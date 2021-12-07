/* 报表接口 */
import { BASE_URL, getAppTypeUrlPath } from '@/js/service/baseUrl'
import service from '@/js/service/index'
import vuexState from '@/store/state'
const baseUrl = BASE_URL.url
export const reportForm = {
	// 获取方案明细
	getPlanDetail (params) {
		return new Promise(resolve => {
			service.requestGet({
				url: `${baseUrl}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/report/scheme`,
				data: params
			}).then(res => {
				resolve(res.reportSchemeRowData)
			})
		})
	},
	// 获取报表数据
	getReportData (params, reportFormId, responseKey) {
		return new Promise(resolve => {
			service.requestPost({
				url: `${baseUrl}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/report/${reportFormId}`,
				data: params
			}).then(res => {
				resolve(res[responseKey])
			})
		})
	},
	// 门店区域
	getShopArea (params) {
		return new Promise(resolve => {
			service.requestGet({
				url: `${baseUrl}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/shoparea/report`,
				data: params
			}).then(res => {
				resolve(res.shopareaData)
			})
		})
	},
	// 机构名称
	getShop (params) {
		return new Promise(resolve => {
			service.requestGet({
				url: `${baseUrl}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/shops`,
				data: Object.assign(params, {
					m: 'getShopListByHouseAndShopArea'
				})
			}).then(res => {
				resolve(res.shops)
			})
		})
	},
	// 门店名称
	getAuthShop (params) { // 有管辖权限的机构，登录只能看到自己的
		return new Promise(resolve => {
			service.requestGet({
				url: `${baseUrl}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/report/dp090`,
				data: Object.assign(params, {
					orgFlag: 0
				})
			}).then(res => {
				resolve(res.shops)
			})
		})
	},
	// 配送中心名称
	getAuthCenter (params) {
		return new Promise(resolve => {
			service.requestGet({
				url: `${baseUrl}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/report/dp090`,
				data: Object.assign(params, {
					orgFlag: 1
				})
			}).then(res => {
				resolve(res.shops)
			})
		})
	},
	// 配送中心名称
	getRdcs (params) {
		return new Promise(resolve => {
			service.requestGet({
				url: `${baseUrl}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/rdcs`,
				data: params
			}).then(res => {
				resolve(res.shops)
			})
		})
	},
	// 供货商
	getSupplier (params) {
		return new Promise(resolve => {
			service.requestPost({
				url: `${baseUrl}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/suppliers`,
				data: params
			}).then(res => {
				resolve(res.suppliers)
			})
		})
	},
	// 仓库类型
	getStoreType (params) {
		return new Promise(resolve => {
			service.requestGet({
				url: `${baseUrl}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/houseType/report`,
				data: params
			}).then(res => {
				resolve(res.houseType)
			})
		})
	},
	// 仓库名称
	getStore (params) {
		return new Promise(resolve => {
			service.requestGet({
				url: `${baseUrl}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/houses/report`,
				data: params
			}).then(res => {
				resolve(res.shops)
			})
		})
	},
	// 获取启用仓库
	getUsingStore (params) {
		return new Promise(resolve => {
			service.requestGet({
				url: `${baseUrl}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/houses/report/dp090`,
				data: params
			}).then(res => {
				resolve(res.shops)
			})
		})
	},
	// 品项大小类
	getItemClass (params) {
		return new Promise(resolve => {
			service.requestGet({
				url: `${baseUrl}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/goodTypes/report`,
				data: params
			}).then(res => {
				resolve(res.goodsTypes)
			})
		})
	},
	// 品项
	getItem (params) {
		return new Promise(resolve => {
			service.requestGet({
				url: `${baseUrl}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/goods/report`,
				data: params
			}).then(res => {
				resolve(res.goods)
			})
		})
	},
	// 品项类型
	getItemType (params) {
		return new Promise(resolve => {
			service.requestGet({
				url: `${baseUrl}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/goodsStyle/report`,
				data: params
			}).then(res => {
				resolve(res.goodsStyle)
			})
		})
	},
	// 单据类型
	getStoreBillType (params) {
		return new Promise(resolve => {
			service.requestGet({
				url: `${baseUrl}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/businessTypes`,
				data: Object.assign(params, {
					m: 'list4ShopOrderBill'
				})
			}).then(res => {
				resolve(res.businessTypes)
			})
		})
	},
	// 储藏方式
	getGoodsStoreWay (params) {
		return new Promise(resolve => {
			service.requestGet({
				url: `${baseUrl}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/goodsStore/report`,
				data: params
			}).then(res => {
				resolve(res.goodsStore)
			})
		})
	},
	// 获取图片信息
	getGoodsImagesList (goodsId) {
		return new Promise(resolve => {
			service.requestGet({
				url: `${baseUrl}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/goods`,
				data: {
					m: 'getGoodsImagesList',
					goodsId
				}
			}).then(res => {
				const imageUrls = res.goodsImage.map(item => {
					return /^http/.test(item.imagUrl) ? item.imagUrl : `http://${getAppTypeUrlPath()}/fileUpload/img_goods/${item.imagUrl}`
				})
				resolve(imageUrls)
			})
		})
	},
	// 供应链
	// 报表方案列表
	get4CldPlanList (reportFormId) {
		return new Promise(resolve => {
			service.requestGet({
				url: `${baseUrl}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/schemes/report/${reportFormId}`
			}).then(res => {
				resolve(res.baseDataVO)
			})
		})
	},
	// 报表方案详情
	get4CldPlanDetail (reportPlanId, reportFormId) {
		return new Promise(resolve => {
			service.requestGet({
				url: `${baseUrl}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/scheme/${reportPlanId}/report/${reportFormId}`
			}).then(res => {
				resolve(res.reportSchemeRowData)
			})
		})
	},
	// 获取报表数据
	get4CldReportData (params, reportFormId) {
		return new Promise(resolve => {
			service.requestPost({
				url: `${baseUrl}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/report/${reportFormId}`,
				data: params
			}).then(res => {
				resolve(res.mbStoreReportData)
			})
		})
	},
	// 获取筛选条件通用接口
	getCommonFilter (urlName, params) {
		return new Promise(resolve => {
			service.requestGet({
				url: `${baseUrl}/accounts/${vuexState.loginer.loginerShopId}/users/${vuexState.loginer.loginerId}/common/` + urlName,
				data: params
			}).then(res => {
				resolve(res.baseDataVO)
			})
		})
	}
}
