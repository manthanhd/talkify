/**
 * Created by manthanhd on 17/10/2016.
 */
function Bot(config) {
    config = config || {};
    const util = require('util');
    const extend = util._extend;
    const async = require('async');
    const TalkifyClassifier = require('talkify-classifier');
    const LogisticRegressionClassifier = require('talkify-natural-classifier').LogisticRegressionClassifier;
    var classifiers = config.classifier || config.classifiers;
    if(!classifiers) classifiers = [new LogisticRegressionClassifier()];
    if(!(classifiers instanceof Array)) classifiers = [classifiers];

    const BotTypes = require('./BotTypes');
    const Skill = BotTypes.Skill;
    const Message = BotTypes.Message;
    const SingleLineMessage = BotTypes.SingleLineMessage;
    const Correspondence = BotTypes.Correspondence;
    const Context = BotTypes.Context;

    const BuiltInContextStore = require('./ContextStore');
    const contextStore = config.contextStore || new BuiltInContextStore();

    const skillsMap = {};
    const undefinedSkills = [];
    var botObject = this;

    this.train = function TrainBotFn(topic, text, callback) {
        var classifier = botObject.getClassifier();
        if(!topic || (typeof topic !== 'string' && !(topic instanceof String))) throw new TypeError('topic must be a String and cannot be undefined');

        if(!text || (!(text instanceof Array) && typeof text !== 'string' && !(text instanceof String))) throw new TypeError('text must be a String and cannot be undefined');

        classifier.trainDocument({topic: topic, text: text}, function(err) {
            if(err) return callback(err);

            return classifier.initialize(callback);
        });

        return botObject;
    };

    this.trainAll = function TrainAllBotFn(documents, finished) {
        finished = (finished) ? finished : function(err) {
            throw err;
        };
        var classifier = botObject.getClassifier();
        if(!documents || !(documents instanceof Array)) return finished(new TypeError('expected documents to exist and be of type Array'));
        classifier.trainDocument(documents, function(err) {
            if(err) return callback(err);

            return classifier.initialize(finished);
        });
        return botObject;
    };

    this.addSkill = function AddSkillFn(skill, minConfidence) {
        if(!skill || !(skill instanceof Skill)) throw new TypeError('skill parameter is of invalid type. Must be defined and be of type Skill');
        if(!minConfidence) {
            minConfidence = 0;
        }

        var skillClone = extend({}, skill);
        var botSkillObject = {skill: skillClone, minConfidence: minConfidence};

        if(skillClone.topic === undefined || skillClone.topic === 'undefined') {
            skillClone.topic = undefined;
            undefinedSkills.push(botSkillObject);
            return botObject;
        }


        if(skillsMap[skill.topic] === undefined) {
            skillsMap[skill.topic] = [botSkillObject];
            return botObject;
        }

        skillsMap[skill.topic].push(botSkillObject);

        return botObject;
    };

    this.getSkills = function GetSkillsFn() {
        var topics = Object.keys(skillsMap);
        var skills = [];

        topics.forEach(function(topic) {
            skills.push(skillsMap[topic]);
        });

        return skills;
    };

    var _resolveContext = function _ResolveContext(id, callback) {
        var retrieved = function(err, contextRecord) {
            if(err) return callback(err);

            if(contextRecord === undefined) return callback(err, new Context(id));

            return callback(err, contextRecord.context);
        };

        return contextStore.get(id, retrieved);
    };

    var _classifyToTopic = function ClassifyToTopicFn(sentence, done) {
        return async.map(classifiers, function(classifier, classificationDone) {
            var classified = function(err, classifications) {
                var topic = {name: undefined, confidence: 1};

                if(err) {
                    return classificationDone(err, topic);
                }

                var classification = classifications[0];
                topic = {name: classification.label, confidence: classification.value};
                return classificationDone(err, topic);
            };

            return classifier.getClassifications(sentence, classified);
        }, function(err, classifications) {
            if(err) return done(err, classifications);
            var indeterminates = [];
            return async.filter(classifications, function(classification, mapped) {
                if(classification.name === undefined) {
                    indeterminates.push(classification);
                    return mapped(undefined, false);
                }
                return mapped(undefined, true);
            }, function(err, allMapped) {
                return async.sortBy(allMapped, function(classification, sorted) {
                    return sorted(undefined, classification.confidence * -1);
                }, function(err, sortedClassifications) {
                    var allClassifications = sortedClassifications.concat(indeterminates);
                    return done(err, allClassifications);
                });
            });
        });
    };

    var _getSkillByName = function(name, skillList) {
        var skills = skillList || botObject.getSkills();
        for(var i = 0; i < skills.length; i++) {
            var skill = skills[i];
            if(skill instanceof Array) {
                var returnSkill = _getSkillByName(name, skill);
                if(returnSkill) return returnSkill;
                continue;
            }

            if(skill.name === name) return skill;
            if(skill.skill.name === name) return skill.skill;
        }
    };

    var _resolveSkillFromTopicWithConfidence = function ResolveSkillFromTopicWithConfidenceFn(topic) {
        if(topic.name === undefined) {
            if(undefinedSkills && undefinedSkills.length > 0) {
                return undefinedSkills[0];
            }

            return;
        }

        var botSkills = skillsMap[topic.name];
        var minConfidenceSkill = undefinedSkills[0];
        var minDistance = 999;
        if (botSkills !== undefined && botSkills.length > 0) {
            for (var i = 0; i < botSkills.length; i++) {
                var botSkill = botSkills[i];
                var distance = topic.confidence - botSkill.minConfidence;
                if (distance < 0) continue;
                if (distance < minDistance) {
                    minDistance = distance;
                    minConfidenceSkill = botSkill;
                }
                if(distance === 0) break;
            }
        }

        return minConfidenceSkill;
    };

    var _resolveSkills = function _ResolveSkillsFn(sentences, doneCallback) {
        return async.mapSeries(sentences, function(sentence, callback) {
            var classified = function(err, topics) {
                var mostConfidentTopic = topics[0];
                var resolvedBotSkill = _resolveSkillFromTopicWithConfidence(mostConfidentTopic);
                var skill = resolvedBotSkill ? resolvedBotSkill.skill : undefined;

                if(skill === undefined) {
                    return callback(new Error("could not resolve any skills"));
                }

                var clonedSkill = extend({}, skill);
                clonedSkill.sentence = sentence;
                clonedSkill.topic = mostConfidentTopic;

                return callback(undefined, clonedSkill);
            };

            return _classifyToTopic(sentence, classified);
        }, doneCallback);
    };

    var _applySkills = function _ApplySkillsFn(context, request, response, skills, skillsApplied) {
        return async.mapSeries(skills, function(skill, callback) {
            var next = function() {
                var responseMessage = response.message;
                if(responseMessage) {
                    delete response.message;
                }

                if(context.lock) {
                    response.isFinal = true;
                }

                if(response.isFinal === true) {
                    return callback('break', responseMessage);
                }

                return callback(undefined, responseMessage);
            };

            response.lockConversationForNext = function LockConversationForNextFn() {
                context.lock = skill.name;
                return response;
            };

            response.final = function FinalFn() {
                response.isFinal = true;
                return response;
            };

            response.send = function SendFn(message) {
                response.message = message;
                return next();
            };

            request.sentence.current = skill.sentence;
            request.sentence.index = skills.indexOf(skill);

            request.skill.current = skill;
            request.skill.index = request.sentence.index;

            skill.apply(context.data, request, response, next);
        }, function(err, messages) {
            if(err === 'break') err = undefined;

            return skillsApplied(err, messages);
        });
    };

    this.resolve = function ResolveFn(id, content, callback) {
        var sentences = content.replace(/([.?!])\s*(?=[A-Z])/g, "$1|").split("|");
        var request = new Correspondence(id, new SingleLineMessage(content));
        request.sentence = {all: sentences};
        var response = new Correspondence(id);
        var context;
        var messages;

        var contextMemorized = function(err, memorizedContext) {
            if(err) return callback(err, messages);

            return callback(err, messages);
        };

        var skillsApplied = function(err, responseMessages) {
            messages = responseMessages;
            return contextStore.put(id, context, contextMemorized);
        };

        var skillsResolved = function(err, skills) {
            if(err) return callback(err);

            request.skill = {all: skills};
            return _applySkills(context, request, response, skills, skillsApplied);
        };

        var contextResolved = function(err, resolvedContext) {
            context = resolvedContext;

            if(context.lock) {
                var skill = _getSkillByName(context.lock);
                skill = extend({}, skill);
                delete context.lock;
                request.skill = {all: [skill]};
                return _applySkills(context, request, response, [skill], skillsApplied);
            }

            return _resolveSkills(sentences, skillsResolved);
        };

        _resolveContext(id, contextResolved);
        return botObject;
    };

    this.getContextStore = function GetContextStoreFn() {
        return contextStore;
    };

    this.getClassifiers = function GetClassifiersFn() {
        return classifiers;
    };

    this.getClassifier = function GetClassifierFn() {
        return classifiers[classifiers.length - 1];
    };

    return this;
}

module.exports = Bot;
