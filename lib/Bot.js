/**
 * Created by manthanhd on 17/10/2016.
 */
function Bot(config) {
    config = config || {};
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

    this.addSkill = function AddSkillFn(skill) {
        if(!skill || !(skill instanceof Skill)) throw new TypeError('skill parameter is of invalid type. Must be defined and be of type Skill');

        skillsMap[skill.topic] = skill;
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

    var _resolveSkills = function _ResolveSkillsFn(sentences, doneCallback) {
        return async.mapSeries(sentences, function(sentence, callback) {
            var topic = classifier.classify(sentence);
            var skill = skillsMap[topic];
            callback(undefined, skill);
        }, doneCallback);
    };

    var _applySkills = function _ApplySkillsFn(context, request, response, skills, callback) {
        return async.mapSeries(skills, function(skill, callback) {
            var next = function() {
                var responseMessage = response.message;
                if(responseMessage) {
                    delete response.message;
                }

                return callback(undefined, responseMessage);
            };

            skill.apply(context, request, response, next);
        }, function(err, messages) {
            return callback(err, messages);
        });
    };

    this.resolve = function ResolveFn(id, content, callback) {
        var sentences = content.replace(/([.?!])\s*(?=[A-Z])/g, "$1|").split("|")
        var request = new Correspondence(id, new SingleLineMessage(content));
        var response = new Correspondence(id);
        var context = undefined;
        var messages = undefined;

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