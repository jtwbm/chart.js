'use strict';

const gulp = require('gulp'),
    watch = require('gulp-watch'),
    prefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    babel = require('gulp-babel'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    cssmin = require('gulp-clean-css'),
    rigger = require('gulp-rigger'),
    rimraf = require('rimraf'),
    imagemin = require('gulp-imagemin'),
    browserSync = require("browser-sync"),
    reload = browserSync.reload,
    favicons = require("favicons").stream,
    gutil = require("gulp-util");

const serverConfig = {
    server: {
        baseDir: "./build"
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: "jtwbm"
};

const path = {
    build: {
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/',
        favicons: 'build/favicons/'
    },
    src: {
        html: 'src/*.html',
        js: 'src/js/**/*.js',
        style: 'src/css/*.*css',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*',
        other: 'src/*.!(html)',
        favicons: 'src/html/favicons/*.png',
        notFavicons: 'src/html/favicons/*.!(png||html)'
    },
    clean: ['./build', './src/html/favicons/']
};

gulp.task('html:build', function () {
    gulp.src(path.src.html)
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
});
gulp.task('js:build', function () {
    gulp.src(path.src.js)
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});
gulp.task('style:build', function () {
    gulp.src(path.src.style)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(prefixer())
        .pipe(cssmin({compatibility: 'ie8'}))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true}));
});
gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});
gulp.task('image:build', function () {
    gulp.src(path.src.img)
        .pipe(imagemin())
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({stream: true}));
});
gulp.task('notFavicons:build', function () {
    gulp.src(path.src.notFavicons)
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
});
gulp.task('favicons:build', ['notFavicons:build'], function () {
    gulp.src(path.src.favicons)
        .pipe(imagemin())
        .pipe(gulp.dest(path.build.favicons))
        .pipe(reload({stream: true}));
});
gulp.task('other:build', function () {
    gulp.src(path.src.other)
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
});
gulp.task('build', [
    'html:build',
    'js:build',
    'image:build',
    'style:build',
    'fonts:build',
    'other:build',
]);
gulp.task('watch', function(){
    watch(['src/**/*.html'], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.src.style], function(event, cb) {
        gulp.start('style:build');
    });
    watch([path.src.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.src.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.src.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
    watch([path.src.other], function(event, cb) {
        gulp.start('other:build');
    });
});
gulp.task('webserver', function () {
    browserSync(serverConfig);
});

gulp.task('build:clean', function (cb) {
    rimraf(path.clean[0], cb);
});
gulp.task('favicons:clean', function (cb) {
    rimraf(path.clean[1], cb);
});
gulp.task('clean', ['build:clean', 'favicons:clean']);

gulp.task('default', ['build', 'webserver', 'watch']);

gulp.task("favicons:create", function () {
    return gulp.src("src/icon.png").pipe(favicons({
        appName: "Empty HTML5 Template",
        appShortName: "HTML5 Template",
        appDescription: "Empty HTML5 Template",
        developerName: "jtwbm",
        developerURL: "localhost:9000",
        background: "#fff",
        path: "favicons/",
        url: "http://yourdomain.com/",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        version: 1.0,
        logging: false,
        html: "favicons.html", // src/favicons/favicons.html
        pipeHTML: true,
        replace: true
    }))
    .on("error", gutil.log)
    .pipe(gulp.dest('src/html/favicons/'));
});
