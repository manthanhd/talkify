/**
 * Created by manthanhd on 19/10/2016.
 */
var gulp = require('gulp');
var jslint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var shell = require('gulp-shell');

gulp.task('lint', function () {
    return gulp.src(['./lib/**.js'])
        .pipe(jslint())
        .pipe(jslint.reporter(stylish));
});

gulp.task('test', shell.task('istanbul cover ./node_modules/mocha/bin/_mocha --report lcovonly -- -R spec'));

gulp.task('default', ['lint', 'test']);