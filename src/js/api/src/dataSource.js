import service from '@/js/service'
import fxUitls from '@/js/lib/utils'
let caches = {}
export const cache = function (res, timeout = 0) {
	res.cache = true
	res.timeout = 0
	return res
}
const initConfig = function ({ url, data = {}, query = {}, loading, autoErrorMsg, responseComplete }) {
	return {
		url: url,
		data,
		query,
		loading,
		autoErrorMsg,
		responseComplete,
		cache: false,
		timeout: 0
	}
}
export const post = function () {
	let configs = initConfig(...arguments)
	configs.type = 'requestPost'
	return configs
}
export const get = function () {
	let configs = initConfig(...arguments)
	configs.type = 'requestGet'
	return configs
}
export const put = function () {
	let configs = initConfig(...arguments)
	configs.type = 'requestPut'
	return configs
}
export const del = function () {
	let configs = initConfig(...arguments)
	configs.type = 'requestDel'
	return configs
}
const requestHandler = function ({ url, data, query, loading, autoErrorMsg, responseComplete, type }) {
	return new Promise((resolve, reject) => {
		const _service = service[type]
		_service({
			url,
			data,
			query,
			loading,
			autoErrorMsg,
			responseComplete
		}).then(res => {
			const cacheResult = {
				res: res,
				time: new Date().getTime()
			}
			const key = JSON.stringify({
				url,
				data
			})
			caches[key] = cacheResult
			resolve(res)
		}).catch((error) => {
			reject(error)
		})
	})
}
const extendParams = function (pre, cur) {
	if (!fxUitls.isDef(cur)) {
		return pre
	}
	if (fxUitls.toRawType(pre) === 'Object') {
		Object.assign(pre, cur)
		return pre
	}
	return cur
}
export const request = function (options, arg = {}) {
	const time = new Date().getTime()
	const key = JSON.stringify({
		url: options.url,
		data: options.data,
		query: options.query
	})
	const value = caches[key]
	const _options = Object.assign(options, {
		data: extendParams(options.data, arg.data),
		query: extendParams(options.query, arg.query)
	})
	if (fxUitls.isDef(arg.loading)) {
		_options.loading = arg.loading
	}
	if (fxUitls.isDef(arg.autoErrorMsg)) {
		_options.autoErrorMsg = arg.autoErrorMsg
	}
	if (fxUitls.isDef(arg.responseComplete)) {
		_options.responseComplete = arg.responseComplete
	}
	if (options.cache) {
		if (!value || (fxUitls.ms2m(time - value.time) > options.timeout && options.timeout !== 0)) {
			return requestHandler(_options)
		} else {
			return Promise.resolve(value.res)
		}
	} else {
		return requestHandler(_options)
	}
}
class DataSource {
	constructor (options = {}, arg = {}) {
		this.options = options
		this.arg = arg
	}
	then (func) {
		return request(this.options, this.arg).then(func)
	}
	catch (func) {
		return request(this.options, this.arg).catch(func)
	}
}
export const dataSource = function (options) {
	const func = function (arg) {
		return new DataSource(options, arg)
	}
	func.then = function (func) {
		return request(options).then(func)
	}
	func.catch = function (func) {
		return request(options).catch(func)
	}
	return func
}
