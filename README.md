# Talkify
Framework for developing chat bot applications.

[![npm version](https://badge.fury.io/js/talkify.svg)](https://badge.fury.io/js/talkify) [![Build Status](https://travis-ci.org/manthanhd/talkify.svg?branch=master)](https://travis-ci.org/manthanhd/talkify) [![Coverage Status](https://coveralls.io/repos/github/manthanhd/talkify/badge.svg?branch=master)](https://coveralls.io/github/manthanhd/talkify?branch=master)

<!-- vim-markdown-toc GFM -->
* [Usage](#usage)
  * [Setup](#setup)
  * [Code Tutorial](#code-tutorial)
    * [Initialize](#initialize)
    * [Train](#train)
    * [Add Skills](#add-skills)
    * [Resolve queries](#resolve-queries)
	* [Chainable methods](#chainable-methods)
  * [Configuration Options](#configuration-options)
    * [Context Store](#context-store)
    * [Classifier](#classifier)
  * [Extending bot](#extending-bot)
    * [Context management](#context-management)
	* [Custom Classifier](#custom-classifier)
* [Reference Documentation](#reference-documentation)
* [Contributing](#contributing)

<!-- vim-markdown-toc -->

# Usage
## Setup

Make sure you have node and npm installed. As of now, this module has been tested against 0.12 node version within the [Travis CI](https://travis-ci.org/manthanhd/talkify) pipeline.

Simply run `npm install` command to install:

```bash
npm install --save talkify
```

## Code Tutorial

### Initialize

Require the main module, types and dependencies. The following command loads everything that you need from the module.

```javascript
// Core dependency
const talkify = require('talkify');
const Bot = talkify.Bot;

// Types dependencies
const BotTypes = talkify.BotTypes;
const Message = BotTypes.Message;
const SingleLineMessage = BotTypes.SingleLineMessage;
const MultiLineMessage = BotTypes.MultiLineMessage;

// Skills dependencies
const Skill = BotTypes.Skill;

// Training dependencies
const TrainingDocument = BotTypes.TrainingDocument;
```

Once the dependencies have been loaded, you can initialise the bot core.

```javascript
const bot = new Bot();
```

The `Bot()` constructor also accepts parameters in the form of configuration object. Here you can pass in configuration switch values or alternate implementations for things like `ContextStore` and `Classifier` etc. We'll cover that afterwards in the [Configuration Options](#configuration-options) section.

### Train

Once Bot has been initialised, the first thing you should do is to train it. To train it one document at a time synchronously, you can use the `train` method:

```javascript
bot.trainAll([
    new TrainingDocument('how_are_you', 'how are you'),
    new TrainingDocument('how_are_you', 'how are you going'),
    new TrainingDocument('how_are_you', 'how is it going'),

    new TrainingDocument('help', 'how can you help'),
    new TrainingDocument('help', 'i need some help'),
    new TrainingDocument('help', 'how could you assist me')
], function() {});
```

The code above trains the bot to recognise the topic `how_are_you` when the text looks like `how are you` or `how are you doing` as well as `how is it going` but to recognise topic `help` when the text looks like `how can you help` or `i need some help` as well as `how can you assist me`. This is how you would train the bot. 

The `trainAll` method accepts an array of `TrainingDocument` objects as well as a callback function. The `TrainingDocument` object constructor accepts two parameters. These are `topicName` and `trainingData`. The `topicName` parameter is the name of the topic you want to train the `trainingData` for and the `trainingData` is the sentence that you are feeding the bot as its training data. The `topicName` will later on map to actual skills the bot can respond to.

The callback for the `trainAll` method is a function that the bot can call when the training is complete. If you have too much training data, you should implement this properly. In this example, since there is not much training data, we've passed in an empty `function`.

Needless to say, the bot gets better with more training data. In this tutorial we are using the default classifier, which currently is the `LogisticRegression` classifier from the [talkify-natural-classifier](https://github.com/manthanhd/talkify-natural-classifier) library. This classifier typically needs bit more training data to start with but is more accurate than others in most conditions.

### Add Skills

Once you have trained the bot for some topics, you need to add some skills. Skills are actions that the bot will execute when it recognises a topic. So topics and skills map to 1:1.

To add a skill, you need to create it first. A skill requires three things. Name of the skill that is unique to the bot. The name is used to relate skills later on within the context. A topic that it maps to and a function that the bot will call in order to execute the skill. This function will take four parameters, namely: `context, request, response, next`. The `context` parameter is used to store any useful contextual information from that skill. The `request` parameter contains information about the request, same for `response`. The `next` parameter is a function that you can call to let the bot
know that you are done processing. Here's what a skill looks like:

```javascript
var howAction = function(context, request, response, next) {
    response.message = new SingleLineMessage('You asked: \"' + request.message.content + '\". I\'m doing well. Thanks for asking.');
    next();
};

var helpAction = function(context, request, response, next) {
    response.message = new SingleLineMessage('You asked: \"' + request.message.content + '\". I can tell you how I\'m doing if you ask nicely.');
    next();
};

var howSkill = new Skill('how_skill', 'how_are_you', howAction);
var helpSkill = new Skill('help_skill', 'help', helpAction);
```

**Note:** Name of a skill can be undefined. However, please be aware that doing so will mean that the bot will execute that skill whenever its confidence level is 0 for responding to a given query.

Once you have defined some skills, you need to add them to the bot. Add the skill to the bot like so:

```javascript
bot.addSkill(howSkill);
bot.addSkill(helpSkill);
```

### Resolve queries

Once added, you can now ask bot to resolve something. This is where you are querying the bot with a sentence and it will respond with a message asynchronously. The resolve function takes in three parameters: `contextId, text, callback`. The `contextId` helps bot resolve context from any previous conversation. The `text` is the question or piece of natural language string that the bot needs to interpret and respond to. Lastly, the `callback` is the callback function that the bot will call
with `err, messages` parameters to indicate an error (if any) and it's reply messages.

```javascript
var resolved = function(err, messages) {
    if(err) return console.error(err);

    return console.log(messages);
};

bot.resolve(123, 'Assistance required', resolved);
```

Run it like a simple node file and it should print the following in the console.

```
[ { type: 'SingleLine',
    content: 'You asked: "Assistance required". I can tell you how I\'m doing if you ask nicely.' } ]
```

Try changing `bot.resolve` to this and notice the change in response.

```javascript
bot.resolve(456, 'How\'s it going?', resolved);
```

Let's ask two things at once. Change `bot.resolve` again to:

```javascript
bot.resolve(456, 'How\'s it going? Assistance required please.', resolved);
```

When you run your code, you should get two messages back:

```javascript
[ { type: 'SingleLine',
    content: 'You asked: "How\'s it going? Assistance required please.". I\'m doing well. Thanks for asking.' },
  { type: 'SingleLine',
    content: 'You asked: "How\'s it going? Assistance required please.". I can tell you how I\'m doing if you ask nicely.' } ]
```

### Chainable methods
Currently `train`, `addSkill` and `resolve` methods are chainable. That means you can create Bot object and cascade methods like is mentioned below.

```javascript
	new Bot().train(topic, sentence).addSkill(skill).resolve(....)
```

## Configuration Options

### Context Store

The bot core also accepts an alternate implementation for the built in context store. Please see [Context management](#context-management) for more details.

### Classifier

You can also supply your own version of the classifier to the bot. This option was primarily used to make testing easier, however, it can still be used in production if you have a better version of the built-in classifier.

The built in classifier is the [talkify-natural-classifier](https://github.com/manthanhd/talkify-natural-classifier). This classifier provides two implementations:

* `LogisticRegressionClassifier`
* `BayesClassifier`

The `LogisticRegressionClassifier` is the default classifier. If you prefer to implement the `BayesClassifier` from `talkify-natural-classifier`, you can do the following:

```javascript
var BayesClassifier = require('talkify-natural-classifier').BayesClassifier;

var bot = new Bot({classifier: new BayesClassifier()});
```

If you prefer to use IBM Watson's Natural Language Processing Classifier instead, you should use the [talkify-watson-classifier](https://github.com/manthanhd/talkify-watson-classifier) library instead. Please see the guide on the Github repository page for more details on how to use that classifier.

If you think yours work better, give me a shout! I'd be delighted to know and possibly work towards implementing it within the core module.

## Extending bot

### Context management
By default, the bot core uses its built in version of ContextStore. If you look into lib/ContextStore.js, you'll find that it is a very simple implementation where the context is stored in a simple in-memory map with the `contextId` being the key and the context object being the value. Of course when you come to deploy this, the built-in context store will be very limiting.

Extending the context store is very easy. Within the config, you can provide your own implementation for the ContextStore object. The following code provides a very trivial implementation that simply logs the values to the console.

```javascript
var myContextStore = {
    put: function(id, context, callback) {
        console.info('put');
        console.info(id);
        console.info(context);
    },

    get: function(id, callback) {
        console.info('get');
        console.info(id);
    },

    remove: function(id, callback) {
        console.info('remove');
        console.info(id);
    }
}

var bot = new Bot({contextStore: myContextStore});
```

The current spec for `ContextStore` requires three functions to be implemented. These are `put, get and remove`. As long as these methods are provided, the bot does not care where the value for `contextStore` field in config comes from.

If you were to run that code with some query resolves, you will find that the remove function never gets called. This is a work in progress as currently there is no limit as to how long a context must be remembered.

### Custom Classifier

As mentioned before, the default classifier that the bot uses is from the [talkify-natural-classifier](https://github.com/manthanhd/talkify-natural-classifier) library. You are free to write your own classifier and use it in your application. To do this, you need to extend the classifier interface defined in the [talkify-classifier](https://github.com/manthanhd/talkify-classifier) library.

Once you have successfully extended that implementation, you can supply your classifier to the bot like so:

```javascript
var myClassifier = new MyAwesomeClassifier();
var bot = new Bot({ classifier: myClassifier });
```

I'd love to see your implementation of the talkify classifier. If you have extended the interface and successfully implemented your classifier give me a shout! I'd be delighted to know your experience using this library.

# Reference Documentation

* [Skills](./wiki/SKILLS.md)

# Contributing

Please see the [contributing guide](./CONTRIBUTING.md) for more details.
