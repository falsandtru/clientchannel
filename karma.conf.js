module.exports = {

  // base path that will be used to resolve all patterns (eg. files, exclude)
  basePath: '',


  // frameworks to use
  // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
  frameworks: ['mocha'],


  // list of files / patterns to load in the browser
  files: [
    // dependencies

    // fixtures
    { pattern: 'node_modules/power-assert/build/power-assert.js', watched: true, served: true, included: true },
    { pattern: 'node_modules/lodash/lodash.js', watched: true, served: true, included: true },
    { pattern: 'node_modules/benchmark/benchmark.js', watched: true, served: true, included: true },
    { pattern: 'node_modules/arch-stream/dist/arch-stream.js', watched: true, served: true, included: true },
    { pattern: 'test/fixture/**/*.html', watched: true, served: true, included: true },
    { pattern: 'test/fixture/**/*.css', watched: true, served: true, included: false },
    { pattern: 'test/fixture/**/*.js', watched: true, served: true, included: false },

    // files to test
    { pattern: 'dist/*.js', watched: true, served: true, included: true },
    { pattern: 'test/**/*.js', watched: true, served: true, included: true },
    { pattern: 'benchmark/**/*.js', watched: true, served: true, included: true },
  ],


  // list of files to exclude
  exclude: [
  ],


  // preprocess matching files before serving them to the browser
  // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
  preprocessors: {
    'dist/*.js': ['espower'],
    'test/fixture/*.html': ['html2js'],
  },


  espowerPreprocessor: {
    options: {
      // emit espowerified code.
      // default: false (in-memory)
      emitActualCode: false
    }
  },


  // test results reporter to use
  // possible values: 'dots', 'progress'
  // available reporters: https://npmjs.org/browse/keyword/karma-reporter
  reporters: ['dots'],
  coverageReporter: {
    dir: 'coverage',
    subdir: function (browser, platform) {
      return browser.toLowerCase().split(' ')[0];
    },
    reporters: [
      { type: 'lcov' },
      { type: 'text-summary', subdir: '.', file: 'summary.txt' }
    ]
  },


  // web server port
  port: 9876,


  // enable / disable colors in the output (reporters and logs)
  colors: true,


  // level of logging
  // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
  //logLevel: config.LOG_INFO,


  // enable / disable watching file and executing tests whenever any file changes
  autoWatch: true,
  autoWatchBatchDelay: 500,


  // start these browsers
  // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
  //browsers: ['PhantomJS', 'Chrome', 'Firefox', 'IE'],
  browsers: ['Chrome'],


  // Continuous Integration mode
  // if true, Karma captures browsers, runs the tests and exits
  singleRun: true

};
