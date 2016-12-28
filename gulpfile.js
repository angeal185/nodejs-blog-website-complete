// include the required packages.
var gulp = require('gulp');
var stylus = require('gulp-stylus');

// Get one .styl file and render
gulp.task('front-end', function () {
  return gulp.src('themes/default/public/stylus/**/*.styl')
	.pipe(stylus({
      compress: true
    }))
    .pipe(gulp.dest('themes/default/public/css'));
});

gulp.task('back-end', function () {
  return gulp.src('public/stylus/**/*.styl')
	.pipe(stylus({
      compress: true
    }))
    .pipe(gulp.dest('public/css'));
});


gulp.task('watch', function() {

// Watch .styl files
gulp.watch('themes/default/public/stylus/**/*.styl', ['front-end']);
gulp.watch('public/stylus/**/*.styl', ['back-end']);

});

// Default gulp task to run
gulp.task('default', ['front-end', 'back-end', 'watch' ]);