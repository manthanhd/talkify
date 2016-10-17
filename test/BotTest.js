/**
 * Created by manthanhd on 17/10/2016.
 */
const expect = require('expect');
const sinon = require('sinon');
const mockery = require('mockery');

function mockClassifierWithMockClassifierFactory() {
    var mockClassifier = {
        addDocument: expect.createSpy(),
        train: expect.createSpy()
    };

    var mockClassifierFactoryInstance = {
        newClassifier: function () {
            return mockClassifier
        }
    };

    var MockClassifierFactory = function () {
        return mockClassifierFactoryInstance;
    };

    mockery.registerMock('./ClassifierFactory', MockClassifierFactory);
    return mockClassifier;
}

function mockClassifierFactory() {
    var mockClassifierFactoryInstance = {
        newClassifier: expect.createSpy()
    };

    var MockClassifierFactory = function () {
        return mockClassifierFactoryInstance;
    };

    mockery.registerMock('./ClassifierFactory', MockClassifierFactory);
    return mockClassifierFactoryInstance;
}

describe('Bot', function () {
    const Bot = require('../lib/Bot');

    beforeEach(function (done) {
        mockery.enable({warnOnUnregistered: false, warnOnReplace: false});
        done();
    });

    afterEach(function (done) {
        mockery.disable();
        done();
    });

    it('passes classifierPreference property from config to ClassifierFactory', function (done) {
        var naturalMock = {};

        mockery.registerMock('natural', naturalMock);

        var mockClassifierFactoryInstance = mockClassifierFactory();

        var bot = new Bot({classifierPreference: 'naive_bayes'});

        expect(mockClassifierFactoryInstance.newClassifier.calls.length).toBe(1);
        expect(mockClassifierFactoryInstance.newClassifier).toHaveBeenCalledWith(naturalMock, 'naive_bayes');
        done();
    });

    it('trains single document', function (done) {
        var mockClassifier = mockClassifierWithMockClassifierFactory();

        var bot = new Bot({classifierPreference: 'naive_bayes'});
        bot.train('topic', 'text');

        expect(mockClassifier.addDocument).toHaveBeenCalledWith('text', 'topic');
        expect(mockClassifier.train).toHaveBeenCalled();
        done();
    });

    it('trains all documents', function (done) {
        var mockClassifier = mockClassifierWithMockClassifierFactory();

        var bot = new Bot({classifierPreference: 'naive_bayes'});
        bot.trainAll([{text: 'hello', topic: 'topic'}, {text: 'hello2', topic: 'topic2'}], function (err) {
            expect(err).toNotExist();
            expect(mockClassifier.addDocument).toHaveBeenCalledWith('hello', 'topic');
            expect(mockClassifier.addDocument).toHaveBeenCalledWith('hello2', 'topic2');
            expect(mockClassifier.train).toHaveBeenCalled();
            done();
        });
    });

    it('throws TypeError when documents in trainAll is not an array', function (done) {
        var mockClassifier = mockClassifierWithMockClassifierFactory();

        var bot = new Bot({classifierPreference: 'naive_bayes'});
        bot.trainAll('not_an_array', function (err) {
            expect(err).toExist();
            expect(err).toBeA(TypeError);
            done();
        });
    });

    it('throws TypeError when documents in trainAll is undefined', function (done) {
        var mockClassifier = mockClassifierWithMockClassifierFactory();

        var bot = new Bot({classifierPreference: 'naive_bayes'});
        bot.trainAll(undefined, function (err) {
            expect(err).toExist();
            expect(err).toBeA(TypeError);
            done();
        });
    });
});