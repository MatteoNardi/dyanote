var gulp = require('gulp');
var karma = require('karma').server;
      'node_modules/angular/angular.js',
      'node_modules/angular-route/angular-route.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'node_modules/angular-local-storage/dist/angular-local-storage.js',

/**
* Run test once and exit
*/
gulp.task('test', function (done) {
  karma.start({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      'node_modules/angular/angular.js',
      'node_modules/angular-route/angular-route.js',
      'node_modules/angular-mocks/angular-mocks.js',
      "node_modules/angular-bootstrap/dist/ui-bootstrap.min.js",
      'node_modules/angular-local-storage/dist/angular-local-storage.js',
      'app/app.js',
      'app/**/*.js'
    ],
    exclude: [
      // 'app/**/components/**/*.test.js'
    ],
    port: 8080,
    autoWatch: false,
    browsers: ['PhantomJS'],
    // browsers: ['Chrome'],
    singleRun: true
  }, function () {
    done ();
  });
});