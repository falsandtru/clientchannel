const gulp = require('gulp');
const shell = cmd => require('child_process').execSync(cmd, {stdio:[0,1,2]});
const del = require('del');
const extend = require('extend');
const seq = require('run-sequence');
const $ = require('gulp-load-plugins')({
  //pattern: ['gulp-*', 'gulp.*'],
  //replaceString: /\bgulp[\-.]/
});
const Server = require('karma').Server;
const browserSync = require('browser-sync');

const pkg = require('./package.json');
const karmaconfig = require('./karma.conf.js');
const config = {
  ts: {
    options: extend(require('./tsconfig.json').compilerOptions, {
      typescript: require('typescript')
    }),
    source: {
      lint: {
        configuration: require('./tslint.source.json')
      },
      src: [
        'typings/*.d.ts',
        '*.ts',
        'src/**/*.ts'
      ],
      dest: 'dist/'
    },
    dist: {
      lint: {
        configuration: require('./tslint.source.json')
      },
      src: [
        'typings/*.d.ts',
        '*.ts',
        'src/**/*.d.ts',
        'src/**/+([!.]).ts'
      ],
      dest: 'dist/'
    },
    test: {
      lint: {
        configuration: require('./tslint.test.json')
      },
      src: [
        'typings/*.d.ts',
        'test/**/*.ts'
      ],
      dest: 'test/'
    },
    bench: {
      lint: {
        configuration: require('./tslint.test.json')
      },
      src: [
        'typings/*.d.ts',
        'typings/benchmark/*.d.ts',
        'benchmark/**/*.ts'
      ],
      dest: 'dist/'
    }
  },
  banner: [
    `/*! ${pkg.name} v${pkg.version} ${pkg.repository.url} | (c) 2015, ${pkg.author} | ${pkg.license.type} License (${pkg.license.url}) */`,
    ''
  ].join('\n'),
  exporter:
`define = typeof define === 'function' && define.amd
  ? define
  : (function () {
    'use strict';
    var name = '${pkg.name}',
        workspace = {};
    return function define(m, rs, f) {
      return !f
        ? void define(name, m, rs)
        : void f.apply(this, rs.map(function (r) {
          switch (r) {
            case 'require': {
              return typeof require === 'function' ? require : void 0;
            }
            case 'exports': {
              return m.indexOf('/') === -1
                ? workspace[m] = typeof exports === 'undefined' ? self[m] = self[m] || {} : exports
                : workspace[m] = workspace.hasOwnProperty(m) ? workspace[m] : {};
            }
            default: {
              return r.slice(-2) === '.d' && {}
                  || workspace.hasOwnProperty(r) && workspace[r]
                  || typeof require === 'function' && require(r)
                  || self[r];
            }
          }
        }));
    };
  })();
`,
  clean: {
    src: 'src/**/*.js',
    dist: 'dist',
    test: 'test/**/*.js',
    bench: 'benchmark/**/*.js',
    cov: 'coverage'
  },
  karma: {
    watch: extend({}, require('./karma.conf.js'), {
      browsers: ['Chrome', 'Firefox'],
      preprocessors: {
        'dist/*.js': ['espower'],
        'test/**/*.js': ['espower']
      },
      singleRun: false
    }),
    test: extend({}, require('./karma.conf.js'), {
      browsers: ['Chrome', 'Firefox'],
      reporters: ['dots', 'coverage'],
      preprocessors: {
        'dist/*.js': ['coverage', 'espower'],
        'test/**/*.js': ['espower']
      },
      singleRun: true
    }),
    bench: extend({}, require('./karma.conf.js'), {
      browsers: ['Chromium', 'Firefox'],
      reporters: ['dots'],
      singleRun: true
    }),
    server: extend({}, require('./karma.conf.js'), {
      browsers: ['Chromium', 'Firefox'],
      reporters: ['dots', 'coverage', 'coveralls'],
      preprocessors: {
        'dist/*.js': ['coverage', 'espower'],
        'test/**/*.js': ['espower']
      },
      singleRun: true
    })
  }
};

/*
gulp.task('bs', function () {
  browserSync.init({
    server: {
      // baseDir: ,
      // directory: true,
      // index: "index.html"
    },
    notify: true,
    xip: false
  });
});
*/
gulp.task('lint:source', function () {
  return gulp.src(config.ts.source.src)
    .pipe($.cached('lint:source'))
    .pipe($.tslint(config.ts.source.lint))
    .pipe($.tslint.report('prose', { emitError: false }));
});

gulp.task('lint:test', function () {
  return gulp.src(config.ts.test.src)
    .pipe($.cached('lint:test'))
    .pipe($.tslint(config.ts.test.lint))
    .pipe($.tslint.report('prose', { emitError: false }));
});

gulp.task('lint:bench', function () {
  return gulp.src(config.ts.bench.src)
    .pipe($.cached('lint:bench'))
    .pipe($.tslint(config.ts.test.lint))
    .pipe($.tslint.report('prose', { emitError: false }));
});

gulp.task('lint:watch', function () {
  gulp.watch(config.ts.source.src, ['lint:source']);
  gulp.watch(config.ts.test.src, ['lint:test']);
});

gulp.task('ts:source', function () {
  return gulp.src(config.ts.source.src)
    .pipe($.typescript(Object.assign({
      outFile: `${pkg.name}.js`
    }, config.ts.options)))
    .pipe($.header(config.exporter))
    .pipe(gulp.dest(config.ts.source.dest));
});

gulp.task('ts:dist', function () {
  return gulp.src(config.ts.dist.src)
    .pipe($.typescript(Object.assign({
      outFile: `${pkg.name}.js`
    }, config.ts.options)))
    .pipe($.unassert())
    .pipe($.header(config.exporter))
    .pipe($.header(config.banner))
    .pipe(gulp.dest(config.ts.dist.dest))
    .pipe($.uglify({ preserveComments: 'license' }))
    .pipe($.rename({ extname: '.min.js' }))
    .pipe(gulp.dest(config.ts.dist.dest));
});

gulp.task('ts:test', function () {
  return gulp.src(config.ts.test.src)
    .pipe($.typescript(Object.assign({
    }, config.ts.options)))
    .pipe(gulp.dest(config.ts.test.dest));
});

gulp.task('ts:bench', function () {
  return gulp.src(config.ts.bench.src)
    .pipe($.typescript(Object.assign({
      outFile: `${pkg.name}.js`
    }, config.ts.options)))
    .pipe(gulp.dest(config.ts.bench.dest));
});

gulp.task('ts:watch', function () {
  gulp.watch(config.ts.source.src, ['ts:source']);
  gulp.watch(config.ts.test.src, ['ts:test']);
});

gulp.task('karma:watch', function (done) {
  new Server(config.karma.watch, function(exitCode) {
    console.log('Karma has exited with ' + exitCode);
    done();
  }).start();
});

gulp.task('karma:test', function (done) {
  new Server(config.karma.test, function(exitCode) {
    console.log('Karma has exited with ' + exitCode);
    done();
  }).start();
});

gulp.task('karma:bench', function (done) {
  new Server(config.karma.bench, function(exitCode) {
    console.log('Karma has exited with ' + exitCode);
    done();
  }).start();
});

gulp.task('karma:server', function (done) {
  new Server(config.karma.server, function(exitCode) {
    console.log('Karma has exited with ' + exitCode);
    done();
  }).start();
});

gulp.task('clean', function () {
  return del([config.clean.src, config.clean.test, config.clean.dist]);
});

gulp.task('install', function () {
  shell('bundle install');
  shell('npm i');
  shell('tsd install --save --overwrite');
});

gulp.task('update', function () {
  shell('bundle update');
  shell('npm-check-updates -u');
  shell('npm i');
  //shell('tsd update --save --overwrite');
});

gulp.task('build', ['clean'], function (done) {
  seq(
    //['lint:source', 'lint:test'],
    ['ts:source', 'ts:test'],
    done
  );
});

gulp.task('watch', ['build'], function () {
  seq([
    //'lint:watch',
    'ts:watch',
    'karma:watch'
  ]);
});

gulp.task('test', ['build'], function (done) {
  seq(
    'karma:test',
    function () {
      shell('cat coverage/summary.txt && echo;');
      done();
    }
  );
});

gulp.task('bench', ['dist'], function (done) {
  seq(
    //'lint:bench',
    'ts:bench',
    'karma:bench',
    done
  );
});

gulp.task('site', function () {
  return gulp.src([
    'node_modules/arch-stream/dist/arch-stream.js',
    'dist/localsocket.js'
  ])
    .pipe(gulp.dest('./gh-pages/assets/js'));
});

gulp.task('dist', ['clean'], function (done) {
  seq(
    'ts:dist',
    'site',
    done
  );
});

gulp.task('view', ['dist'], function () {
  shell('bundle exec jekyll serve -s ./gh-pages -d ./gh-pages/_site --incremental');
});

gulp.task('server', function (done) {
  seq(
    'build',
    'karma:server',
    'dist',
    function () {
      shell('cat coverage/summary.txt && echo;');
      done();
    }
  );
});
