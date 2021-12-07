// cordova-plugin-sunmiprint 商米v2pro打印机
import app from '@/main.js'
import sunmiprintTemplate from '@/config/sunmiprint_template_config.js'

/*
 * 按照风行模板打印
 */
export const sunmiprint = function (type, params) {
	return new Promise(resolve => {
		const _template = sunmiprintTemplate[type](params)
		try {
			window.cordova.plugins.sunmiprint.printFxTemplate(_template, function () {
				resolve()
			}, function () {
				app.vue.$fxToast.fail('打印失败!')
			})
		} catch (error) {
			console.warn('浏览器环境下无法使用sunmiprint功能')
			app.vue.$fxToast.fail('当前设备不支持打印')
		}
	})
}
