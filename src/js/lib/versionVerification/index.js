import app from '@/main.js'
import utils from '@/js/lib/utils'
import vuexState from '@/store/state'
const platfromObj = utils.platformIs()
const getNewVersionData = function () {
	return app.vue.$fxApi('common.getVersionUpdate').then(res => {
		const { zzbAndroidUrl, zzbIOSUrl, zzbVersion } = res.systemParams[0]
		return Promise.resolve({
			androidUrl: zzbAndroidUrl,
			iosUrl: zzbIOSUrl,
			version: zzbVersion
		})
	})
}
const versionSync = function (versionData) {
	return new Promise(resolve => {
		app.vue.$fxCordova.checkVersion(versionData.version).then(res => {
			app.vue.$store.commit({
				type: 'SETSTATE',
				hasNewVersion: res !== '0'
			})
			resolve([res, versionData])
		})
	})
}
const versionUpdate = function ([updateType, versionData]) {
	return new Promise(resolve => {
		if (vuexState.ignoreVersionUpdate) {
			return false
		}
		if (updateType === '0') {
			resolve()
		} else {
			app.vue.$dialog.confirm({ message: '发现新版本,是否下载?' }).then(() => {
				const downloadUrl = platfromObj.iPhone ? versionData.iosUrl : versionData.androidUrl
				app.vue.$fxCordova.openInBrowser(downloadUrl, '_system')
			}).catch(() => {
				app.vue.$store.commit({
					type: 'SETSTATE',
					ignoreVersionUpdate: true
				})
			})
		}
	})
}
export default function () {
	return utils.appTypeCheck(['z5'])
		.then(getNewVersionData)
		.then(versionSync)
		.then(versionUpdate)
}
