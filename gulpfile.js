var gulp = require('gulp');	// gulp 모듈 호출
// var webserver = require('gulp-webserver');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minifycss = require('gulp-clean-css');
var rename = require('gulp-rename');
// var fileinclude = require('gulp-file-include');
var browserSync = require('browser-sync').create();
// var minifyhtml = require('gulp-minify-html');
// var sass = require('gulp-sass');
// var livereload = require('gulp-livereload');

var src = '/';
var dist = 'dist';
var paths = {
	html: 'html/**/*.html',
	css: ['resources/style/common.css', 'resources/style/style.css'],
	js: 'resources/script/common.js'
	// scss: 'resources/style/*.scss',
}

// gulp.task('server', function(done){
// 	gulp.src('/')
// 		.pipe(webserver({
// 			port:3000,
// 			// path:'/html',
// 			open:true
// 		}));
// });

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
		// .pipe(concat('index.css'))	// 병합
		.pipe(gulp.dest('dist/css'))	// dist폴더에 저장
		.pipe(minifycss())				// minify
		// .pipe(rename('index.min.css'))	// min네이밍으로 파일 생성
		.pipe(rename({ suffix : '.min'}))
		.pipe(gulp.dest('dist/css'))	//dist폴더에 저장
	done();
});

// js minify
gulp.task('uglify', function(done){
	gulp.src(paths.js)
		// .pipe(concat('index.min.js'))	// 병합
		.pipe(uglify())				// minify		
		.pipe(gulp.dest('dist/js'))	// dist폴더에 저장
	done();
});

gulp.task('reload', function(done){
	browserSync.reload();
	done();
});

// 웹서버 실행
gulp.task('server', function(done){
	browserSync.init({
		// 로컬서버
		server:{
			baseDir:'./',
			index:'/html/path.html'
		},
		// 프록시 이용
		// proxy:'localhost:8080',
		// serveStatic:['./'],
		
		reloadDelay: 50,
        reloadDebounce: 250
	});
	done();
});

// 파일 변경 감지
gulp.task('watch', function(done){
	gulp.watch(paths.html, gulp.series('html', 'reload'));
	gulp.watch(paths.css, gulp.series('minifycss', 'reload'));
	gulp.watch('resources/script/*.js', gulp.series('uglify', 'reload'));
	done();
});

gulp.task('default', gulp.series('server', 'watch'));

// file include 이용할 때 사용
// gulp.task('default', gulp.series('html', gulp.parallel('server', 'watch')));