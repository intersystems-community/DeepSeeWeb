var gulp   = require('gulp'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    concat = require('gulp-concat'),
    cssmin = require('gulp-cssmin'),
    htmlreplace = require('gulp-html-replace'),
    templateCache = require('gulp-angular-templatecache'),
    del = require('del');

gulp.task('minify', ['templates'], function () {
    var scripts = [
        "src/app.js",
        "src/directives/focus.js",
        "src/controllers/login.js",
        "src/services/session.js",
        "src/services/interseptor.js",
        "src/services/connector.js",
        "src/controllers/menu.js",
        "src/controllers/dashboard.js",
        "src/controllers/dashboardList.js",
        "src/services/lang.js",
        "build/src/templates.js"
    ];
    return gulp.src(scripts)
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(uglify({mangle: false}))
        .pipe(concat('app.js'))
        .pipe(gulp.dest('build/src'));
});

gulp.task('cssminify', function () {
    gulp.src(['css/**/*.css', '!css/**/*.min.css'])
        .pipe(cssmin())
        .pipe(concat('main.css'))
        .pipe(gulp.dest('build/css'));
});

gulp.task('copyfiles', function () {
    gulp.src(['src/lib/*.js'])
        .pipe(gulp.dest('build/src/lib'));
    gulp.src(['css/*.min.css'])
        .pipe(gulp.dest('build/css'));
    gulp.src(['fonts/*'])
        .pipe(gulp.dest('build/fonts'));
    gulp.src(['img/*'])
        .pipe(gulp.dest('build/img'));
});

gulp.task('copyindex', function () {
    var scripts = [
        "src/lib/angular.min.js",
        "src/lib/angular-route.min.js",
        "src/lib/angular-gridster.min.js",
        "src/lib/jquery-2.1.3.min.js",
        "src/lib/bootstrap.min.js",
        "src/app.js"
    ];

    gulp.src(['index.html'])
        .pipe(htmlreplace({ 'js': scripts }))
        .pipe(gulp.dest('build'));
});

gulp.task('templates', function() {
    return gulp.src(['src/views/*.html'])
        .pipe(templateCache())
        .pipe(gulp.dest('build/src'));
});

gulp.task('cleanup', ['minify'], function() {
    del(["build/src/templates.js"]);
});


gulp.task('default', ['minify', 'cssminify', 'copyfiles', 'copyindex', 'cleanup'], function () {});

