/**
 * Created by manthanhd on 17/10/2016.
 */
function Bot(config) {
    config = config || {};
    const util = require('util');
    const extend = util._extend;
    const async = require('async');
    const natural = require('natural');

    const ClassifierFactory = require('./ClassifierFactory');
    const classifierFactory = new ClassifierFactory();
    const classifier = config.classifier || classifierFactory.newClassifier(natural, config.classifierPreference);

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

    this.train = function TrainBotFn(topic, text) {
        if(!topic || (typeof topic !== 'string' && !(topic instanceof String))) throw new TypeError('topic must be a String and cannot be undefined');
        if(!text || (typeof text !== 'string' && !(text instanceof String))) throw new TypeError('text must be a String and cannot be undefined');

        classifier.addDocument(text, topic);
        classifier.train();
    };

    this.trainAll = function TrainAllBotFn(documents, finished) {
        if(!documents || !(documents instanceof Array)) return finished(new TypeError('expected documents to exist and be of type Array'));

        return async.eachSeries(documents, function(document, callback) {
            classifier.addDocument(document.text, document.topic);
            return callback();
        }, function done(err) {
            classifier.train();
            return finished(err);
        });
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
            return undefinedSkills.push(botSkillObject);
        }


        if(skillsMap[skill.topic] === undefined) {
            skillsMap[skill.topic] = [botSkillObject];
            return;
        }

        skillsMap[skill.topic].push(botSkillObject);
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

    var _classifyToTopic = function ClassifyToTopicFn(sentence) {
        var topic;

        try {
            var classifications = classifier.getClassifications(sentence);
            var classification = classifications[0];
            topic = {name: classification.label, confidence: classification.value};
        } catch (e) {
            if(e instanceof TypeError) {
                topic = {name: undefined, confidence: 1};
            }
        }

        return topic;
    };

    /**
     * @param {Object} topic
     * @return undefined | Object
     */
    var _resolveSkillFromTopicWithConfidence = function ResolveSkillFromTopicWithConfidenceFn(topic) {
        if(topic.name === undefined) {
            if(undefinedSkills && undefinedSkills.length > 0) {
                return undefinedSkills[0];
            }

            return undefined;
        }

        var botSkills = skillsMap[topic.name];
        var minConfidenceSkill = undefined;
        var minDistance = 999;
        if (botSkills !== undefined && botSkills.length > 0) {
            for (var i = 0; i < botSkills.length; i++) {
                var botSkill = botSkills[i];
                var distance = topic.confidence - botSkill.minConfidence;
                if (distance < 0) {
                    continue;
                }
                if (distance < minDistance) {
                    minDistance = distance;
                    minConfidenceSkill = botSkill;
                }
                if(distance === 0) {
                    break;
                }
            }
        }

        return minConfidenceSkill;
    };


    var _resolveSkills = function _ResolveSkillsFn(sentences, doneCallback) {
        return async.mapSeries(sentences, function(sentence, callback) {
            var topic = _classifyToTopic(sentence);
            var resolvedBotSkill = _resolveSkillFromTopicWithConfidence(topic);
            var skill = resolvedBotSkill ? resolvedBotSkill.skill : undefined;

            if(skill === undefined) {
                return callback(new Error("could not resolve any skills"));
            }

            var clonedSkill = extend({}, skill);
            clonedSkill.sentence = sentence;
            clonedSkill.topic = topic;

            return callback(undefined, clonedSkill);
        }, doneCallback);
    };

    var _applySkills = function _ApplySkillsFn(context, request, response, skills, skillsApplied) {
        return async.mapSeries(skills, function(skill, callback) {
            var next = function() {
                var responseMessage = response.message;
                if(responseMessage) {
                    delete response.message;
                }

                if(response.isFinal === true) {
                    return callback('break', responseMessage);
                }

                return callback(undefined, responseMessage);
            };

            response.final = function FinalFn() {
                response.isFinal = true;
                return next();
            };

            request.sentence.current = skill.sentence;
            request.sentence.index = skills.indexOf(skill);

            request.skill.current = skill;
            request.skill.index = request.sentence.index;

            skill.apply(context, request, response, next);
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
            return _resolveSkills(sentences, skillsResolved);
        };

        return _resolveContext(id, contextResolved);
    };

    this.getContextStore = function GetContextStoreFn() {
        return contextStore;
    };

    this.getClassifier = function GetClassifierFn() {
        return classifier;
    };

    return this;
}

module.exports = Bot;