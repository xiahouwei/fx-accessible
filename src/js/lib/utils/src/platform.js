import vuexState from '@/store/state'
// 判断平台 by shw
const platformIs = () => {
	let platformObj = {}
	let userAgent = navigator.userAgent
	if (/mobile/i.test(userAgent)) {
		platformObj.Mobile = true
	}
	if (/like Mac OS X/.test(userAgent)) {
		platformObj.iOS = /CPU( iPhone)? OS ([0-9\._]+) like Mac OS X/.exec(userAgent)[2].replace(/_/g, '.')
		platformObj.iPhone = /iPhone/.test(userAgent)
		platformObj.iPad = /iPad/.test(userAgent)
	}
	if (/Android/.test(userAgent)) {
		platformObj.Android = /Android ([0-9\.]+)[\);]/.exec(userAgent)[1]
	}
	if (/webOS\//.test(userAgent)) {
		platformObj.webOS = /webOS\/([0-9\.]+)[\);]/.exec(userAgent)[1]
	}
	if (/(Intel|PPC) Mac OS X/.test(userAgent)) {
		platformObj.Mac = /(Intel|PPC) Mac OS X ?([0-9\._]*)[\)\;]/.exec(userAgent)[2].replace(/_/g, '.') || true
	}
	if (/Windows NT/.test(userAgent)) {
		platformObj.Windows = /Windows NT ([0-9\._]+)[\);]/.exec(userAgent)[1]
	}
	if (/MicroMessenger/i.test(userAgent)) {
		platformObj.weixin = true
	}
	return platformObj
}

// 判断当前应用类型(z5, 云供应链)
const isCLDByUrl = function (url) {
	return /fxscm/.test(url) && !/z5/.test(url)
}
const getAppType = function (netAddressX = vuexState.netAddressX) {
	return isCLDByUrl(netAddressX) ? 'cld' : 'z5'
}
const appTypeIs = function (type) {
	return type === getAppType()
}
const appTypeIncludes = function (appType) {
	if (Array.isArray(appType)) {
		return appType.includes(getAppType())
	} else {
		return appTypeIs(appType)
	}
}
const appTypeCheck = function (appType) {
	const error = '程序运行版本不满足条件'
	return appTypeIncludes(appType) ? Promise.resolve() : Promise.reject(error)
}

export default {
	platformIs,
	getAppType,
	appTypeIs,
	appTypeCheck
}
