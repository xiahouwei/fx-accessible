// cordova-media-with-compression
// 录音

import { getFileFullPath } from '@/js/cordova/src/file'
var fxMedia = null
var recordResolve = null
var recordReject = null
const recordRes = function (res) {
	recordResolve(res)
}
const recordResFullPath = function (res) {
	getFileFullPath(res).then(fileFullPath => {
		recordResolve(fileFullPath)
	}).catch(() => {
		recordReject()
	})
}
const startRecord = function ({ fileName, getFullPath = true }) {
	try {
		let Media = window.Media
		fxMedia = new Media(fileName, () => {
			if (getFullPath) {
				recordResFullPath(fileName)
			} else {
				recordRes(fileName)
			}
		}, () => {
		})
		fxMedia.startRecord()
	} catch (error) {
		console.log('当前运行环境为浏览器')
	}
}

const stopRecord = function () {
	return new Promise((resolve, reject) => {
		recordResolve = resolve
		recordReject = reject
		fxMedia.stopRecord()
	})
}

export default {
	startRecord,
	stopRecord
}
