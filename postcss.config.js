module.exports = {
	'plugins': {
		'autoprefixer': {},
		'postcss-write-svg': { utf8: false },
		'postcss-px-to-viewport': {
			viewportWidth: 375,
			viewportHeight: 667,
			viewportUnit: 'vw',
			selectorBlackList: ['.ignore', '.hairlines', '.vw-disabled', /vw-disabled/],
			minPixelValue: 1,
			unitPrecision: 3,
			mediaQuery: false
		}
	}
}
