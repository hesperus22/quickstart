var gulp = require('gulp');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var transform = require('vinyl-transform');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var ngAnnotate = require('gulp-ng-annotate');
var to5ify = require('6to5-browserify');
var server = require('gulp-express');
var to5 = require('gulp-6to5');
var del = require('del');
var exorcist = require('exorcist');

var getBundler =function() {
  watchify.args.debug = true;
  var bundler = watchify(browserify(watchify.args));

  bundler
    .transform(to5ify)
    .transform('brfs')
    .add('./src/client/js/script.js');
    
  return bundler;
}

gulp.task('6to5server', function(){
    return gulp.src('src/*.js')
            .pipe(to5())
            .pipe(gulp.dest('dist'));
});

gulp.task('clean', function(cb){
    del(['./dist/*'], function(err){
        console.log(err);
        cb(err);
    });
});

gulp.task('copyClient', function(){
    return gulp.src(['src/client/*', '!src/client/js'])
        .pipe(gulp.dest('dist/client'));
});

gulp.task('watch', ['6to5server'], function() {
   
  var runServer = function(){
    server.run({
        file: 'dist/server.js'
    });
  };
  
  runServer();

  gulp.watch('dist/*.js', [runServer]);
  gulp.watch('src/*.js', ['6to5server']);
  gulp.watch('./dist/client/js/bundle.js', ['stripMap']);

  var bundler = getBundler();

  bundler.on('update', rebundle);

  function rebundle() {
    return bundler.bundle()
      .on('error', gutil.log.bind(gutil, 'Browserify Error'))
      .pipe(source('bundle.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true, debug: true}))
        .pipe(ngAnnotate())
        //.pipe(uglify())
      .pipe(sourcemaps.write())
      .pipe(transform(function(){return exorcist('./dist/client/js/bundle.js.map')}))
      .pipe(gulp.dest('./dist/client/js/'))
  }

  return rebundle();
});