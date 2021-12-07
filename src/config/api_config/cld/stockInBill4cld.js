import Vue from 'vue'
import vuexState from '@/store/state'
import { get, post, put, del } from '@/js/api/src/dataSource'
let vueCore = Vue.prototype
export default {
	// 中心采购入库单
	stockInBill4cld: {
		// 获取主表数据
		getOrderListData () {
			return post({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/stockInBill/users/${vuexState.loginer.loginerId}`
			})
		},
		// 获取单据补充实时权限
		getBillOtherAuth (billId) {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/stockInBill/function/${billId}`
			})
		},
		// 生成单据
		createOrder () {
			return post({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/stockInBill`
			})
		},
		// 批量审核单据
		checkMulity () {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/stockInBill/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'batchCheck'
				}
			})
		},
		// 获取单据详情
		getOrderDetails (orderId) {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/stockInBill/${orderId}`
			})
		},
		// 根据品项分类获取品项
		getItemByClass (sendOrganId) {
			return post({
				url: `${vueCore.$fxBaseApi.url}/accounts/${sendOrganId}/stockInBill/users/${vuexState.loginer.loginerId}/centerInDetails`
			})
		},
		// 保存单据
		saveOrder (orderId) {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/stockInBill/${orderId}/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'modify'
				}
			})
		},
		// 提交单据
		submitOrder (orderId) {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/stockInBill/${orderId}/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'submitBill'
				}
			})
		},
		// 退回单据
		returnOrder (orderId) {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/stockInBill/${orderId}/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'returnBill'
				}
			})
		},
		// 审核单据
		checkOrder (orderId) {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/stockInBill/${orderId}/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'examineBill'
				}
			})
		},
		// 审核-重置/不重置审核日期
		checkOrderByBusinessDate (orderId, resetFlag) {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/stockInBill/${orderId}/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'examineBill',
					resetFlag
				}
			})
		},
		// 反审单据
		uncheckOrder (orderId) {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/stockInBill/${orderId}/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'examineBackBill'
				}
			})
		},
		// 复制单据
		copyOrder (orderId) {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/stockInBill/${orderId}/users/${vuexState.loginer.loginerId}`,
				query: {
					userId: vuexState.loginer.loginerId,
					m: 'copyBill'
				}
			})
		},
		// 删除单据
		deleteOrder (orderId) {
			return del({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/stockInBill/${orderId}/users/${vuexState.loginer.loginerId}`
			})
		},
		// 复审单据
		checkAgain (orderId) {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/stockInBill/${orderId}/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'reCheck'
				}
			})
		},
		// 取消复审单据
		unReCheck (orderId) {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/stockInBill/${orderId}/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'unReCheck'
				}
			})
		},
		// 获取业务人列表数据
		getAccountListData () {
			return post({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/stockInBill/users/${vuexState.loginer.loginerId}/centerInUsers`
			})
		}
	}
}
