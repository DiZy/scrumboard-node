const gulp = require('gulp');
const sass = require('gulp-sass');
const nodemon = require('gulp-nodemon');
const gulpSupervisor = require('gulp-supervisor');
const watch = require('gulp-watch');

gulp.task('clean', function() {
    //TODO figure out clean task
});

gulp.task('css', function() {
    gulp.src('src/scss/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('build/assets/css'));
});

gulp.task('js', function() {
    gulp.src('src/nodejs/*.js')
        .pipe(gulp.dest('build'));
});

gulp.task('views', function() {
    gulp.src('src/views/**/*.ejs')
        .pipe(gulp.dest('build/views'));
});

gulp.task('run', function() {
    nodemon({
        script: 'build/app.js'
    });
});

gulp.task('supervisor', function() {
    gulpSupervisor('build/app.js');
});

gulp.task('css-debug', function() {
    return watch('src/scss/*.scss', { ignoreInitial: false }).pipe(sass())
        .pipe(gulp.dest('build/assets/css'));
});

gulp.task('js-debug', function() {
    return watch('src/nodejs/*.js', { ignoreInitial: false }).pipe(gulp.dest('build'));
});

gulp.task('views-debug', function() {
    return watch('src/views/**/*.ejs', { ignoreInitial: false }).pipe(gulp.dest('build/views'));
});

gulp.task('default', ['clean', 'css', 'js', 'views', 'run'], function() {

});

gulp.task('build', ['clean', 'css', 'js', 'views'], function() {

});

gulp.task('debug', ['clean', 'css', 'css-debug', 'js', 'js-debug', 'views', 'views-debug', 'supervisor'], function() {

});
