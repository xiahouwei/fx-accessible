<template>
	<reportFormContainer
		ref="reportForm"
		:reportFormConfig="reportFormConfig"
		:reportPlans="reportPlans"
		:getReportParams="getReportParams"
		:filterPopShow.sync="filterPopShow"
		showSearchBar
		:planDetailsApi="planDetailsApi"
		:reportFormApi="reportFormApi"
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
import filterPop from '@/components/reportForm/report-dp090/FilterPop.vue'
const REPORT_FORM_ID = 'dp090'
export default {
	name: 'report-dp090',
	components: {
		reportFormContainer,
		filterPop
	},
	data () {
		const reportFormConfig = this.$fxCommon.getReportFormConfig(REPORT_FORM_ID)
		return {
			reportFormConfig: reportFormConfig,
			reportFormId: REPORT_FORM_ID,
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
			loginerOrganType: state => state.loginer.loginerOrganType,
			loginerId: state => state.loginer.loginerId
		}),
		...mapGetters(['reportPlansGetter']),
		reportPlans () {
			return this.reportPlansGetter(REPORT_FORM_ID)
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
					shopId: filterParams.shopId,
					centerId: filterParams.centerId,
					houseTypeId: filterParams.storeTypeId,
					houseId: filterParams.storeId,
					goodBigTypeId: filterParams.bigClassId,
					goodSmallTypeId: filterParams.smallClassId,
					goodsId: filterParams.itemId,
					agg: {}
				}
		},
		async getReportParamsDefault () {
			const { shop, shopId } = await this.getDefaultShop()
			this.setDefaultShop(shop, shopId)
			const { center, centerId } = await this.getDefaultCenter()
			this.setDefaultCenter(center, centerId)
			return {
				shopId,
				centerId,
				agg: {}
			}
		},
		// {{{ 设置默认机构
		async getDefaultShop () {
			return this.getDefaultShopListData().then(res => {
				if (!res.shops) {
					return { shop: '', shopId: '' }
				} else {
					let shop = res.shops[0].name
					let shopId = res.shops[0].id
					return { shop: shop, shopId: shopId }
				}
			})
		},
		// {{{获取默认机构
		getDefaultShopListData () {
			return new Promise(resolve => {
				let params = {
					m: 'getDefaultShopList'
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/shops`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		// }}}
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
						this.$fxToast.fail(error)
						reject(error)
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
			return this.$fxApi('reportForm.getAuthShop')(params)
		},
		// }}}
		// {{{ 设置默认配送中心
		async getDefaultCenter () {
			return this.centerCellDisable ? await this.getDefaultCenterHandler() : { center: '请选择', centerId: '' }
		},
		setDefaultCenter (shop, shopId) {
			this.filterParams.center = shop
			this.filterParams.centerId = shopId
		},
		getDefaultCenterHandler () {
			return new Promise((resolve, reject) => {
				this.getCenterListData().then(res => {
					if (res.length > 0) {
						resolve({
							center: res[0].name,
							centerId: res[0].id
						})
					} else {
						const error = '当前没有可查询机构'
						this.$fxToast.fail(error)
						reject(error)
					}
				})
			})
		},
		getCenterListData () {
			const params = {
				keyword: null,
				start: 0,
				size: 1
			}
			return this.$fxApi('reportForm.getAuthCenter')(params)
		},
		// }}}
		// 此报表获取方案,报表数据 api与其他报表不同, 单独声明, 此后报表禁止出现此情况
		planDetailsApi (params) {
			return this.$fxHttp.requestGet({
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/report/distributionReport/scheme`,
				data: params
			}).then(res => {
				return Promise.resolve(res.reportSchemeRowData)
			})
		},
		reportFormApi (params) {
			return this.$fxHttp.requestReport({
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/report/distributionReport/${this.reportFormId}`,
				data: params
			}).then(res => {
				return Promise.resolve(res.mbDistributionReportData)
			})
		}
	}
}
</script>
