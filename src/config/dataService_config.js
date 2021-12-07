import Vue from 'vue'
import vuexState from '@/store/state'
import { get, put, post } from '@/js/api/src/dataSource'
let vueCore = Vue.prototype
export default {
	z5common: {
		// 获取门店列表数据:包括门店、配送中心、机构等选择框，只可选择登陆人员可管理的
		getUserManageShop (params) {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/shops`,
				data: {
					m: 'getShopListByHouseAndShopArea',
					selAll: 'on'
				}
			})
		},
		// 获取门店列表数据
		getListShop4Except () {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/shops`,
				data: {
					m: 'getListShop4Except',
					selAll: 'on'
				}
			})
		},
		// 获取门店列表数据:用于菜品预估单
		getListShop4ExceptPS () {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/shops`,
				data: {
					m: 'getListShop4ExceptPS',
					selAll: 'on'
				}
			})
		},
		// 获取仓库列表数据:用于菜品预估单
		selListGoodsByHouse4Food () {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/houses`,
				data: {
					m: 'selListGoodsByHouse4Food',
					selAll: 'on'
				}
			})
		},
		// 获取仓库列表数据:用于菜品预估单
		selJoinListGoodsByHouse4Food () {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/houses`,
				data: {
					m: 'selJoinListGoodsByHouse4Food',
					selAll: 'on'
				}
			})
		},
		// 获取门店列表数据:包括门店、配送中心、机构等选择框，只可选择登陆人员可管理的
		list4ShopOtherOrderBill4Edit (params) {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/shops`,
				data: {
					m: 'list4ShopOtherOrderBill4Edit'
				}
			})
		},
		// 获取仓库列表数据
		getHouseBylist4ShopOrderBill (shopId) {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/${shopId}/users/${vuexState.loginer.loginerId}/houses`,
				data: {
					m: 'list4ShopOrderBill'
				}
			})
		},
		// 获取部门
		getDepartment (params) {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/department/report`,
				data: {
					id: params ? params.id : ''
				}
			})
		},
		// 单据类型
		getBusinessTypes () {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/businessTypes`,
				data: {
				}
			})
		},
		// 品项
		getGoods () {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/goods`,
				data: {
				}
			})
		},
		// 仓库
		getGoodsByShop (shopId) {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/${shopId}/users/${vuexState.loginer.loginerId}/houses`,
				data: {
				}
			})
		},
		// 供货商
		getSuppliers (shopId) {
			return post({
				url: `${vueCore.$fxBaseApi.url}/accounts/${shopId}/users/${vuexState.loginer.loginerId}/suppliers`,
				data: {
				}
			})
		},
		// 扫码：目前用于采购入库
		getScanCodeBySM (param) {
			return post({
				url: `${vueCore.$fxBaseApi.url}/accounts/${param.shopId}/users/${vuexState.loginer.loginerId}/getscancodebysm`,
				query: param.query
			})
		}
	},
	// {{{采购入库单
	stockInBill: {
		// 快速领用
		quickAccess () {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/stockinbills/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'quickAccess'
				}
			})
		}
	},
	// }}}
	// {{{统配入库单
	distributioninbills: {
		// 快速领用
		quickAccess (orderId) {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/distributioninbills/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'quickAccess'
				}
			})
		}
	},
	// }}}
	// {{{直送入库单
	shopDirectInBill: {
		// 快速领用
		quickAccess (orderId) {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/shopdirectinbills/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'quickAccess'
				}
			})
		}
	},
	// }}}
	// {{{直通入库单
	shopStraightInBill: {
		// 快速领用
		quickAccess (orderId) {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/shopstraightinbills/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'quickAccess'
				}
			})
		}
	},
	// }}}
	// {{{统配出
	uniformDistributionOutBill: {
		// 是否库存不足
		noEnoughAmountIsExist (orderId) {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/distributionOutBills/billId/${orderId}`,
				data: {
					m: 'noEnoughAmountIsExist'
				}
			})
		},
		// 库存不足列表
		getNoEnoughAmountGoodsList (orderId) {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/distributionOutBills/billId/${orderId}/users/${vuexState.loginer.loginerId}`,
				data: {
					m: 'getNoEnoughAmountGoodsList'
				}
			})
		},
		// 单独设置发货仓库
		getHouse4NoEnoughAmountGoods (data) {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/distributionOutBills/billId/${data.orderId}/goodsId/${data.goodsId}/users/${vuexState.loginer.loginerId}`,
				data: {
					m: 'getHouse4NoEnoughAmountGoods'
				}
			})
		},
		// 统一设置发货仓库
		getHouseList4UniformNoEnoughSet (orderId) {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/distributionOutBills/billId/${orderId}/users/${vuexState.loginer.loginerId}`,
				data: {
					m: 'getHouseList4UniformNoEnoughSet'
				}
			})
		},
		// 查询库存
		getOutHouseGidAmount (orderId) {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/distributionOutBills/billId/${orderId}/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'getOutHouseGidAmount'
				},
				data: []
			})
		},
		// 生成出库单
		createUniform (orderId) {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/distributionOutBills/billId/${orderId}/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'createUniform'
				},
				data: []
			})
		}
	},
	// }}}
	// {{{内部调拨单
	insideMoveBill: {
		// 获取调拨类型
		getHouseManagedStatus () {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/houses/`,
				query: {
					m: 'selHouseManagedStatus'
				}
			})
		}
	},
	// }}}
	// {{{门店订货单
	shopOrderBill: {
		// 修改业务日期 清空明细
		getMBDetailList4ModifyWorkDate () {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/shoporders/`,
				query: {
					m: 'getMBDetailList4ModifyWorkDate'
				}
			})
		},
		// 根据方案到货间隔，设置到货日期
		getArrivalDate (orderId) {
			return post({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/shoporders/orderPlanId/${orderId}`
			})
		},
		// 供货商
		getDirectGoodsSupplier (shopId) {
			return post({
				url: `${vueCore.$fxBaseApi.url}/accounts/${shopId}/shoporders/users/${vuexState.loginer.loginerId}`,
				query: {
					m: 'getDirectGoodsSupplier'
				}
			})
		}
	},
	// }}}
	// {{{采购申请单
	stockApplyOrder: {
		// 减单
		reduceBill (orderId) {
			return put({
				url: `${vueCore.$fxBaseApi.url}/accounts/${vuexState.loginer.loginerShopId}/stockApplies/${orderId}`,
				query: {
					userId: vuexState.loginer.loginerId,
					m: 'reduceBill'
				},
				data: []
			})
		}
	},
	// }}}
	// {{{菜品预估单
	foodReckonBill: {
		// 查询菜品列表
		selFoodList () {
			return get({
				url: `${vueCore.$fxBaseApi.url}/accounts/food`,
				data: {
					m: 'selFoodList'
				}
			})
		}
	}
	// }}}
}
