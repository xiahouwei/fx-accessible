import Vue from 'vue'
import axios from 'axios'
import config from '@/js/service/config'
import filesConfig from '@/js/service/filesConfig'
import router from '@/router/index'
import { Toast, Dialog } from 'vant'
import vuexState from '@/store/state'
import fxCordova from '@/js/cordova'
import { getAppTypeUrlPath } from './baseUrl'
import { HTTPS_URL } from '@/config/https_config'
let vueCore = Vue.prototype
let service = axios.create(config)
let filesService = axios.create(filesConfig)
let loadingInstance = null
let loadingQueue = 0
const loadingOption = {
	duration: 0,
	mask: true,
	message: '加载中...'
}
const loadingShow = (loadingFlag) => {
	loadingQueue++
	if (!loadingFlag) {
		return false
	}
	loadingInstance = Toast.loading(loadingOption)
	loadingInstance.fxIsLoading = true
}
const loadingHide = () => {
	loadingQueue--
	if (loadingQueue === 0 && loadingInstance) {
		loadingInstance.clear()
		loadingInstance.fxIsLoading = false
	}
}
const getNetAddress = function () {
	const url = getAppTypeUrlPath()
	const http = HTTPS_URL.find(item => {
		return url.includes(item.url)
	}) ? 'https' : 'http'
	return `${http}://${url}`
}
const requestInterceptors = [
	config => {
		if (process.env.NODE_ENV === 'production') {
			config.url = `${getNetAddress()}${config.url}`
		}
		return config
	},
	error => {
		return Promise.reject(error)
	}
]
const responseInterceptors = [
	res => {
		loadingHide()
		if (res.data.result) {
			return res.data || {}
		} else {
			const data = res.data.data || {}
			data.message = data.message || res.data.message
			return Promise.reject(data)
		}
	},
	error => {
		loadingHide()
		let serviceError = {
			code: 5000,
			message: '请求失败！'
		}
		if (error.response && error.response.data) {
			if (typeof error.response.data !== 'object' || error.response.data.status === 500) {
				return Promise.reject(serviceError)
			}
			return Promise.reject(error.response.data.data)
		} else {
			return Promise.reject(serviceError)
		}
	}
]
service.interceptors.request.use(...requestInterceptors)
service.interceptors.response.use(...responseInterceptors)
filesService.interceptors.request.use(...requestInterceptors)
filesService.interceptors.response.use(...responseInterceptors)
const errorToast = (error) => {
	return new Promise(resolve => {
		if (error.errorCode === '403') {
			fxCordova.jpushCleanAlias()
			Dialog.alert({
				title: '提示',
				message: '您的账号已在其他设备上登陆'
			}).then(() => {
				router.replace({
					path: '/login'
				})
			})
		} else if (error.errorCode === '402') {
			fxCordova.jpushCleanAlias()
			Dialog.alert({
				title: '提示',
				message: '登录超时，请重新登录！'
			}).then(() => {
				router.replace({
					path: '/login'
				})
			})
		} else if (error.errorCode === '405') {
			vueCore.$fxToast.fail('单据正在被处理，请稍后操作...').then(() => {
				resolve()
			})
		} else if (error.errorCode === 'isToContinue') {
			vueCore.$dialog.confirm({
				title: '提示',
				message: error.message
			}).then(resolve)
		} else {
			Dialog.alert({
				title: '提示',
				message: error.message
			}).then(() => {
				resolve()
			})
		}
	})
}
const requestCommon = (type, timeout = 60000) => {
	return ({ url, data, query = {}, fullUrl, loading = true, autoErrorMsg = true, responseComplete = false }) => {
		loadingShow(loading)
		return new Promise((resolve, reject) => {
			let loginFlag = vuexState.loginer.loginFlag
			service({
				method: type,
				url: url,
				data: data,
				params: loginFlag ? Object.assign(query, {
					loginFlag: loginFlag
				}) : query,
				responseType: 'json',
				timeout
			}).then(res => {
				if (responseComplete) {
					resolve(res || {})
				} else {
					resolve(res.data || {})
				}
			}).catch((error) => {
				if (autoErrorMsg) {
					errorToast(error).then(() => {
						reject(error)
					})
				} else {
					reject(error)
				}
			})
		})
	}
}
const requestGet = ({ url, data = {}, loading = true, autoErrorMsg = true, responseComplete = false }) => {
	loadingShow(loading)
	return new Promise((resolve, reject) => {
		let loginFlag = vuexState.loginer.loginFlag
		service({
			method: 'get',
			url: url,
			params: loginFlag ? Object.assign(data, {
				loginFlag: loginFlag
			}) : data,
			responseType: 'json'
		}).then(res => {
			if (responseComplete) {
				resolve(res || {})
			} else {
				resolve(res.data || {})
			}
		}).catch((error) => {
			if (autoErrorMsg) {
				errorToast(error).then(() => {
					reject(error)
				})
			} else {
				reject(error)
			}
		})
	})
}
const requestFilePost = ({ url, data, query = {}, fullUrl, loading = true, autoErrorMsg = true }) => {
	loadingShow(loading)
	const params = new FormData()
	data.forEach(item => {
		params.append(item.name, item.value)
	})
	return new Promise((resolve, reject) => {
		let loginFlag = vuexState.loginer.loginFlag
		filesService({
			method: 'post',
			url: url,
			data: params,
			params: loginFlag ? Object.assign(query, {
				loginFlag: loginFlag
			}) : query,
			responseType: 'json'
		}).then(res => {
			resolve(res)
		}).catch((error) => {
			if (autoErrorMsg) {
				errorToast(error).then(() => {
					reject(error)
				})
			} else {
				reject(error)
			}
		})
	})
}

const fileTransfer = function ({ url, fileFullPath, params = {} }) {
	const postUrl = `${getAppTypeUrlPath()}${url}?loginFlag=${vuexState.loginer.loginFlag}`
	return fxCordova.fileTransfer({
		fileFullPath,
		postUrl,
		params
	})
}
export default {
	requestPost: requestCommon('post'),
	requestPut: requestCommon('put'),
	requestDel: requestCommon('delete'),
	requestGet,
	requestFilePost,
	fileTransfer,
	requestReport: requestCommon('post', 1800000)
}
