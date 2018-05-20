'use strict';

// gulp require file
const gulp = require('gulp');
const gutil = require('gulp-util');

// npm packages for config
const fileinclude = require('gulp-file-include'); // file include
const gulpconfig = require('./gulpconfig.json'); //  configuration file

// npm packages for global settings
const fs = require('fs'); // file system
const browsersync = require('browser-sync').create(); // browser sync
const changed = require('gulp-changed'); // change 
const clean = require('gulp-clean'); // clean
const concat = require('gulp-concat'); // concat
const connect =  require('gulp-connect'); // connect 
const del = require('del'); // del
const livereload =require('gulp-livereload'); // for fast developement
const path = require('path'); // node path
const plumber =  require('gulp-plumber'); // prevent pipe function breaking caused by errors from gulp plugins
const notify = require('gulp-notify');
const rename = require('gulp-rename');

// npm packages for images

const imagemin = require('gulp-imagemin'); // imagemin
const newer = require('gulp-newer'); // newer
// npm packages for styles

const autoprefixer = require('autoprefixer'); // autoprefixer
const cssnano = require('gulp-cssnano'); // gulp cssnano
const cssnext = require('postcss-cssnext'); // postcss cssnext
const postcss =require('gulp-postcss'); // gulp postcss
const sass = require('gulp-sass'); // gulp sass

// npm packages for dev build
const devBuild = (process.env.NODE_ENV !== 'production'); // environment variable

// task management

// dev Build task
gulp.task('set-node-env-dev', function(){
    return process.env.NODE_ENV = 'development'; // for development
});
gulp.task('set-node-env-prod', function(){
    return process.env.NODE_ENV = 'production'; // for production
});

//@description Folder paths and variables
const paths = {
    // templates folder varibles object
    templates: {
        src: './apps/templates', // file source
        glob: './apps/templates/**/*.{tpl.html,html}', // select all file
        dest: './dist' // destination folder
    },
    app: './apps', // app folder path variable
    dest: './dist', // destination folder path variable
    //scripts folder varibles object
    scripts: {
        src: './apps/scripts',
        components: './apps/scripts/**/*.js', // all the js files
        entry: './apps/scripts/main.js', // entry file 
        thirdparty: './apps/scripts/thirdparty/**/*.js', // external js files
        dest: {
            default: './dist/scripts', // by default destination folder
            thirdparty: './dist/scripts/thirdparty' // thirdparty destination folder
        }
    },
    // styles folder variables object
    styles: {
        // global style folder variables
        glob: [
            './apps/templates/**/*.{scss,sass}',
            './apps/styles/**/*.{scss,sass}'
        ],
        // portfolio project folder variables
        portfolio_101: {
            src: './apps/styles/portfolio--101',
            entry: './apps/styles/portfolio--101/portfolio--101.scss',
            dest: './dist/styles'
        }

    },
    //fonts folder variables object
    fonts: {
        src: './apps/fonts',
        glob: './apps/fonts/**/*.{eot,svg,ttf,woff,woff2}',
        dest: './dist/fonts',
    },
    // images folder variables object
    images: {
        src: './apps/images',
        dest: './dist/images'
    }
};
// error handling using gulp util
gutil.log(gutil.colors.blue('[INFO]') + 'Checking the ' + gutil.colors.cyan('\'paths\'') + 'variables: ');
gutil.log(gutil.colors.blue('[INFO]') + 'paths.apps ' + paths.app);
gutil.log(gutil.colors.blue('[INFO]') + 'paths.dest ' + paths.dest);
gutil.log(gutil.colors.blue('[INFO]') + 'paths.templates.src ' + paths.templates.src);
gutil.log(gutil.colors.blue('[INFO]') + 'paths.templates.glob ' + paths.templates.glob);
gutil.log(gutil.colors.blue('[INFO]') + 'paths.templates.dest ' + paths.templates.dest);
gutil.log(gutil.colors.blue('[INFO]') + 'paths.templates.dest ' + paths.templates.dest);
gutil.log(gutil.colors.blue('[INFO]') + 'paths.styles.default.src ' + paths.styles.src);
gutil.log(gutil.colors.blue('[INFO]') + 'paths.styles.default.glob ' + paths.styles.glob);
gutil.log(gutil.colors.blue('[INFO]') + 'paths.styles.default.entry ' + paths.styles.entry);
gutil.log(gutil.colors.blue('[INFO]') + 'paths.scripts.src ' +  paths.scripts.src);
gutil.log(gutil.colors.blue('[INFO]') + 'paths.scripts.glob ' +  paths.scripts.glob);
gutil.log(gutil.colors.blue('[INFO]') + 'paths.scripts.entry ' +  paths.scripts.entry);
gutil.log(gutil.colors.blue('[INFO]') + 'paths.scripts.dest ' +  paths.scripts.dest);
gutil.log(gutil.colors.blue('[INFO]') + 'paths.images.src ' +  paths.images.src);
gutil.log(gutil.colors.blue('[INFO]') + 'paths.images.dest ' +  paths.images.dest);
gutil.log(gutil.colors.blue('[INFO]') + 'paths.fonts.src ' +  paths.fonts.src);
gutil.log(gutil.colors.blue('[INFO]') + 'paths.fonts.dest ' +  paths.fonts.dest);

// Error function
function onError(err){
    gutil.beep();
    console.log(err);
    this.emit('end');
} 

// file include task
gulp.task('fileinclude', function(done){
    gulp.src(paths.templates.src + '/**/*.tpl.html') // file src
    .pipe(fileinclude()) // run file include
    .pipe(rename({
        extname: '' // strip extension '.tpl.html'
    }))
    .pipe(rename({
        extname: '.html' // add extension '.html
    }))
    .pipe(gulp.dest(paths.templates.dest))
    .pipe(browsersync.reload({
        stream: true
    }));
    done();
});

// clean task. this task is assigned for if any file is delete from app folder it will automatically remove from dist folder
gulp.task('clean:dist', function(done){
    del.sync(paths.dest); // this will run the delete operation
    done();
});

// image optimization and image task
const imageOptions = {
    optimizationLevel : 5,
    interlaced : true
};
gulp.task('images',function (done) {
    gulp
      // process all images in ... based on file type
        .src(paths.images.src + '/**/*.+(png|jpg|jpeg|gif|svg|ico)')
      // process only newer images, check output folder first!
        .pipe(newer(paths.images.dest))
      // process images
        .pipe(imagemin(imageOptions))
      // move process imaged to output destination folder
        .pipe(gulp.dest(paths.images.dest));
    done();
});

// fonts task
gulp.task('fonts', function(done){
    gulp.src(paths.fonts.glob)
    .pipe(gulp.dest(paths.fonts.dest));
    done();
});

// sass options
const sassOptions = {
    // https://github.com/sass/node-sass
    errLogToConsole: true,
    imagePath:'images/',
    outputStyle: 'expanded', 
    precision: 3
}

// postcss options
const postcssPluginOptions = [
    autoprefixer({
        browsers: gulpconfig.browserList
    })
];

// css task
gulp.task('styles:portfolio--101', function (done){
    gutil.log(gutil.colors.blue('[INFO] ') + 'Generating CSS files: Sass, PostCSS (Autoprefixer) + Nano');
    if(!devBuild){
        postcssPluginOptions.push(cssnano);
    }
    gulp
      // get all .scss and sass files from styles folder
      .src(paths.styles.portfolio_101.entry)
      .pipe(plumber({
          errorHandler: onError
      }))
      // run sass with options
      .pipe(sass(sassOptions)).on('error', notify.onError(function (error){
         return gutil.log(gutil.colors.red('[ERROR]') + 'Problem file: ' + gutil.colors.red(error.message));  
      }))
      .pipe(postcss(postcssPluginOptions))
      .pipe(rename({
          suffix: '.min'
      }))
      .pipe(gulp.dest(paths.styles.portfolio_101.src))
      .pipe(gulp.dest(paths.styles.portfolio_101.dest))
      .pipe(browsersync.reload({
          stream: true
      }));
      done();
});

// script task for thirdparty
// @description copy all the thirdparty scripts to the destination folder
gulp.task('scripts:thirdparty', function(done){
    gulp
    // collecting thirdparty js
    .src(paths.scripts.thirdparty)
    // copy files to destination folder
    .pipe(gulp.dest(paths.scripts.dest.thirdparty));
    done();
});

// script task for components
gulp.task('scripts:components', function(done){
    gulp
    // collecting component js
    .src(paths.scripts.components)
    // copy files to destination
    .pipe(gulp.dest(paths.scripts.dest.default))
    // concat the files to main js file
    .pipe(concat('main.js'))
    .pipe(gulp.dest(paths.scripts.dest.default))
    .pipe(browsersync.reload({
        stream: true
    }));
    done();
});

// scripts series tasks
gulp.task('scripts', gulp.series(
    [
        'scripts:thirdparty',
        'scripts:components'
    ], function(done){
        done();
    }
));


// Simple local server with defualt settings
gulp.task('connectDev', function(done){
    connect.server({
        name: 'Dev',
        root: 'app',
        port: 8080,
        livereload: true
    });
    done();
});

// browser sync
// @see https://browsersync.io/docs/gulp
gulp.task('browserSync', function(){
    // static server
    browsersync.init({
        server: {
            baseDir: paths.app
        }
    });
    done();
});

// include all tasks in one
gulp.task('serve', gulp.series(
    [
        'fileinclude',
        'styles:portfolio--101',
        'scripts:thirdparty',
        'scripts:components',
        'images',
        'fonts'
    ],
    function(done){
        // start browsersync
        browsersync.init({
            server: {
                baseDir: paths.dest
            }
        });
    
    // watch styles
        gulp.watch(paths.styles.glob, gulp.series(['styles:portfolio--101'], function(done){
            done();
        }));
    // watch scripts components
        gulp.watch(paths.scripts.components, gulp.series(['scripts:components'], function(done){
            done();
        }));
    // watch template changes and reload
        gulp.watch(paths.templates.glob, gulp.series(['fileinclude'], function(done){
            done();
        }));
    
        done();
    }
));

// Default:DEVELOPMENT
gulp.task('default:development',gulp.series(
    [
        'set-node-env-dev',
        'clean:dist',
        'serve'
    ], function(done){
        done();
    }
));

// Default:PRODUCTION
gulp.task('default:development',gulp.series(
    [
        'set-node-env-dev',
        'clean:dist',
        'serve'
    ], function(done){
        done();
    }
));

// Run this task to generate all the tasks along one time
gulp.task('default', gulp.series(['clean:dist', 'serve'], function(done){
    done();
}));