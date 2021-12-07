// cordova-plugin-inappbrowser
// 通过手机默认浏览器打开
export const openInBrowser = function (url, target, options) {
	try {
		window.cordova.InAppBrowser.open(url, target, options)
	} catch (error) {
		window.open(url)
	}
}

