<template>
	<fx-order-list-filter @on-back="onCloseClick">
		<van-cell-group>
			<w-cell title="业务日期"></w-cell>
			<w-cell title="起始时间" is-link @click="onBeginDateClick">{{beginDate}}</w-cell>
			<w-cell title="结束时间" is-link @click="onEndDateClick">{{endDate}}</w-cell>
			<w-cell title="配送中心" is-link @click="onRdcClick">{{rdc.name}}</w-cell>
			<w-cell title="盘点仓库" is-link @click="onHouseClick">{{house.name}}</w-cell>
			<w-cell title="品项" is-link @click="onGoodsClick">{{goods.name}}</w-cell>
			<w-cell
				title="业务类型"
				:is-link="!billType.id"
				:is-clear="!!billType.id"
				@click="onBillTypeClick"
				@on-clear="onBillTypeClearClick"
			>{{billType.name}}</w-cell>
			<van-pro-field
				ref="billNo"
				v-model="billNo"
				label="系统单号"
				placeholder="请输入系统单号"
				input-align="right"
				@focus="onFocus('billNo')"
			></van-pro-field>
		</van-cell-group>
		<van-popup v-model="datePickerShow" position="bottom">
			<w-date-picker
				type="date"
				:visibleFlag.sync="datePickerShow"
				:currentDate="currentDate"
				@confirm="dateConfirmhandle"
			></w-date-picker>
		</van-popup>
		<van-popup v-model="rdcPopShow" position="right" class="fx-list-popup-300">
			<listComp
				:visibleFlag.sync="rdcPopShow"
				:data="rdcList"
				:loadFinished="true"
				title="配送中心检索"
				@on-select="selectRdcs"
				@on-search="searchRdcs"
			></listComp>
		</van-popup>
		<van-popup v-model="housePopShow" position="right" class="fx-list-popup-300">
			<listComp
				:visibleFlag.sync="housePopShow"
				:data="houseList"
				title="仓库检索"
				:loadFinished="true"
				@on-select="selectHouse"
				@on-search="searchHouse"
			></listComp>
		</van-popup>
		<van-popup v-model="goodsPopShow" position="right" class="fx-list-popup-300">
			<listComp
				:visibleFlag.sync="goodsPopShow"
				:data="goodsList"
				title="品项检索"
				:loading.sync="goodsLoading"
				:loadFinished="goodsLoadFinished"
				@on-select="selectGoods"
				@on-search="searchGoods"
				@on-load="loadGoodsList"
			></listComp>
		</van-popup>
		<van-popup v-model="billTypePopShow" position="right" class="fx-list-popup-300">
			<listComp
				:visibleFlag.sync="billTypePopShow"
				:data="billTypeList"
				title="单据类型检索"
				:loadFinished="true"
				@on-select="selectBillType"
				@on-search="searchBillType"
			></listComp>
		</van-popup>
		<w-button
			slot="bottom-btn"
			size="large"
			type="info"
			@click="onResetClick"
		>重置</w-button>
		<w-button
			slot="bottom-btn"
			size="large"
			type="primary"
			@click="onConfirmClick"
		>确定</w-button>
	</fx-order-list-filter>
</template>

<script>
import { mapState } from 'vuex'
import listComp from '@/components/common/ListComp.vue'
const ITEM_SIZE = 50
export default {
	name: 'FilterPop',
	components: {
		listComp
	},
	props: {
		visibleFlag: Boolean,
		filterParams: {
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
			datePickerShow: false,
			beginDate: '',
			endDate: '',
			rdc: {
				name: '请选择'
			},
			rdcList: [],
			rdcPopShow: false,
			house: {
				name: '请选择'
			},
			houseList: [],
			housePopShow: false,
			goods: {
				name: '请选择'
			},
			goodsListStart: 0,
			goodsList: [],
			goodsLoading: false,
			goodsLoadFinished: false,
			goodsPopShow: false,
			searchGoodsKeyword: '',
			billType: {
				name: '请选择'
			},
			billTypeList: [],
			billTypePopShow: false,
			billNo: ''
		}
	},
	watch: {
		visibleFlag: {
			handler (val) {
				if (val && this.$fxUtils.isEmptyObjSHW(this.filterParams)) {
					this.resetHandler()
				}
			},
			immediate: true
		},
		businessDateStart: {
			immediate: true,
			handler (val) {
				this.beginDate = val
			}
		},
		businessDateEnd: {
			immediate: true,
			handler (val) {
				this.endDate = val
			}
		}
	},
	computed: {
		...mapState({
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId,
			businessDateStart: state => state.systemParamsCld.businessDateStart,
			businessDateEnd: state => state.systemParamsCld.businessDateEnd
		})
	},
	methods: {
		onCloseClick () {
			this.$emit('update:visibleFlag', false)
		},
		onBeginDateClick () {
			this.datePickerShow = true
			if (this.beginDate) this.currentDate = new Date(this.beginDate)
			this.dateType = 'begin'
		},
		onEndDateClick () {
			this.datePickerShow = true
			if (this.endDate) this.currentDate = new Date(this.endDate)
			this.dateType = 'end'
		},
		dateConfirmhandle (date) {
			if (this.dateType === 'begin') {
				this.beginDate = this.$fxUtils.setDate(date)
			} else {
				this.endDate = this.$fxUtils.setDate(date)
			}
			this.datePickerShow = false
		},
		// {{{ 配送中心
		onRdcClick () {
			this.getRdcListData().then(res => {
				this.rdcList = res.shops
				this.rdcPopShow = true
			})
		},
		selectRdcs (item) {
			this.rdc = item
			this.house = {
				name: '请选择'
			}
			this.goods = {
				name: '请选择'
			}
		},
		searchRdcs (keyword) {
			this.getRdcListData(keyword).then(res => {
				this.rdcList = res.shops
			})
		},
		getRdcListData (keyword = null) {
			const params = {
				keyword: keyword
			}
			return this.$fxApi('common.getRdcListData')({ data: params })
		},
		// }}}
		// {{{ 盘点仓库
		onHouseClick () {
			if (!this.rdc.id) {
				this.$fxToast.fail('请先选择配送中心!')
				return false
			}
			this.getHouseListData().then(res => {
				this.houseList = res.shops
				this.housePopShow = true
			})
		},
		selectHouse (item) {
			this.house = item
			this.goods = {
				name: '请选择'
			}
		},
		searchHouse (keyword) {
			this.getHouseListData(keyword).then(res => {
				this.houseList = res.shops
			})
		},
		getHouseListData (keyword = null) {
			const params = {
				keyword: keyword
			}
			return this.$fxApi('common.getStoreListData', this.rdc.id)({ data: params })
		},
		// }}}
		// {{{ 品项
		onGoodsClick () {
			this.goodsListStart = 0
			this.searchGoodsKeyword = ''
			this.getGoodsListData().then(res => {
				this.goodsLoading = false
				this.goodsPopShow = true
				this.goodsList = res.goods
			})
		},
		selectGoods (item) {
			this.goods = item
		},
		searchGoods (keyword) {
			this.goodsListStart = 0
			this.searchGoodsKeyword = keyword
			this.getGoodsListData(keyword).then(res => {
				if (res.goods.length < ITEM_SIZE) {
					this.goodsLoadFinished = true
				}
				this.goodsList = res.goods
			})
		},
		loadGoodsList () {
			if (this.goodsLoadFinished === true) {
				return
			}
			this.goodsListStart = this.goodsListStart + ITEM_SIZE
			this.getGoodsListData(this.searchGoodsKeyword).then(res => {
				this.goodsLoading = false
				if (res.goods.length < ITEM_SIZE) {
					this.goodsLoadFinished = true
				}
				this.goodsList.push(...res.goods)
			})
		},
		getGoodsListData (keyword = null) {
			const params = {
				start: this.goodsListStart,
				size: ITEM_SIZE,
				paged: true,
				keyword: keyword
			}
			return this.$fxApi('common.getGoodsListData')({ data: params })
		},
		// }}}
		// {{{ 业务类型
		onBillTypeClick () {
			this.getBillTypeListData().then(res => {
				this.billTypeList = res.businessTypes
				this.billTypePopShow = true
			})
		},
		selectBillType (item) {
			this.billType = item
		},
		searchBillType (keyword) {
			this.getBillTypeListData(keyword).then(res => {
				this.billTypeList = res.businessTypes
			})
		},
		getBillTypeListData (keyword = null) {
			const params = {
				m: 'list4CenterCheck',
				keyword: keyword
			}
			return this.$fxApi('common.getBusinessTypeListData')({ data: params })
		},
		// }}}
		onResetClick () {
			this.resetHandler()
		},
		resetHandler () {
			this.beginDate = this.businessDateStart
			this.endDate = this.businessDateEnd
			this.rdc = {
				name: '请选择'
			}
			this.inShop = {
				name: '请选择'
			}
			this.house = {
				name: '请选择'
			}
			this.billType = {
				name: '请选择'
			}
			this.goods = {
				name: '请选择'
			}
			this.billNo = ''
		},
		onConfirmClick () {
			if (new Date(this.endDate) < new Date(this.beginDate)) {
				this.$fxToast.fail('开始日期不能大于结束日期!')
				return false
			}
			this.$emit('update:visibleFlag', false)
			this.$emit('update:filterParams', this.getFilterParams())
			this.$emit('on-confirm', this.getFilterParams())
		},
		getFilterParams () {
			return {
				beginDate: this.beginDate,
				endDate: this.endDate,
				rdcId: this.rdc.id,
				houseId: this.house.id,
				billTypeId: this.billType.id,
				goodsId: this.goods.id,
				billNo: this.billNo
			}
		},
		onFocus (ref) {
			this.onScrollTop(ref)
		},
		onScrollTop (scrollRef, distance = 20) {
			let detailsRowRef = this.$refs[scrollRef]
			if (!detailsRowRef || detailsRowRef.length === 0) {
				return false
			}
			let offsetTop = detailsRowRef.$el.offsetTop
			let $el = this.$refs['filterContent']
			this.$fxUtils.scrollTopW({ offsetTop, $el, distance })
		},
		onBillTypeClearClick () {
			this.billType = {
				name: '请选择',
				id: ''
			}
		}
	}
}
</script>
