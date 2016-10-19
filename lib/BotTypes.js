/**
 * Created by manthanhd on 17/10/2016.
 */
function Message(type, content) {
    if(typeof type !== 'string' && !(type instanceof String)) throw new TypeError('type attribute for Message must be a String');
    this.type = type;
    this.content = content;
}

function SingleLineMessage(content) {
    return new Message('SingleLine', content);
}

function MultiLineMessage(content) {
    if(!(content instanceof Array)) throw new TypeError('content for MultiLineMessage is expected to be Array');
    return new Message('MultiLine', content);
}

function Correspondence(id, message) {
    if(message && !(message instanceof Message)) throw new TypeError('message attribute must be of type Message');
    this.id = id;
    this.message = message;
}

function TrainingDocument(topic, text) {
    if(!topic || (typeof topic !== 'string' && !(topic instanceof String))) throw new TypeError('topic parameter is of invalid type. Must exist and be a String.');
    if(!text || (typeof text !== 'string' && !(text instanceof String))) throw new TypeError('text parameter is of invalid type. Must exist and be a String.');
    this.topic = topic;
    this.text = text;
}

function Context(id) {
    if(!id) throw new TypeError('Expected id for Context to exist');
    this.id = id;
}

function Skill(topic, skillFn) {
    if(!topic || (typeof topic !== 'string' && !(topic instanceof String))) throw new TypeError('topic parameter is of invalid type. Must exist and be a String');
    if(!skillFn || !(skillFn instanceof Function)) throw new TypeError('skillFn parameter is of invalid type. Must exist and be a function');
    this.topic = topic;
    this.apply = skillFn;
}

exports.Message = Message;
exports.Correspondence = Correspondence;
exports.Context = Context;
exports.SingleLineMessage = SingleLineMessage;
exports.MultiLineMessage = MultiLineMessage;
exports.TrainingDocument = TrainingDocument;
exports.Skill = Skill;