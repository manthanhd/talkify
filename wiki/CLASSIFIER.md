# Classifier

At an abstract level, a classifier is a module that is able to classify a bunch of given text into a series of topics with decreasing level of confidence. Once the bot receives the list of classified topics, it tries to map the topic that has the highest level of confidence with a skill.

From the perspective of the bot, a classifier is an asynchronous black box. Hence, any implementation of the classifier abstract interface can be used with the bot.

The bot core depends on the [talkify-natural-classifier](https://github.com/manthanhd/talkify-natural-classifier) library. It provides two different classifier implementations:

1. Logistic Regression (`LogisticRegressionClassifier`)
2. Naive Bayes (`NaiveBayesClassifier`)

The further implementation of these two classifiers is based on the [NaturalNode/Natural](https://github.com/NaturalNode/natural) NLP Node.js 

## Custom classifier

A custom classifier needs to extend the [talkify-classifier](https://github.com/manthanhd/talkify-classifier) interface. This interface defines three methods:

1. trainDocument
2. getClassifications
3. initialize

Easiest way would be to define an object that implements those three methods and then passing it to the `classifier` configuration option when instantiating the bot core. Here's a quick snippet:

```javascript
var myClassifier = {
  trainDocument: function(trainingData, callback) {
    ...
  },
  getClassifications: function(input, callback) {
    ...
  },
  initialize: function(callback) {
    ...
  }
};

var options = {
  classifier: myClassifier
};

var Bot = require('talkify').Bot;
var myBot = new Bot(options);
```

Lets go through each of the methods that a classifier needs to support in order to function with the Bot.

### trainDocument(trainingData, callback)

Most classifiers, in one way or another, need to be trained. If the classifier is a micro-classifier (like the one that comes built in with the Bot) then it will need to be trained every time the Bot is initialized. This is because the training data stays within the Bot's memory. This is not too much of a concern because the built-in classifier is usually very quick to train. 

Some complex classifiers like the [IBM Watson Classifier](https://github.com/manthanhd/talkify-watson-classifier) need not be trained every time the Bot is initialized as the training data resides on IBM's cloud servers. In this case, while you still should implement the trainDocument method, it's implementation could be kept empty.

The implementation of this method must accept two parameters. These are `trainingData` and `callback`. The input provided within the `trainingData` object could be a single `TrainingDocument` object or an array of objects of `TrainingDocument` type. The implementation of this method in [NaturalClassifier function of talkify-natural-classifier](https://github.com/manthanhd/talkify-natural-classifier/blob/master/lib/NaturalClassifier.js) might help.

The `TrainingDocument` object that is provided as a single or an array within `trainingData` has two publicly accessible attributes. These are `topic` and `text`. So when you are within your `trainDocument` function, you should be able to do this:

```javascript
var myClassifier = {
  trainDocument: function(trainingData, callback) {
    if(trainingData instanceof Array) {
      for(var i = 0; i < trainingData.length; i++) {
        var topic = trainingData[i].topic;
        var text = trainingData[i].text;
        console.log('TrainingData[%s], topic: %s, text: %s', i, topic, text);
      }
      return callback(undefined, true);
    }
    
    var topic = trainingData.topic;
    var text = trainingData.text;
    return callback(undefined, true);
  },
  ...
};
```

Here in this example, we are handling both cases, one where trainingData could be a single object as well as another where it could be an array. In either case, the object (or objects) that you receive will have at least one object with two aforementioned attributes.

When you are done, make sure you call the callback to let the bot know that you are done. The `callback` must be called with two parameters, namely, `error` and `result`. The `error` parameter could contain an `Error` object if there is an error or a literal `undefined` object. On the other hand, the `result` object should contain the status of the result. In most cases, this is simply `true`.

Lines 9 and 14 show an example invocation of the callback in a success scenario. In case of a failure:

```javascript
...
var err = new Error('Uh oh. Something went wrong.');
callback(err);
...
```

#### Buffering your training data

In many cases, you might want to buffer your training data so that you can efficiently process your entire training data set at once. This can be achieved by leveraging the `initialize` method. At the end of every call to  `trainDocument`, the Bot will call the `initialize` method. 

This means that you can buffer your training when the `trainDocument` method is call and when the time is right, process it in the `initialize` method.

### initialize(callback)

The `initialize` method is there to provide your classifier with an opportunity to finish any remaining processing after training. This could be some network or a database call. If you choose to [buffer your training data](#buffer-your-training-data), the initialize method could be a good place to complete the remainder of your processing.

The initialize method must accept one parameter, namely `callback`. Whatever you do, make sure you call the callback method at the end when you are done processing. 

When calling this callback, you only need to pass a parameter value in when there is an error. Here's a quick example of a success scenario:

```javascript
var myClassifier = {
  initialize: function(callback) {
    ...
    return callback();
  },
  ...
};
```

If something goes wrong, you can simply call:

```javascript
...
var err = new Error('Whoops, something went wrong.');
callback(err);
```

### getClassifications(text, callback)

The `getClassifications` method is one of the most simple looking methods, however, at the same time, it is also one of the most important. This is because using this is how the Bot will receive classifications for text which in turn it will use to execute skills in order to respond to queries.

An implementation of this method must accept two parameters, namely `text` and `callback`. 

The text parameter will always be a `string` as it is the input text being received from the end-user that is being requested for classification. 

The `callback` parameter will be a function that accepts two arguments, namely `error` and `classifications[]` array. Call this function when you have successfully managed to classify the string.

When calling the callback in an error scenario, make sure that the first parameter is not null. Ideally you'd want this to be an instance of an `Error` object like so:

```javascript
...
var err = new Error('Not very good.');
callback(err);
```

However, you should set this parameter to `undefined` in case of a success with a non-empty array as a parameter to the `classifications[]` array. Here's an example snippet:

```javascript
var myClassifier = {
  getClassifications: function(trainingData, callback) {
    ...
    return callback(undefined, [ {label: 'MyTopic', value: 0.5} ]);
  },
  ...
};
```

The `classifications[]` array must contain objects with at least two attributes, namely `label` and `value`. The value for the `label` attribute must be a `string` while that of the `value` attribute must be a number. As shown in the above example, the array has one classification object of `topic` MyTopic and `value` 0.5. This means that the classifier has classified the given `text` to be of `topic` MyTopic with a confidence value of 0.5, i.e. it is 50% confident on the result. Note that the first parameter is explicitly set to `undefined` as the classification was successful.

As of now, the array must have objects that have the value of the `value` field in decreasing order, i.e. highest first. The value of this field must be between 0 and 1.

In cases where a classification could not be determined, the classifier must return an array with an object whose topic is `undefined` and value is set to an arbitrary value (usually 1 as it is most confident that the answer is indeterminate). Here's an example:

```javascript
var myClassifier = {
  getClassifications: function(trainingData, callback) {
    ...
    return callback(undefined, [ {label: undefined, value: 1} ]);
  },
  ...
};
```

