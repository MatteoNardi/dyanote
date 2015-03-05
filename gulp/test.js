var gulp = require('gulp');
var karma = require('karma').server;

/**
* Run test once and exit
*/
gulp.task('test', function (done) {
  karma.start({
    basePath: '',
    frameworks: ['jasmine', 'source-map-support'],
    files: [
      'node_modules/angular/angular.js',
      "node_modules/angular-new-router/dist/router.es5.js",
      'node_modules/angular-mocks/angular-mocks.js',
      "node_modules/angular-bootstrap/dist/ui-bootstrap.min.js",
      'node_modules/angular-local-storage/dist/angular-local-storage.js',
      'app/app.js',
      'app/**/*.js'
    ],
    preprocessors: {
      "app/**/*.js": ["babel"]
    },
    "babelPreprocessor": {
      options: {
        sourceMap: "inline"
      },
      filename: function(file) {
        return file.originalPath.replace(/\.js$/, ".es5.js");
      },
      sourceFileName: function(file) {
        return file.originalPath;
      }
    },
    exclude: [
      // 'app/**/components/**/*.test.js'
    ],
    port: 8080,
    autoWatch: false,
    // browsers: ['PhantomJS'],
    browsers: ['Chrome'],
    singleRun: true
  }, function () {
    done ();
  });
});