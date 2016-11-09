# Talkify Changelog

High level features between major versions are outlined here.

## 2016-10-25 Version 2.0.0 @manthanhd

* Methods in the `Response` object are chainable.
* Skills can now lock a conversation for one request/response in order to process a follow-up question.
* The classifier interface defined in [talkify-classifier](https://github.com/manthanhd/talkify-classifier) npm module can be used to write a custom classifier.
* Default classifier is [talkify-natural-classifier](https://github.com/manthanhd/talkify-natural-classifier).
* Helpers `StaticResponseSkill` and `StaticRandomResponseSkill` are now available.

## 2016-10-25 Version 1.0.0 @manthanhd

* Skills now have name as its first parameter.
* Skill can be mapped to undefined topic. This allows execution of skills when no topic is found or a skill-topic mapping is not found.
* While adding a new skill, you can now specify minimum required confidence level as second parameter. This allows you to map multiple skills to the same topic but at different confidence levels.
* Fix for protecting skill references from cross-context async calls.

