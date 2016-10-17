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
        if(!documents) throw new TypeError('expected documents to exist');
        if(!(documents instanceof Array)) throw new TypeError('expected documents to be of type Array');

        return async.series(documents, function(document, callback) {
            classifier.addDocument(document.text, document.topic);
            return callback();
        }, function done() {
            classifier.train();
            return finished();
        });
    };

    return this;
}

module.exports = Bot;