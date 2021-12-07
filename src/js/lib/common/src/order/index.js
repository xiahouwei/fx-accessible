import Vue from 'vue'
import orderListFrontConfig from './orderListFrontConfig'
import orderSuccessConfig from './orderSuccessConfig'
export default {
	orderFrontFunc (type, params) {
		if (!orderListFrontConfig[type]) {
			console.warn('没有找到指定类型的订单列表前置函数, 请检查type值是否传输正确')
			return false
		}
		return orderListFrontConfig[type](params)
	},
	orderSuccess (type) {
		return (res) => {
			if (!orderSuccessConfig[type]) {
				console.warn('没有找到指定类型的订单列表成功回调函数, 请检查type值是否传输正确')
				return false
			}
			return orderSuccessConfig[type](res)
		}
	},
	orderListIsSelectAll (getList) {
		let unCheckBill = getList()
		if (unCheckBill.length === 0) return false
		let unCheckBillSelect = unCheckBill.filter(item => {
			return !!item.checked
		})
		return unCheckBillSelect.length === unCheckBill.length
	},
	orderListOnSelectAll (list, func, val) {
		list.forEach(item => {
			if (func(item)) {
				Vue.prototype.$set(item, 'checked', val)
			}
		})
	}
}
