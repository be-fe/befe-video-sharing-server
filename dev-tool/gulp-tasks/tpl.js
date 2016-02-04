var gulp = require('gulp');
var npath = require('path');
var through = require('through2');
var _ = require('lodash');
var fs = require('fs');

var config = require('../config');

gulp.task('tpl', ['compile-tpl'], function () {
    gulp.watch([config.src + '/**/tpl/*.tpl'],
        [
            'compile-tpl'
        ])
});

gulp.task('compile-tpl', function () {
    var tplContent = {};
    return gulp.src(config.src + '/**/tpl/*.tpl')
        .pipe(through.obj(function (file, encoding, callback) {
            var path = file.path;
            var content = file.contents.toString();

            tplContent[npath.basename(path, npath.extname(path))] = content;
            callback();
        }))
        .on('end', function () {
            //console.log(tplContent);

            var tplJs = 'window.rawTpls = _.extend({}, window.rawTpls, {\n' +
                _(tplContent).map(function (val, key) {
                    return key + ':' + JSON.stringify(val);
                }).join(',\n')
                + '\n});';

            fs.writeFileSync(config.src + 'tpls.js', tplJs);
        });
});