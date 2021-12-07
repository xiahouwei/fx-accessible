<template>
	<div class="inteledi-intellectOrderPop">
		<w-header title="智能订货" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div class="intellectOrderPop-content">
			<FilterParams
				:filterParams="filterParams"
				:forecastAvailable="filterParams.forecastAvailable"
				:isDisabled="filterSale.estimateDayList.length ? true : false"
				@on-checkdate-click="onCheckDateClick"
				@on-arrivedate-click="onArriveDateClick"
				@on-house-click="onHouseClick"
				@on-intellectplan-click="onIntellectPlanClick"
				@on-refCycle-change="onRefCycleChange"
				@on-forecastAvailable-change="onForecastAvailableChange"
				class="filter-block"
			></FilterParams>
			<FilterRange
				:filterRange="filterRange"
				class="filter-block"
			></FilterRange>
			<FilterWeather
				:filterWeather="filterWeather"
				@on-weatherraido-click="onWeatherraidoClick"
				class="filter-block"
			></FilterWeather>
			<FilterOther
				:filterOther="filterOther"
				:isDisabled="filterOther.isDisabled"
				@on-othershop-click="onOtherShopClick"
				@on-calculate-click="onCalculateClick"
				@on-instructions-click="onInstructionsClick"
				class="filter-block"
			></FilterOther>
			<FilterSaleData
				:filterSale="filterSale"
				@on-dayEstimate-click="onDayEstimateClick"
				@on-hisEstimate-click="onHisEstimateClick"
				class="filter-block"
			></FilterSaleData>
		</div>
		<div class="intellectOrderPop-bottom">
			<van-button class="bottom-btn fx-btn" v-show="$fxAuth('shopOrderBill.add')" type="primary" round size="small" @click="onNextClick">下一步</van-button>
		</div>
		<van-popup v-model="datePickerShow" position="bottom">
			<w-date-picker
				:visibleFlag.sync="datePickerShow"
				:currentDate="currentDate"
				@confirm="dateConfirmhandle"
			></w-date-picker>
		</van-popup>
		<van-popup
			v-model="housePopShow"
			position="right"
			class="fx-list-popup-300"
			:lock-scroll="false"
		>
			<listComp
				:visibleFlag.sync="housePopShow"
				:data="houseList"
				:loadFinished="true"
				title="仓库检索"
				@on-search="searchHouse"
				@on-select="selectHouse"
			></listComp>
		</van-popup>
		<van-popup
			v-model="intellectPlanPopShow"
			position="right"
			class="fx-list-popup-300"
			:lock-scroll="false"
		>
			<listComp
				:visibleFlag.sync="intellectPlanPopShow"
				:data="intellectPlanList"
				:loadFinished="true"
				title="智能订货方案检索"
				@on-search="searchIntellectPlan"
				@on-select="selectIntellectPlan"
			></listComp>
		</van-popup>
		<van-popup v-model="otherShopPopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="otherShopPopShow"
				:data="otherShopList"
				:loadFinished="true"
				title="请选择门店"
				@on-search="searchOtherShop"
				@on-select="selectOtherShop"
			></listComp>
		</van-popup>
		<van-popup
			v-model="estimateEditPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<EstimateEditPop
				:visibleFlag.sync="estimateEditPopShow"
				:foodsStoreItem="foodsStoreItem"
				:goodsStoreItem="goodsStoreItem"
				:recMoney="filterOther.estimate"
				@on-creatdetails-click="onCreatdetailsClick"
			></EstimateEditPop>
		</van-popup>
		<van-popup
			v-model="estimateDayPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<EstimateDayPop
				:estimateDayList="filterSale.estimateDayList"
				:checkDate="filterParams.checkDate"
				:forecastAvailable="filterParams.forecastAvailable"
				:visibleFlag.sync="estimateDayPopShow"
				@on-saveDayMoney-click="onSaveDayMoneyClick"
			></EstimateDayPop>
		</van-popup>
		<van-popup
			v-model="estimateHisPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<EstimateHisPop
				:hisDayList="filterSale.hisData"
				:checkDate="filterParams.checkDate"
				:referenceCycle="filterParams.referenceCycle"
				:visibleFlag.sync="estimateHisPopShow"
			></EstimateHisPop>
		</van-popup>
		<van-popup
			v-model="instructionsPopShow"
			position="bottom"
			class="fx-list-popup-full"
			:lock-scroll="false"
			:style="{ height: '39%' }"
		>
			<div class="filter-instructions" v-if="instructionsData">
				<h3 class="instructions-title">合计</h3>
				<p class="filter-instructions-p">
					预订<!--
				--><span v-for="(item, index) in instructionsData.date" :key="index">{{item.instructionsDate}}（周{{item.instructionsDay}}）<!--
					--><span v-if="index < instructionsData.date.length - 1">、</span><!--
				--></span>的品项，<!--
					--><span v-show="filterRange.sameCompare">以前{{instructionsData.sameCompareDay}}周的每周{{instructionsData.date[0].instructionsDay}}的营业数据</span><!--
				--><span><!--
					--><span v-if="filterRange.ringCompare && filterRange.sameCompare">、</span><!--
					--><span v-if="filterRange.ringCompare">前{{filterParams.referenceCycle}}天的所有营业数据</span><!--
					--><span v-if="filterRange.ringCompare && !filterRange.orderBeforeDay">之和</span>
					</span><!--
				--><span v-if="filterRange.orderBeforeDay && (filterRange.sameCompare || filterRange.ringCompare)">、订货前一天营业数据之和</span><!--
				--><span v-else-if="filterRange.orderBeforeDay">订货前一天营业数据，</span><!--
				--><span>作为参考，</span><!--
				-->预计可用{{filterParams.forecastAvailable}}天，<!--
				-->参考营业额{{filterOther.reference}}元，<!--
				--><span v-if="filterOther.reference === filterOther.estimate">预估营业额{{filterOther.estimate}}元</span><!--
				--><span v-else>预估营业额已手工修改为{{filterOther.estimate}}元</span><!--
				--><span v-if="instructionsData.weather"><!--
					-->，可能会受{{instructionsData.weather}}天影响，<!--
					--><span v-if="instructionsData.weatherMinus">减少</span><span v-else>增加</span><!--
					-->预估总量{{instructionsData.weatherCount}}%的订货量<!--
					--></span><!--
				--><span v-if="filterWeather.otherFactorCount > 0"><!--
					-->，受到其它因素“{{filterWeather.otherFactor}}”影响，预估总量<!--
					--><span v-if="filterWeather.otherFactorMinus">减少</span><span v-else>增加</span><!--
					-->{{filterWeather.otherFactorCount}}%的订货量<!--
				--></span><!--
				--><span>。</span>
				</p>
				<div class="instructions-bottom">
					<van-button type="primary" round size="small" @click="onInstructionsDataClick">确认</van-button>
				</div>
			</div>
		</van-popup>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import FilterParams from '@/components/shopOrder/intellectOrder/FilterParams.vue'
import FilterRange from '@/components/shopOrder/intellectOrder/FilterRange.vue'
import FilterWeather from '@/components/shopOrder/intellectOrder/FilterWeather.vue'
import FilterOther from '@/components/shopOrder/intellectOrder/FilterOther.vue'
import FilterSaleData from '@/components/shopOrder/intellectOrder/FilterSaleData.vue'
import EstimateEditPop from '@/components/shopOrder/intellectOrder/EstimateEditPop.vue'
import EstimateDayPop from '@/components/shopOrder/intellectOrder/EstimateDayPop.vue'
import EstimateHisPop from '@/components/shopOrder/intellectOrder/EstimateHisPop.vue'
import listComp from '@/components/common/ListComp.vue'
export default {
	name: 'intellectOrderPop',
	components: {
		FilterParams,
		FilterRange,
		FilterWeather,
		FilterOther,
		FilterSaleData,
		EstimateEditPop,
		EstimateDayPop,
		EstimateHisPop,
		listComp
	},
	props: {
		visibleFlag: Boolean,
		shopId: {
			type: String,
			default: ''
		},
		orderPlanId: {
			type: String,
			default: ''
		},
		urgentFlag: {
			type: Boolean,
			default: false
		},
		businessDate: Number,
		arriveDate: Number,
		orderInfoData: {
			type: Object,
			default: () => {
				return {}
			}
		}
	},
	data () {
		return {
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			currentDate: new Date(),
			filterParams: {
				checkDate: this.businessDate,
				arriveDate: this.arriveDate,
				house: '请选择',
				houseId: '',
				intellectPlan: '请选择',
				intellectPlanId: '',
				referenceCycle: 21,
				forecastAvailable: 1
			},
			filterRange: {
				sameCompare: true,
				ringCompare: true,
				orderBeforeDay: true
			},
			filterWeather: {
				days: [
					{ code: 'sunnyDay', name: '晴朗', count: 0, minus: false, add: false },
					{ code: 'cloudyDay', name: '阴天', count: 0, minus: false, add: false },
					{ code: 'windy', name: '刮风', count: 0, minus: false, add: false },
					{ code: 'rain', name: '下雨', count: 0, minus: false, add: false },
					{ code: 'smog', name: '雾霾', count: 0, minus: false, add: false },
					{ code: 'snowing', name: '下雪', count: 0, minus: false, add: false }
				],
				weatherRaido: '',
				otherFactor: '',
				otherFactorCount: 0,
				otherFactorMinus: false,
				otherFactorAdd: false
			},
			filterOther: {
				checkOtherShop: false,
				otherShop: '请选择',
				otherShopId: '',
				reference: '',
				estimate: 0,
				isDisabled: false
			},
			filterSale: {
				estimateDayList: [],
				dayMoneyTotal: 0,
				dayMoneyAvg: 0,
				hisMoneyTotal: 0,
				hisMoneyAvg: 0,
				hisData: []
			},
			currentWeather: '',
			datePickerShow: false,
			housePopShow: false,
			houseList: [],
			otherShopPopShow: false,
			otherShopList: [],
			intellectPlanPopShow: false,
			intellectPlanList: [],
			foodsStoreItem: {},
			goodsStoreItem: {},
			estimateEditPopShow: false,
			instructionsPopShow: false,
			estimateDayPopShow: false,
			estimateHisPopShow: false,
			formatterSysPointKey: ['busUnitAmount', 'consultMoney'],
			calculateFlag: false,
			instructionsData: null
		}
	},
	watch: {
		visibleFlag: {
			handler (val) {
				if (val) {
					this.resetHandler()
					this.resetIntellectData()
				}
			},
			immediate: true
		},
		filterParams: {
			handler (val) {
				if (val) {
					this.resetCalculate()
				}
			},
			deep: true
		},
		filterRange: {
			handler (val) {
				if (val) {
					this.resetCalculate()
				}
			},
			deep: true
		},
		filterWeather: {
			handler (val) {
				if (val) {
					this.resetCalculate()
				}
			},
			deep: true
		},
		'filterOther.checkOtherShop': {
			handler (val) {
				if (val) {
					this.resetCalculate()
					this.resetHisData()
				}
			},
			immediate: true
		},
		'filterOther.otherShop': {
			handler (val) {
				if (val) {
					this.resetCalculate()
					this.resetHisData()
				}
			},
			immediate: true
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize',
			loginerShopId: state => state.loginer.loginerShopId,
			loginerShopName: state => state.loginer.loginerShopName,
			loginerId: state => state.loginer.loginerId,
			loginerOrganType: state => state.loginer.loginerOrganType
		})
	},
	methods: {
		resetHandler () {
			this.filterParams = {
				checkDate: this.businessDate,
				arriveDate: this.arriveDate,
				house: '请选择',
				houseId: '',
				intellectPlan: '请选择',
				intellectPlanId: '',
				referenceCycle: 21,
				forecastAvailable: 1
			}
			this.filterRange = {
				sameCompare: true,
				ringCompare: true,
				orderBeforeDay: true
			}
			this.filterWeather = {
				days: [
					{ code: 'sunnyDay', name: '晴朗', count: 0, minus: true, add: false },
					{ code: 'cloudyDay', name: '阴天', count: 0, minus: true, add: false },
					{ code: 'windy', name: '刮风', count: 0, minus: true, add: false },
					{ code: 'rain', name: '下雨', count: 0, minus: true, add: false },
					{ code: 'smog', name: '雾霾', count: 0, minus: true, add: false },
					{ code: 'snowing', name: '下雪', count: 0, minus: true, add: false }
				],
				weatherRaido: '',
				otherFactor: '',
				otherFactorCount: 0,
				otherFactorMinus: true,
				otherFactorAdd: false
			}
			this.filterOther = {
				checkOtherShop: false,
				otherShop: '请选择',
				otherShopId: '',
				reference: 0,
				estimate: 0
			}
			this.calculateFlag = false
			this.filterSale = {
				estimateDayList: [],
				dayMoneyTotal: 0,
				dayMoneyAvg: 0,
				hisMoneyTotal: 0,
				hisMoneyAvg: 0,
				hisData: []
			}
		},
		resetIntellectData () {
			this.getIntellectPlanListData().then(res => {
				this.filterParams.intellectPlan = res.smartOrderPlans[0].name
				this.filterParams.intellectPlanId = res.smartOrderPlans[0].id
				this.setIntellectOrderByPlan(res.smartOrderPlans[0])
			})
			this.getHouseListData().then(res => {
				this.filterParams.house = res.shops[0].name
				this.filterParams.houseId = res.shops[0].id
			})
		},
		resetCalculate () {
			this.filterOther.estimate = 0
			this.filterOther.reference = 0
			this.filterOther.isDisabled = false
			this.calculateFlag = false
		},
		onCloseClick () {
			if (this.focusing) { // input不符合验证规则
				return false
			}
			this.$emit('update:visibleFlag', false)
		},
		// {{{ 日期
		onCheckDateClick () {
			this.clearItemConfim('修改日期，将会清空日额预估数据，是否确认修改').then(() => {
				this.dateType = 'check'
				if (this.filterParams.checkDate) this.currentDate = new Date(this.filterParams.checkDate)
				this.datePickerShow = true
				this.resetCalculate()
				this.resetHisData()
			})
		},
		onArriveDateClick () {
			this.dateType = 'arrive'
			if (this.filterParams.arriveDate) this.currentDate = new Date(this.filterParams.arriveDate)
			this.datePickerShow = true
		},
		dateConfirmhandle (date) {
			if (this.dateType === 'check') {
				this.filterParams.checkDate = date.getTime()
			} else {
				this.filterParams.arriveDate = date.getTime()
			}
			this.datePickerShow = false
		},
		// }}}
		// {{{ 仓库
		onHouseClick () {
			this.onHouseRefresh()
		},
		searchHouse (keyword) {
			this.onHouseRefresh(keyword)
		},
		selectHouse (item) {
			if (item.id === this.filterParams.houseId) {
				return true
			}
			this.resetHandler()
			this.filterParams.house = item.name
			this.filterParams.houseId = item.id
		},
		onHouseRefresh (keyword = null) {
			this.getHouseListData(keyword).then(res => {
				this.houseList = res.shops
				this.housePopShow = true
			})
		},
		getHouseListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					keyword: keyword,
					m: 'list4ShopOrderBill'
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.shopId}/users/${this.loginerId}/houses`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		// }}}
		// {{{智能订货方案
		onIntellectPlanClick () {
			this.onIntellectPlanRefresh()
		},
		searchIntellectPlan (keyword) {
			this.onIntellectPlanRefresh(keyword)
		},
		selectIntellectPlan (item) {
			if (item.id === this.filterParams.intellectPlanId) {
				return true
			}
			this.filterParams.intellectPlan = item.name
			this.filterParams.intellectPlanId = item.id
			this.resetFilterDaySale()
			this.setIntellectOrderByPlan(item)
		},
		onIntellectPlanRefresh (keyword = null) {
			this.getIntellectPlanListData(keyword).then(res => {
				this.intellectPlanList = res.smartOrderPlans
				this.intellectPlanPopShow = true
			})
		},
		getIntellectPlanListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					keyWord: keyword,
					houseId: this.filterParams.houseId,
					m: 'getSmartOrderPlans'
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.shopId}/users/${this.loginerId}/orderGoodPlans`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		// 根据智能订货方案设置参数
		setIntellectOrderByPlan (data) {
			Object.assign(this.filterParams, {
				referenceCycle: data.referenceCycle ? data.referenceCycle : 21,
				forecastAvailable: data.forecastAvailable ? data.forecastAvailable : 1
			})
			this.filterRange = {
				sameCompare: data.sameCompare === '1',
				ringCompare: data.ringCompare === '1',
				orderBeforeDay: data.orderBeforeDay === '1'
			}
			let sunnyDayCount = data.sunnyDayCount
			let cloudyDayCount = data.cloudyDayCount
			let windyCount = data.windyCount
			let rainCount = data.rainCount
			let smogCount = data.smogCount
			let snowingCount = data.snowingCount
			this.filterWeather = {
				days: [
					{ code: 'sunnyDay', name: '晴朗', count: Math.abs(sunnyDayCount), minus: sunnyDayCount <= 0, add: sunnyDayCount > 0 },
					{ code: 'cloudyDay', name: '阴天', count: Math.abs(cloudyDayCount), minus: cloudyDayCount <= 0, add: cloudyDayCount > 0 },
					{ code: 'windy', name: '刮风', count: Math.abs(windyCount), minus: windyCount <= 0, add: windyCount > 0 },
					{ code: 'rain', name: '下雨', count: Math.abs(rainCount), minus: rainCount <= 0, add: rainCount > 0 },
					{ code: 'smog', name: '雾霾', count: Math.abs(smogCount), minus: smogCount <= 0, add: smogCount > 0 },
					{ code: 'snowing', name: '下雪', count: Math.abs(snowingCount), minus: snowingCount <= 0, add: snowingCount > 0 }
				],
				weatherRaido: '',
				otherFactor: data.otherFactor ? data.otherFactor : '',
				otherFactorCount: data.otherFactorCount ? Math.abs(data.otherFactorCount) : 0,
				otherFactorMinus: data.otherFactorCount <= 0,
				otherFactorAdd: data.otherFactorCount > 0
			}
		},
		// }}}
		// {{{ 修改预计可用
		onForecastAvailableChange (data) {
			this.filterParams.forecastAvailable = data
			this.resetFilterDaySale()
		},
		// }}}
		// {{{ 修改参考周期
		onRefCycleChange () {
			this.resetHisData()
		},
		// 清空历史营业额
		resetHisData () {
			this.filterSale.hisMoneyTotal = 0
			this.filterSale.hisMoneyAvg = 0
			this.filterSale.hisData = []
		},
		// }}}
		// {{{
		onWeatherraidoClick () {
			if (this.currentWeather === this.filterWeather.weatherRaido) {
				this.filterWeather.weatherRaido = ''
				this.currentWeather = ''
			} else {
				this.currentWeather = this.filterWeather.weatherRaido
			}
		},
		// }}}
		// {{{ 参考其他门店
		onOtherShopClick () {
			this.onOtherShopRefresh()
		},
		searchOtherShop (keyword) {
			this.onOtherShopRefresh(keyword)
		},
		selectOtherShop (item) {
			this.filterOther.otherShop = item.name
			this.filterOther.otherShopId = item.id
		},
		onOtherShopRefresh (keyword = null) {
			this.getOtherShopListData(keyword).then(res => {
				this.otherShopList = res.shops
				this.otherShopPopShow = true
			})
		},
		getOtherShopListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					m: 'list4SmartOrderBill',
					keyword: keyword
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.shopId}/users/${this.loginerId}/shops`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		// }}}
		// }}}
		// {{{计算
		onCalculateClick () {
			this.validaterParams().then(() => {
				this.clearItemConfim('计算参考营业额，将会清空日额预估数据，是否确认修改?').then(() => {
					Promise.all([this.getCalculateData(), this.getHisEstimateData()]).then(res => {
						this.filterOther.estimate = res[0].count
						this.filterOther.reference = res[0].count
						this.calculateFlag = true
						let hisData = res[1].smartAverDayMoneys
						let sumMoney = hisData.reduce((pre, cur) => {
							return pre + parseFloat(cur.money)
						}, 0)
						this.filterSale.hisMoneyTotal = this.toFixedNumberSize(sumMoney)
						this.filterSale.hisMoneyAvg = this.toFixedNumberSize(sumMoney / hisData.length)
						this.filterSale.hisData = res[1].smartAverDayMoneys
					})
				})
			})
		},
		getCalculateData () {
			return new Promise(resolve => {
				let params = {
					shopId: this.filterOther.checkOtherShop ? this.filterOther.otherShopId : this.shopId,
					houseId: this.filterParams.houseId,
					orderDate: this.$fxUtils.setDateTime(new Date(this.filterParams.checkDate)),
					referenceCycle: this.filterParams.referenceCycle,
					sameCompare: this.filterRange.sameCompare ? 1 : 0,
					ringCompare: this.filterRange.ringCompare ? 1 : 0,
					orderBeforeDay: this.filterRange.orderBeforeDay ? 1 : 0,
					planId: this.filterParams.intellectPlanId
				}
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/shoporders`,
					data: params,
					query: {
						userId: this.loginerId,
						m: 'getSaleMoney'
					}
				}).then(res => {
					resolve(res)
				})
			})
		},
		clearItemConfim (message) {
			return new Promise(resolve => {
				if (!this.filterSale.estimateDayList.length) {
					resolve()
				} else {
					this.$dialog.confirm({
						title: '提示',
						message: message
					}).then(() => {
						this.resetFilterDaySale()
						resolve()
					}).catch(() => {
					})
				}
			})
		},
		resetFilterDaySale () {
			this.filterSale.estimateDayList = []
			this.filterSale.dayMoneyTotal = 0
			this.filterSale.dayMoneyAvg = 0
			this.filterOther.isDisabled = false
		},
		// {{{验证 参数
		validaterParams () {
			return new Promise(resolve => {
				if (this.filterParams.houseId === '') {
					this.$fxToast.top(`请选择仓库！`)
					return false
				}
				if (this.filterParams.intellectPlanId === '') {
					this.$fxToast.top(`请选择智能订货方案！`)
					return false
				}
				let rangeL = 0
				for (let key in this.filterRange) {
					if (!this.filterRange[key]) {
						rangeL++
					}
				}
				if (rangeL === Object.keys(this.filterRange).length) {
					this.$fxToast.top(`至少选择一种预估范围！`)
					return false
				}
				let weatherCode = this.filterWeather.weatherRaido
				let selectWeather = this.filterWeather.days.find(item => {
					return item.code === weatherCode
				})
				// 天气值,其它因素值
				if (selectWeather) {
					let selectWeatherCount = selectWeather.minus ? parseFloat(-selectWeather.count) : parseFloat(selectWeather.count)
					let otherFactorCount = this.filterWeather.otherFactorMinus ? parseFloat(-this.filterWeather.otherFactorCount) : parseFloat(this.filterWeather.otherFactorCount)
					if (selectWeatherCount + otherFactorCount < -100) {
						this.$fxToast.top(`天气,其它因素影响量之和不能小于-100%！`)
						return false
					}
				}
				if (this.filterOther.checkOtherShop && this.filterOther.otherShopId === '') {
					this.$fxToast.top(`请选择要参考的其他门店！`)
					return false
				}
				resolve()
			})
		},
		// }}}
		// }}}
		onNextClick () {
			return new Promise(resolve => {
				if (!this.calculateFlag) {
					this.$fxToast.top(`请点击计算“参考营业额”！`)
					return false
				}
				this.validaterParams().then(() => {
					Promise.all([this.getFoodsDetails(), this.getGoodsDetails()]).then(result => {
						let foodsData = result[0].smartOrderFoods
						this.formatterSysPoint(foodsData)
						this.foodsStoreItem = this.filterStoreItem(foodsData)
						let goodsData = result[1].smartOrderGoods
						this.formatterSysPoint(goodsData)
						this.goodsStoreItem = this.filterStoreItem(goodsData)
						this.estimateEditPopShow = true
						resolve()
					})
				})
			})
		},
		getFoodsDetails () {
			return new Promise(resolve => {
				let params = {
					shopId: this.shopId,
					houseId: this.filterParams.houseId,
					orderDate: this.$fxUtils.setDateTime(new Date(this.filterParams.checkDate)),
					referenceCycle: this.filterParams.referenceCycle,
					sameCompare: this.filterRange.sameCompare ? 1 : 0,
					ringCompare: this.filterRange.ringCompare ? 1 : 0,
					orderBeforeDay: this.filterRange.orderBeforeDay ? 1 : 0,
					planId: this.filterParams.intellectPlanId,
					orderPlanId: this.orderPlanId,
					refMoney: this.filterOther.reference,
					recMoney: this.filterOther.estimate,
					expressFlag: this.urgentFlag ? 1 : 0,
					date: this.filterParams.forecastAvailable
				}
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/shoporders`,
					data: params,
					query: {
						userId: this.loginerId,
						m: 'pageFoodList'
					}
				}).then(res => {
					resolve(res)
				})
			})
		},
		getGoodsDetails () {
			return new Promise(resolve => {
				let params = {
					shopId: this.shopId,
					houseId: this.filterParams.houseId,
					orderDate: this.$fxUtils.setDateTime(new Date(this.filterParams.checkDate)),
					referenceCycle: this.filterParams.referenceCycle,
					sameCompare: this.filterRange.sameCompare ? 1 : 0,
					ringCompare: this.filterRange.ringCompare ? 1 : 0,
					orderBeforeDay: this.filterRange.orderBeforeDay ? 1 : 0,
					planId: this.filterParams.intellectPlanId,
					orderPlanId: this.orderPlanId,
					refMoney: this.filterOther.reference,
					recMoney: this.filterOther.estimate,
					expressFlag: this.urgentFlag ? 1 : 0,
					date: this.filterParams.forecastAvailable
				}
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/shoporders`,
					data: params,
					query: {
						userId: this.loginerId,
						m: 'pageGoodsList'
					}
				}).then(res => {
					resolve(res)
				})
			})
		},
		formatterSysPoint (data) {
			data.forEach(item => {
				this.formatterSysPointKey.forEach(pointItem => {
					item[pointItem] = this.toFixedNumberSize(item[pointItem])
				})
			})
		},
		filterStoreItem (data) {
			data.forEach(dataItem => {
				let amount = parseFloat(dataItem.busUnitAmount)
				if (amount) {
					dataItem.consultPrice = this.toFixedNumberSize(dataItem.consultMoney / amount)
				} else {
					dataItem.consultMoney = 0
					dataItem.consultPrice = 0
				}
			})
			let storeObj = {
				id: this.filterParams.houseId,
				name: this.filterParams.house
			}
			storeObj = JSON.parse(JSON.stringify(storeObj))
			storeObj.details = data.length ? data : []
			return storeObj
		},
		toFixedNumberSize (data) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysPointSize))
		},
		// {{{ 计算解释
		onInstructionsClick () {
			if (!this.calculateFlag) {
				return false
			}
			this.instructionsPopShow = true
			this.instructionsData = {
				sameCompareDay: parseInt(this.filterParams.referenceCycle / 7)
			}
			let date = []
			for (let i = 0; i < this.filterParams.forecastAvailable; i++) {
				let forDate = this.$fxUtils.getCustomAssignDate(this.$fxUtils.setDate(new Date(this.filterParams.checkDate)), i)
				date.push({
					instructionsDate: this.$fxUtils.setDate(forDate, '年月日'),
					instructionsDay: '日一二三四五六'.charAt(forDate.getDay())
				})
			}
			this.instructionsData.date = date
			let weatherCode = this.filterWeather.weatherRaido
			let selectWeather = this.filterWeather.days.find(item => {
				return item.code === weatherCode
			})
			if (selectWeather && selectWeather.count > 0) {
				this.instructionsData.weather = selectWeather.name
				this.instructionsData.weatherCount = selectWeather.count
				this.instructionsData.weatherMinus = selectWeather.minus
			}
		},
		onInstructionsDataClick () {
			this.instructionsPopShow = false
		},
		// }}}
		// {{{ 生成明细
		onCreatdetailsClick (details) {
			return new Promise(resolve => {
				let params = this.getSaveParams(details)
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/shoporders`,
					data: params,
					query: {
						userId: this.loginerId,
						m: 'getSmartOrderDetails'
					}
				}).then(res => {
					/* 改为拆单，去掉其他逻辑
					let data = res.smartOrders[0]
					data.checkDate = this.filterParams.checkDate
					data.arriveDate = this.filterParams.arriveDate */
					this.estimateEditPopShow = false
					this.$emit('update:visibleFlag', false)
					this.$emit('on-creat-detail', res.shopOrderBills[0])
					resolve(res)
				})
			})
		},
		getSaveParams (data) {
			let selectWeatherCount = 0
			let otherFactorCount = 0
			let weatherCode = this.filterWeather.weatherRaido
			let selectWeather = this.filterWeather.days.find(item => {
				return item.code === weatherCode
			})
			if (selectWeather) {
				selectWeatherCount = selectWeather.minus ? parseFloat(-selectWeather.count / 100) : parseFloat(selectWeather.count / 100)
			}
			otherFactorCount = this.filterWeather.otherFactorMinus ? parseFloat(-this.filterWeather.otherFactorCount / 100) : parseFloat(this.filterWeather.otherFactorCount / 100)
			let averDay = this.filterSale.estimateDayList.map(item => {
				return { rq: item.rq, money: item.money }
			})
			let mobileBill = JSON.parse(JSON.stringify(this.orderInfoData))
			delete mobileBill.details
			delete mobileBill.detailDel
			delete mobileBill.detailAdd
			delete mobileBill.detailMdf
			let info = {
				influence: selectWeatherCount,
				otherInf: otherFactorCount,
				infName: selectWeather ? selectWeather.name : '',
				otherInfName: this.filterWeather.otherFactor,
				date: this.filterParams.forecastAvailable,
				shopId: this.shopId,
				houseId: this.filterParams.houseId,
				orderDate: this.$fxUtils.setDateTime(new Date(this.filterParams.checkDate)),
				referenceCycle: this.filterParams.referenceCycle,
				sameCompare: this.filterRange.sameCompare ? 1 : 0,
				ringCompare: this.filterRange.ringCompare ? 1 : 0,
				orderBeforeDay: this.filterRange.orderBeforeDay ? 1 : 0,
				planId: this.filterParams.intellectPlanId,
				orderPlanId: this.orderPlanId,
				refMoney: this.filterOther.reference,
				recMoney: this.filterOther.estimate,
				expressFlag: this.urgentFlag ? 1 : 0,
				averDay: averDay,
				checkFlag: data.checkFlag ? 1 : 0,
				breakFlag: data.breakFlag ? 1 : 0,
				mobileBill: mobileBill
			}
			let editGoodsItems = data.goodsDetails.details ? data.goodsDetails.details : []
			let editFoodsItems = data.foodsDetails.details ? data.foodsDetails.details : []
			let params = Object.assign({}, info, {
				goods: editGoodsItems.length > 0 ? editGoodsItems : null,
				foods: editFoodsItems.length > 0 ? editFoodsItems : null
			})
			return params
		},
		// }}}
		// {{{日额预估
		onDayEstimateClick () {
			// 日额预估，查询历史营业额
			this.validaterParams().then(() => {
				Promise.all([this.getCalculateData(), this.getHisEstimateData()]).then(res => {
					this.filterOther.estimate = res[0].count
					this.filterOther.reference = res[0].count
					this.calculateFlag = true
					let hisData = res[1].smartAverDayMoneys
					let sumMoney = hisData.reduce((pre, cur) => {
						return pre + parseFloat(cur.money)
					}, 0)
					this.filterSale.hisMoneyTotal = this.toFixedNumberSize(sumMoney)
					this.filterSale.hisMoneyAvg = this.toFixedNumberSize(sumMoney / hisData.length)
					this.filterSale.hisData = res[1].smartAverDayMoneys
				})
				this.estimateDayPopShow = true
			})
		},
		onSaveDayMoneyClick (dayMoney) {
			this.filterSale.estimateDayList = JSON.parse(JSON.stringify(dayMoney.dayList))
			let dayMoneyTotal = dayMoney.allMoney.find((item) => {
				return item.id === 'dayMoneyTotal'
			}).money
			this.filterSale.dayMoneyTotal = dayMoneyTotal
			this.filterSale.dayMoneyAvg = dayMoney.allMoney.find((item) => {
				return item.id === 'dayMoneyAvg'
			}).money
			this.filterOther.estimate = parseInt(dayMoneyTotal)
			this.filterOther.isDisabled = true
			this.calculateFlag = true
		},
		// }}}
		// {{{ 历史预估
		onHisEstimateClick () {
			// 查询历史营业额
			this.getHisEstimateData().then(res => {
				let hisData = res.smartAverDayMoneys
				let sumMoney = hisData.reduce((pre, cur) => {
					return pre + parseFloat(cur.money)
				}, 0)
				this.filterSale.hisMoneyTotal = this.toFixedNumberSize(sumMoney)
				this.filterSale.hisMoneyAvg = this.toFixedNumberSize(sumMoney / hisData.length)
				this.filterSale.hisData = res.smartAverDayMoneys
				this.estimateHisPopShow = true
			})
		},
		getHisEstimateData () {
			return new Promise(resolve => {
				let params = {
					shopId: this.filterOther.checkOtherShop ? this.filterOther.otherShopId : this.shopId,
					houseId: this.filterParams.houseId,
					orderDate: this.$fxUtils.setDateTime(new Date(this.filterParams.checkDate)),
					referenceCycle: this.filterParams.referenceCycle
				}
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/shoporders`,
					data: params,
					query: {
						userId: this.loginerId,
						m: 'getAverDaySaleMoney'
					}
				}).then(res => {
					resolve(res)
				})
			})
		}
		// }}}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.inteledi-intellectOrderPop {
	height: 100%
	background: $fxWhite
	display: flex
	flex-direction: column
	$fx-dynamic-font-size(13px)
	.intellectOrderPop-content {
		flex: 1
		overflow: scroll
		background: #eee
		.filter-block {
			margin-top: 5px
		}
	}
	.intellectOrderPop-bottom {
		display: flex
		flex-direction: row
		padding: 10px
		padding-left: 26px
		.bottom-btn {
			flex: 1
		}
	}
	.filter-instructions-p {
		$fx-dynamic-font-size(13px)
		line-height: 30px
		text-indent: 26px
		text-align: left
		flex: 1
		padding: 0px 10px
		overflow-y: auto
	}
	.filter-instructions {
		text-align: left
		display: flex
		height: 100%
		flex-direction: column
	}
	.instructions-title {
		border-bottom: 1px solid $fxGray
		$fx-dynamic-font-size(18px)
		padding: 10px
	}
	.instructions-bottom {
		padding-bottom: 10px
		display: flex
		flex-direction: column
	}
}
</style>
