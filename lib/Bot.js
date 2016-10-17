/**
 * Created by manthanhd on 17/10/2016.
 */
function Bot(config) {
    config = config || {};
    const async = require('async');
    const natural = require('natural');
    const BotTypes = require('./BotTypes');
    const ClassifierFactory = require('./ClassifierFactory');
    const classifierFactory = new ClassifierFactory();
    const classifier = classifierFactory.newClassifier(natural, config.classifierPreference);

    this.train = function TrainBotFn(topic, text) {
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

    return this;
}

module.exports = Bot;