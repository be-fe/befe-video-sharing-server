var gulp = require('gulp');
var rename = require('gulp-rename');
var less = require('gulp-less');
var combiner = require('stream-combiner2');
var exec = require('child_process').exec;

// less编译
var config = require('../config');
console.log('config - ', config);

gulp.task('less', ['compile-less'], function() {
    gulp.watch([config.src + '/**/less/*.less'],
        [
            'compile-less'
        ])
});

gulp.task('compile-less', ['really-compile-less'], function() {
    //exec('say 你的less构建好了, 猴塞雷啊.')
});

gulp.task('really-compile-less', function() {
    var rgxLess = /([\/\\]|^)less$/;

    var combined = combiner.obj([
        gulp.src(config.src + '/**/less/*.less'),
        less(),
        rename(function(path) {
            console.log('before processed',  path);

            path.dirname = path.dirname.replace(rgxLess, '$1css');
            path.extname = '.css';

            //console.log('after processed', path);
        }),
        gulp.dest(config.src)
    ]);

    combined.on('error', console.error.bind(console));

    return combined;
});