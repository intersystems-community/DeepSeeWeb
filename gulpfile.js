var gulp   = require('gulp'),
    uglify = require('gulp-uglify'),
    useref = require('gulp-useref'),
    jshint = require('gulp-jshint'),
    concat = require('gulp-concat'),
    cssmin = require('gulp-cssmin'),
    templateCache = require('gulp-angular-templatecache'),
    del = require('del'),
    zip = require('gulp-zip'),
    bump = require('gulp-bump'),
    replace = require('gulp-replace'),
    release = require('gulp-github-release');

    // TODO: add html-min
    //jsdoc = require("gulp-jsdoc");

// Runing jshint an all source
gulp.task('lint', function() {
    gulp.src(['src/**/*.js', '!src/lib/*'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Minify all project js files
gulp.task('minify', function () {
    var assets = useref.assets();
    var p = require('./package.json');
    return gulp.src('index.html')
        .pipe(assets)
        .pipe(replace('"{{package.json.version}}"', '"' + p.version + '"'))
        .pipe(uglify())
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(gulp.dest('build'));
});

// Append templates.js to app.js
gulp.task('concat-templates', ['templates', 'minify'], function() {
    return gulp.src(['build/src/app.js', 'build/src/templates.js'])
        .pipe(concat('app.js'))
        .pipe(gulp.dest('build/src'));
});

// Minify css files
gulp.task('cssminify', function () {
    gulp.src(['css/**/*.css', '!css/**/*.min.css'])
        .pipe(cssmin())
        .pipe(concat('main.css'))
        .pipe(gulp.dest('build/css'));
});

// Copy other files to dist (like fonts, libs, images)
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

// Create single tamplates file from *.html views
gulp.task('templates', function() {
    var p = require('./package.json');
    return gulp.src(['src/views/*.html'])
        .pipe(replace('{{package.json.version}}', p.version))
        .pipe(templateCache({root:"src/views/"}))
        .pipe(gulp.dest('build/src'));
});

// Remove temporary files
gulp.task('cleanup', ['concat-templates'], function() {
    del(["build/src/templates.js"]);
    del(["build/*.zip"]);
});

// Creates zip with builded project
gulp.task('zip', function() {
    var p = require('./package.json');

    return gulp.src('build/**/*')
        .pipe(zip('DSW-' + p.version + '.zip'))
        .pipe(gulp.dest('build'));
});

// Deploys release on github
/*gulp.task('upload', ['zip'], function() {
    var p = require('./package.json');
    return gulp.src('./build/' + 'DSW-' + p.version + '.zip')
    .pipe(release({
        token: '',                     // or you can set an env var called GITHUB_TOKEN instead
        owner: 'gnibeda',
        name: 'DeepSeeWeb v' + p.version,
        repo: 'publish-release',
        tag: 'v'+p.version,
        manifest: p
    }));
});*/

gulp.task('makerelease', ['zip'], function() {
    return gulp.src('./package.json')
        //.pipe(bump())
        .pipe(gulp.dest('./'));
});


/* Generate jsdoc
gulp.task('jsdoc', function() {
    return gulp.src(['src/ * * /*.js', '!src/lib/*'])
        .pipe(jsdoc('./documentation'));
});*/


gulp.task('default', ['lint', 'minify', 'cssminify', 'concat-templates', 'copyfiles', 'cleanup'], function () {});

