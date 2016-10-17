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
    const BotTypes = require('../lib/BotTypes');
    const Skill = BotTypes.Skill;
    const Bot = require('../lib/Bot');

    beforeEach(function (done) {
        mockery.enable({warnOnUnregistered: false, warnOnReplace: false});
        done();
    });

    afterEach(function (done) {
        mockery.disable();
        done();
    });

    describe('<init>', function () {
        it('passes classifierPreference property from config to ClassifierFactory', function (done) {
            var naturalMock = {};

            mockery.registerMock('natural', naturalMock);

            var mockClassifierFactoryInstance = mockClassifierFactory();

            var bot = new Bot({classifierPreference: 'naive_bayes'});

            expect(mockClassifierFactoryInstance.newClassifier.calls.length).toBe(1);
            expect(mockClassifierFactoryInstance.newClassifier).toHaveBeenCalledWith(naturalMock, 'naive_bayes');
            done();
        });
    });

    describe('train', function () {
        it('trains single document when parameters are valid', function (done) {
            var mockClassifier = mockClassifierWithMockClassifierFactory();

            var bot = new Bot({classifierPreference: 'naive_bayes'});
            bot.train('topic', 'text');

            expect(mockClassifier.addDocument).toHaveBeenCalledWith('text', 'topic');
            expect(mockClassifier.train).toHaveBeenCalled();
            done();
        });

        it('throws TypeError when topic is undefined', function (done) {
            var bot = new Bot();
            try {
                bot.train(undefined);
                done('should have failed.');
            } catch (e) {
                expect(e).toBeA(TypeError);
                done();
            }
        });

        it('throws TypeError when topic is not String', function (done) {
            var bot = new Bot();
            try {
                bot.train([]);
                done('should have failed.');
            } catch (e) {
                expect(e).toBeA(TypeError);
                done();
            }
        });

        it('throws TypeError when text is undefined', function (done) {
            var bot = new Bot();
            try {
                bot.train('topic', undefined);
                done('should have failed.');
            } catch (e) {
                expect(e).toBeA(TypeError);
                done();
            }
        });

        it('throws TypeError when text is not String', function (done) {
            var bot = new Bot();
            try {
                bot.train('topic', []);
                done('should have failed.');
            } catch (e) {
                expect(e).toBeA(TypeError);
                done();
            }
        });
    });

    describe('trainAll', function () {

        it('trains all documents when parameters are valid', function (done) {
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

        it('throws TypeError when documents is not an array', function (done) {
            var mockClassifier = mockClassifierWithMockClassifierFactory();

            var bot = new Bot({classifierPreference: 'naive_bayes'});
            bot.trainAll('not_an_array', function (err) {
                expect(err).toExist();
                expect(err).toBeA(TypeError);
                done();
            });
        });

        it('throws TypeError when documents is undefined', function (done) {
            var mockClassifier = mockClassifierWithMockClassifierFactory();

            var bot = new Bot({classifierPreference: 'naive_bayes'});
            bot.trainAll(undefined, function (err) {
                expect(err).toExist();
                expect(err).toBeA(TypeError);
                done();
            });
        });
    })

    describe('addSkill', function () {

        it('adds given skill', function (done) {
            var bot = new Bot();

            const fakeSkillFn = function (context, req, res, next) {
            };

            const fakeSkill = new Skill('topic', fakeSkillFn);
            bot.addSkill(fakeSkill);

            const skills = bot.getSkills();
            expect(skills.length).toBe(1);
            done();
        });

        it('throws TypeError when skill is undefined', function (done) {
            var bot = new Bot();
            try {
                bot.addSkill(undefined);
                done('should have failed.');
            } catch (e) {
                expect(e).toBeA(TypeError);
                done();
            }
        });

        it('throws TypeError when skill is not of type Skill', function (done) {
            var bot = new Bot();
            try {
                bot.addSkill([]);
                done('should have failed.');
            } catch (e) {
                expect(e).toBeA(TypeError);
                done();
            }
        });
    })
});