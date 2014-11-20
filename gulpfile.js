var gulp = require('gulp');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
watchify.args.debug = true;
var browserify = require('browserify')(watchify.args);
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

browserify
    .transform(to5ify)
    .transform('brfs')
    .add('./src/client/js/script.js');

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

var copyClientSrc = ['src/client/*', '!src/client/js'];
gulp.task('copyClient', function(){
    return gulp.src(copyClientSrc)
        .pipe(gulp.dest('dist/client'));
});

gulp.task('run', ['copyClient', '6to5server'], function() {
    server.run({
        file: 'dist/server.js'
    });
});

var createBundle = function (bundler){
    return function(){
        return bundler
            .bundle()
            .on('error', gutil.log.bind(gutil, 'Browserify Error'))
            .pipe(exorcist('./dist/client/js/bundle.js.map'))
            .pipe(source('bundle.js'))
            .pipe(buffer())
            .pipe(ngAnnotate())
            .pipe(gulp.dest('./dist/client/js/')); 
    }
}

gulp.task('bundle', createBundle(browserify));

gulp.task('watch', ['run'], function() {
   
  gulp.watch('dist/*.js', ['run']);
  gulp.watch('src/*.js', ['6to5server']);
  gulp.watch(copyClientSrc, ['copyClient']);

  var bundler = watchify(browserify)
  var bundle = createBundle(bundler);
 
  bundler.on('update', bundle);

  return bundle();
});