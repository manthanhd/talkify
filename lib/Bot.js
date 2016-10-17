/**
 * Created by manthanhd on 17/10/2016.
 */
function Bot(config) {
    config = config || {};
    const async = require('async');
    const natural = require('natural');

    const ClassifierFactory = require('./ClassifierFactory');
    const classifierFactory = new ClassifierFactory();
    const classifier = classifierFactory.newClassifier(natural, config.classifierPreference);

    const BotTypes = require('./BotTypes');
    const Skill = BotTypes.Skill;

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

    return this;
}

module.exports = Bot;