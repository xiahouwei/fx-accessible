// cordova-plugin-jpush
import app from '@/main.js'
import router from '@/router'
import utils from '@/js/lib/utils'
const platfromObj = utils.platformIs()
let badgeNumb = 0
let jpush = {}
export const JPushInstance = function () {
	document.addEventListener('deviceready', onDeviceReady, false)
	document.addEventListener('jpush.openNotification', onOpenNotification, false)
	document.addEventListener('jpush.receiveNotification', onReceiveNotification, false)
	document.addEventListener('jpush.receiveMessage', onReceiveMessage, false)
}
// jpush init
const onDeviceReady = function () {
	try {
		// window.JPush.setDebugMode(true)
		window.JPush.init()
		window.setTimeout(getRegistrationID, 1000)
	} catch (error) {
		console.warn('浏览器环境下无法使用jpush.init功能')
	}
}
const getRegistrationID = function () {
	return new Promise(onRegistrationID)
}
const onRegistrationID = function (resolve, reject) {
	try {
		window.JPush.getRegistrationID(res => {
			if (res) {
				jpush.registrationID = res
				resolve(res)
			} else {
				window.setTimeout(() => {
					onRegistrationID(resolve)
				}, 1000)
			}
		})
	} catch (error) {
		reject()
	}
}
// 打开消息
const onOpenNotification = function (data) {
	try {
		// badgeNumb = badgeNumb - 1
		// badgeNumb = badgeNumb <= 0 ? 0 : badgeNumb
		// window.JPush.setBadgeNumber(badgeNumb)
		const billType = data.extras.billType
		const billId = data.extras.billId
		if (billType === 'stockInBill') {
			router.push({
				path: '/stockInBillDetails',
				query: {
					orderId: billId
				}
			})
		} else {
			if (app.vue.$route.path !== '/main/home' && app.vue.$route.path !== '/login') {
				router.push('/main/home')
			} else if (app.vue.$route.path === '/main/home') {
				app.vue.$fxEventBus.$emit('refreshTodoTypes')
			}
		}
	} catch (error) {
		console.warn('浏览器环境下无法使用jpush.openNotification功能')
	}
}
// 接收消息
const onReceiveNotification = function () {
	try {
		jpushSetBadge(++badgeNumb)
	} catch (error) {
		console.warn('浏览器环境下无法使用jpush.receiveNotification功能')
	}
}
// 接收自定义消息
const onReceiveMessage = function () {
	try {
		jpushSetBadge(++badgeNumb)
	} catch (error) {
		console.warn('浏览器环境下无法使用jpush.receiveMessage功能')
	}
}
// 设置角标
export const jpushSetBadge = function (numb) {
	badgeNumb = numb
	try {
		if (platfromObj.Android) {
			window.JPush.setBadgeNumber(numb)
		} else {
			window.JPush.setApplicationIconBadgeNumber(numb)
		}
	} catch (error) {
		console.warn('浏览器环境下无法使用jpush.setBadge功能')
	}
}
// 清空角标
export const jpushClearBadge = function () {
	jpushSetBadge(0)
}
// 设置tag
export const jpushSetTag = function (tags) {
	return new Promise((resolve, reject) => {
		try {
			window.JPush.setTags({ sequence: 4, tags }, (result) => {
				resolve(result.tags)
			}, (error) => {
				reject(error)
			})
		} catch (error) {
			console.warn('浏览器环境下无法使用jpush.setTag功能')
			reject(error)
		}
	})
}
// 清除tag
export const jpushCleanTag = function () {
	return new Promise((resolve, reject) => {
		try {
			window.JPush.cleanTags({ sequence: 3 }, (result) => {
				resolve(result)
			}, (error) => {
				reject(error)
			})
		} catch (error) {
			console.warn('浏览器环境下无法使用jpush.cleanTag功能')
			reject(error)
		}
	})
}
// 设置alias
export const jpushSetAlias = function (alias) {
	return new Promise((resolve, reject) => {
		try {
			window.JPush.setAlias({ sequence: 1, alias }, (result) => {
				resolve(result.alias)
			}, (error) => {
				reject(error)
			})
		} catch (error) {
			console.warn('浏览器环境下无法使用jpush.setAlias功能')
			reject(error)
		}
	})
}
// 清除alias
export const jpushCleanAlias = function () {
	return new Promise((resolve, reject) => {
		try {
			window.JPush.deleteAlias({ sequence: 2 }, (result) => {
				resolve(result)
			}, (error) => {
				reject(error)
			})
		} catch (error) {
			console.warn('浏览器环境下无法使用jpush.cleanAlias功能')
			reject(error)
		}
	})
}

export const fireOpenNotification = function (options) {
	let notificatioEvent = new CustomEvent('jpush.openNotification', {
		bubbles: true,
		cancelable: true,
		composed: true
	})
	notificatioEvent.extras = options
	document.dispatchEvent(notificatioEvent)
}
