/**
 * Created by manthanhd on 17/10/2016.
 */
const expect = require('expect');

describe('Message', function() {
    const Message = require("../lib/BotTypes").Message;

    it("throws TypeError when initialised with type attribute as array", function(done) {
        try {
            new Message([]);
            done('should have failed');
        } catch (e) {
            expect(e).toBeA(TypeError);
            done();
        }
    });

    it('creates a new instance of Message when passed valid parameters', function(done) {
        var message = new Message('SingleLine', 'Hello World!');
        expect(message).toExist();
        expect(message.type).toBe('SingleLine');
        expect(message.content).toBe('Hello World!');
        done();
    });
});

describe('SingleLineMessage', function() {
    const SingleLineMessage = require("../lib/BotTypes").SingleLineMessage;

    it('creates a new instance of Message when passed valid parameters', function(done) {
        var message = new SingleLineMessage('Hello World!');
        expect(message).toExist();
        expect(message.type).toBe('SingleLine');
        expect(message.content).toBe('Hello World!');
        done();
    });
});

describe('MultiLineMessage', function() {
    const MultiLineMessage = require("../lib/BotTypes").MultiLineMessage;

    it("throws TypeError when initialised with content attribute as string", function(done) {
        try {
            new MultiLineMessage('');
            done('should have failed');
        } catch (e) {
            expect(e).toBeA(TypeError);
            done();
        }
    });

    it('creates a new instance of Message when passed valid parameters', function(done) {
        var message = new MultiLineMessage(['Hello World!']);
        expect(message).toExist();
        expect(message.type).toBe('MultiLine');
        expect(message.content.length).toBe(1);
        expect(message.content[0]).toBe('Hello World!');
        done();
    });
});

describe('Correspondence', function() {
    const Message = require('../lib/BotTypes').Message;
    const Correspondence = require("../lib/BotTypes").Correspondence;

    it("throws TypeError when initialised with message attribute as array", function(done) {
        try {
            new Correspondence(123, []);
            done('should have failed');
        } catch (e) {
            expect(e).toBeA(TypeError);
            done();
        }
    });

    it('creates a new instance of Correspondence when passed valid parameters', function(done) {
        var correspondence = new Correspondence('abcde12345', new Message('SingleLine', 'Hello World!'));
        expect(correspondence).toExist();
        expect(correspondence.id).toBe('abcde12345');
        expect(correspondence.message).toExist();
        expect(correspondence.message.type).toBe('SingleLine');
        expect(correspondence.message.content).toBe('Hello World!');
        done();
    });
});

describe('Context', function() {
    const Context = require("../lib/BotTypes").Context;

    it("throws TypeError when initialised with undefined id field", function(done) {
        try {
            new Context();
            done('should have failed');
        } catch (e) {
            expect(e).toBeA(TypeError);
            done();
        }
    });

    it('creates a new instance of Context when passed valid parameters', function(done) {
        var context = new Context(123);
        expect(context).toExist();
        expect(context.id).toBe(123);
        done();
    });
});

describe('TrainingDocument', function() {
    const TrainingDocument = require('../lib/BotTypes').TrainingDocument;

    it("throws TypeError when initialised with undefined values", function(done) {
        try {
            new TrainingDocument();
            done('should have failed');
        } catch (e) {
            expect(e).toBeA(TypeError);
            done();
        }
    });

    it('throws type error when topic parameter is not string', function(done) {
        try {
            new TrainingDocument([], '');
            done('should have failed');
        } catch (e) {
            expect(e).toBeA(TypeError);
            done();
        }
    });

    it('throws type error when text parameter is not string', function(done) {
        try {
            new TrainingDocument('', []);
            done('should have failed');
        } catch (e) {
            expect(e).toBeA(TypeError);
            done();
        }
    });

    it('returns a new TrainingDocument object when initialised with valid parameters', function() {
        var trainingDocument = new TrainingDocument('topic', 'text');
        expect(trainingDocument).toExist();
        expect(trainingDocument.topic).toBe('topic');
        expect(trainingDocument.text).toBe('text');
    });

    it('throws TypeError when text is not of type string', function(done) {
        try {
            new TrainingDocument('topic', {});
        } catch (e) {
            expect(e).toBeA(TypeError);
            done();
        }
    });

    it('throws TypeError when text is undefined', function(done) {
        try {
            new TrainingDocument('topic', undefined);
        } catch (e) {
            expect(e).toBeA(TypeError);
            done();
        }
    });
});

describe('Skill', function() {
    const Skill = require('../lib/BotTypes').Skill;

    it('throws TypeError when name parameter is not string', function(done) {
        try {
            new Skill([], 'mytopic', function(){});
            done('should have failed');
        } catch (e) {
            expect(e).toBeA(TypeError);
            done();
        }
    });

    it('throws TypeError when topic parameter is undefined', function(done) {
        try {
            new Skill('name', undefined);
            done('should have failed');
        } catch (e) {
            expect(e).toBeA(TypeError);
            done();
        }
    });

    it('throws TypeError when topic parameter is not string', function(done) {
        try {
            new Skill('name', []);
            done('should have failed');
        } catch (e) {
            expect(e).toBeA(TypeError);
            done();
        }
    });

    it('throws TypeError when skillFn parameter is undefined', function(done) {
        try {
            new Skill('name', '', undefined);
            done('should have failed');
        } catch (e) {
            expect(e).toBeA(TypeError);
            done();
        }
    });

    it('throws TypeError when skillFn parameter is not string', function(done) {
        try {
            new Skill('name', '', []);
            done('should have failed');
        } catch (e) {
            expect(e).toBeA(TypeError);
            done();
        }
    });

    it('returns new Skill object when parameters are valid', function(done) {
        const skillFn = function(context, req, res, next) {

        };
        var skill = new Skill('name', 'topic', skillFn);
        expect(skill.name).toBe('name');
        expect(skill.topic).toBe('topic');
        expect(skill.apply).toBe(skillFn);
        done();
    });
});

describe('StaticResponseSkill', function() {
    const Message = require('../lib/BotTypes').Message;
    const SingleLineMessage = require('../lib/BotTypes').SingleLineMessage;
    const MultiLineMessage = require('../lib/BotTypes').MultiLineMessage;
    const StaticResponseSkill = require('../lib/BotTypes').StaticResponseSkill;

    it('returns new skill that always returns given static string response', function(done) {
        var skill = new StaticResponseSkill('myskill', 'hello', 'hey there!');
        expect(skill.topic).toBe('hello');
        var fakeResponseObject = {};
        return skill.apply({}, {}, fakeResponseObject, function() {
            expect(fakeResponseObject.message).toBeA(Message);
            expect(fakeResponseObject.message.content).toBe('hey there!');
            done();
        });
    });

    it('returns new skill that always returns given static message response', function(done) {
        var singleLineMessage = new SingleLineMessage('hey there!');
        var skill = new StaticResponseSkill('myskill', 'hello', singleLineMessage);
        expect(skill.topic).toBe('hello');
        var fakeResponseObject = {};
        return skill.apply({}, {}, fakeResponseObject, function() {
            expect(fakeResponseObject.message).toBeA(Message);
            expect(fakeResponseObject.message).toBe(singleLineMessage);
            expect(fakeResponseObject.message.content).toBe('hey there!');
            done();
        });
    });

    it('throws type error when static response object is neither of type Message nor of type String', function() {
        try {
            new StaticResponseSkill('myskill', 'hello', {});
        } catch (e) {
            expect(e).toBeA(TypeError);
        }
    });
});

describe('StaticRandomResponseSkill', function() {
    const Message = require('../lib/BotTypes').Message;
    const SingleLineMessage = require('../lib/BotTypes').SingleLineMessage;
    const MultiLineMessage = require('../lib/BotTypes').MultiLineMessage;
    const StaticResponseSkill = require('../lib/BotTypes').StaticResponseSkill;
    const StaticRandomResponseSkill = require('../lib/BotTypes').StaticRandomResponseSkill;

    it('returns new skill that returns random response from given string responses', function(done) {
        var skill = new StaticRandomResponseSkill('myrandomskill', 'hello', ['awesome', 'amazing', 'one', 'two']);
        skill._getRandomIndex = function(min, max) {
            return 3;
        };

        var fakeResponseObject = {};
        return skill.apply({}, {}, fakeResponseObject, function() {
            expect(fakeResponseObject.message).toBeA(Message);
            expect(fakeResponseObject.message.content).toBe('two');

            fakeResponseObject = {};
            skill._getRandomIndex = function(min, max) {
                return 0;
            };

            return skill.apply({}, {}, fakeResponseObject, function() {
                expect(fakeResponseObject.message).toBeA(Message);
                expect(fakeResponseObject.message.content).toBe('awesome');
                done();
            });
        });
    });

    it('returns new skill that returns random response from given Message responses', function(done) {
        var awesomeSingleLineResponse = new SingleLineMessage('awesome');
        var amazingSingleLineResponse = new SingleLineMessage('amazing');
        var oneSingleLineResponse = new SingleLineMessage('one');
        var twoSingleLineResponse = new SingleLineMessage('two');
        var skill = new StaticRandomResponseSkill('myrandomskill', 'hello', [awesomeSingleLineResponse, amazingSingleLineResponse, oneSingleLineResponse, twoSingleLineResponse]);
        skill._getRandomIndex = function(min, max) {
            return 3;
        };

        var fakeResponseObject = {};
        return skill.apply({}, {}, fakeResponseObject, function() {
            expect(fakeResponseObject.message).toBeA(Message);
            expect(fakeResponseObject.message).toBe(twoSingleLineResponse);

            fakeResponseObject = {};
            skill._getRandomIndex = function(min, max) {
                return 0;
            };

            return skill.apply({}, {}, fakeResponseObject, function() {
                expect(fakeResponseObject.message).toBeA(Message);
                expect(fakeResponseObject.message).toBe(awesomeSingleLineResponse);
                done();
            });
        });
    });

    it('throws TypeError when one of the items in the array is not of valid type', function(done) {
        try {
            var skill = new StaticRandomResponseSkill('myrandomskill', 'hello', ['awesome', {}]);
        } catch (e) {
            expect(e).toBeA(TypeError);
            done();
        }
    });

    it('throws TypeError when the responses parameter is not an array', function(done) {
        try {
            new StaticRandomResponseSkill('myrandomskill', 'hello', {});
        } catch (e) {
            expect(e).toBeA(TypeError);
            done();
        }
    });

    it('throws TypeError when the responses parameter is undefined', function(done) {
        try {
            new StaticRandomResponseSkill('myrandomskill', 'hello', undefined);
        } catch (e) {
            expect(e).toBeA(TypeError);
            done();
        }
    });

    it('throws TypeError when the topic parameter is undefined', function(done) {
        try {
            new StaticRandomResponseSkill('myrandomskill', undefined);
        } catch (e) {
            expect(e).toBeA(TypeError);
            done();
        }
    });

    it('throws TypeErrpr when responses array is empty', function(done) {
        try {
            new StaticRandomResponseSkill('myrandomskill', 'topic', []);
        } catch (e) {
            expect(e).toBeA(TypeError);
            done();
        }
    });
});