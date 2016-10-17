/**
 * Created by manthanhd on 17/10/2016.
 */
const expect = require('expect');

describe('ClassifierFactory', function() {
    const ClassifierFactory = require('../lib/ClassifierFactory')();

    it('throws TypeError when preference is invalid', function(done) {
        try {
            new ClassifierFactory.newClassifier(undefined, 'totally_invalid');
            done('should have failed.');
        } catch (e) {
            expect(e).toBeA(TypeError);
            done();
        }
    });

    it('returns logistic regression classifier when preference is undefined', function(done) {
        var lrClassifier = new ClassifierFactory.newClassifier(undefined, undefined);
        expect(lrClassifier).toExist();
        expect(lrClassifier).toBeA(require('natural').LogisticRegressionClassifier);
        done();
    });

    it('returns logistic regression classifier when preference is logistic_regression', function(done) {
        var lrClassifier = new ClassifierFactory.newClassifier(undefined, 'logistic_regression');
        expect(lrClassifier).toExist();
        expect(lrClassifier).toBeA(require('natural').LogisticRegressionClassifier);
        done();
    });

    it('returns naive bayes classifier when preference is naive_bayes', function(done) {
        var nbClassifier = new ClassifierFactory.newClassifier(undefined, 'naive_bayes');
        expect(nbClassifier).toExist();
        expect(nbClassifier).toBeA(require('natural').BayesClassifier);
        done();
    });
});