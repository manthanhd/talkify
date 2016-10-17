/**
 * Created by manthanhd on 17/10/2016.
 */
const expect = require('expect');
const sinon = require('sinon');
const mockRequire = require('mock-require');

describe('Bot', function() {

    it('passes classifierPreference property from config to ClassifierFactory', function(done) {
        var mockClassifierFactory = {newClassifier: function() {console.log(1);}};
        expect.spyOn(mockClassifierFactory, 'newClassifier');
        var MockClassifierFactory = function() {return mockClassifierFactory;};
        mockRequire('./ClassifierFactory', MockClassifierFactory);
        var Bot = require('../lib/Bot');
        new Bot({classifierPreference: 'naive_bayes'});
        expect(mockClassifierFactory.newClassifier.calls.length).toBe(1);
        mockRequire.stop('./ClassifierFactory');
        done();
    });
});