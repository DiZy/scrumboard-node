const gulp = require('gulp');
const sass = require('gulp-sass');
const nodemon = require('gulp-nodemon');
const gulpSupervisor = require('gulp-supervisor');
const watch = require('gulp-watch');

gulp.task('clean', function() {
    //TODO figure out clean task
});

gulp.task('scss', function() {
    gulp.src('src/scss/**')
        .pipe(sass())
        .pipe(gulp.dest('build/assets/css'));
});

gulp.task('css', function() {
    gulp.src('src/css/**')
        .pipe(gulp.dest('build/assets/css'));
});

gulp.task('js', function() {
    gulp.src('src/js/**')
        .pipe(gulp.dest('build/assets/js'));
});

gulp.task('nodejs', function() {
    gulp.src('src/nodejs/**')
        .pipe(gulp.dest('build'));
});

gulp.task('views', function() {
    gulp.src('src/views/**')
        .pipe(gulp.dest('build/views'));
});

gulp.task('images', function() {
    gulp.src('src/images/**')
        .pipe(gulp.dest('build/assets/images'));
});

gulp.task('fonts', function() {
    gulp.src('src/fonts/**')
        .pipe(gulp.dest('build/assets/fonts'));
});

gulp.task('run', function() {
    nodemon({
        script: 'build/app.js'
    });
});

gulp.task('supervisor', function() {
    gulpSupervisor('build/app.js');
});

gulp.task('scss-debug', function() {
    return watch('src/scss/**', { ignoreInitial: false }).pipe(sass())
        .pipe(gulp.dest('build/assets/css'));
});

gulp.task('css-debug', function() {
    return watch('src/css/**', { ignoreInitial: false })
        .pipe(gulp.dest('build/assets/css'));
});

gulp.task('nodejs-debug', function() {
    return watch('src/nodejs/**', { ignoreInitial: false }).pipe(gulp.dest('build'));
});

gulp.task('js-debug', function() {
    return watch('src/js/**', { ignoreInitial: false }).pipe(gulp.dest('build/assets/js'));
});


gulp.task('views-debug', function() {
    return watch('src/views/**', { ignoreInitial: false }).pipe(gulp.dest('build/views'));
});

gulp.task('images-debug', function() {
    return watch('src/images/**', { ignoreInitial: false }).pipe(gulp.dest('build/assets/images'));
});

gulp.task('fonts-debug', function() {
    return watch('src/fonts/**', { ignoreInitial: false }).pipe(gulp.dest('build/assets/fonts'));
});


gulp.task('build', ['clean', 'scss', 'css', 'nodejs', 'js', 'images', 'fonts', 'views'], function() {

});

gulp.task('default', ['build', 'run'], function() {

});

gulp.task('debug', ['build', 'scss-debug', 'css-debug', 'nodejs-debug', 'js-debug', 'views-debug', 'supervisor'], function() {

});

gulp.task('debug-assets', ['build', 'scss-debug', 'css-debug', 'nodejs-debug', 'js-debug', 'images-debug', 'views-debug', 'fonts-debug', 'run'], function() {

});


