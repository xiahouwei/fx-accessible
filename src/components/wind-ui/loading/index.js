import { Toast } from 'vant'
let loadingInstance = null
let loadingOption = {
	duration: 0,
	mask: true,
	message: '加载中...'
}
const loading = function (arg) {
	if (typeof arg === 'string') {
		loadingOption.message = arg
	} else if (Object.prototype.toString.call(arg) === '[object Object]') {
		Toast(Object.assign(loadingOption, arg))
		loadingOption.mask = true
		loadingOption.duration = 0
	}
	loadingInstance = Toast.loading(loadingOption)
}
loading.close = function () {
	loadingInstance.clear()
}

export default loading
