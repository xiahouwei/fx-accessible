// cordova-plugin-app-version
// 获取APP的包名
export const getPackageName = function () {
	return new Promise(resolve => {
		try {
			window.cordova.getAppVersion.getPackageName().then(packageName => {
				resolve(packageName)
			})
		} catch (error) {
			resolve('com.fengxing.intelEdi')
		}
	})
}
// 获取APP的发布版本号
export const getVersionNumber = function () {
	return new Promise(resolve => {
		try {
			window.cordova.getAppVersion.getVersionNumber().then(versionNumber => {
				resolve(versionNumber)
			})
		} catch (error) {
			resolve('1.0.0')
		}
	})
}
// 获取APP的名字
export const getAppName = function () {
	return new Promise(resolve => {
		try {
			window.cordova.getAppVersion.getAppName().then(appName => {
				resolve(appName)
			})
		} catch (error) {
			resolve('@移动供应链')
		}
	})
}
// app版本校验
export const checkVersion = function (newVersion) {
	return getVersionNumber().then(currentVersion => {
		let type = '0'
		const currVerArr = currentVersion.split('.')
		const newVerArr = newVersion.split('.')
		if (currVerArr.length !== 3 || newVerArr.length !== 3) {
			type = '1'
		} else {
			const flag = newVerArr.some((item, index) => {
				return ~~item > ~~currVerArr[index]
			})
			if (flag) {
				type = '1'
			}
		}
		return Promise.resolve(type)
	})
}
