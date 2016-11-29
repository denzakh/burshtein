"use strict";

// МОДУЛИ:

// gulp
var gulp = require("gulp");

// сервер и обновление
var browserSync = require("browser-sync").create();
var server = require("browser-sync");

// *** сборка ***

// sass
var sass = require("gulp-sass");

// префиксы для CSS
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");

// useref - парсит специфичные блоки и конкатенирует описанные в них стили и скрипты
var useref = require("gulp-useref");

// mqpacker - группирует media queries и перемещает их
var mqpacker = require("css-mqpacker");

// minify - минификация CSS
var minify = require("gulp-csso");

// imagemin - сжатие изображений
var imagemin = require("gulp-imagemin");

// *** общие ***

// gulp-util - вспомогательные утилиты gulp
var gutil = require('gulp-util');

//  rename - переименовывает файлы
var rename = require("gulp-rename");

// plumber - обрабатывает ошибки и выводит в консоль
var plumber = require("gulp-plumber");

// позволяет запускать несколько задач
var gulpif = require("gulp-if");

// позволяет запускать задачи последовательно
var run = require('run-sequence');

// notify - позволяет выводить системные сообщения
var notify = require("gulp-notify");

// заливает сборку по FTP
var ftp = require("gulp-ftp"); 

// очищает каталог
var del = require("del");

// работа с файловой системой
var fs = require('fs');


// ЗАДАЧИ:

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

//команда по умолчанию - запуск сервера и наблюдение
gulp.task("default", ["serve"]);

// очистка каталога со сборкой
gulp.task("clean", function() {
    return del("dist");
});

//копирование файлов в каталог сборки
gulp.task("copy", function() {
    gulp.src("app/*.html").pipe(gulp.dest("dist"));
    gulp.src("app/css/*.css").pipe(gulp.dest("dist/css"));
    gulp.src("app/js/*.js").pipe(gulp.dest("dist/js"));
    gulp.src("app/img/*.*").pipe(gulp.dest("dist/img"));
});


// FTP: Отправка собранного проекта на хостинг
gulp.task('ftp', function () {

  // настройки FTP
  var ftpObj = {
          host: 'burshtein.ru',
          user: 'fenixx83_burshtein',
          pass: ''
      };  

  // чтение файла с паролем
  ftpObj.pass = fs.readFileSync('psw.txt','utf8');

  return gulp.src('dist/**/**')
      .pipe(ftp(ftpObj))
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
