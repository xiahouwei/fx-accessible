// cordova-plugin-file
// 文件读取

import utils from '@/js/lib/utils'
const platfromObj = utils.platformIs()

const getFileByIphone = function (filePath) {
	return new Promise((resolve, reject) => {
		window.requestFileSystem(window.TEMPORARY, 0, (dirEntry) => {
			dirEntry.root.getFile(filePath, {}, function (fileEntry) {
				var fileURL = fileEntry.toURL()
				resolve(fileURL)
			})
		}, function (error) {
			reject(error)
		})
	})
}

const getFileByAndroid = function (filePath) {
	return new Promise((resolve, reject) => {
		window.resolveLocalFileSystemURL(window.cordova.file.externalRootDirectory, (dirEntry) => {
			dirEntry.getFile(filePath, {}, function (fileEntry) {
				var fileURL = fileEntry.toURL()
				resolve(fileURL)
			})
		}, function (error) {
			reject(error)
		})
	})
}

export const getFileFullPath = function (filePath) {
	return new Promise((resolve, reject) => {
		if (platfromObj.iPhone) {
			getFileByIphone(filePath).then(fileURL => {
				resolve(fileURL)
			}).catch(error => {
				reject(error)
			})
		} else {
			getFileByAndroid(filePath).then(fileURL => {
				resolve(fileURL)
			}).catch(error => {
				reject(error)
			})
		}
	})
}
