<template>
	<fx-order-list-filter @on-back="onCloseClick">
		<van-cell-group>
			<w-cell title="业务日期"></w-cell>
			<w-cell title="起始时间" is-link @click="onBeginDateClick">{{beginDate}}</w-cell>
			<w-cell title="结束时间" is-link @click="onEndDateClick">{{endDate}}</w-cell>
			<w-cell title="来源" is-link @click="onSourceClick">{{source.name}}</w-cell>
			<w-cell title="配送中心" is-link @click="onRdcClick">{{rdc.name}}</w-cell>
			<w-cell title="仓库" is-link @click="onInHouseClick">{{inHouse.name}}</w-cell>
			<w-cell title="供货商" is-link @click="onSupplierClick">{{supplier.name}}</w-cell>
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
				@confirm="dateConfirmHandle"
			></w-date-picker>
		</van-popup>
		<van-popup v-model="sourcePopShow" position="right" class="fx-list-popup-300">
			<listComp
				:visibleFlag.sync="sourcePopShow"
				:data="sourceList"
				:loadFinished="true"
				title="来源检索"
				@on-select="selectSource"
				@on-search="searchSource"
			></listComp>
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
		<van-popup v-model="inHousePopShow" position="right" class="fx-list-popup-300">
			<listComp
				:visibleFlag.sync="inHousePopShow"
				:data="inHouseList"
				title="仓库检索"
				:loadFinished="true"
				@on-select="selectInHouse"
				@on-search="searchInHouse"
			></listComp>
		</van-popup>
		<van-popup v-model="supplierPopShow" position="right" class="fx-list-popup-300">
			<listComp
				:visibleFlag.sync="supplierPopShow"
				:data="supplierList"
				title="供货商检索"
				:loadFinished="true"
				@on-select="selectSupplier"
				@on-search="searchSupplier"
			></listComp>
		</van-popup>
		<van-popup v-model="shopPopShow" position="right" class="fx-list-popup-300">
			<listComp
				:visibleFlag.sync="shopPopShow"
				:data="shopList"
				title="门店检索"
				:loadFinished="true"
				@on-select="selectShop"
				@on-search="searchShop"
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
			inHouse: {
				name: '请选择'
			},
			inHouseList: [],
			inHousePopShow: false,
			supplier: {
				name: '请选择'
			},
			supplierList: [],
			supplierPopShow: false,
			shop: {
				name: '请选择'
			},
			shopList: [],
			shopPopShow: false,
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
			loginerShopId: state => state.loginerId.loginerShopId,
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
		dateConfirmHandle (date) {
			if (this.dateType === 'begin') {
				this.beginDate = this.$fxUtils.setDate(date)
			} else {
				this.endDate = this.$fxUtils.setDate(date)
			}
			this.datePickerShow = false
		},
		onSourceClick () {
			this.getSourceListData().then(res => {
				this.sourceList = res.baseDataVO
				this.sourcePopShow = true
			})
		},
		selectSource (item) {
			this.source = item
		},
		searchSource (keyword) {
			this.getSourceListData(keyword).then(res => {
				this.sourceList = res.baseDataVO
			})
		},
		getSourceListData (keyword = null) {
			const params = {
				keyword: keyword
			}
			return this.$fxApi('common.getSourceListData', keyword)({ data: params })
		},
		onRdcClick () {
			this.getRdcListData().then(res => {
				this.rdcList = res.shops
				this.rdcPopShow = true
			})
		},
		selectRdcs (item) {
			this.rdc = item
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
			return this.$fxApi('common.getRdcListData', keyword)({ data: params })
		},
		onInHouseClick () {
			if (!this.rdc.id) {
				this.$fxToast.fail('请先选择配送中心')
				return false
			}
			this.getInHouseListData().then(res => {
				this.inHouseList = res.shops
				this.inHousePopShow = true
			})
		},
		selectInHouse (item) {
			this.inHouse = item
		},
		searchInHouse (keyword) {
			this.getInHouseListData(keyword).then(res => {
				this.inHouseList = res.shops
			})
		},
		getInHouseListData (keyword = null) {
			const params = {
				keyword: keyword
			}
			return this.$fxApi('common.getStoreListData', this.rdc.id)({ data: params })
		},
		onSupplierClick () {
			this.getSupplierListData().then(res => {
				this.supplierList = res.suppliers
				this.supplierPopShow = true
			})
		},
		selectSupplier (item) {
			this.supplier = item
		},
		searchSupplier (keyword) {
			this.getSupplierListData(keyword).then(res => {
				this.supplierList = res.suppliers
			})
		},
		getSupplierListData (keyword = null) {
			const params = {
				keyword: keyword
			}
			return this.$fxApi('common.getSupplierListData', keyword)({ data: params })
		},
		onGoodsClick () {
			this.goodsListStart = 0
			this.searchGoodsKeyword = ''
			this.getGoodsListData().then(res => {
				this.goodsList = res.goods
				this.goodsLoading = false
				this.goodsPopShow = true
			})
		},
		selectGoods (item) {
			this.goods = item
		},
		searchGoods (keyword) {
			this.goodsListStart = 0
			this.searchGoodsKeyword = ''
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
			this.inHouse = {
				name: '请选择'
			}
			this.supplier = {
				name: '请选择'
			}
			this.shop = {
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
				inHouseId: this.inHouse.id,
				shopId: this.shop.id,
				supplierId: this.supplier.id,
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

<style scoped>

</style>
