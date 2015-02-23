var gulp = require('gulp'),
  concat = require('gulp-concat'),
  templateCache = require('gulp-angular-templatecache'),
  del = require('del'),
  es = require('event-stream'),
  express = require('express'),
  open = require('open'),
  less = require('gulp-less');;

var sources = require('./config.json').sources;

gulp.task('server', function () {
  var app = express();
  app.use(express.static('dist'));
  app.listen(9000);
  open('http://localhost:9000/');
});

gulp.task('build', [
  'index',
  'style',
  'fonts',
  'images',
  'js:vendor',
  'js:dyanote',
  'watch'
]);

gulp.task('watch', function () {
  gulp.watch(sources.vendor, ['js:vendor']);
  gulp.watch(sources.dyanote.concat(sources.templates), ['js:dyanote']);
  gulp.watch(sources.index, ['index']);
  gulp.watch(sources.styles, ['style']);
});

gulp.task('index', function () {
  gulp.src(sources.index)
    .pipe(gulp.dest('dist'));
});

gulp.task('style', function () {
  gulp.src(sources.styles)
    .pipe(concat('style.less'))
    .pipe(less())
    .pipe(gulp.dest('dist/build'));
});

gulp.task('fonts', function () {
  gulp.src(sources.fonts)
    .pipe(gulp.dest('dist/build/fonts'));
});

gulp.task('images', function () {
  gulp.src(sources.images)
    .pipe(gulp.dest('dist/build/images'));
});

gulp.task('js:vendor', function () {
  gulp.src(sources.vendor)
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('dist/build'))
});

gulp.task('js:dyanote', function () {
  var js = gulp.src(sources.dyanote);
  var templates = gulp.src(sources.templates).pipe(templateCache({
    module: 'dyanote'
  }));
  es.merge(js, templates)
    .pipe(concat('dyanote.js'))
    .pipe(gulp.dest('dist/build'));
});
