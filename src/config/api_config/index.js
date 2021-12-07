import Vue from 'vue'
import vuexState from '@/store/state'
import { get, post, put } from '@/js/api/src/dataSource'
import CLD_API from './cld/index'
let vueCore = Vue.prototype
export default {
	common: {
		// 登录
		login () {
			return post({
				url: `${vueCore.$fxBaseApi.url}/login/`
			})
		},
		// 静默登录
		silentLogin () {
			return post({
				url: `${vueCore.$fxBaseApi.url}/login/`,
				data: {
					username: vuexState.urserNameX,
					password: vuexState.loginer.loginerPassword,
					uuid: vuexState.loginer.loginerUuid
				},
				autoErrorMsg: false
			})
		},
		// 退出登录
		logout () {
			return post({
				url: `${vueCore.$fxBaseApi.url}/logout/`
			})
		},
		changePassword () {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'changePwd'
				}
			})
		},
		// 版本升级
		getVersionUpdate () {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/systemParams/version`
			})
		},
		// 获取品项单位
		getItemUnit (goodsId) {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/shopId/users/userId/goods/${goodsId}/units`,
				query: {
					userId: vuexState.loginer.loginerId
				}
			})
		},
		// 获取业务类型列表数据
		getBusinessTypeListData () {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/businessTypes`
			})
		},
		// 获取配送中心列表数据
		getRdcListData () {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/rdcs`
			})
		},
		// 获取单据来源列表数据
		getSourceListData () {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/sources`
			})
		},
		// 获取客户列表数据
		getCustomerListData () {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/customer`
			})
		},
		// 获取收货客户列表数据
		getSubCustomerListData () {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/subcustomer`
			})
		},
		// 获取发货仓库列表数据
		getStoreListData (shopId) {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/${shopId}/users/${vuexState.loginer.loginerId}/houses`
			})
		},
		// 获取供货商列表数据
		getSupplierListData (shopId) {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/${shopId}/users/${vuexState.loginer.loginerId}/suppliers`
			})
		},
		// 查询品项列表数据
		getGoodsListData () {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/goods`
			})
		},
		//  查询品项分类
		getItemClass (inShopId) {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/${inShopId}/users/${vuexState.loginer.loginerId}/goodTypes`
			})
		},
		// 获取门店列表数据
		getInShopListData () {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/shopsByRdc`
			})
		},
		// 获取业务人列表数据
		getAccountListData () {
			return post({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/busUsers`
			})
		}
	},
	...CLD_API
}
