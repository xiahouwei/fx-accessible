<template>
	<fx-order-list-filter @on-back="onCloseClick">
		<van-cell-group>
			<w-cell title="业务日期"></w-cell>
			<w-cell title="起始时间" is-link @click="onBeginDateClick">{{beginDate}}</w-cell>
			<w-cell title="结束时间" is-link @click="onEndDateClick">{{endDate}}</w-cell>
			<w-cell title="来源" is-link @click="onSourceRefresh(null)">{{source.name}}</w-cell>
			<w-cell title="配送中心" is-link @click="onRdcRefresh(null)">{{rdc.name}}</w-cell>
			<w-cell title="发货仓库" is-link @click="onHouseRefresh(null)">{{house.name}}</w-cell>
			<w-cell title="客户(付款方集团)" class="customer-cell" is-link @click="onInShopClick">{{inShop.name}}</w-cell>
			<w-cell title="收货客户(付款方机构)" class="customer-cell" is-link @click="onSubcustomerClik">{{subcustomer.name}}</w-cell>
			<!-- <w-cell title="拣货人" class="customer-cell" is-link @click="onPickerRefresh(null)">{{picker.name}}</w-cell> -->
			<w-cell title="品项" is-link @click="onGoodsClick">{{goods.name}}</w-cell>
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
		<van-popup v-model="sourcePopShow" position="right" class="fx-list-popup-300">
			<listComp
				:visibleFlag.sync="sourcePopShow"
				:data="sourceList"
				:loadFinished="true"
				title="来源检索"
				@on-select="onSourceSelect"
				@on-search="onSourceRefresh"
			></listComp>
		</van-popup>
		<van-popup v-model="rdcPopShow" position="right" class="fx-list-popup-300">
			<listComp
				:visibleFlag.sync="rdcPopShow"
				:data="rdcList"
				:loadFinished="true"
				title="配送中心检索"
				@on-select="selectRdcs"
				@on-search="onRdcRefresh"
			></listComp>
		</van-popup>
		<!-- <van-popup v-model="pickerPopShow" position="right" class="fx-list-popup-300">
			<listComp
				:visibleFlag.sync="pickerPopShow"
				:data="pickerList"
				:loadFinished="true"
				title="拣货人"
				@on-select="selectPicker"
				@on-search="onPickerRefresh"
			></listComp>
		</van-popup> -->
		<van-popup v-model="housePopShow" position="right" class="fx-list-popup-300">
			<listComp
				:visibleFlag.sync="housePopShow"
				:data="houseList"
				title="仓库检索"
				:loadFinished="true"
				@on-select="selectHouse"
				@on-search="onHouseRefresh"
			></listComp>
		</van-popup>
		<van-popup v-model="inShopPopShow" position="right" class="fx-list-popup-300">
			<listComp
				:visibleFlag.sync="inShopPopShow"
				:data="inShopList"
				title="客户检索"
				:loadFinished="true"
				@on-select="selectInShop"
				@on-search="searchInShop"
			></listComp>
		</van-popup>
		<van-popup v-model="subcustomerPopShow" position="right" class="fx-list-popup-300">
			<listComp
				:visibleFlag.sync="subcustomerPopShow"
				:data="subcustomerList"
				title="收货客户检索"
				:loadFinished="true"
				@on-select="onSubcustomerSelect"
				@on-search="onSubcustomerSearch"
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
			source: {
				name: '请选择'
			},
			sourceList: [],
			sourcePopShow: false,
			rdc: {
				name: '请选择'
			},
			rdcList: [],
			rdcPopShow: false,
			// picker: {
			// 	name: '请选择'
			// },
			// pickerList: [],
			// pickerPopShow: false,
			inShop: {
				name: '请选择'
			},
			inShopList: [],
			inShopPopShow: false,
			subcustomer: {
				name: '请选择'
			},
			subcustomerList: [],
			subcustomerPopShow: false,
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
		// {{{ 来源
		onSourceRefresh (keyword) {
			this.getSourceListData(keyword).then(res => {
				this.sourceList = res.baseDataVO
				this.sourcePopShow = true
			})
		},
		getSourceListData (keyword = null) {
			const params = {
				keyword: keyword
			}
			return this.$fxApi('common.getSourceListData', keyword)({ data: params })
		},
		onSourceSelect (item) {
			this.source = item
		},
		// }}}
		// {{{配送中心
		onRdcRefresh (keyword) {
			this.getRdcListData(keyword).then(res => {
				this.rdcList = res.shops
				this.rdcPopShow = true
			})
		},
		selectRdcs (item) {
			this.rdc = item
		},
		getRdcListData (keyword = null) {
			const params = {
				keyword: keyword
			}
			return this.$fxApi('common.getRdcListData', keyword)({ data: params })
		},
		// }}}
		// onPickerRefresh (keyword) {
		// 	this.getPickerListData(keyword).then(res => {
		// 		this.pickerList = res.shops
		// 		this.pickerPopShow = true
		// 	})
		// },
		// selectPicker (item) {
		// 	this.picker = item
		// },
		// getPickerListData (keyword = null) {
		// 	const params = {
		// 		searchText: keyword,
		// 		rdcId: this.rdc ? this.rdc.id : ''
		// 	}
		// 	return this.$fxApi('stockInBill4cld.getAccountListData')({ data: params })
		// },
		// {{{ 发货仓库
		onHouseRefresh (keyword) {
			if (!this.rdc.id) {
				this.$fxToast.fail('请先选择配送中心!')
				return false
			}
			this.getHouseListData(keyword).then(res => {
				this.houseList = res.shops
				this.housePopShow = true
			})
		},
		selectHouse (item) {
			this.house = item
		},
		getHouseListData (keyword = null) {
			const params = {
				keyword: keyword
			}
			return this.$fxApi('common.getStoreListData', this.rdc.id)({ data: params })
		},
		// }}}
		onInShopClick () {
			this.getInShopListData().then(res => {
				this.inShopList = res.customerDataVO
				this.inShopPopShow = true
			})
		},
		selectInShop (item) {
			this.inShop = item
		},
		searchInShop (keyword) {
			this.getInShopListData(keyword).then(res => {
				this.inShopList = res.customerDataVO
			})
		},
		getInShopListData (keyword = null) {
			const params = {
				keyword: keyword
			}
			return this.$fxApi('common.getCustomerListData', keyword)({ data: params })
		},
		onSubcustomerClik () {
			this.getSubcustomerListData().then(res => {
				this.subcustomerList = res.customerDataVO
				this.subcustomerPopShow = true
			})
		},
		onSubcustomerSelect (item) {
			this.subcustomer = item
		},
		onSubcustomerSearch (keyword) {
			this.getInShopListData(keyword).then(res => {
				this.subcustomerList = res.customerDataVO
			})
		},
		getSubcustomerListData (keyword = null) {
			const params = {
				keyword: keyword
			}
			return this.$fxApi('common.getSubCustomerListData', keyword)({ data: params })
		},
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
		onResetClick () {
			this.resetHandler()
		},
		resetHandler () {
			this.beginDate = this.businessDateStart
			this.endDate = this.businessDateEnd
			this.source = {
				name: '请选择'
			}
			this.rdc = {
				name: '请选择'
			}
			this.inShop = {
				name: '请选择'
			}
			this.subcustomer = {
				name: '请选择'
			}
			this.house = {
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
				sourceId: this.source.id,
				rdcId: this.rdc.id,
				inShopId: this.inShop.id,
				pickerId: this.picker.id,
				subcustomer: this.subcustomer.id,
				houseId: this.house.id,
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
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.customer-cell >>> .wind-cell-title {
	width: 160px
}
</style>
