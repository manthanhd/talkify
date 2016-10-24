# Contributing to Talkify

<!-- vim-markdown-toc GFM -->
* [Code of Conduct](#code-of-conduct)
* [Contributing code](#contributing-code)
	* [1. Fork](#1.-fork)
	* [2. Develop code](#2.-develop-code)
	* [3. Merge contribution](#3.-merge-contribution)

<!-- vim-markdown-toc -->

## Code of Conduct

The code of conduct is simple. Please treat others like you would like to be treated yourself. Please be kind and courteous. Insulting behaviour, publicly or privately will not be tolerated. 

Harassment is unacceptable. If you are harassed, privately or publicly, please do not hesitate to contact me or anyone in this repository with a photo or email or capture of the harassment if possible. This includes behaviour considered spamming, trolling, flaming or baiting.

I am dedicated to making this a safe place to collaborate and communicate.

## Contributing code

Please follow the following steps to contribute code to this repo.

### 1. Fork

Click on the fork button on the top left of the [repository page](https://github.com/manthanhd/talkify) to fork the project and checkout your local copy.

```
$ git clone git@github.com:username/talkify.git
$ cd node
$ git remote add upstream git://github.com/manthanhd/talkify.git
```

### 2. Develop code

Make sure you create a new branch before you start your work. The simplest way to create a new branch locally is to use the `checkout -b` command.

```
$ git checkout -b branch_name
```

When you are making your changes, you should run `npm test` to make sure that all the tests pass. At the very least, make sure that all the tests pass at the end of your changes.

Your changes are expected to have self-contained tests within it. Please ensure that you write test cases covering scenarios. The idea here is 'leave it in a better state than you found it in'.

Make sure you make commits with useful messages. Great commits are less than 50 characters long. If you need to provide more details, use new lines.

When you are ready, push your commits:

```
$ git push origin branch_name
```


### 3. Merge contribution

Navigate to your repository URL. This might be ` https://github.com/username/talkify`. Provided you have just pushed your code, GitHub should provide you with a prompt to raise a pull request. 

Provide as much information as you can as to what value the pull request brings. Please make an effort to reference any existing issues (if any) that the pull request impacts.

I will try to review your pull request within a few days of opening. If there are comments, please address them in the commits and once you push them, please comment back on the pull request when it is done, replying to the original comment.

By submitting a pull request, you agree that the work you have submitted is your own and/or is covered under an appropriate open source license under which you are allowed to make the aforementioned contribution in part or whole. You are aware of the fact that the contribution that you submit is maintained indefinitely and may be redistributed consistent with this project or the open source license(s) involved.

*Inspired from Node.js [Contributing](https://github.com/nodejs/node/blob/a4d396d85874046ffe6647ecb953fd78e16bcba3/CONTRIBUTING.md) and [Code of Conduct](https://raw.githubusercontent.com/nodejs/node/fcf7696bc1b64c61a6263d1f13f2af8501dbd207/CODE_OF_CONDUCT.md) guides*.
