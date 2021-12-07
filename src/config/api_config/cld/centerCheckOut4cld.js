import Vue from 'vue'
import vuexState from '@/store/state'
import { get, post } from '@/js/api/src/dataSource'
let vueCore = Vue.prototype
export default {
	// 中心盘亏单
	centerCheckOut4cld: {
		// 获取主表数据
		getOrderListData () {
			return post({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/centerCheckOutBll4cld/users/${vuexState.loginer.loginerId}`
			})
		},
		// 获取单据详情
		getOrderDetails (orderId) {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/centerCheckOutBll4cld/${orderId}`
			})
		}
	}
}
