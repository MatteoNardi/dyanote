var gulp = require('gulp'),
  concat = require('gulp-concat'),
  templateCache = require('gulp-angular-templatecache'),
  del = require('del'),
  es = require('event-stream'),
  webserver = require('gulp-webserver');
  open = require('open'),
  less = require('gulp-less'),
  babel = require('gulp-babel'),
  sourcemaps = require('gulp-sourcemaps');

var sources = require('./config.json').sources;

gulp.task('server', function () {
  gulp.src('dist/')
    .pipe(webserver({
      livereload: true,
      open: true,
      fallback: 'index.html'
    }));
});

gulp.task('server:nofallback', function () {
  gulp.src('dist/')
    .pipe(webserver({
      livereload: true,
      open: true
    }));
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
  gulp.watch(['app/**/*.less'], ['style']);
});

gulp.task('index', function () {
  return gulp.src(sources.index)
    .pipe(gulp.dest('dist'));
});

gulp.task('style', function () {
  return gulp.src('app/main.less')
    .pipe(concat('style.less'))
    .pipe(less())
    .pipe(gulp.dest('dist/build'));
});

gulp.task('fonts', function () {
  return gulp.src(sources.fonts)
    .pipe(gulp.dest('dist/build/fonts'));
});

gulp.task('images', function () {
  return gulp.src(sources.images)
    .pipe(gulp.dest('dist/build/images'));
});

gulp.task('js:vendor', function () {
  return gulp.src(sources.vendor)
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('dist/build'))
});

gulp.task('js:dyanote', function () {
  var js = gulp.src(sources.dyanote);
  var templates = gulp.src(sources.templates).pipe(templateCache({ module: 'dyanote' }));
  return es.merge(js, templates)
    .pipe(sourcemaps.init())
      .pipe(babel())
      .pipe(concat('dyanote.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/build'));
});
