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
var ngAnnotate = require('gulp-ng-annotate');
var to5ify = require('6to5-browserify');
var server = require('gulp-express');
var to5 = require('gulp-6to5');
var del = require('del');
var exorcist = require('exorcist');
var mkdir = require('mkdirp');
var jshint = require('gulp-jshint');

var packageJSON  = require('./package');
var jshintConfig = packageJSON.jshintConfig;

jshintConfig.lookup = false;

gulp.task('jshint', function(){
    return gulp.src('src/**/*.js')
    .pipe(jshint(jshintConfig))
    .pipe(jshint.reporter('jshint-stylish'));
});

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

var copyClientSrc = ['src/client/**/*', '!src/client/js/**/*'];
gulp.task('copyClient', function(){
    return gulp.src(copyClientSrc, {base:"src/client"})
        .pipe(gulp.dest('dist/client'));
});

gulp.task('run', ['copyClient', '6to5server'], function() {
    server.run({
        file: 'dist/server.js'
    });
});

gulp.task('makedir', function(cb){
    mkdir('dist/client/js', cb);
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

gulp.task('bundle', ['makedir'], createBundle(browserify));

gulp.task('watch', ['makedir', 'run'], function(cb) {

    gulp.watch('dist/*.js', ['run']);
    gulp.watch('src/*.js', ['6to5server']);
    gulp.watch(copyClientSrc, ['copyClient']);

    var bundler = watchify(browserify)
    var bundle = createBundle(bundler);

    bundler.on('update', bundle);
    bundler.on('bundle', function(){
        console.log('Bundling...');
    });

    bundle();
});
