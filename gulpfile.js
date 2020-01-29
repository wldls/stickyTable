var gulp = require('gulp');
// var concat = require('gulp-concat');
var del = require('del');
var uglify = require('gulp-uglify');
var minifycss = require('gulp-clean-css');
var rename = require('gulp-rename');
var browserSync = require('browser-sync').create();
// var sass = require('gulp-sass');

var src = '/';
var dist = 'dist';
var paths = {
	html: 'html/**/*.html',
	css: 'css/index.css',
	js: 'js/jquery.stickyTable.js'
	// scss: 'resources/style/*.scss',
}

// html
gulp.task('html', function(done){
	gulp.src(paths.html)
		// include -> 새 폴더가 생성되므로 다음 프로젝트 전까지 봉인
		// .pipe(fileinclude({
		// 	prefix: '@@',
		// 	basepath: './'
		// }))
		// .pipe(gulp.dest('temp'))
	done();
});

// css minify
gulp.task('minifycss', function(done){
	gulp.src(paths.css)
		.pipe(gulp.dest('dist/css'))	// dist폴더에 저장
		.pipe(minifycss())				// minify
		.pipe(rename({ suffix : '.min'}))	// min네이밍으로 파일 생성
		.pipe(gulp.dest('dist/css'))	//dist폴더에 저장
	done();
});

// js minify
gulp.task('uglify', function(done){
	gulp.src(paths.js)
		.pipe(gulp.dest('dist/js'))	// dist폴더에 저장
		.pipe(uglify())				// minify
		.pipe(rename({suffix:'.min'}))	// min네이밍으로 파일 생성
		.pipe(gulp.dest('dist/js'))	// dist폴더에 저장
	done();
});

gulp.task('reload', function(done){
	browserSync.reload();
	done();
});

gulp.task('clean', function(done){
	del(['dist/**']);
	done();
});

// 웹서버 실행
gulp.task('server', function(done){
	browserSync.init({
		// 로컬서버
		server:{
			baseDir:'./',
			index:'/html/index.html'
		},		
		reloadDelay: 50,
    reloadDebounce: 250
	});
	done();
});

// 파일 변경 감지
gulp.task('watch', function(done){
	gulp.watch(paths.html, gulp.series('html', 'reload'));
	gulp.watch(paths.css, gulp.series('minifycss', 'reload'));
	gulp.watch(paths.js, gulp.series('uglify', 'reload'));
	done();
});

gulp.task('default', gulp.series('clean', 'html', 'minifycss', 'uglify', 'server', 'watch'));