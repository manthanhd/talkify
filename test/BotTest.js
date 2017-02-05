/**
 * Created by manthanhd on 17/10/2016.
 */
const expect = require('expect');
const async = require('async');
const mockery = require('mockery');

function mockClassifierWithMockClassifierFactory() {
    const TalkifyClassifier = require('talkify-classifier');
    var mockClassifier = new TalkifyClassifier();
    expect.spyOn(mockClassifier, 'trainDocument');
    expect.spyOn(mockClassifier, 'initialize');

    var mockLrClassifier = {
        LogisticRegressionClassifier: function () {
            return mockClassifier;
        }
    };

    mockery.registerMock('talkify-natural-classifier', mockLrClassifier);
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
    const SingleLineMessage = BotTypes.SingleLineMessage;
    const Skill = BotTypes.Skill;
    const Message = BotTypes.Message;
    const Bot = require('../lib/Bot');

    beforeEach(function (done) {
        mockery.enable({warnOnUnregistered: false, warnOnReplace: false});
        done();
    });

    afterEach(function (done) {
        mockery.deregisterAll();
        mockery.disable();
        done();
    });

    describe('<init>', function () {
        it('works with passed in classifier', function () {
            var TalkifyClassifier = require('talkify-classifier');
            var fakeClassifier = new TalkifyClassifier();
            var bot = new Bot({classifier: fakeClassifier});
            var classifier = bot.getClassifier();
            expect(classifier).toExist();
            expect(classifier).toBe(fakeClassifier);
            expect(classifier).toBeA(TalkifyClassifier);
        });

        it('allows configuring multiple classifiers', function() {
            var TalkifyClassifier = require('talkify-classifier');
            var fakeClassifier1 = new TalkifyClassifier();
            var fakeClassifier2 = new TalkifyClassifier();
            var bot = new Bot({classifier: [fakeClassifier1, fakeClassifier2]});
            var classifiers = bot.getClassifiers();
            expect(classifiers).toExist();
            expect(classifiers.length).toBe(2);
            expect(classifiers[0]).toBe(fakeClassifier1);
            expect(classifiers[1]).toBe(fakeClassifier2);
        });
    });

    describe('train', function () {
        it('trains single document when parameters are valid', function (done) {
            var mockClassifier = mockClassifierWithMockClassifierFactory();

            var bot = new Bot();
            bot.train('topic', 'text');

            expect(mockClassifier.trainDocument.calls[0].arguments[0]).toEqual({text:'text', topic:'topic'});
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
            var bot = new Bot();
            bot.trainAll([{text: 'hello', topic: 'topic'}, {text: 'hello2', topic: 'topic2'}], function (err) {
                expect(err).toNotExist();
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

        it('requires optional finished callback', function(done) {
            const bot = new Bot();
            try {
                bot.trainAll([{text: "hello", topic: "greeting"}]);
                done();
            } catch (e) {
                done(e);
            }
        });

        it('throws errors synchronously when finished callback is not defined', function(done) {
            try {
                const bot = new Bot();
                bot.trainAll(undefined);
                done('should have failed');
            } catch (e) {
                expect(e).toExist();
                expect(e).toBeA(TypeError);
                done();
            }
        })
    });

    describe('addSkill', function () {

        it('adds given skill', function (done) {
            var bot = new Bot();

            const fakeSkillFn = function (context, req, res, next) {
            };

            const fakeSkill = new Skill('fakeskill', 'topic', fakeSkillFn);
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

        it('adds multiple skills with different confidence levels to the same topic', function (done) {
            var bot = new Bot();
            try {
                bot.addSkill(new Skill('name', 'topic', function () {
                }), 20);
                bot.addSkill(new Skill('anothername', 'topic', function () {
                }), 50);
                var skills = bot.getSkills();
                expect(skills.length).toBe(1);
                expect(skills).toBeA(Array);
                done();
            } catch (e) {
                done(e);
            }
        })
    });

    describe('resolve', function () {
        it("resolves multi sentence message into a multi message response", function (done) {
            var mockClassifier = mockClassifierWithMockClassifierFactory();
            mockClassifier.getClassifications = expect.createSpy().andCall(function (sentence, callback) {
                if (sentence === 'Hello.') return callback(undefined, [{label: 'mytopic', value: 1}]);
                return callback(undefined, [{label: 'myanothertopic', value: 1}]);
            });

            var fakeMyTopicSkill = new Skill('myfakeskill', 'mytopic', expect.createSpy().andCall(function (context, request, response, next) {
                response.message = new SingleLineMessage('mytopic response');
                return next()
            }));

            var fakeMyAnotherTopicSkill = new Skill('myanotherfakeskill', 'myanothertopic', expect.createSpy().andCall(function (context, request, response, next) {
                response.message = new SingleLineMessage('myanothertopic response');
                return next()
            }));

            var bot = new Bot();
            bot.addSkill(fakeMyTopicSkill);
            bot.addSkill(fakeMyAnotherTopicSkill);

            return bot.resolve(123, "Hello. Hi", function (err, messages) {
                if (err) return done(err);

                expect(messages).toBeA(Array);
                expect(messages.length).toBe(2);
                expect(messages[0]).toBeA(Message);
                expect(messages[0].content).toBe('mytopic response');
                expect(messages[1]).toBeA(Message);
                expect(messages[1].content).toBe('myanothertopic response');
                done();
            });
        });

        it('saves context by correspondance id', function (done) {
            var mockClassifier = mockClassifierWithMockClassifierFactory();
            mockClassifier.getClassifications = expect.createSpy().andCall(function (sentence, callback) {
                if (sentence === 'Hello.') return callback(undefined, [{label: 'mytopic', value: 1}]);
                return callback(undefined, [{label: 'myanothertopic', value: 1}]);
            });

            var contextStore = {
                put: function (id, context, callback) {
                    return callback(undefined, context);
                },

                get: function (id, callback) {
                    return callback(undefined, undefined);
                }
            };

            var contextStore_putSpy = expect.spyOn(contextStore, 'put').andCallThrough();
            var contextStore_getSpy = expect.spyOn(contextStore, 'get').andCallThrough();

            var fakeMyTopicSkill = new Skill('myfakeskill', 'mytopic', expect.createSpy().andCall(function (context, request, response, next) {
                response.message = new SingleLineMessage('mytopic response');
                return next()
            }));

            var fakeMyAnotherTopicSkill = new Skill('myanotherfakeskill', 'myanothertopic', expect.createSpy().andCall(function (context, request, response, next) {
                response.message = new SingleLineMessage('myanothertopic response');
                return next()
            }));

            var bot = new Bot({contextStore: contextStore});
            bot.addSkill(fakeMyTopicSkill);
            bot.addSkill(fakeMyAnotherTopicSkill);

            return bot.resolve(123, "Hello. Hi", function (err, messages) {
                if (err) return done(err);

                expect(contextStore_putSpy).toHaveBeenCalled();
                expect(contextStore_getSpy).toHaveBeenCalled();
                done();
            });
        });

        it('returns messages as well as error when failed to memorize context', function (done) {
            var mockClassifier = mockClassifierWithMockClassifierFactory();
            mockClassifier.getClassifications = expect.createSpy().andCall(function (sentence, callback) {
                if (sentence === 'Hello.') return callback(undefined, [{label: 'mytopic', value: 1}]);
                return callback(undefined, [{label: 'myanothertopic', value: 1}]);
            });

            var contextStore = {
                put: function (id, context, callback) {
                    return callback(new Error("hurr durr i failed to memorize context"), context);
                },

                get: function (id, callback) {
                    return callback(undefined, undefined);
                }
            };

            var fakeMyTopicSkill = new Skill('myfakeskill', 'mytopic', expect.createSpy().andCall(function (context, request, response, next) {
                response.message = new SingleLineMessage('mytopic response');
                return next()
            }));

            var fakeMyAnotherTopicSkill = new Skill('myanotherfakeskill', 'myanothertopic', expect.createSpy().andCall(function (context, request, response, next) {
                response.message = new SingleLineMessage('myanothertopic response');
                return next()
            }));

            var bot = new Bot({contextStore: contextStore});
            bot.addSkill(fakeMyTopicSkill);
            bot.addSkill(fakeMyAnotherTopicSkill);

            return bot.resolve(123, "Hello. Hi", function (err, messages) {
                expect(err).toExist();
                expect(err.message).toBe('hurr durr i failed to memorize context');

                expect(messages).toExist();
                expect(messages.length).toBe(2);
                done();
            });
        });

        it('has access to sentence metadata when skill is processing the request', function (done) {
            var mockClassifier = mockClassifierWithMockClassifierFactory();
            mockClassifier.getClassifications = expect.createSpy().andCall(function (sentence, callback) {
                if (sentence === 'Hello.') return callback(undefined, [{label: 'mytopic', value: 1}]);
                return callback(undefined, [{label: 'myanothertopic', value: 1}]);
            });

            var fakeTopicSkillCalled = false;
            var fakeAnotherTopicSkillCalled = false;

            var fakeMyTopicSkill = new Skill('myfakeskill', 'mytopic', expect.createSpy().andCall(function (context, request, response, next) {
                expect(request.sentence).toExist();
                expect(request.sentence.current).toBe("Hello.");
                expect(request.sentence.index).toBe(0);

                expect(request.sentence.all).toExist();
                expect(request.sentence.all.length).toBe(2);
                expect(request.sentence.all[0]).toBe("Hello.");
                expect(request.sentence.all[1]).toBe("Hi.");
                fakeTopicSkillCalled = true;

                response.message = new SingleLineMessage('mytopic response');
                return next();
            }));

            var fakeMyAnotherTopicSkill = new Skill('myanotherfakeskill', 'myanothertopic', expect.createSpy().andCall(function (context, request, response, next) {
                expect(request.sentence).toExist();
                expect(request.sentence.current).toBe("Hi.");
                expect(request.sentence.index).toBe(1);

                expect(request.sentence.all).toExist();
                expect(request.sentence.all.length).toBe(2);
                expect(request.sentence.all[0]).toBe("Hello.");
                expect(request.sentence.all[1]).toBe("Hi.");

                fakeAnotherTopicSkillCalled = true;

                response.message = new SingleLineMessage('myanothertopic response');
                return next();
            }));

            var bot = new Bot();
            bot.addSkill(fakeMyTopicSkill);
            bot.addSkill(fakeMyAnotherTopicSkill);

            return bot.resolve(123, "Hello. Hi.", function (err, messages) {
                expect(fakeTopicSkillCalled).toBe(true);
                expect(fakeAnotherTopicSkillCalled).toBe(true);

                return done();
            });
        });

        it('has access to topic metadata when skill is processing the request', function (done) {
            var mockClassifier = mockClassifierWithMockClassifierFactory();
            mockClassifier.getClassifications = expect.createSpy().andCall(function (sentence, callback) {
                if (sentence === 'Hello.') return callback(undefined, [{label: 'mytopic', value: 1}]);
                return callback(undefined, [{label: 'myanothertopic', value: 1}]);
            });

            var fakeTopicSkillCalled = false;
            var fakeAnotherTopicSkillCalled = false;

            var fakeMyTopicSkill = new Skill('myfakeskill', 'mytopic', expect.createSpy().andCall(function (context, request, response, next) {
                expect(request.skill).toExist();
                expect(request.skill.index).toBe(0);

                expect(request.skill.all).toExist();
                expect(request.skill.all.length).toBe(2);
                expect(request.skill.all[0].name).toBe(fakeMyTopicSkill.name);
                expect(request.skill.all[1].name).toBe(fakeMyAnotherTopicSkill.name);
                fakeTopicSkillCalled = true;

                response.message = new SingleLineMessage('mytopic response');
                return next();
            }));

            var fakeMyAnotherTopicSkill = new Skill('myanotherfakeskill', 'myanothertopic', expect.createSpy().andCall(function (context, request, response, next) {
                expect(request.skill).toExist();
                expect(request.skill.index).toBe(1);

                expect(request.skill.all).toExist();
                expect(request.skill.all.length).toBe(2);
                expect(request.skill.all[0].name).toBe(fakeMyTopicSkill.name);
                expect(request.skill.all[1].name).toBe(fakeMyAnotherTopicSkill.name);
                fakeAnotherTopicSkillCalled = true;

                response.message = new SingleLineMessage('myanothertopic response');
                return next();
            }));

            var bot = new Bot();
            bot.addSkill(fakeMyTopicSkill);
            bot.addSkill(fakeMyAnotherTopicSkill);

            return bot.resolve(123, "Hello. Hi.", function (err, messages) {
                expect(fakeTopicSkillCalled).toBe(true);
                expect(fakeAnotherTopicSkillCalled).toBe(true);
                return done();
            });
        });

        it('does not call the next skill when previous skill calls final()', function (done) {
            var mockClassifier = mockClassifierWithMockClassifierFactory();
            mockClassifier.getClassifications = expect.createSpy().andCall(function (sentence, callback) {
                if (sentence === 'Hello.') return callback(undefined, [{label: 'mytopic', value: 1}]);
                return callback(undefined, [{label: 'myanothertopic', value: 1}]);
            });

            var fakeMyTopicSkill = new Skill('myfakeskill', 'mytopic', expect.createSpy().andCall(function (context, request, response, next) {
                response.final().send(new SingleLineMessage('mytopic response'));
            }));

            var fakeMyAnotherTopicSkill = new Skill('myanotherfakeskill', 'myanothertopic', expect.createSpy().andCall(function (context, request, response, next) {
                done('This skill should not have been called.');
            }));

            var bot = new Bot();
            bot.addSkill(fakeMyTopicSkill, 1);
            bot.addSkill(fakeMyAnotherTopicSkill, 1);

            return bot.resolve(123, "Hello. Hi.", function (err, messages) {
                expect(messages.length).toBe(1);
                expect(messages[0].content).toBe('mytopic response');
                return done();
            });
        });

        it('resolves context from a previously saved context with the built in context store', function (done) {
            var mockClassifier = mockClassifierWithMockClassifierFactory();
            mockClassifier.getClassifications = expect.createSpy().andCall(function (sentence, callback) {
                if (sentence === 'Hello.') return callback(undefined, [{label: 'mytopic', value: 1}]);
                return callback(undefined, [{label: 'myanothertopic', value: 1}]);
            });

            var firstRun = true;

            var fakeMyTopicSkill = new Skill('myfakeskill', 'mytopic', expect.createSpy().andCall(function (context, request, response, next) {
                if (firstRun === true) {
                    expect(context.something).toNotExist();
                } else {
                    expect(context.something).toExist();
                }

                response.message = new SingleLineMessage('mytopic response');
                return next();
            }));

            var bot = new Bot();
            bot.addSkill(fakeMyTopicSkill);

            bot.resolve(123, "Hello.", function (err, messages) {
                expect(err).toNotExist();
            });
            return bot.resolve(123, "Hello.", function (err, messages) {
                expect(err).toNotExist();
                done();
            });
        });

        it('returns skills could not be resolved error when it couldn\'t resolve skills', function (done) {
            var mockClassifier = mockClassifierWithMockClassifierFactory();
            mockClassifier.getClassifications = expect.createSpy().andCall(function (sentence, callback) {
                if (sentence === 'Hello.') return callback(undefined, [{label: 'mytopic', value: 0.2}]);
                return callback(undefined, [{label: 'myanothertopic', value: 1}]);
            });

            var firstRun = true;

            var fakeMyTopicSkill = new Skill('myfakeskill', 'mytopic', expect.createSpy().andCall(function (context, request, response, next) {
                if (firstRun === true) {
                    expect(context.something).toNotExist();
                } else {
                    expect(context.something).toExist();
                }

                response.message = new SingleLineMessage('mytopic response');
                return next();
            }));

            var bot = new Bot();
            bot.addSkill(fakeMyTopicSkill, 1);

            bot.resolve(123, "Hello.", function (err, messages) {
                expect(err).toExist();
                done();
            });
        });

        it('calls mapped undefined skill when skill cannot be found for a topic', function (done) {
            const TrainingDocument = require('../lib/BotTypes').TrainingDocument;
            mockery.deregisterAll();
            mockery.disable();

            var fakeMyTopicSkill = new Skill('myskill', undefined, expect.createSpy().andCall(function (context, request, response, next) {
                response.message = new SingleLineMessage('mytopic response');
                return next();
            }));

            var bot = new Bot();
            bot.addSkill(fakeMyTopicSkill);

            var resolved = function (err, messages) {
                expect(err).toNotExist();

                expect(messages).toExist();
                expect(messages.length).toBe(1);
                expect(messages[0].content).toBe('mytopic response');
                done();
            };
            return bot.resolve(123, "kiwi", resolved);
        });

        it('calls mapped undefined skill when skill with closest positive distance from defined minConfidence cannot be found for a topic', function (done) {
            var mockClassifier = mockClassifierWithMockClassifierFactory();
            mockClassifier.getClassifications = expect.createSpy().andCall(function (sentence, callback) {
                return callback(undefined, [{label: 'myanothertopic', value: 0.5}]);
            });

            var fakeMyTopicSkill = new Skill('myskill', undefined, expect.createSpy().andCall(function (context, request, response, next) {
                response.message = new SingleLineMessage('mytopic response');
                return next();
            }));

            var fakeAnotherTopicSkill = new Skill('myfakeanothertopicskill', 'myanothertopic', function(context, request, response) {
                return done('should not have called this skill');
            });

            var bot = new Bot();
            bot.addSkill(fakeMyTopicSkill);
            bot.addSkill(fakeAnotherTopicSkill, 0.8);

            var resolved = function (err, messages) {
                expect(err).toNotExist();

                expect(messages).toExist();
                expect(messages.length).toBe(1);
                expect(messages[0].content).toBe('mytopic response');
                done();
            };
            return bot.resolve(123, "kiwi", resolved);
        });

        it('calls skills based on confidence level', function (done) {
            var fakeMyTopicSkill = new Skill('myskill', 'hello', expect.createSpy().andCall(function (context, request, response, next) {
                response.message = new SingleLineMessage('mytopic response');
                return next();
            }));

            var bot = new Bot();
            async.series([
                function(done) {
                    bot.train('hello', 'hey there', done);
                },
                function(done) {
                    bot.train('hello', 'hello there', done);
                },
                function(done) {
                    bot.train('hello', 'hello', done);
                }
            ], function() {
                bot.addSkill(fakeMyTopicSkill, 0.4);

                var resolved = function (err, messages) {
                    expect(err).toNotExist();

                    expect(messages).toExist();
                    expect(messages.length).toBe(1);
                    expect(messages[0].content).toBe('mytopic response');
                    done();
                };

                return bot.resolve(123, "kiwi", resolved);
            });
        });

        it('resolves to the same skill that locked the conversation', function (done) {
            var mockClassifier = mockClassifierWithMockClassifierFactory();
            mockClassifier.getClassifications = expect.createSpy().andCall(function (sentence, callback) {
                if (sentence === 'Hello.') return callback(undefined, [{label: 'mytopic', value: 1}]);
                if (sentence === 'Hi.') return callback(undefined, [{label: 'myanothertopic', value: 1}]);
                return callback(undefined, [{label: 'myanothertopic', value: 1}]);
            });

            var firstRun = true;

            var fakeMyTopicSkill = new Skill('myfakeskill', 'mytopic', expect.createSpy().andCall(function (context, request, response, next) {
                if (firstRun === true) {
                    response.message = new SingleLineMessage('I need more information please!');
                    response.lockConversationForNext();
                    firstRun = false;
                    return next();
                }

                return done();
            }));

            var fakeAnotherMyTopicSkill = new Skill('myfakeskill', 'myanothertopic', expect.createSpy().andCall(function (context, request, response, next) {
                return done('should not have called this topic');
            }));

            var bot = new Bot();
            bot.addSkill(fakeMyTopicSkill);
            bot.addSkill(fakeAnotherMyTopicSkill);

            return bot.resolve(123, "Hello.", function (err, messages) {
                expect(err).toNotExist();

                return bot.resolve(123, "Hi.", function (err, messages) {
                    expect(err).toNotExist();
                });
            });
        });

        it('lockConversationForNext only lasts for a single next conversation', function (done) {
            var mockClassifier = mockClassifierWithMockClassifierFactory();
            mockClassifier.getClassifications = expect.createSpy().andCall(function (sentence, callback) {
                if (sentence === 'Hello.') return callback(undefined, [{label: 'mytopic', value: 1}]);
                if (sentence === 'Hi.') return callback(undefined, [{label: 'myanothertopic', value: 1}]);
                return callback(undefined, [{label: 'myanothertopic', value: 1}]);
            });

            var firstRun = true;

            var fakeMyTopicSkill = new Skill('myfakeskill', 'mytopic', expect.createSpy().andCall(function (context, request, response, next) {
                if (firstRun === true) {
                    response.message = new SingleLineMessage('I need more information please!');
                    response.lockConversationForNext();
                    firstRun = false;
                    context.runs = 1;
                    return next();
                }

                context.runs = 2;

                return next();
            }));

            var fakeAnotherMyTopicSkill = new Skill('myfakeskill', 'myanothertopic', expect.createSpy().andCall(function (context, request, response, next) {
                expect(firstRun).toBe(false);
                expect(context.runs).toBe(2);
                return done();
            }));

            var bot = new Bot();
            bot.addSkill(fakeMyTopicSkill);
            bot.addSkill(fakeAnotherMyTopicSkill);

            return bot.resolve(123, "Hello.", function (err, messages) {
                expect(err).toNotExist();

                return bot.resolve(123, "Hi.", function (err, messages) {
                    expect(err).toNotExist();
                    return bot.resolve(123, "Hi.", function (err, messages) {
                        expect(err).toNotExist();
                    });
                });
            });
        });

        it('lock information is not available to the skill', function (done) {
            var mockClassifier = mockClassifierWithMockClassifierFactory();
            mockClassifier.getClassifications = expect.createSpy().andCall(function (sentence, callback) {
                return callback(undefined, [{label: 'mytopic', value: 1}]);
            });

            var firstRun = true;

            var fakeMyTopicSkill = new Skill('myfakeskill', 'mytopic', expect.createSpy().andCall(function (context, request, response, next) {
                if (firstRun === true) {
                    response.message = new SingleLineMessage('I need more information please!');
                    response.lockConversationForNext();

                    expect(context.lock).toNotExist();

                    firstRun = false;
                    context.runs = 1;
                    return next();
                }

                expect(context.lock).toNotExist();
                return done();
            }));

            var bot = new Bot();
            bot.addSkill(fakeMyTopicSkill);

            return bot.resolve(123, "Hello.", function (err, messages) {
                expect(err).toNotExist();

                return bot.resolve(123, "Hi.", function (err, messages) {
                    expect(err).toNotExist();
                });
            });
        });

        it('works with response.send to send message and next', function (done) {
            var mockClassifier = mockClassifierWithMockClassifierFactory();
            mockClassifier.getClassifications = expect.createSpy().andCall(function (sentence, callback) {
                return callback(undefined, [{label: 'mytopic', value: 1}]);
            });

            var fakeMyTopicSkill = new Skill('myfakeskill', 'mytopic', expect.createSpy().andCall(function (context, request, response, next) {
                return response.send(new Message('SingleLine', 'Hello there!'));
            }));

            var bot = new Bot();
            bot.addSkill(fakeMyTopicSkill);

            return bot.resolve(123, "Hello.", function (err, messages) {
                expect(err).toNotExist();

                expect(messages).toExist();
                expect(messages.length).toBe(1);
                expect(messages[0].type).toBe('SingleLine');
                expect(messages[0].content).toBe('Hello there!');
                return done();
            });
        });

        it('final() method is chainable with same effect as send(message, true)', function (done) {
            var mockClassifier = mockClassifierWithMockClassifierFactory();
            mockClassifier.getClassifications = expect.createSpy().andCall(function (sentence, callback) {
                return sentence === 'Hello.' ? callback(undefined, [{label: 'mytopic', value: 1}]) : callback(undefined, [{label: 'myanothertopic', value: 1}]);
            });

            var fakeMyTopicSkill = new Skill('myfakeskill', 'mytopic', expect.createSpy().andCall(function (context, request, response, next) {
                expect(response.final()).toBe(response);
                return response.final().send(new Message('SingleLine', 'Hello there!'));
            }));

            var fakeMyTopicSkill2 = new Skill('myfakeskill2', 'myanothertopic', expect.createSpy().andCall(function (context, request, response, next) {
                return done('should not have executed this skill');
            }));

            var bot = new Bot();
            bot.addSkill(fakeMyTopicSkill);
            bot.addSkill(fakeMyTopicSkill2);

            return bot.resolve(123, "Hello. Hi!", function (err, messages) {
                expect(err).toNotExist();

                expect(messages).toExist();
                expect(messages.length).toBe(1);
                expect(messages[0].type).toBe('SingleLine');
                expect(messages[0].content).toBe('Hello there!');
                return done();
            });
        });

        it('lockConversationForNext method is chainable', function (done) {
            var mockClassifier = mockClassifierWithMockClassifierFactory();
            mockClassifier.getClassifications = expect.createSpy().andCall(function (sentence, callback) {
                return callback(undefined, [{label: 'mytopic', value: 1}]);
            });

            var firstRun = true;

            var fakeMyTopicSkill = new Skill('myfakeskill', 'mytopic', expect.createSpy().andCall(function (context, request, response, next) {
                if (firstRun === true) {
                    var returnVal = response.lockConversationForNext();
                    expect(returnVal).toBe(response);

                    expect(context.lock).toNotExist();

                    firstRun = false;
                    context.runs = 1;
                    return response.lockConversationForNext().send(new SingleLineMessage('I need more information please!'));
                }

                expect(context.lock).toNotExist();
                return done();
            }));

            var bot = new Bot();
            bot.addSkill(fakeMyTopicSkill);

            return bot.resolve(123, "Hello.", function (err, messages) {
                expect(err).toNotExist();

                return bot.resolve(123, "Hi.", function (err, messages) {
                    expect(err).toNotExist();
                });
            });
        });

        it('resolves across multiple classifiers', function(done) {
            var fakeMyTopicSkill = new Skill('myskill', 'hello', expect.createSpy().andCall(function (context, request, response) {
                var resolutionConfidence = request.skill.current.topic.confidence;
                expect(resolutionConfidence).toBe(0.5);
                return done();
            }));

            var TalkifyClassifier = require('talkify-classifier');
            var fakeClassifier1 = new TalkifyClassifier();
            fakeClassifier1.getClassifications = function(input, callback) {
                return callback(undefined, [{label: 'hello', value: 0.2}]);
            };

            var fakeClassifier2 = new TalkifyClassifier();
            fakeClassifier2.getClassifications = function(input, callback) {
                return callback(undefined, [{label: 'hello', value: 0.5}]);
            };

            var bot = new Bot({classifiers: [fakeClassifier1, fakeClassifier2]});
            bot.addSkill(fakeMyTopicSkill, 0.4);

            return bot.resolve(1, 'hello this is a message', function(err, messages) {
                // placeholder callback
            });
        });

        it('prioritises low confidence definite resolution over high confidence indeterminate resolution', function(done) {
            var fakeMyTopicSkill = new Skill('myskill', 'hello', expect.createSpy().andCall(function (context, request, response) {
                var resolutionConfidence = request.skill.current.topic.confidence;
                expect(resolutionConfidence).toBe(0.1);
                return done();
            }));

            var TalkifyClassifier = require('talkify-classifier');
            var fakeClassifier1 = new TalkifyClassifier();
            fakeClassifier1.getClassifications = function(input, callback) {
                return callback(undefined, [{label: 'hello', value: 0.1}]);
            };

            var fakeClassifier2 = new TalkifyClassifier();
            fakeClassifier2.getClassifications = function(input, callback) {
                return callback(undefined, [{label: undefined, value: 1}]);
            };

            var bot = new Bot({classifiers: [fakeClassifier1, fakeClassifier2]});
            bot.addSkill(fakeMyTopicSkill);

            return bot.resolve(1, 'hello this is a message', function(err, messages) {
                // placeholder callback
            });
        });
    });

    describe('getContextStore', function () {
        const ContextStore = require('../lib/ContextStore');
        it('gets context store', function () {
            var bot = new Bot();
            var contextStore = bot.getContextStore();
            expect(contextStore).toExist();
            expect(contextStore).toBeA(ContextStore);
        });

        it('gets passed in context store', function () {
            var fakeContextStore = {
                put: function () {
                }, get: function () {
                }, remove: function () {
                }
            };
            var bot = new Bot({contextStore: fakeContextStore});
            var contextStore = bot.getContextStore();
            expect(contextStore).toExist();
            expect(contextStore).toNotBeA(ContextStore);
            expect(contextStore).toBe(fakeContextStore);
        });
    });

    describe('getClassifier', function () {
        it('gets initialised default classifier', function () {
            var bot = new Bot();
            var classifier = bot.getClassifier();
            expect(classifier).toExist();
        });

        it('gets passed in classifier', function () {
            var natural = require('talkify-natural-classifier');
            var fakeClassifier = new natural.BayesClassifier();
            var bot = new Bot({classifier: fakeClassifier});
            var classifier = bot.getClassifier();
            expect(classifier).toExist();
            expect(classifier).toNotBeA(natural.LogisticRegressionClassifier);
            expect(classifier).toBe(fakeClassifier);
        });

        it('returns last registered classifier', function() {
            var TalkifyClassifier = require('talkify-classifier');
            var fakeClassifier1 = new TalkifyClassifier();
            var fakeClassifier2 = new TalkifyClassifier();
            var bot = new Bot({classifier: [fakeClassifier1, fakeClassifier2]});
            var classifier = bot.getClassifier();
            expect(classifier).toExist();
            expect(classifier).toBe(fakeClassifier2);
        })
    });

    describe('chainableMethods', function () {
        it('chainable train method', function (done) {
            const bot = new Bot();
            const returnReference = bot.train('topic', 'text', function(){});

            expect(returnReference).toBe(bot);
            done();
        });

        it('chainable addSkill method', function (done) {
            const bot = new Bot();
            const fakeSkillFn = function (context, req, res, next) {
            };
            const returnReference = bot.addSkill(new Skill('fakeskill', 'topic', fakeSkillFn));

            expect(returnReference).toBe(bot);
            done();
        });

        it('chainable resolve method', function (done) {
            const bot = new Bot();
            const returnReference = bot.resolve(123, "Hello. Hi.", function (err, messages) {
            });

            expect(returnReference).toBe(bot);
            done();
        });
    });
});
