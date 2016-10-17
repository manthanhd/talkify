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
});