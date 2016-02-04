// 第一步: 引入了核心的gulp和其他依赖组件
var gulp = require('gulp');
var config = require('./dev-tool/config');

require('./dev-tool/gulp-tasks/less');
require('./dev-tool/gulp-tasks/tpl');

// 默认任务
gulp.task('default', ['less', 'tpl']);
