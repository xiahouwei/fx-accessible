<template>
	<reportFormContainer
		ref="reportForm"
		:reportFormConfig="reportFormConfig"
		:reportPlans="reportPlans"
		:getReportParams="getReportParams"
		:filterPopShow.sync="filterPopShow"
		:reportFormId = "reportFormId"
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
import filterPop from '@/components/reportForm/report-dqjcb4cld/FilterPop.vue'
const REPORT_FORM_ID = 'ZXKC_100010'
export default {
	name: 'report-dqjcb4cld',
	components: {
		reportFormContainer,
		filterPop
	},
	data () {
		const reportFormConfig = this.$fxCommon.getReportFormConfig(REPORT_FORM_ID)
		return {
			reportFormConfig: reportFormConfig,
			filterPopShow: false,
			filterParams: {},
			reportPlans: [],
			reportFormId: REPORT_FORM_ID
		}
	},
	async mounted () {
		let reportPlans = await this.getReportPlans()
		this.reportPlans = reportPlans
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
		...mapGetters(['reportPlansGetter'])
		// shopCellDisable () {
		// 	return this.$fxStateMiddleware.stateIs('loginerOrganType')(['shop', 'center', 'area'])(this.loginerOrganType)
		// },
		// centerCellDisable () {
		// 	return this.$fxStateMiddleware.stateIs('loginerOrganType')(['center'])(this.loginerOrganType)
		// }
	},
	methods: {
		filterConfirm (filterParams) {
			this.filterParamsCheck(filterParams).then(() => {
				this.getReportParams(filterParams).then(res => {
					this.$refs.reportForm.refreshReportForm(res)
				})
			})
		},
		async getReportParams (filterParams = {}) {
			return this.$fxUtils.isEmptyObjSHW(filterParams)
				? await this.getReportParamsDefault()
				: {
					makeTimeOn: filterParams.makeTimeOn ? `${filterParams.makeTimeOn} 00:00:00` : '',
					makeTimeOff: filterParams.makeTimeOff ? `${filterParams.makeTimeOff} 23:59:59` : '',
					shopName: filterParams.shopName !== '请选择' ? filterParams.shopName : '',
					storeId: filterParams.storeId,
					dlName: filterParams.dlName !== '请选择' ? filterParams.dlName : '',
					lbName: filterParams.lbName !== '请选择' ? filterParams.lbName : '',
					itemName: filterParams.itemName !== '请选择' ? filterParams.itemName : '',
					startAmount: filterParams.startAmount,
					endAmount: filterParams.endAmount,
					ftName: filterParams.ftName !== '请选择' ? filterParams.ftName : '',
					agg: {}
				}
		},
		filterParamsCheck (filterParams) {
			return new Promise((resolve, reject) => {
				if (filterParams.startAmount || filterParams.endAmount) {
					if (!filterParams.startAmount) {
						this.filterPopShow = true
						this.$fxToast.fail('请填写结存数量的最小数量')
					} else if (!filterParams.endAmount) {
						this.filterPopShow = true
						this.$fxToast.fail('请填写结存数量的最大数量')
					} else if (Number(filterParams.startAmount) > Number(filterParams.endAmount)) {
						this.filterPopShow = true
						this.$fxToast.fail('结存数量的最小数量不能大于结存数量的最大数量')
					} else {
						resolve()
					}
				} else {
					resolve()
				}
			})
		},
		async getReportParamsDefault () {
			// const { shop, shopId } = await this.getDefaultShop()
			// this.setDefaultShop(shop, shopId)
			// const { center, centerId } = this.getDefaultCenter()
			// this.setDefaultCenter(center, centerId)
			return {
				makeTimeOn: `${this.$fxUtils.setDate()} 00:00:00`,
				makeTimeOff: `${this.$fxUtils.setDate()} 23:59:59`,
				// // shopId,
				// houseId: '40289b98787bfb5101787c7289a00004',
				agg: {
					jCCurrentAmount: 'sum',
					aJCCurrentAmount: 'sum'
				}
			}
		},
		// {{{}}}
		// async getDefaultShop () {
		// 	return this.shopCellDisable ? { shop: this.loginerShopName, shopId: this.loginerShopId } : await this.getDefaultShopHandler()
		// },
		// setDefaultShop (shop, shopId) {
		// 	this.filterParams.shop = shop
		// 	this.filterParams.shopId = shopId
		// },
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
		// {{{
		// getDefaultCenter () {
		// 	return this.centerCellDisable ? { center: this.loginerShopName, centerId: this.loginerShopId } : { center: '请选择', centerId: '' }
		// },
		setDefaultCenter (center, centerId) {
			this.filterParams.center = center
			this.filterParams.centerId = centerId
		},
		getReportPlans () {
			return new Promise(resolve => {
				this.$fxApi('reportForm.get4CldPlanList')(REPORT_FORM_ID).then((reportPlansList) => {
					resolve(reportPlansList)
				})
			})
		}
	}
}
</script>
