# Talkify Changelog

## 2016-10-25 Version 1.0.0 @manthanhd

* Skills now have name as its first parameter.
* Skill can be mapped to undefined topic. This allows execution of skills when no topic is found or a skill-topic mapping is not found.
* While adding a new skill, you can now specify minimum required confidence level as second parameter. This allows you to map multiple skills to the same topic but at different confidence levels.
* Fix for protecting skill references from cross-context async calls.

