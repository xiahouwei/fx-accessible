import utils from '@/js/lib/utils'
const getLocalStorage = function (lname, defaultValue, validity = 0) {
	if (validity) {
		return getLocalStorageTimeStamp(lname, validity) || defaultValue
	} else {
		return window.localStorage[lname] || defaultValue
	}
}
const getLocalStorageNumber = function (lname, defaultValue) {
	return parseFloat(window.localStorage[lname]) || defaultValue
}
const getLocalStorageBoolean = function (lname, defaultValue) {
	if (window.localStorage[lname] === '' || window.localStorage[lname] === undefined) {
		return defaultValue
	} else {
		return window.localStorage[lname] === 'true'
	}
}
const getLocalStorageJson = function (lname, defaultValue) {
	return utils.JSONparse(window.localStorage[lname], 'object') || defaultValue
}
const setLocalStorage = function (key, val) {
	if (utils.toRawType(val) === 'Object' || utils.toRawType(val) === 'Array') {
		window.localStorage.setItem(key, JSON.stringify(val))
	} else {
		window.localStorage.setItem(key, val)
	}
}
const setLocalStorageTimeStamp = function (key, val) {
	const time = new Date().getTime()
	if (utils.toRawType(val) === 'Object' || utils.toRawType(val) === 'Array') {
		val = JSON.stringify(val)
	}
	const _val = `fxVal=${val}&fxTimeStamp=${time}`
	window.localStorage.setItem(key, _val)
}
// const getLocalStorageVal = function (lname, validity) {
// 	return validity ? getLocalStorageTimeStamp(lname, validity) : window.localStorage[lname]
// }
const getLocalStorageTimeStamp = function (key, validity = 0) {
	const currentTime = new Date().getTime()
	const valObj = parseTimeStampValue(window.localStorage[key])
	const time = valObj.fxTimeStamp || 0
	const interval = utils.ms2d(currentTime - time)
	const _val = valObj.fxVal || ''
	if (!validity || validity > interval) {
		return _val
	} else {
		return ''
	}
}
const parseTimeStampValue = function (val) {
	if (!val || !/^fxVal=/.test(val)) {
		return {}
	}
	try {
		const [valPair, timeStampPair] = val.split('&')
		const fxVal = valPair.split('=')[1]
		const fxTimeStamp = timeStampPair.split('=')[1]
		return {
			fxVal,
			fxTimeStamp
		}
	} catch (error) {
		console.log(error)
		return {}
	}
}
export {
	getLocalStorage,
	getLocalStorageNumber,
	getLocalStorageBoolean,
	getLocalStorageJson,
	setLocalStorage,
	setLocalStorageTimeStamp,
	getLocalStorageTimeStamp
}
