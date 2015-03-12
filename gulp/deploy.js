var gulp = require('gulp'),
  awspublish = require('gulp-awspublish'),
  uglify = require('gulp-uglify');
  concat = require('gulp-concat'),
  templateCache = require('gulp-angular-templatecache'),
  del = require('del'),
  es = require('event-stream'),
  replace = require('gulp-replace');

var sources = require('./config.json').sources;


gulp.task('clean', function (cb) {
  del([
    'dist/**'
  ], cb);
});

gulp.task('build:deploy', ['style', 'fonts', 'images', 'js:vendor', 'js:dyanote:deploy'], 
  function () {

  var buildNum = new Date().valueOf();
  var buildFolder = 'dist/build_' + buildNum;

  var scout = gulp.src('app/index.html')
    .pipe(replace(/="build\//g, '="build_' +buildNum+ '/'))
    .pipe(gulp.dest('dist'));
  var build = gulp.src('dist/build/**/*'/*, {base:'dist'}*/)
    .pipe(gulp.dest(buildFolder));
  return es.merge(build, scout);
});

gulp.task('publish', ['build:deploy'], function() {
  var publisher = awspublish.create({
    bucket: 'dyanote.com',
    region: 'eu-west-1'
  });

  var build = gulp.src(['dist/**', '!dist/build/**', '!dist/index.html'])
    .pipe(awspublish.gzip())
    .pipe(publisher.publish({
      // Two Year cache policy (1000 * 60 * 60 * 24 * 730)
      'Cache-Control': 'max-age=630720000, public',
      'Expires': new Date(Date.now() + 63072000000)
    }))
    .pipe(publisher.cache())
    .pipe(awspublish.reporter());

  var scout = gulp.src('dist/index.html')
    .pipe(awspublish.gzip())
    .pipe(publisher.publish({
      // 5 minutes cache policy (1000 * 60 * 5)
      'Cache-Control': 'max-age=300000, public',
      'Expires': new Date(Date.now() + 300000)
    }))
    .pipe(awspublish.reporter());

  return es.merge(build, scout);
});

// No sourcemaps
gulp.task('js:dyanote:deploy', function () {
  var js = gulp.src(sources.dyanote);
  var templates = gulp.src(sources.templates).pipe(templateCache({ module: 'dyanote' }));
  return es.merge(js, templates)
    .pipe(babel())
    .pipe(concat('dyanote.js'))
    .pipe(gulp.dest('dist/build'));
});
