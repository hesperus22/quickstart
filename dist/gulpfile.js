"use strict";

var gulp = require("gulp");
var gutil = require("gulp-util");
var source = require("vinyl-source-stream");
var watchify = require("watchify");
var browserify = require("browserify");
var buffer = require("vinyl-buffer");
var uglify = require("gulp-uglify");
var sourcemaps = require("gulp-sourcemaps");
var ngAnnotate = require("gulp-ng-annotate");
var to5ify = require("6to5-browserify");
var server = require("gulp-express");
var to5 = require("gulp-6to5");

var getBundler = function () {
  watchify.args.debug = true;
  var bundler = watchify(browserify(watchify.args));

  bundler.transform(to5ify).transform("brfs").add("./client/js/script.js");

  return bundler;
};

gulp.task("6to5server", function () {
  gulp.src("*.js").pipe(to5()).pipe(gulp.dest("dist"));
});

gulp.task("watch", ["6to5server"], function () {
  var runServer = function () {
    server.run({
      file: "dist/server.js"
    });
  };

  runServer();

  gulp.watch("dist/*.js", [runServer]);
  gulp.watch("*.js", ["6to5server"]);

  var bundler = getBundler();

  bundler.on("update", rebundle);
  bundler.on("bundle", function () {
    console.log("Bundle");
  });

  function rebundle() {
    return bundler.bundle().on("error", gutil.log.bind(gutil, "Browserify Error")).pipe(source("bundle.js")).pipe(buffer()).pipe(sourcemaps.init({ loadMaps: true, debug: true })).pipe(ngAnnotate())
    //.pipe(uglify())
    .pipe(sourcemaps.write()).pipe(gulp.dest("./client/js/"));
  }

  return rebundle();
});