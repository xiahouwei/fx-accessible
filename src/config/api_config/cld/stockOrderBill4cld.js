import Vue from 'vue'
import vuexState from '@/store/state'
import { get, post, put, del } from '@/js/api/src/dataSource'
let vueCore = Vue.prototype
export default {
	// 中心采购订货单
	stockOrderBill4cld: {
		// 获取主表数据
		getOrderListData () {
			return post({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/stockOrderBill/users/${vuexState.loginer.loginerId}`
			})
		},
		// 获取单据补充实时权限
		getBillOtherAuth (billId) {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/stockOrderBill/function/${billId}`
			})
		},
		// 生成单据
		createOrder () {
			return post({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/stockOrderBill`
			})
		},
		// 批量审核单据
		checkMulity () {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/stockOrderBill/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'batchCheck'
				}
			})
		},
		// 获取单据详情
		getOrderDetails (orderId) {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/stockOrderBill/${orderId}`
			})
		},
		// 根据品项分类获取品项
		getItemByClass (inShopId) {
			return post({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/stockOrderBill/users/${vuexState.loginer.loginerId}/centerPurchaseDetails`
			})
		},
		// 保存单据
		saveOrder (orderId) {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/stockOrderBill/${orderId}/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'modify'
				}
			})
		},
		// 提交单据
		submitOrder (orderId) {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/stockOrderBill/${orderId}/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'submitBill'
				}
			})
		},
		// 退回单据
		returnOrder (orderId) {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/stockOrderBill/${orderId}/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'returnBill'
				}
			})
		},
		// 审核单据
		checkOrder (orderId) {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/stockOrderBill/${orderId}/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'examineBill'
				}
			})
		},
		// 反审单据
		uncheckOrder (orderId) {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/stockOrderBill/${orderId}/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'examineBackBill'
				}
			})
		},
		// 复制单据
		copyOrder (orderId) {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/stockOrderBill/${orderId}/users/${vuexState.loginer.loginerId}`,
				query: {
					userId: vuexState.loginer.loginerId,
					m: 'copyBill'
				}
			})
		},
		// 发送到EDI
		sendEdi (orderId) {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/stockOrderBill/${orderId}/users/${vuexState.loginer.loginerId}`,
				query: {
					userId: vuexState.loginer.loginerId,
					m: 'sendBill'
				}
			})
		},
		// 删除单据
		deleteOrder (orderId) {
			return del({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/stockOrderBill/${orderId}/users/${vuexState.loginer.loginerId}`
			})
		},
		// 获取业务人列表数据
		getAccountListData () {
			return post({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/stockOrderBill/users/${vuexState.loginer.loginerId}/centerPurchaseUsers`
			})
		}
	}
}
