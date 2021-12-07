import { Toast } from 'vant'
const duration = 1500
const toast = function (arg) {
	return new Promise(resolve => {
		let close = false
		if (typeof arg === 'string') {
			Toast({
				message: arg,
				duration
			})
			setTimeout(() => {
				if (close) {
					return false
				}
				close = true
				resolve()
			}, duration)
		} else if (Object.prototype.toString.call(arg) === '[object Object]') {
			Toast(Object.assign({
				duration
			}, arg))
			if (arg.duration !== 0) {
				setTimeout(() => {
					if (close) {
						return false
					}
					close = true
					resolve()
				}, arg.duration || duration)
			}
		}
	})
}
toast.success = function (msg) {
	return new Promise(resolve => {
		let params = {
			type: 'success',
			message: '',
			duration: 1000,
			mask: true,
			forbidClick: true
		}
		if (typeof msg === 'string') {
			params.message = msg
		} else if (Object.prototype.toString.call(msg) === '[object Object]') {
			params = Object.assign(params, msg)
			params.type = 'success'
		}
		toast(params).then(() => {
			resolve()
		})
	})
}
toast.fail = function (msg) {
	return new Promise(resolve => {
		let params = {
			type: 'fail',
			message: '',
			mask: true,
			forbidClick: true
		}
		if (typeof msg === 'string') {
			params.message = msg
		} else if (Object.prototype.toString.call(msg) === '[object Object]') {
			params = Object.assign(params, msg)
			params.type = 'fail'
		}
		toast(params).then(() => {
			resolve()
		})
	})
}
toast.top = function (msg) {
	return new Promise(resolve => {
		let params = {
			message: '',
			position: 'top'
		}
		if (typeof msg === 'string') {
			params.message = msg
		} else if (Object.prototype.toString.call(msg) === '[object Object]') {
			params = Object.assign(params, msg)
		}
		toast(params).then(() => {
			resolve()
		})
	})
}
toast.bottom = function (msg) {
	return new Promise(resolve => {
		let params = {
			message: '',
			position: 'bottom'
		}
		if (typeof msg === 'string') {
			params.message = msg
		} else if (Object.prototype.toString.call(msg) === '[object Object]') {
			params = Object.assign(params, msg)
		}
		toast(params).then(() => {
			resolve()
		})
	})
}

export default toast
