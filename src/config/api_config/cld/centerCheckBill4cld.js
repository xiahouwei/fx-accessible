import Vue from 'vue'
import vuexState from '@/store/state'
import { get, post, put, del } from '@/js/api/src/dataSource'
let vueCore = Vue.prototype
export default {
	// 中心盘点单
	centerCheckBill4cld: {
		// 获取中心盘点系统参数
		getSystemParams () {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/centerCheckBill4cld/sysparams`
			})
		},
		// 获取主表数据
		getOrderListData () {
			return post({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/centerCheckBill4cld/users/${vuexState.loginer.loginerId}`
			})
		},
		// 获取盘点分类list
		getCheckTypeList () {
			return post({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/centerCheckBill4cld/checkType`
			})
		},
		// 生成单据
		createOrder () {
			return post({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/centerCheckBill4cld`
			})
		},
		// 批量审核单据
		checkMulity () {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/centerCheckBill4cld/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'batchCheck'
				},
				responseComplete: true
			})
		},
		// 获取品项分类
		getItemClass () {
			return post({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerId}/centerCheckBill4cld/checkplan/itemstypes`
			})
		},
		// 查询追加品项的类别
		getSuperadditionItemClass () {
			return post({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerId}/centerCheckBill4cld/additional/itemstypes`
			})
		},
		// 根据品项分类获取品项
		getItemByClass () {
			return post({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/centerCheckBill4cld/checkplan/items`
			})
		},
		// 查询追加品项列表
		getSuperadditionItemByClass () {
			return post({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/centerCheckBill4cld/additional/items`
			})
		},
		// 获取单据详情
		getOrderDetails (orderId) {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/centerCheckBill4cld/${orderId}`
			})
		},
		// 保存单据
		saveOrder () {
			return post({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/centerCheckBill4cld`
			})
		},
		// 保存单据
		saveOrderSilence () {
			return post({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/centerCheckBill4cld`,
				loading: false
			})
		},
		// 提交单据
		submitOrder (orderId) {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/centerCheckBill4cld/${orderId}/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'submitBill'
				}
			})
		},
		// 退回单据
		returnOrder (orderId) {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/centerCheckBill4cld/${orderId}/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'returnBill'
				}
			})
		},
		// 审核单据
		checkOrder (orderId) {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/centerCheckBill4cld/${orderId}/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'examineBill'
				}
			})
		},
		// 反审单据
		uncheckOrder (orderId) {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/centerCheckBill4cld/${orderId}/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'examineBackBill'
				}
			})
		},
		// 复审单据
		checkAgain (orderId) {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/centerCheckBill4cld/${orderId}/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'reCheckBill'
				}
			})
		},
		// 取消复审单据
		unReCheck (orderId) {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/centerCheckBill4cld/${orderId}/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'unReCheckBill'
				}
			})
		},
		// 删除单据
		deleteOrder (orderId) {
			return del({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/centerCheckBill4cld/${orderId}/users/${vuexState.loginer.loginerId}`
			})
		},
		// 导入必盘
		importMustItem (orderId) {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/centerCheckBill4cld/${orderId}/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'mustCheck'
				}
			})
		},
		// 导入盘点品项
		importCheckItem (orderId) {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/centerCheckBill4cld/${orderId}/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'importCheck'
				}
			})
		},
		// 实盘数量置为账存数量
		checkAccount (orderId) {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/centerCheckBill4cld/${orderId}/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'changeFactNum',
					flag: '1'
				}
			})
		},
		// 实盘数量置为账存数量
		checkZero (orderId) {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/centerCheckBill4cld/${orderId}/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'changeFactNum',
					flag: '0'
				}
			})
		},
		// 单据审核前校验
		checkValidate (orderId) {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/centerCheckBill4cld/${orderId}/users/${vuexState.loginer.loginerId}`,
				data: {
					m: 'validate4Check'
				},
				autoErrorMsg: false
			})
		},
		// 添加品项时获取品项详情
		getItemDetaiData () {
			return post({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/centerCheckBill4cld/checkplan/items/details`
			})
		},
		// 新增品项前判断导入必盘品项
		canAddItem (orderId) {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/centerCheckBill4cld/${orderId}/users/${vuexState.loginer.loginerId}`,
				data: {
					m: 'validate4Add'
				}
			})
		}
	}
}
