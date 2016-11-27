"use strict";

// переменные (модули)
var gulp        = require("gulp");
var browserSync = require("browser-sync").create();
var sass        = require("gulp-sass");
var useref = require("gulp-useref");
var rename = require("gulp-rename");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync");
var mqpacker = require("css-mqpacker");
var minify = require("gulp-csso");
var imagemin = require("gulp-imagemin");
var gulpif = require("gulp-if");
var ftp = require("gulp-ftp"); // если неободимо sftp соединение - заменить gulp-ftp на gulp-sftp(см. package.json)
var gutil = require('gulp-util');

var del = require("del");
var run = require('run-sequence');
var fs = require('fs');

//команды
gulp.task("default", ["serve"]);


// сборка стилей
gulp.task("sass", function() {
    return gulp.src("app/scss/app.scss")
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
        //.pipe(gulp.dest("app/css"))
        .pipe(minify())
        .pipe(rename("app.min.css"))
        .pipe(gulp.dest("app/css"))
        .pipe(browserSync.stream());
});


// сервер + наблюдение за scss/html files
gulp.task("serve", ["sass"], function() {

    browserSync.init({
        server: "./app"
    });

    gulp.watch("app/scss/*.scss", ["sass"]);
    gulp.watch("app/*.html").on("change", browserSync.reload);
});

// очистка
gulp.task("clean", function() {
    return del("dist");
});

//useref
gulp.task("copy", function() {
    gulp.src("app/*.html").pipe(gulp.dest("dist"));
    gulp.src("app/css/*.css").pipe(gulp.dest("dist/css"));
    gulp.src("app/js/*.js").pipe(gulp.dest("dist/js"));
});


// Отправка собранного проекта на хостинг - очищает папку dist,
// собирает в нее проект по новой и отправляет на хостинг
gulp.task('ftp', function () {
    return gulp.src('dist/**/**')
        .pipe(ftp({
            host: 'burshtein.ru',
            user: 'fenixx83_burshtein',
            pass: 'burshte1n'
        }))
        // you need to have some kind of stream after gulp-ftp to make sure it's flushed 
        // this can be a gulp plugin, gulp.dest, or any kind of stream 
        // here we use a passthrough stream 
        .pipe(gutil.noop());
});

// запуск сборки
gulp.task("build", function(fn) {
  run(
    "sass",
    "clean",
    "copy",
    fn
  );
});
