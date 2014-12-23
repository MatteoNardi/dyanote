var gulp = require('gulp');

require('./gulp/test');
require('./gulp/server');
require('./gulp/deploy');

gulp.task('default', ['test']);