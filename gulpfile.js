const { src, dest, watch, parallel, series } = require('gulp');

const sass = require('gulp-dart-sass');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const fileinclude = require('gulp-file-include');
const del = require('del');
const htmlmin = require('gulp-htmlmin');
const cfg = require('./package.json').config;
const csso = require('gulp-csso');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const terser = require('gulp-terser');
const browserslist = ['> 1%, last 3 versions, not dead'];

function html() {
	return src(cfg.srcDir + '/*.html')
		.pipe(
			fileinclude({
				prefix: '@@',
				basepath: '@file',
			}),
		)
		.pipe(dest(cfg.outputDir))
		.pipe(browserSync.stream({ once: true }));
}

function htmlMin() {
	return src(cfg.srcDir + '/*.html')
		.pipe(
			fileinclude({
				prefix: '@@',
				basepath: '@file',
			}),
		)
		.pipe(htmlmin({ collapseWhitespace: true }))
		.pipe(dest(cfg.outputDir));
}

async function fonts() {
	const ttf2woff2 = (await import('gulp-ttf2woff2')).default;

	// Копіюємо оригінальні шрифти
	src(cfg.srcDir + '/fonts/**/*', { encoding: false }).pipe(dest(cfg.outputDir + '/fonts'));

	// Конвертуємо .ttf у .woff2
	return src(cfg.srcDir + '/fonts/**/*.ttf', { encoding: false })
		.pipe(plumber({ errorHandler: notify.onError('Font Error: <%= error.message %>') }))
		.pipe(ttf2woff2())
		.pipe(dest(cfg.outputDir + '/fonts'));
}

function styles() {
	return src(cfg.srcDir + '/scss/**/*.{scss,sass}', { sourcemaps: true })
		.pipe(plumber({ errorHandler: notify.onError('Sass Error: <%= error.message %>') }))
		.pipe(
			sass({
				outputStyle: 'expanded',
				silenceDeprecations: ['legacy-js-api'],
			}).on('error', sass.logError),
		)
		.pipe(
			autoprefixer({
				overrideBrowserslist: browserslist,
			}),
		)
		.pipe(dest(cfg.outputDir + '/css', { sourcemaps: '.' }))
		.pipe(browserSync.stream({ once: true }));
}

function stylesMin() {
	return src(cfg.srcDir + '/scss/**/*.{scss,sass}', { sourcemaps: false })
		.pipe(
			sass({
				outputStyle: 'compressed',
				silenceDeprecations: ['legacy-js-api'],
			}).on('error', sass.logError),
		)
		.pipe(
			autoprefixer({
				overrideBrowserslist: browserslist,
			}),
		)
		// .pipe(csso()) // можна розкоментити, якщо хочеш додатково мінімізувати css
		.pipe(dest(cfg.outputDir + '/css'));
}

function scripts() {
	return src(cfg.srcDir + '/js/**/*.js')
		.pipe(plumber({ errorHandler: notify.onError('Error: <%= error.message %>') }))
		.pipe(concat('script.min.js'))
		.pipe(terser())
		.pipe(dest(cfg.outputDir + '/js'))
		.pipe(browserSync.stream({ once: true }));
}

function imageSync() {
	return src(cfg.srcDir + '/imgs/**/*', { encoding: false })
		.pipe(dest(cfg.outputDir + '/imgs'))
		.pipe(browserSync.stream({ once: true }));
}

async function imageSyncMin() {
	const imagemin = (await import('gulp-imagemin')).default;
	const imageminPngquant = (await import('imagemin-pngquant')).default;
	const imageminMozjpeg = (await import('imagemin-mozjpeg')).default;
	const imageminSvgo = (await import('imagemin-svgo')).default;

	return src(cfg.srcDir + '/imgs/**/*', { encoding: false })
		.pipe(
			imagemin([
				imageminPngquant({ quality: [0.6, 0.8], speed: 1 }),
				imageminMozjpeg({ quality: 70, progressive: true }),
				imageminSvgo(),
			]),
		)
		.pipe(dest(cfg.outputDir + '/imgs'))
		.pipe(browserSync.stream({ once: true }));
}

function browsersync() {
	browserSync.init({
		server: {
			baseDir: cfg.outputDir,
		},
	});
}

function watching() {
	watch(cfg.srcDir + '/scss/**/*.scss', styles);
	watch(cfg.srcDir + '/js/**/*.js', scripts);
	watch(cfg.srcDir + '/**/*.html', html);
	watch(cfg.srcDir + '/imgs/**/*', imageSync);
}

async function clean() {
	const { deleteSync } = await import('del');
	return deleteSync([cfg.outputDir]);
}

async function loadPrettier() {
	const prettier = await import('gulp-prettier');
	return prettier.default;
}

async function pretty() {
	const prettier = await loadPrettier();
	return src([cfg.srcDir + '/**/*', '!' + cfg.srcDir + '/imgs/**/*']).pipe(prettier()).pipe(dest(cfg.srcDir));
}

exports.build = series(
	clean,
	htmlMin,
	fonts,
	stylesMin,
	scripts,
	imageSyncMin,
);
exports.format = pretty;
exports.cssmin = stylesMin;
exports.default = parallel(html, fonts, styles, scripts, imageSync, watching, browsersync);
