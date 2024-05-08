// Gulp
const gulp = require('gulp');

// Browser
const browserSync = require('browser-sync').create();

// HTML
const fileInclude = require('gulp-file-include');

// CSS
const sass = require('gulp-sass')(require('sass'));
const sassGlob = require('gulp-sass-glob');
const sourceMaps = require('gulp-sourcemaps');

// Files
const rename = require('gulp-rename');
const clean = require('gulp-clean');
const fs = require('fs');

// Notification
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');

// JavaScript
const webpack = require('webpack-stream');
const babel = require('gulp-babel');

// Images
const imagemin = require('gulp-imagemin');

// Watching for changed files
const changed = require('gulp-changed');


// Settings
const fileIncludeSettings = {
    prefix: '@@',
    basepath: '@file'
};

const plumberNotify = (title) => {
    return {
        errorHandler: notify.onError({
            title: title,
            message: 'Error <%=  error.message %>',
            sound: false
        }),
    }
}

const renameSettings = {
    prefix: "",
    suffix: ".min"
};


// Tasks
gulp.task('clean:dev', function(done) {
    if (fs.existsSync('./docs/')) {
        return gulp.src('./docs/', { read: false }).pipe(clean({ force: true}));
    }
    done();
})

gulp.task('html:dev', function(){
    return gulp
        .src(['./src/html/**/*.html', '!./src/html/blocks/*.html']) 
        .pipe(changed('./docs/',  { hasChanged: changed.compareContents }))
        .pipe(plumber(plumberNotify('HTML')))
        .pipe(fileInclude(fileIncludeSettings))
        .pipe(gulp.dest('./docs/'))
        .pipe(browserSync.stream());
});

gulp.task('sass:dev', function(){
    return gulp
    .src('./src/scss/**/*.+(sass|scss)')
    .pipe(changed('./docs/css/'))
    .pipe(plumber(plumberNotify('SCSS')))
    .pipe(sourceMaps.init())
    .pipe(sassGlob())
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(sourceMaps.write())
    .pipe(rename(renameSettings))
    .pipe(gulp.dest('./docs/css/'))
    .pipe(browserSync.stream());
});

gulp.task('images:dev', function(){
    return gulp
    .src('./src/img/**/*')
    .pipe(changed('./docs/img/'))

    .pipe(gulp.dest('./docs/img/'))
    .pipe(browserSync.stream());
});

gulp.task('fonts:dev', function(){
    return gulp
    .src('./src/fonts/**/*')
    .pipe(changed('./docs/fonts/'))
    .pipe(gulp.dest('./docs/fonts/'))
    .pipe(browserSync.stream());
});

gulp.task('icons:dev', function(){
    return gulp
    .src('./src/icons/**/*')
    .pipe(changed('./docs/icons/'))
    .pipe(gulp.dest('./docs/icons/'))
    .pipe(browserSync.stream());
});

gulp.task('js:dev', function(){
    return gulp
    .src('./src/js/*.js')
    .pipe(changed('./docs/js/'))
    .pipe(plumber(plumberNotify('JS')))
    .pipe(webpack(require('./../webpack.config.js')))
    .pipe(gulp.dest('./docs/js'))
    .pipe(browserSync.stream());
})

gulp.task('server:dev', function() {

    browserSync.init({
        server: "./docs/"
    });
    gulp.watch("src/html/**/*.html").on('change', browserSync.reload);
});

gulp.task('watch:dev', function() {
    gulp.watch('./src/scss/**/*.+(sass|scss|css)', gulp.parallel('sass:dev'));
    gulp.watch('./src/html/**/*.html', gulp.parallel('html:dev'));
    gulp.watch('./src/img/**/*', gulp.parallel('images:dev'));
    gulp.watch('./src/fonts/**/*', gulp.parallel('fonts:dev'));
    gulp.watch('./src/icons/**/*', gulp.parallel('icons:dev'));
    gulp.watch('./src/js/**/*.js', gulp.parallel('js:dev'));
});
