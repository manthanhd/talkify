/**
 * Created by manthanhd on 19/10/2016.
 */
const expect = require('expect');

describe('ContextStore', function() {
    describe('put', function() {
        const ContextStore = require('../lib/ContextStore');

        it('puts context against given ID', function(done) {
            const store = new ContextStore();
            store.put(123, {subject: 'hammer'}, function(err, storedRecord) {
                if(err) return done('should not have errored');

                expect(storedRecord).toExist();
                expect(storedRecord.id).toBe(123);
                expect(storedRecord.context).toExist();
                expect(storedRecord.context.subject).toBe('hammer');
                done();
            });
        });

        it('returns TypeError when ID is undefined', function(done) {
            const store = new ContextStore();
            store.put(undefined, {subject: 'car'}, function(err, storedRecord) {
                expect(err).toExist();
                expect(err).toBeA(TypeError);
                expect(storedRecord).toNotExist();
                done();
            });
        });

        it('does not throw error when callback is undefined', function(done) {
            const store = new ContextStore();
            try {
                store.put(123, {subject: 'dogs'}, undefined);
                done();
            } catch (e) {
                done(e);
            }
        });
    });

    describe('get', function() {
        const ContextStore = require('../lib/ContextStore');

        it('gets saved context', function(done) {
            const store = new ContextStore();

            var retrieved = function(err, contextRecord) {
                expect(err).toNotExist();
                expect(contextRecord).toExist();
                expect(contextRecord.id).toBe(123);
                expect(contextRecord.context).toExist();
                expect(contextRecord.context.subject).toBe('camel');
                done(err);
            };

            var stored = function(err, storedRecord) {
                store.get(123, retrieved);
            };

            store.put(123, {subject: 'camel'}, stored);
        });

        it('returns TypeError when lookup ID is undefined', function(done) {
            const store = new ContextStore();

            var retrieved = function(err, contextRecord) {
                expect(err).toExist();
                expect(contextRecord).toNotExist();
                expect(err).toBeA(TypeError);
                done(contextRecord);
            };

            store.get(undefined, retrieved);
        });

        it('throws TypeError when callback is undefined', function(done) {
            const store = new ContextStore();

            try {
                store.get(123);
                done('should have failed')
            } catch (e) {
                expect(e).toExist();
                expect(e).toBeA(TypeError);
                done();
            }
        });

        it('gets undefined result if key does not exist', function(done) {
            const store = new ContextStore();

            store.get(999, function(err, contextRecord) {
                if(err) return done(err);

                expect(contextRecord).toNotExist();
                done();
            });
        });

        it('gets context record with undefined context value if key exists but context does not exist', function(done) {
            const store = new ContextStore();

            var retrieved = function(err, contextRecord) {
                expect(err).toNotExist();
                expect(contextRecord).toExist();
                expect(contextRecord.id).toBe(123);
                expect(contextRecord.context).toNotExist();
                done(err);
            };

            var stored = function(err, storedRecord) {
                store.get(123, retrieved);
            };

            store.put(123, undefined, stored);
        });
    });

    describe('remove', function() {
        const ContextStore = require('../lib/ContextStore');

        it('removes specified key', function(done) {
            const store = new ContextStore();

            var retrieveRemoved = function(err, contextRecord) {
                expect(err).toNotExist();
                expect(contextRecord).toNotExist();
                done();
            };

            var removed = function(err, contextRecord) {
                store.get(123, retrieveRemoved);
            };

            var retrieved = function(err, contextRecord) {
                store.remove(123, removed);
            };

            var stored = function(err, storedRecord) {
                store.get(123, retrieved);
            };

            store.put(123, {subject: 'marshmallow'}, stored);
        });

        it('returns TypeError when removing undefined key', function(done) {
            const store = new ContextStore();

            var removed = function(err, contextRecord) {
                expect(err).toExist();
                expect(err).toBeA(TypeError);
                expect(contextRecord).toNotExist();
                done();
            };

            store.remove(undefined, removed);
        });

        it('does not throw error when callback is undefined', function(done) {
            const store = new ContextStore();

            try {
                store.remove(123, undefined);
                done();
            } catch (e) {
                done(e);
            }
        })
    });
});