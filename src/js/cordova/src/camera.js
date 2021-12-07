// cordova-plugin-camera
import app from '@/main.js'
// 通过相机 获取图片
const getPictureByCamera = function () {
	return new Promise((resolve, reject) => {
		try {
			const cameraOptions = {
				destinationType: navigator.camera.DestinationType.DATA_URL,
				quality: 30,
				correctOrientation: true
			}
			navigator.camera.getPicture(result => {
				resolve(result)
			}, (err) => {
				if (err === 'No Image Selected') {
					return false
				} else {
					app.vue.$fxToast.fail('获取图片失败')
				}
			}, cameraOptions)
		} catch (error) {
			console.warn('浏览器环境下无法使用camera.getPictureByCamera功能')
			app.vue.$fxToast.fail('获取图片失败')
		}
	})
}
// 通过相册 获取图片
const getPictureByLibrary = function () {
	return new Promise((resolve, reject) => {
		try {
			const cameraOptions = {
				destinationType: navigator.camera.DestinationType.DATA_URL,
				sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY,
				mediaType: 0,
				quality: 30,
				targetWidth: 800,
				targetHeight: 800
			}
			navigator.camera.getPicture(result => {
				resolve(result)
			}, (err) => {
				if (err === 'No Image Selected') {
					return false
				} else {
					app.vue.$fxToast.fail('获取图片失败')
				}
			}, cameraOptions)
		} catch (error) {
			console.warn('浏览器环境下无法使用camera.getPictureByLibrary功能')
			app.vue.$fxToast.fail('获取图片失败')
		}
	})
}
export default {
	getPictureByCamera,
	getPictureByLibrary
}
