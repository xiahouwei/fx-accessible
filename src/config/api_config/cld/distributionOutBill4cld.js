import Vue from 'vue'
import vuexState from '@/store/state'
import { get, post, put, del } from '@/js/api/src/dataSource'
let vueCore = Vue.prototype
export default {
	// 中心统配出库单
	distributionOutBill4cld: {
		// 获取主表数据
		getOrderListData () {
			return post({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/distributionOutBills/users/${vuexState.loginer.loginerId}`
			})
		},
		// 获取单据补充实时权限
		getBillOtherAuth (billId) {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/distributionOutBills/function/${billId}`
			})
		},
		// 获取门店列表数据
		getInShopListData () {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/shopsByRdc`
			})
		},
		// 获取配送中心列表数据
		getRdcListData () {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/rdcs`
			})
		},
		// 获取单据类型列表数据
		getBillTypeListData () {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/businessTypes`
			})
		},
		// 生成单据
		createOrder () {
			return post({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/distributionOutBills`
			})
		},
		// 批量审核单据
		checkMulity () {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/distributionOutBills/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'batchCheck'
				}
			})
		},
		// 批量审核单据-重置/不重置审核日期
		checkMulityByBusinessDate (resetDate) {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/distributionOutBills/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'batchCheck',
					resetDate
				}
			})
		},
		// 获取品项分类
		getItemClass (inShopId) {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/${inShopId}/users/${vuexState.loginer.loginerId}/goodTypes`
			})
		},
		// 根据品项分类获取品项
		getItemByClass (inShopId) {
			return post({
				url: `${vueCore.$fxBaseApi.url}/accounts/${inShopId}/users/${vuexState.loginer.loginerId}/distributionOutDetails`
			})
		},
		// 获取单据详情
		getOrderDetails (orderId) {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/distributionOutBills/${orderId}`
			})
		},
		// 保存单据
		saveOrder (orderId) {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/distributionOutBills/${orderId}/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'modify'
				}
			})
		},
		// 审核单据
		checkOrder (orderId) {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/distributionOutBills/${orderId}/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'editAndCheck'
				}
			})
		},
		// 审核-重置/不重置审核日期
		checkOrderByBusinessDate (orderId, resetDate) {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/distributionOutBills/${orderId}/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'editAndCheck',
					resetDate
				}
			})
		},
		// 反审单据
		uncheckOrder (orderId) {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/distributionOutBills/${orderId}/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'unCheck'
				}
			})
		},
		// 复制单据
		copyOrder (orderId) {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/distributionOutBills/${orderId}`,
				query: {
					userId: vuexState.loginer.loginerId,
					m: 'copy'
				}
			})
		},
		// 删除单据
		deleteOrder (orderId) {
			return del({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/distributionOutBills/${orderId}/users/${vuexState.loginer.loginerId}`
			})
		},
		// 复审单据
		checkAgain (orderId) {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/distributionOutBills/${orderId}/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'reCheck'
				}
			})
		},
		// 取消复审单据
		unReCheck (orderId) {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/distributionOutBills/${orderId}/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'unReCheck'
				}
			})
		},
		// 提交单据
		submitOrder (orderId) {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/distributionOutBills/${orderId}/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'submitBill'
				}
			})
		},
		// 退回单据
		returnOrder (orderId) {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/distributionOutBills/${orderId}/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'returnBill'
				}
			})
		},
		// 扫码
		scanCode () {
			return post({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/distributionOutDetails/scancode`
			})
		},
		// 分拣
		sortingOrder (orderId) {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/distributionOutBills/${orderId}/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'updateSortingState'
				}
			})
		},
		// 批量分拣
		sortingMulity () {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/distributionOutBills/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'batchUpdateSortingState'
				}
			})
		}
	}
}
