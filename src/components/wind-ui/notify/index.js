import { Notify } from 'vant'
const duration = 2000
const notify = (arg) => {
	return new Promise(resolve => {
		var close = false
		if (typeof arg === 'string') {
			Notify({
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
			Notify(Object.assign({
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
notify.success = (msg) => {
	return new Promise(resolve => {
		let params = {
			background: '#538FFD',
			message: ''
		}
		if (typeof msg === 'string') {
			params.message = msg
		} else if (Object.prototype.toString.call(msg) === '[object Object]') {
			params = Object.assign(params, msg)
		}
		notify(params).then(() => {
			resolve()
		})
	})
}
notify.fail = (msg) => {
	return new Promise(resolve => {
		let params = {
			background: '#FC4E49',
			message: ''
		}
		if (typeof msg === 'string') {
			params.message = msg
		} else if (Object.prototype.toString.call(msg) === '[object Object]') {
			params = Object.assign(params, msg)
		}
		notify(params).then(() => {
			resolve()
		})
	})
}
export default notify
