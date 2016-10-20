# Talkify
Framework for developing chat bot applications.

[![Build Status](https://travis-ci.org/manthanhd/botjs.svg?branch=master)](https://travis-ci.org/manthanhd/botjs) [![Coverage Status](https://coveralls.io/repos/github/manthanhd/botjs/badge.svg?branch=master)](https://coveralls.io/github/manthanhd/botjs?branch=master)


<!-- vim-markdown-toc GFM -->
* [Usage](#usage)
	* [Setup](#setup)
	* [Code Tutorial](#code-tutorial)
		* [Initialize](#initialize)
		* [Train](#train)
		* [Add Skills](#add-skills)
		* [Resolve queries](#resolve-queries)
	* [Extending bot](#extending-bot)
		* [Context management](#context-management)
* [Contributing](#contributing)

<!-- vim-markdown-toc -->

# Usage
## Setup
Make sure you have node and npm installed. As of now, this module has been tested against latest node, 6, 5, 4, 0.12 and 0.10 within Travis CI pipeline. 

Simply run:

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
const bot = new Bot()
```

The Bot core also accepts a configuration object. Here you can pass in configuration switch values or alternate implementations for things like ContextStore and Classifier etc. We'll cover that in wiki afterwards.

### Train

Once Bot has been initialised, the first thing you should do is to train it. To train it one document at a time synchronously, you can use the `train` method:

```javascript
bot.train('apple', 'I love apples');
bot.train('apple', 'apples are amazing');
bot.train('orange', 'I love oranges');
bot.train('orange', 'oranges are amazing');
```

The code above trains the bot to recognise the topic `apple` when the text looks like `I love apples` or `apples are amazing` but to recognise topic `orange` when the text looks like `I love oranges` or `oranges are amazing`. This is how you would train the bot. The first parameter in the `train` method is the topic that you want the bot to recognise and the second parameter is the text that you want the bot to classify as that topic. With enough training sets, the bot should get good at
classifying things correctly. Also, keep in mind that the bot does not do an exact lookup so in a sense it is learning from the sentences that it is being trained for.

### Add Skills

Once you have trained the bot for some topics, you need to add some skills. Skills are actions that the bot will execute when it recognises a topic. So topics and skills map to 1:1. 

To add a skill, you need to create it first. A skill requires two things. A topic that it maps to and a function that the bot will call in order to execute the skill. This function will take four parameters, namely: `context, request, response, next`. The `context` parameter is used to store any useful contextual information from that skill. The `request` parameter contains information about the request, same for `response`. The `next` parameter is a function that you can call to let the bot
know that you are done processing. Here's what a skill looks like:

```javascript
var appleAction = function(context, request, response, next) {
    request.message = new SingleLineMessage('Hey you love apples!');
    next();
};

var appleSkill = new Skill('apple', appleAction);
```

Do the same for `orangeSkill` but replace `apple` with `orange`. Add the skill to the bot like so:

```javascript
bot.addSkill(appleSkill);
bot.addSkill(orangeSkill);
```

### Resolve queries

Once added, you can now ask bot to resolve something. This is where you are querying the bot with a sentence and it will respond with a message asynchronously. The resolve function takes in three parameters: `contextId, text, callback`. The `contextId` helps bot resolve context from any previous conversation. The `text` is the question or piece of natural language string that the bot needs to interpret and respond to. Lastly, the `callback` is the callback function that the bot will call
with `err, messages` parameters to indicate an error (if any) and it's reply messages.

```javascript
var resolved = function(err, messages) {
    if(err) return console.error(err);

    return console.log(messages);
};

bot.resolve(123, 'hey i love apples!', resolved);
```

Run it like a simple node file and it should print `Hey you love apples!` in the console.

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

# Contributing
WIP

