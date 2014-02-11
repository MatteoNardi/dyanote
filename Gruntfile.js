// Generated on 2013-09-01 using generator-angular 0.4.0
'use strict';
var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({ port: LIVERELOAD_PORT });
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};


module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);
  var modRewrite = require('connect-modrewrite');

  // configurable paths
  var yeomanConfig = {
    app: 'app',
    dist: 'dist'
  };

  grunt.initConfig({
    yeoman: yeomanConfig,
    timestamp: (new Date()).getTime(),

    watch: {
      styles: {
        files: [
          '<%= yeoman.app %>/styles/{,*/}*.css',
          '<%= yeoman.app %>/styles/{,*/}*.less'
        ],
        tasks: ['less', 'autoprefixer']
      },
      livereload: {
        options: {
          livereload: LIVERELOAD_PORT
        },
        files: [
          '<%= yeoman.app %>/{,*/}*.html',
          '.tmp/styles/{,*/}*.css',
          '.tmp/styles/{,*/}*.less',
          '.tmp/styles/fonts/*',
          '{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },
    autoprefixer: {
      options: ['last 1 version'],
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/styles/'
        }]
      }
    },
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost'
      },
      livereload: {
        options: {
          port: 9000,
          // Change this to '0.0.0.0' to access the server from outside.
          hostname: 'localhost',
          middleware: function (connect) {
            return [
              lrSnippet,
              modRewrite([
                '!\\.html|\\.js|\\.css|\\woff|\\ttf|\\swf$ /index.html'
              ]),
              mountFolder(connect, '.tmp'),
              mountFolder(connect, yeomanConfig.app)
            ];
          }
        }
      },

      test: {
        options: {
          middleware: function (connect) {
            return [
              mountFolder(connect, '.tmp'),
              mountFolder(connect, 'test')
            ];
          }
        }
      },
      dist: {
        options: {
          middleware: function (connect) {
            return [
              mountFolder(connect, yeomanConfig.dist)
            ];
          }
        }
      }
    },
    open: {
      server: {
        url: 'http://localhost:<%= connect.options.port %>'
      }
    },
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/*',
            '!<%= yeoman.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        '<%= yeoman.app %>/scripts/{,*/}*.js'
      ]
    },
    rev: {
      dist: {
        files: {
          src: [
            '<%= yeoman.dist %>/scripts/{,*/}*.js',
            '<%= yeoman.dist %>/styles/{,*/}*.css',
            '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= yeoman.dist %>/styles/fonts/*'
          ]
        }
      }
    },
    useminPrepare: {
      html: '<%= yeoman.app %>/index.html',
      options: {
        dest: '<%= yeoman.dist %>'
      }
    },
    usemin: {
      html: ['<%= yeoman.dist %>/{,*/}*.html'],
      options: {
        dirs: ['<%= yeoman.dist %>']
      }
    },
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.{png,jpg,jpeg}',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },
    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.svg',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },
    htmlmin: {
      dist: {
        options: {
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>',
          src: ['*.html'],
          dest: '<%= yeoman.dist %>'
        }]
      }
    },
    // Put files not handled in other tasks here
    copy: {
      // When testing locally we only need to copy fonts.
      server: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '.tmp',
          src: ['styles/fonts/*']
        }]
      },
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            'extra/**/*',
            'images/{,*/}*.{gif,webp}',
            'styles/fonts/*'
          ]
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: '<%= yeoman.dist %>/images',
          src: [
            'generated/*'
          ]
        }]
      },
      scout: {
        src: 'dist/index.html',
        dest: 'dist/scout.html'
      }
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: false
      }
    },
    cdnify: {
      dist: {
        html: ['<%= yeoman.dist %>/*.html']
      }
    },
    ngmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat/scripts',
          src: '*.js',
          dest: '.tmp/concat/scripts'
        }]
      }
    },

    less: {
      options: {
        paths: ['<%= yeoman.app %>/styles/']
      },
      server: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/styles/',
          src: ['main.less'],
          dest: '.tmp/styles/',
          ext: '.css'
        }]
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/styles/',
          src: ['main.less'],
          dest: '<%= yeoman.dist %>/styles/',
          ext: '.css'
        }]
      }
    },

    // Put AngularJS templates in $templateCache
    ngtemplates: {
      dist: {
        cwd: '<%= yeoman.app %>/',
        src: 'views/*.html',
        dest: '.tmp/ngtemplates/template.js',
        options: {
          module: 'dyanote',
          usemin: 'scripts/scripts.js'
        }
      }
    },

    replace: {
      scout: {
        src: ['dist/scout.html'],
        dest: 'dist/scout.html',
        replacements: [{ 
          from: 'scripts/',
          to: '<%= timestamp %>/scripts/'
        }, { 
          from: 'styles/',
          to: '<%= timestamp %>/styles/'
        }]
      }
    },


    // Amazon S3 deployment
    s3: {
      options: {
        bucket: 'dyanote.com',
        region: 'eu-west-1',
        access: 'public-read',
        gzip: true,
        headers: {
          // Two Year cache policy (1000 * 60 * 60 * 24 * 730)
          "Cache-Control": "max-age=630720000, public",
          "Expires": new Date(Date.now() + 63072000000).toUTCString()
        }
      },
      deploy: {
        upload: [{
          // CSS
          src: '<%= yeoman.dist %>/styles/*',
          dest: '<%= timestamp %>/styles/',
          options: {
            headers: {
              'Content-Type': 'text/css'
            }
          }
        }, {
          // JS (scripts)
          src: '<%= yeoman.dist %>/scripts/*',
          dest: '<%= timestamp %>/scripts/',
        }, {
          // JS (extra)
          src: '<%= yeoman.dist %>/extra/*',
          dest: '<%= timestamp %>/extra/',
        }, {
          // Html
          src: '<%= yeoman.dist %>/index.html',
          dest: '<%= timestamp %>/',
        }, {
          // Scout file
          src: '<%= yeoman.dist %>/scout.html',
          dest: '/index.html',
          headers: {
            // 5 minutes cache policy (1000 * 60 * 6)
            "Cache-Control": "max-age=360000, public",
            "Expires": new Date(Date.now() + 360000).toUTCString()
          }
        }]
      }
    }
  });

  grunt.registerTask('server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'open', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'less',
      'copy:server',
      'autoprefixer',
      'connect:livereload',
      'open',
      'watch'
    ]);
  });

  grunt.registerTask('test', [
    'clean:server',
    'autoprefixer',
    'connect:test',
    'karma'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'useminPrepare',
    'less:dist',
    'imagemin',
    'svgmin',
    'htmlmin',
    'autoprefixer',
    'copy:dist',
    'cdnify',
    'ngtemplates:dist',
    'concat',
    'ngmin',
    'uglify',
    'rev',
    'usemin'
  ]);

  grunt.registerTask('default', [
    'jshint',
    'test',
    'build'
  ]),

  grunt.registerTask('deploy', [
    'copy:scout',
    'replace:scout',
    's3:deploy',
  ]);
};
