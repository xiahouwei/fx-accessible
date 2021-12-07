// cordova-plugin-file-transfer
// 文件传输
import utils from '@/js/lib/utils'

export const fileTransfer = function ({
	fileFullPath,
	postUrl,
	params
}) {
	return new Promise((resolve, reject) => {
		const success = function (res) {
			try {
				let response = utils.JSONparse(res.response)
				if (response.result) {
					resolve(response.data)
				} else {
					reject(response.data)
				}
			} catch (error) {
				const errorObj = {
					message: '网络异常'
				}
				reject(errorObj)
			}
		}
		const fail = function () {
			const errorObj = {
				message: '网络异常'
			}
			reject(errorObj)
		}
		var options = new window.FileUploadOptions()
		options.fileKey = 'file'
		options.fileName = fileFullPath.substr(fileFullPath.lastIndexOf('/') + 1)
		options.mimeType = 'multipart/form-data'
		options.params = params
		var ft = new window.FileTransfer()
		ft.upload(fileFullPath, encodeURI(postUrl), success, fail, options)
	})
}
