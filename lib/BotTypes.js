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

function Skill(name, topic, skillFn) {
    if(!name || (typeof name !== 'string' && !(name instanceof String))) throw new TypeError('name parameter is of invalid type. Must exist and be a String');
    if(topic !== undefined && (typeof topic !== 'string' && !(topic instanceof String))) throw new TypeError('topic parameter is of invalid type. Must exist and be a String');
    if(!skillFn || !(skillFn instanceof Function)) throw new TypeError('skillFn parameter is of invalid type. Must exist and be a function');
    this.name = name;
    this.topic = topic;
    this.apply = skillFn;
}

function StaticResponseSkill(name, topic, staticResponse) {
    this.topic = topic;
    var _staticStringResponse, _staticMessageResponse;
    if(typeof staticResponse === 'string' || staticResponse instanceof String) _staticStringResponse = staticResponse;
    else if (staticResponse instanceof Message) _staticMessageResponse = staticResponse;
    else throw new TypeError('Expected staticResponse object to be of type Message or String');

    this.apply = function(context, request, response, next) {
        if(_staticMessageResponse) {
            response.message = _staticMessageResponse;
        } else {
            response.message = new SingleLineMessage(_staticStringResponse);
        }

        return next();
    };

    return new Skill(name, topic, this.apply);
}

function StaticRandomResponseSkill(name, topic, staticResponses) {
    this.topic = topic;
    if(staticResponses === undefined) throw new TypeError('Expected staticResponses to be defined');
    if(!(staticResponses instanceof Array)) throw new TypeError('Expected staticResponses to be of type Array'); 
    if(staticResponses.length === 0) throw new TypeError("expected staticResponses to have at least one item");

    for(var i = 0; i < staticResponses.length; i++) {
        var staticResponse = staticResponses[i];
        if (!(typeof staticResponse === 'string' || staticResponse instanceof String) && !(staticResponse instanceof Message)) throw new TypeError('Expected staticResponse object to be of type Message or String');
    }

    this.apply = function ApplyStaticRandomResponseSkillFn(context, request, response, next) {
        var _getRandomIndex = function _getRandomIndexFn(min, max) {
            return parseInt(Math.random() * (max - min) + min);
        };

        var chosenResponseIndex;
        if(this._getRandomIndex) {
            chosenResponseIndex = this._getRandomIndex(0, staticResponses.length);
        } else { 
            chosenResponseIndex = _getRandomIndex(0, staticResponses.length);
        }

        var chosenResponse = staticResponses[chosenResponseIndex];

        if(typeof staticResponse === 'string' || chosenResponse instanceof String) {     
            response.message = new SingleLineMessage(chosenResponse);
        } else { 
            response.message = chosenResponse;
        }

        return next();
    };

    return new Skill(name, topic, this.apply);
}

exports.Message = Message;
exports.Correspondence = Correspondence;
exports.Context = Context;
exports.SingleLineMessage = SingleLineMessage;
exports.MultiLineMessage = MultiLineMessage;
exports.TrainingDocument = TrainingDocument;
exports.Skill = Skill;
exports.StaticResponseSkill = StaticResponseSkill;
exports.StaticRandomResponseSkill = StaticRandomResponseSkill;