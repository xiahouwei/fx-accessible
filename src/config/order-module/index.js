import utils from '@/js/lib/utils'
import ORDER_MODULE_CLD from './order_module_config_cld'
import ORDER_MODULE_Z5 from './order_module_config_z5'

export const getOrderModule = function (type) {
	if (!type) {
		type = utils.getAppType()
	}
	switch (type) {
	case 'cld':
		return ORDER_MODULE_CLD
	case 'z5':
		return ORDER_MODULE_Z5
	default:
		console.warn('无法识别当前应用类型')
		return false
	}
}
const getOrder = function (orders) {
	return orders.find(item => {
		return !!item.defaultCreatePath
	})
}
export const getDefaultCreateOrder = function (type) {
	let order
	if (!type) {
		type = utils.getAppType()
	}
	switch (type) {
	case 'cld':
		order = getOrder(ORDER_MODULE_CLD)
		break
	case 'z5':
		order = getOrder(ORDER_MODULE_Z5)
		break
	default:
		console.warn('无法识别当前应用类型')
		return false
	}
	return {
		path: order.defaultCreatePath,
		auth: `${order.auth}.add`
	}
}
