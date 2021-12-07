import vuexState from '@/store/state'
import utils from '@/js/lib/utils'
export const BASE_URL = {
	url: process.env.VUE_APP_mock === 'true' ? 'http://rap2api.taobao.org/app/mock/148614' : '/mbapi'
}

export const getAppTypeUrlPath = function (type) {
	if (!type) {
		type = utils.getAppType()
	}
	switch (type) {
	case 'cld':
		return `${vuexState.netAddressX}/cldpoint`
	case 'z5':
		return vuexState.netAddressX
	default:
		console.warn('无法识别当前应用类型')
		return false
	}
}
