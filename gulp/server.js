var gulp = require('gulp'),
  concat = require('gulp-concat'),
  templateCache = require('gulp-angular-templatecache'),
  del = require('del'),
  es = require('event-stream'),
  express = require('express'),
  open = require('open');

var sources = require('./config.json').sources;

gulp.task('server', function () {
  var app = express();
  app.use(express.static('dist'));
  // app.use(function (req, res) {
  //   res.redirect('index.html');
  // });
  app.listen(9000);
  open('http://localhost:9000/');
});

gulp.task('build', [
  'clean',
  'js:vendor',
  'js:dyanote',
  'index'
]);

gulp.task('watch', function () {
  gulp.watch(sources.vendor, ['js:vendor']);
  gulp.watch(sources.dyanote.concat(sources.templates), ['js:dyanote']);
});

gulp.task('js:vendor', ['clean'], function () {
  gulp.src(sources.vendor)
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('dist/build'))
});

gulp.task('js:dyanote', ['clean'], function () {
  var js = gulp.src(sources.dyanote);
  var templates = gulp.src(sources.templates).pipe(templateCache({
    module: 'dyanote'
  }));
  es.merge(js, templates)
    .pipe(concat('dyanote.js'))
    .pipe(gulp.dest('dist/build'));
});

gulp.task('index', ['clean'], function () {
  gulp.src(sources.index)
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', function (cb) {
  del(['dist'], cb);
});
