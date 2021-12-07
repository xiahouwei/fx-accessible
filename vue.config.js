const path = require('path');
const PROXY_TARGET = process.env.PROXY_TARGET || 'CS'
const PROXY_LIBRARY = {
	CS1: 'http://192.168.7.195:8282/z5_supply',
	CS2: 'http://192.168.13.195:8282/z5',
	XXW: 'http://192.168.7.145',
	ZX: 'http://192.168.7.122:8080/z5',
	WQ: 'http://192.168.7.138',
	// ZHANGXU: 'http://192.168.7.232:8180/cldpoint'
	ZHANGXU: 'http://zxcs.test.fxscm.net:8041/cldpoint',
	DHC: 'http://xhcs.test.fxscm.net:7123/cldpoint',
	// KHJ: 'http://192.168.13.153:8080/cldpoint'
	KHJ: 'http://xhcs.test.fxscm.net:8080/cldpoint',
	TY: 'http://192.168.7.155:8080',
	YHQ: 'http://192.168.7.122:8080',
	YXY: 'http://yxycs.test.fxscm.net:8111/cldpoint'
	
}
const PROXY_URL = {
	CS: PROXY_LIBRARY.CS1,
	SHW: PROXY_LIBRARY.ZHANGXU,
	ZYQ: PROXY_LIBRARY.CS1
}
console.log('proxy:', PROXY_TARGET)
console.log('PROXY_URL:', PROXY_URL[PROXY_TARGET])
function resolve (dir) {
	return path.join(__dirname, dir)
}
module.exports = {
	publicPath: '',

	outputDir: 'dist',

	assetsDir: './src/assets',

	lintOnSave: 'error',

	indexPath: './index.html',

	css: {
		extract: true,

		sourceMap: false,

		loaderOptions: {},

		modules: false,

		loaderOptions: {
			less: {
				modifyVars: {
					blue: '#538FFD',
					green: '#07c160',
					'button-primary-background-color': '@blue',
					'button-primary-border-color': '@blue',
					'button-info-background-color': '@green',
					'button-info-border-color': '@green'
				}
			},
			stylus: {
				import: '~$assets/stylus/handler.styl'
			}
		}
	},
	chainWebpack: (config)=>{
		config.resolve.alias
			.set('$assets', resolve('src/assets'))
			.set('images', resolve('src/assets/images'))
	},
	devServer: {
		host: '0.0.0.0',
		port: 8849,
		https: false,
		hotOnly: true,
		proxy: {
			'/mbapi': {
				target: PROXY_URL[PROXY_TARGET],
				changeOrigin: true,
				pathRewrite: { '^/mbapi': '/mbapi' }
			}
		},
		before: app => {},
		disableHostCheck: true
	}
}
