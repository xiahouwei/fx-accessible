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
import filterPop from '@/components/reportForm/report-kc011/FilterPop.vue'
const REPORT_FORM_ID = 'kc011'
export default {
	name: 'report-kc011',
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
					shopAreaId: filterParams.shopAreaId,
					shopId: filterParams.shopId,
					houseTypeId: filterParams.storeTypeId,
					houseId: filterParams.storeId,
					goodBigTypeId: filterParams.bigClassId,
					goodSmallTypeId: filterParams.smallClassId,
					goodStyleId: filterParams.itemTypeId,
					goodsId: filterParams.itemId,
					goodStoreId: filterParams.goodsStoreId,
					agg: {
						jyMoney: 'sum',
						qcAmount: 'sum',
						qcMoney: 'sum',
						inAmount: 'sum',
						inMoney: 'sum',
						notCheckInAmount: 'sum',
						outAmount: 'sum',
						outMoney: 'sum',
						notCheckOutAmount: 'sum',
						jyAmount: 'sum',
						notCheckJyAmount: 'sum'
					}
				}
		},
		async getReportParamsDefault () {
			const { shop, shopId } = await this.getDefaultShop()
			this.setDefaultShop(shop, shopId)
			return {
				sWorkDate: `${this.$fxUtils.getCurrentMonthFirst()} 00:00:00`,
				eWorkDate: `${this.$fxUtils.setDate()} 23:59:59`,
				shopId,
				agg: {
					jyMoney: 'sum',
					qcAmount: 'sum',
					qcMoney: 'sum',
					inAmount: 'sum',
					inMoney: 'sum',
					notCheckInAmount: 'sum',
					outAmount: 'sum',
					outMoney: 'sum',
					notCheckOutAmount: 'sum',
					jyAmount: 'sum',
					notCheckJyAmount: 'sum'
				}
			}
		},
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
			return this.$fxApi('reportForm.getShop')(params)
		}
	}
}
</script>
