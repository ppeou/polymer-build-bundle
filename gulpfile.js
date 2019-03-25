var gulp = require('gulp');
var RevAll = require("gulp-rev-all");
const gulpFilter = require('gulp-filter');
var gulpClean = require('gulp-clean');

const src = './build/es6-bundled/';

const clean = () => {
    return gulp.src('./build/dist', {read: false, allowEmpty: true})
        .pipe(gulpClean());
};


const cacheBuster = () => {
    return gulp.src('./build/es6-bundled/**')
        .pipe(RevAll.revision({
            includeFilesInManifest: ['.html', '.css', '.js', '.txt', '.png', '.jpg'],
            dontRenameFile: [
                'index.html',
                'service-worker.js',
                'manifest.json', /bower_components\/webcomponentsjs/],
            dontUpdateReference: ['index.html', 'service-worker.js',
                'manifest.json', /bower_components\/webcomponentsjs/],
        }))
        .pipe(gulp.dest('./build/dist'))
        .pipe(RevAll.manifestFile())
        .pipe(gulp.dest('./build/dist'))
        .pipe(RevAll.versionFile())
        .pipe(gulp.dest('./build/dist'));
};

const excludeDirs = () => {
    const f= gulpFilter(['!*build/es6-bundled/bower_components/webcomponentsjs']);
    return gulp.src(src).pipe(f).pipe(gulp.dest('./build/dist'));
};

gulp.task('clean', clean);
gulp.task('excludeDirs', excludeDirs);
gulp.task('cacheBuster', cacheBuster);
gulp.task('default', gulp.series(clean, excludeDirs,cacheBuster));
