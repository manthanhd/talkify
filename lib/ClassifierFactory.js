/**
 * Created by manthanhd on 17/10/2016.
 */
function ClassifierFactory() {
    this.newClassifier = function NewClassifierInstance(natural, preference) {
        if(!natural) natural = require('natural');

        if(!preference || preference === 'logistic_regression') return new natural.LogisticRegressionClassifier();
        if(preference === 'naive_bayes') return new natural.BayesClassifier();

        throw new TypeError('Invalid preference for classifier. Expected logistic_regression or naive_bayes as value');
    };

    return this;
}

module.exports = ClassifierFactory;