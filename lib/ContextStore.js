/**
 * Created by manthanhd on 18/10/2016.
 */
function ContextStore() {
    const store = {};

    this.put = function PutContextFn(id, context, callback) {
        callback = callback || function(){};

        if(id === undefined) return callback(new TypeError('Parameter id must be defined'));

        store[id] = {value: context};
        return callback(undefined, {id: id, context: context});
    };

    this.get = function GetContextFn(id, callback) {
        if(id === undefined) return callback(new TypeError('Parameter id must be defined'));
        if(callback === undefined) throw new TypeError('Parameter callback must be defined');

        var retrievedContext = store[id];
        if(retrievedContext === undefined) return callback(undefined, undefined);

        var contextRecord = {id: id, context: retrievedContext.value};
        return callback(undefined, contextRecord);
    };

    this.remove = function RemoveContextFn(id, callback) {
        callback = callback || function() {};
        if(id === undefined) return callback(new TypeError('Parameter id must be defined'));
        delete store[id];
        return callback(undefined, undefined);
    };
}

module.exports = ContextStore;