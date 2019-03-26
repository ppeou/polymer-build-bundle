const gulp = require('gulp');
const RevAll = require('gulp-rev-all');
const gulpFilter = require('gulp-filter');
const gulpClean = require('gulp-clean');
const fs = require('fs');
const gulpReplace = require('gulp-replace');
const gulpRename = require("gulp-rename");

const src = './build/es6-bundled/';

const clean = () => {
    return gulp.src('./build/dist', {read: false, allowEmpty: true})
        .pipe(gulpClean());
};

const cacheBuster = () => {
    return gulp.src('./build/es6-bundled/**')
        .pipe(RevAll.revision({
            includeFilesInManifest: ['.html', '.css', '.js', '.txt', '.png', '.jpg'],
            dontRenameFile: ['service-worker.js',
                'manifest.json', /bower_components\/webcomponentsjs/],
            dontUpdateReference: ['service-worker.js',
                'manifest.json', /bower_components\/webcomponentsjs/],
        }))
        .pipe(gulp.dest('./build/dist'))
        .pipe(RevAll.manifestFile())
        .pipe(gulp.dest('./build/dist'))
        .pipe(RevAll.versionFile())
        .pipe(gulp.dest('./build/dist'));
};

const excludeDirs = () => {
    const f = gulpFilter(['!*build/es6-bundled/bower_components/webcomponentsjs']);
    return gulp.src(src).pipe(f).pipe(gulp.dest('./build/dist'));
};

const updateVersion = () => {
    return gulp.src('./build/es6-bundled/index.html', {base: './'})
        .pipe(gulpReplace('(@version@)', (new Date()).toLocaleString()))
        .pipe(gulp.dest('./'));
};

const reCorrectRef = () => {
    const fileData = fs.readFileSync('./build/dist/service-worker.js', 'utf8');
    const {'index.html': indexFileHash} = JSON.parse(fs.readFileSync('./build/dist/rev-manifest.json'));
    const str = fileData.match(new RegExp(`\["${indexFileHash}","[a-z0-9]*"\],`, 'g'));
    const toBeReplaced = str.find(c => c.indexOf(indexFileHash) > -1);

    fs.renameSync(`./build/dist/${indexFileHash}`, `./build/dist/index.html`);

    return gulp.src('./build/dist/service-worker.js', {base: './'})
        .pipe(gulpReplace(toBeReplaced, ''))
        .pipe(gulp.dest('./'));
};

gulp.task('clean', clean);
gulp.task('excludeDirs', excludeDirs);
gulp.task('cacheBuster', cacheBuster);
gulp.task('default', gulp.series(clean, excludeDirs, updateVersion, cacheBuster, reCorrectRef));

