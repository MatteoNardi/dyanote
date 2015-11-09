var gulp = require('gulp');
var Server = require('karma').Server;

/**
* Run test once and exit
*/
gulp.task('test', function (done) {
  var config = {
    basePath: '',
    frameworks: ['jasmine', 'source-map-support'],
    files: [
      'node_modules/babel/node_modules/babel-core/browser-polyfill.js',
      'node_modules/angular/angular.js',
      'node_modules/angular-new-router/dist/router.es5.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'node_modules/angular-animate/angular-animate.js',
      'node_modules/angular-local-storage/dist/angular-local-storage.js',
      'node_modules/angular-tooltips/dist/angular-tooltips.min.js',
      'node_modules/ramda/dist/ramda.js',
      'app/app.js',
      'app/config_local.js',
      'app/services/*/*.js',
      'app/utilities/*.js',
      'app/components/*/*.js',
      'app/scribe/*.js',
      'app/scribe/*/*.js'
    ],
    preprocessors: {
      'app/**/*.js': ['babel']
    },
    'babelPreprocessor': {
      options: {
        sourceMap: 'inline'
      },
      filename: function(file) {
        return file.originalPath.replace(/\.js$/, '.es5.js');
      },
      sourceFileName: function(file) {
        return file.originalPath;
      }
    },
    exclude: [
      // 'app/**/components/**/*.test.js'
    ],
    port: 8080,
    autoWatch: true,
    browsers: ['PhantomJS'],
    // browsers: ['Chrome'],
    singleRun: false
  };
  var server = new Server(config, done);
  server.start();
});
