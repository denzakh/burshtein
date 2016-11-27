"use strict";

// переменные (модули)
var gulp        = require('gulp');
var browserSync = require('browser-sync').create();
var sass        = require('gulp-sass');

var rename = require("gulp-rename");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync");
var mqpacker = require("css-mqpacker");
var minify = require('gulp-csso');
var imagemin = require('gulp-imagemin');
var del = require("del");
var run = require('run-sequence');
var fs = require('fs');


// сборка стилей
gulp.task('sass', function() {
    return gulp.src("app/scss/*.scss")
        .pipe(plumber())
        .pipe(sass())
        .pipe(postcss([
          autoprefixer({browsers: [
            "last 1 version",
            "last 2 Chrome versions",
            "last 2 Firefox versions",
            "last 2 Opera versions",
            "last 2 Edge versions"
          ]}),
          mqpacker({
            sort: false
          })
        ]))
        .pipe(gulp.dest("app/css"))
        .pipe(minify())
        .pipe(rename("style.min.css"))
        .pipe(gulp.dest("app/css"))
        .pipe(browserSync.stream());
});


// Static Server + watching scss/html files
gulp.task('serve', ['sass'], function() {

    browserSync.init({
        server: "./app"
    });

    gulp.watch("app/scss/*.scss", ['sass']);
    gulp.watch("app/*.html").on('change', browserSync.reload);
});


gulp.task('default', ['serve']);