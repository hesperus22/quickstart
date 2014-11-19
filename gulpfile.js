var gulp = require('gulp');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var ngAnnotate = require('gulp-ng-annotate');
var es6ify = require('es6ify');
var server = require('gulp-express');

var getBundler =function() {
  watchify.args.debug = true;
  var bundler = watchify(browserify(watchify.args));

  bundler
    .add(es6ify.runtime)
    .transform(es6ify)
    .transform('brfs')
    .require(require.resolve('./client/js/script.js'), { entry: true });
    
  return bundler;
}

gulp.task('watch', function() {
   
  var runServer = function(){
    server.run({
        file: 'server.js'
    });
  };
  
  runServer();

  gulp.watch(['*.js'], [runServer]);

  var bundler = getBundler();

  bundler.on('update', rebundle);
  bundler.on('bundle', function(){console.log('Bundle');});

  function rebundle() {
    return bundler.bundle()
      .on('error', gutil.log.bind(gutil, 'Browserify Error'))
      .pipe(source('bundle.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true, debug: true}))
        .pipe(ngAnnotate())
        //.pipe(uglify())
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('./client/js/'));
  }

  return rebundle();
});