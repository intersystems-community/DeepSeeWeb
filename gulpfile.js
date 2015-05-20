var gulp   = require('gulp'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    concat = require('gulp-concat'),
    cssmin = require('gulp-cssmin'),
    //jscs = require('gulp-jscs'),
    htmlreplace = require('gulp-html-replace'),
    templateCache = require('gulp-angular-templatecache'),
    del = require('del');

gulp.task('minify', ['templates'], function () {
    var scripts = [
        "src/app.js",
        "src/services/utils.js",
        "src/directives/widgetContent.js",
        "src/services/error.js",
        "src/services/filters.js",
        "src/controllers/filter.js",
        "src/directives/focus.js",
        "src/directives/pivot.js",
        "src/controllers/login.js",
        "src/services/interseptor.js",
        "src/services/connector.js",
        "src/controllers/menu.js",
        "src/controllers/dashboard.js",
        "src/controllers/dashboardList.js",
        "src/factories/baseWidget.js",
        "src/factories/emptyWidget.js",
        "src/factories/baseChart.js",
        "src/factories/lineChart.js",
        "src/factories/areaChart.js",
        "src/factories/barChart.js",
        "src/factories/columnChart.js",
        "src/factories/pieChart.js",
        "src/factories/xyChart.js",
        "src/factories/timeChart.js",
        "src/factories/timeChart.js",
        "src/factories/hiLowChart.js",
        "src/factories/treeMapChart.js",
        "src/factories/bubbleChart.js",
        "src/factories/bullseyeChart.js",
        "src/factories/speedometerChart.js",
        "src/factories/fuelGaugeChart.js",
        "src/factories/pivotWidget.js",
        "src/directives/textWidget.js",
        "src/factories/textWidget.js",
        "src/services/typeMap.js",
        "src/controllers/widget.js",
        "src/services/lang.js",
        "build/src/templates.js"
    ];

    return gulp.src(scripts)
        //.pipe(jscs())
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        //.pipe(uglify())
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
        "src/lib/numeral.min.js",
        "src/lib/angular.min.js",
        "src/lib/angular-route.min.js",
        "src/lib/angular-cookies.min.js",
        "src/lib/angular-notify.min.js",
        "src/lib/ng-context-menu.min.js",
        "src/lib/ngDialog.js",
        "src/lib/jquery-2.1.3.min.js",
        "src/lib/bootstrap.min.js",
        "src/lib/angular-gridster.min.js",
        "src/lib/highstock.js",
        "src/lib/exporting.js",
        "src/lib/no-data-to-display.src.js",
        "src/lib/highcharts-more.js",
        "src/lib/highcharts-3d.src.js",
        "src/lib/heatmap.src.js",
        "src/lib/treemap.src.js",
        "src/lib/highcharts-ng.min.js",
        "src/lib/lightPivotTable.js",
        "src/app.js"
    ];
    gulp.src(['index.html'])
        .pipe(htmlreplace({ 'js': scripts }))
        .pipe(gulp.dest('build'));
});

gulp.task('templates', function() {
    return gulp.src(['src/views/*.html'])
        .pipe(templateCache({root:"src/views/"}))
        .pipe(gulp.dest('build/src'));
});

gulp.task('cleanup', ['minify'], function() {
    del(["build/src/templates.js"]);
});


gulp.task('default', ['minify', 'cssminify', 'copyfiles', 'copyindex', 'cleanup'], function () {});

