<template>
	<reportFormContainer
		ref="reportForm"
		:reportFormConfig="reportFormConfig"
		:reportPlans="reportPlans"
		:getReportParams="getReportParams"
		:filterPopShow.sync="filterPopShow"
		showSearchBar
	>
		<filterPop
			slot="slot-filter"
			:visibleFlag.sync="filterPopShow"
			:filterParams.sync="filterParams"
			@on-confirm="filterConfirm"
		></filterPop>
	</reportFormContainer>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import reportFormContainer from '@/components/reportForm/common/ReportFormContainer.vue'
import filterPop from '@/components/reportForm/report-dp080/FilterPop.vue'
const REPORT_FORM_ID = 'dp080'
export default {
	name: 'report-dp080',
	components: {
		reportFormContainer,
		filterPop
	},
	data () {
		const reportFormConfig = this.$fxCommon.getReportFormConfig(REPORT_FORM_ID)
		return {
			reportFormConfig: reportFormConfig,
			filterPopShow: false,
			filterParams: {}
		}
	},
	mounted () {
		this.$refs.reportForm.init({
			reportPlan: this.reportPlans[0],
			getReportParams: this.getReportParams
		})
	},
	computed: {
		...mapState({
			loginerShopId: state => state.loginer.loginerShopId,
			loginerShopName: state => state.loginer.loginerShopName,
			loginerOrganType: state => state.loginer.loginerOrganType
		}),
		...mapGetters(['reportPlansGetter']),
		reportPlans () {
			return this.reportPlansGetter(REPORT_FORM_ID)
		},
		shopCellDisable () {
			return this.$fxStateMiddleware.stateIs('loginerOrganType')(['shop', 'center', 'area'])(this.loginerOrganType)
		},
		centerCellDisable () {
			return this.$fxStateMiddleware.stateIs('loginerOrganType')(['center'])(this.loginerOrganType)
		}
	},
	methods: {
		filterConfirm (filterParams) {
			this.getReportParams(filterParams).then(res => {
				this.$refs.reportForm.refreshReportForm(res)
			})
		},
		async getReportParams (filterParams = {}) {
			return this.$fxUtils.isEmptyObjSHW(filterParams)
				? await this.getReportParamsDefault()
				: {
					sWorkDate: filterParams.beginDate ? `${filterParams.beginDate} 00:00:00` : '',
					eWorkDate: filterParams.beginDate ? `${filterParams.endDate} 23:59:59` : '',
					sArriveDate: filterParams.arriveBeginDate ? `${filterParams.arriveBeginDate} 23:59:59` : '',
					eArriveDate: filterParams.arriveEndDate ? `${filterParams.arriveEndDate} 23:59:59` : '',
					shopId: filterParams.shopId,
					supplierId: filterParams.supplierId,
					houseId: filterParams.storeId,
					centerId: filterParams.centerId,
					rdcHouseId: filterParams.centerStoreId,
					goodBigTypeId: filterParams.bigClassId,
					goodSmallTypeId: filterParams.smallClassId,
					goodStyleId: filterParams.itemTypeId,
					goodsId: filterParams.itemId,
					assignFlagValue: filterParams.assignFlagValue,
					distributType: filterParams.distributType,
					storeBillTypeId: filterParams.storeBillTypeId,
					agg: {}
				}
		},
		async getReportParamsDefault () {
			// const { shop, shopId } = await this.getDefaultShop()
			// this.setDefaultShop(shop, shopId)
			const { center, centerId } = this.getDefaultCenter()
			this.setDefaultCenter(center, centerId)
			return {
				sWorkDate: `${this.$fxUtils.setDate()} 00:00:00`,
				eWorkDate: `${this.$fxUtils.setDate()} 23:59:59`,
				// shopId,
				centerId,
				agg: { amount: 'sum' }
			}
		},
		// {{{}}}
		async getDefaultShop () {
			return this.shopCellDisable ? { shop: this.loginerShopName, shopId: this.loginerShopId } : await this.getDefaultShopHandler()
		},
		setDefaultShop (shop, shopId) {
			this.filterParams.shop = shop
			this.filterParams.shopId = shopId
		},
		getDefaultShopHandler () {
			return new Promise((resolve, reject) => {
				this.getShopListData().then(res => {
					if (res.length > 0) {
						resolve({
							shop: res[0].name,
							shopId: res[0].id
						})
					} else {
						const error = '当前没有可查询机构'
						this.$fxToast.fail(error).then(() => {
							reject(error)
						})
					}
				})
			})
		},
		getShopListData () {
			const params = {
				keyword: null,
				start: 0,
				size: 1
			}
			return this.$fxApi('reportForm.getShop')(params)
		},
		// }}}
		// {{{ 设置默认配送中心
		getDefaultCenter () {
			return this.centerCellDisable ? { center: this.loginerShopName, centerId: this.loginerShopId } : { center: '请选择', centerId: '' }
		},
		setDefaultCenter (center, centerId) {
			this.filterParams.center = center
			this.filterParams.centerId = centerId
		}
		// getDefaultCenterHandler () {
		// 	return new Promise((resolve, reject) => {
		// 		this.getCenterListData().then(res => {
		// 			if (res.length > 0) {
		// 				resolve({
		// 					center: res[0].name,
		// 					centerId: res[0].id
		// 				})
		// 			} else {
		// 				const error = '当前没有可查询机构'
		// 				this.$fxToast.fail(error)
		// 				reject(error)
		// 			}
		// 		})
		// 	})
		// },
		// getCenterListData () {
		// 	const params = {
		// 		keyword: null,
		// 		start: 0,
		// 		size: 1
		// 	}
		// 	return this.$fxApi('reportForm.getAuthCenter')(params)
		// }
		// }}}
	}
}
</script>
