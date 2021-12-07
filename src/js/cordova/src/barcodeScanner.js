// cordova.plugins.barcodeScanner
import app from '@/main.js'
const params = {
	// 是否默认使用前置摄像头（同时支持 iOS 和 Android）
	preferFrontCamera: false,
	// 是否显示前后摄像头切换按钮（同时支持 iOS 和 Android）
	showFlipCameraButton: true,
	// 是否显示打开关闭闪光灯按钮（同时支持 iOS 和 Android）
	showTorchButton: false,
	// 是否默认打开闪关灯（仅支持 Android）
	torchOn: true,
	// 是否记录扫码历史（仅支持 Android）
	saveHistory: true,
	// 扫码界面下方提示语（仅支持 Android）
	prompt: '',
	// 扫码文本在扫码界面上显示多少毫秒。0完全禁用。默认1500（仅Android）
	resultDisplayDuration: 500,
	// 支持的格式,默认为除PDF_417和RSS_EXPANDED之外的所有格式
	// formats: 'QR_CODE,PDF_417',
	// 设置为横向或纵向(portrait|landscape),默认跟随手机旋转（仅Android）
	orientation: 'portrait',
	// 禁用动画（仅支持 iOS）
	disableAnimations: true,
	// 禁用成功蜂鸣声（同时支持 iOS 和 Android）
	disableSuccessBeep: false
}

export const barcodeScan = function () {
	return new Promise(resolve => {
		try {
			window.cordova.plugins.barcodeScanner.scan(result => {
				if (result && result.text) {
					resolve(result.text)
				} else {
					app.vue.$fxToast.fail('未扫描到任何数据')
				}
			}, error => {
				console.log(error)
				app.vue.$fxToast.fail('二维码扫码失败')
			}, params)
		} catch (error) {
			console.warn('浏览器环境下无法使用barcodeScan功能')
			app.vue.$fxToast.fail('无法使用扫码功能')
		}
	})
}
