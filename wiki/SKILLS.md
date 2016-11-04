# Skills

This page is intended to serve as a guide to what skills are, how they plug into the Bot core and how they can be used.

<!-- vim-markdown-toc GFM -->
* [Concept](#concept)
	* [Basics](#basics)
	* [The apply function](#the-apply-function)
		* [Context](#context)
		* [Request](#request)
		* [Response](#response)
* [Adding skill](#adding-skill)
* [Helpers](#helpers)
	* [StaticResponse](#staticresponse)
	* [StaticRandomResponse](#staticrandomresponse)

<!-- vim-markdown-toc -->

## Concept

### Basics

At its core, a skill is an object that represents an action that the bot executes to respond back to the user as part of a conversation. The object is called a Skill object and the action is the JavaScript skill function that is passed in when instantiating a new skill.

At a basic level, a skill object can be created like so:

```javascript
var skillName = 'my_help_skill';
var topicName = 'help';
var helpSkill = new Skill(skillName, topicName, function ApplyFn(context, request, response, next) {
	...
	return next();
});
```

A skill name is expected to be unique where as at the same time, multiple skills can work with the same topic name. For every skill, an apply function must be defined.

### The apply function

The apply function is called whenever a skill is matched against a given incoming message. It is called with four function parameters, namely: `context, request, response, next`. These four objects are there to help you construct a meaningful conversational response.

#### Context

The context object is a simple object, designed to serve as a key-value map. Every interaction with the bot requires a correspondance ID. This ID is used to create a new context if one does not already exist or to load an existing one. 

The idea is to allow skills to infer values from previously saved ones if they have not been explicitly specified in a given query. 

For example, a skill that extracts and resolves a ticket number can use the context to save the ticket number when a given sentene contains one. Next time, when the same skill is called as part of a different statement, the ticket number may not be present in the sentence. In this scenario, the ticket number can be retrieved from the context that was persisted previously.

#### Request

The request object serves to provide data about the request itself. Currently, the request object contains the following:

| Attribute | Data Type | Description                                           |
|----------:|-----------|-------------------------------------------------------|
| id        | String    | Correspondance ID of the request                      |
| message   | Message   | Message object representing the incoming message      |
| sentence  | Object    | Object containing `all[]` array containing all sentences in the request, `current` string representing the current sentence that is being processed and `index` number representing the index within the sentence array of the current sentence that is being processed.     |
| skill  | Object    | Object containing `all[]` array containing all skills resolved as part of the request, `current` Skill representing the current sentence that is being processed and `index` number representing the index within the skill array of the current skill that is being processed.     |

#### Response

The response object can be used to respond to the query from the skill. Basic usage to respond with a message is:

```javascript
response.message = new Message('SingleLine', 'Hey there!');
```

Once you have responded to a message, you may want to do something else too. That is fine, as long as you remember to call the next() function which is passed in as the fourth parameter to the apply function. 

**Make sure you call next() or else the bot will never know that the skill has finished processing the request.**

All skills are resolved and executed as part of a skill resolution chain. This is true especially when the bot is processing multi-sentence requests. However, sometimes, you may want to set a final message to the response, preventing the rest of the execution chain from responding. This can be achieved by calling the `final()` function within the response object. Basic usage is like so:

```javascript
response.message = new SingleLineMessage('Sorry I do not understand what you are trying to say.');
response.final();
response.next();
```

## Adding skill

For every topic the bot has been trained for, it must have a corresponding skill that it can call to resolve that topic. Thus, the number of skills must be *at least* equal to the number of topics. At a basic level, a skill can be added to the bot like so:

```javascript
bot.addSkill(skillObject);
```

You can map more skills than the number of topics. This is because skills can be mapped at different minimum confidence levels to a topic. The confidence level can be specified as the second parameter to the addSkill method on the bot. Basic usage is like so:

```javascript
bot.addSkill(skillObject, 50);
```

According to the above example, the bot will only resolve the above skill when its confidence in the resolved topic from the sentence is at least 50%.

Multiple topics can be added at multiple skill levels. The bot will always resolve the skill closest to its confidence level.

```javscript
bot.addSkill(skillA);
bot.addSkill(skillB, 40);
bot.addSkill(skillC, 60);
```

In the above example, `skillC` gets executed when the bot is at least 60% confident in its topic resolution, `skillB` when it is 40% confident and `skillA` below 40%. Notice that we did not need to specify confidence level for `skillA` because when skills are added, the default minimum confidence level at which they are executed is always 0.

## Helpers

To make skill-making easier, some helpers are available. These are wrappers around the skill object that allow you to common tasks within a skill.

### StaticResponse

The `StaticResponse` helper can help you create a skill that statically responds using a single message object. The constructor requires you to pass in three parameters. These are `skillName` as a `string`, `topicName` as a `string` and `Message` which could be a `string`, `array` or a `Message` object.

Here's syntax for all the ways it can be used.

```javascript
var skillName = 'MyAwesomeSkill';
var topic = 'some_topic';

var singleLineSkill = new StaticResponseSkill(skillName, topic, 'My Static Response');
var multiLineSkill = new StaticResponseSkill(skillName, topic, ['Static', 'Response']);
var messageObjectSkill = new StaticResponseSkill(skillName, topic, [new Message('MultiLine', ['Multi', 'Line'])]);
```

### StaticRandomResponse

If you ever wanted to return a random response from a list of responses, `StaticRandomResponse` helper is your friend. The constructor requires you to pass in three parameters. These are `skillName` as a `string`, `topicName` as a `string` and `Message` which could be a `string[]`, `Message[]` object.

Here's a syntax for all the ways it can be used.

```javscript
var skillName = 'MyAwesomeSkill';
var topic = 'some_topic';

var singleLineSkill = new StaticRandomResponseSkill(skillName, topic, ['random', 'skill']);
var messageObjectSkill = new StaticRandomResponseSkill(skillName, topic, [new SingleLineMessage('Random Response One'), new SingleLineMessage('Random Response Two')]);
```
