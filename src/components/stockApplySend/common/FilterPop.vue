<template>
	<div class="filter-popup">
		<w-header title="筛选条件" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div ref="filterContent" class="filter-content">
			<van-cell-group>
				<van-cell title="仓库" :value="store" value-class="info-item-value" is-link @click="onStoreClick" />
				<van-cell title="供货商" :value="supplier" value-class="info-item-value" is-link @click="onSupplierClick" />
				<van-cell title="品项" :value="item" value-class="info-item-value" is-link @click="onItemClick" />
				<van-cell title="品项大类" :value="itemBigType" value-class="info-item-value" is-link @click="onItemBigTypeClick" />
				<van-cell title="品项小类" :value="itemSmallType" value-class="info-item-value" is-link @click="onItemSmallTypeClick" />
				<van-cell title="品项类别" :value="itemType" value-class="info-item-value" is-link @click="onItemTypeClick" />
			</van-cell-group>
		</div>
		<div class="filter-bottom">
			<van-button class="reset-btn fx-no-radius" type="info" @click="onResetClick">重置</van-button>
			<van-button class="confirm-btn fx-no-radius" type="primary" @click="onConfirmClick">确定</van-button>
		</div>
		<van-popup v-model="supplierPopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="supplierPopShow"
				:data="supplierList"
				:loadFinished="true"
				title="供货商检索"
				@on-search="searchSupplier"
				@on-select="selectSupplier"
			></listComp>
		</van-popup>
		<van-popup v-model="storePopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="storePopShow"
				:data="storeList"
				:loadFinished="storeListLoadFinished"
				:loading.sync="onStoreLoading"
				title="仓库检索"
				@on-search="searchStore"
				@on-select="selectStore"
				@on-load="onStoreLoad"
			></listComp>
		</van-popup>
		<van-popup v-model="itemPopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="itemPopShow"
				:data="itemList"
				:loadFinished="itemListLoadFinished"
				:loading.sync="onItemLoading"
				title="品项检索"
				@on-search="searchItem"
				@on-select="selectItem"
				@on-load="onItemLoad"
			></listComp>
		</van-popup>
		<van-popup v-model="itemBigTypePopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="itemBigTypePopShow"
				:data="itemBigTypeList"
				:loadFinished="itemBigTypeListLoadFinished"
				:loading.sync="itemBigTypeLoading"
				title="品项大类检索"
				@on-search="searchItemBigType"
				@on-select="selectItemBigType"
				@on-load="onItemBigTypeLoad"
			></listComp>
		</van-popup>
		<van-popup v-model="itemSmallTypePopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="itemSmallTypePopShow"
				:data="itemSmallTypeList"
				:loadFinished="itemSmallTypeListLoadFinished"
				:loading.sync="itemSmallTypeLoading"
				title="品项小类检索"
				@on-search="searchItemSmallType"
				@on-select="selectItemSmallType"
				@on-load="onItemSmallTypeLoad"
			></listComp>
		</van-popup>
		<van-popup v-model="itemTypePopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="itemTypePopShow"
				:data="itemTypeList"
				:loadFinished="itemTypeListLoadFinished"
				:loading.sync="itemTypeLoading"
				title="品项类别检索"
				@on-search="searchItemType"
				@on-select="selectItemType"
				@on-load="onItemTypeLoad"
			></listComp>
		</van-popup>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import listComp from '@/components/common/ListComp.vue'
const ITEM_SIZE = 50
export default {
	name: 'filterPop',
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
			supplier: '请选择',
			supplierId: '',
			supplierList: [],
			supplierPopShow: false,
			store: '请选择',
			storeId: '',
			storeList: [],
			storePopShow: false,
			storeListStart: 0,
			onStoreLoading: false,
			storeListLoadFinished: false,
			item: '请选择',
			itemId: '',
			itemList: [],
			itemPopShow: false,
			itemListStart: 0,
			onItemLoading: false,
			itemListLoadFinished: false,
			itemBigTypeListStart: 0,
			itemBigType: '请选择',
			itemBigTypeId: '',
			itemBigTypeList: [],
			itemBigTypeListLoadFinished: false,
			itemBigTypeLoading: false,
			itemBigTypePopShow: false,
			itemSmallTypeListStart: 0,
			itemSmallType: '请选择',
			itemSmallTypeId: '',
			itemSmallTypeList: [],
			itemSmallTypeListLoadFinished: false,
			itemSmallTypeLoading: false,
			itemSmallTypePopShow: false,
			itemTypeListStart: 0,
			itemType: '请选择',
			itemTypeId: '',
			itemTypeList: [],
			itemTypeListLoadFinished: false,
			itemTypeLoading: false,
			itemTypePopShow: false
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
		}
	},
	computed: {
		...mapState({
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId
		})
	},
	methods: {
		getFilterParams () {
			return {
				supplierId: this.supplierId,
				storeId: this.storeId,
				itemId: this.itemId,
				itemBigTypeId: this.itemBigTypeId,
				itemSmallTypeId: this.itemSmallTypeId,
				itemTypeId: this.itemTypeId
			}
		},
		onCloseClick () {
			this.$emit('update:visibleFlag', false)
		},
		onConfirmClick () {
			this.$emit('update:visibleFlag', false)
			this.$emit('update:filterParams', this.getFilterParams())
			this.$emit('on-confirm', this.getFilterParams())
		},
		onResetClick () {
			this.resetHandler()
		},
		resetHandler () {
			this.supplier = '请选择'
			this.supplierId = ''
			this.store = '请选择'
			this.storeId = ''
			this.item = '请选择'
			this.itemId = ''
			this.itemBigType = '请选择'
			this.itemBigTypeId = ''
			this.itemSmallType = '请选择'
			this.itemSmallTypeId = ''
			this.itemType = '请选择'
			this.itemTypeId = ''
		},
		// {{{ 供货商
		onSupplierClick () {
			this.onSupplierRefresh()
		},
		searchSupplier (keyword) {
			this.onSupplierRefresh(keyword)
		},
		selectSupplier (item) {
			this.supplier = item.name
			this.supplierId = item.id
		},
		onSupplierRefresh (keyword = null) {
			this.getSupplierListData(keyword).then(res => {
				this.supplierList = res.suppliers
				this.supplierPopShow = true
			})
		},
		getSupplierListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					m: 'getListByKeywordOfselAll',
					selAll: 'on',
					keyword: keyword
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/suppliers`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		// }}}
		// {{{ 仓库
		onStoreClick () {
			this.onStoreRefresh()
		},
		searchStore (keyword) {
			this.onStoreRefresh(keyword)
		},
		selectStore (item) {
			this.store = item.name
			this.storeId = item.id
		},
		onStoreRefresh (keyword = null) {
			this.storeListStart = 0
			this.storeListLoadFinished = false
			this.getStoreListData(keyword).then(res => {
				this.storePopShow = true
				this.onStoreLoading = false
				this.storeListStart += ITEM_SIZE
				if (res.shops.length < ITEM_SIZE) {
					this.storeListLoadFinished = true
				}
				this.storeList = res.shops
			})
		},
		onStoreLoad (keyword = null) {
			this.getStoreListData(keyword).then(res => {
				this.onStoreLoading = false
				this.storeListStart += ITEM_SIZE
				if (res.shops.length < ITEM_SIZE) {
					this.storeListLoadFinished = true
				}
				this.storeList.push(...res.shops)
			})
		},
		getStoreListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					start: this.storeListStart,
					size: ITEM_SIZE,
					paged: true,
					keyword: keyword
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/houses?m=getAllHouses`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		// }}}
		// {{{品项
		onItemClick () {
			this.onItemRefresh()
		},
		searchItem (keyword) {
			this.onItemRefresh(keyword)
		},
		selectItem (item) {
			this.item = item.name
			this.itemId = item.id
		},
		onItemRefresh (keyword = null) {
			this.itemListStart = 0
			this.itemListLoadFinished = false
			this.getItemListData(keyword).then(res => {
				this.itemPopShow = true
				this.onItemLoading = false
				this.itemListStart += ITEM_SIZE
				if (res.goods.length < ITEM_SIZE) {
					this.itemListLoadFinished = true
				}
				this.itemList = res.goods
			})
		},
		onItemLoad (keyword = null) {
			this.getItemListData(keyword).then(res => {
				this.onItemLoading = false
				this.itemListStart += ITEM_SIZE
				if (res.goods.length < ITEM_SIZE) {
					this.itemListLoadFinished = true
				}
				this.itemList.push(...res.goods)
			})
		},
		getItemListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					start: this.itemListStart,
					size: ITEM_SIZE,
					paged: true,
					keyword: keyword
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/goods`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		// }}}
		// {{{品项大类
		onItemBigTypeClick () {
			this.onItemBigTypeRefresh()
		},
		searchItemBigType (keyword) {
			this.onItemBigTypeRefresh(keyword)
		},
		selectItemBigType (item) {
			this.itemBigType = item.name
			this.itemBigTypeId = item.id
			this.itemSmallType = '请选择'
			this.itemSmallTypeId = ''
		},
		onItemBigTypeRefresh (keyword = null) {
			this.itemBigTypeListStart = 0
			this.itemBigTypeListLoadFinished = false
			this.getItemBigTypeListData(keyword).then(res => {
				this.itemBigTypePopShow = true
				this.itemBigTypeLoading = false
				this.itemBigTypeListStart += ITEM_SIZE
				if (res.goodsTypes.length < ITEM_SIZE) {
					this.itemBigTypeListLoadFinished = true
				}
				this.itemBigTypeList = res.goodsTypes
			})
		},
		onItemBigTypeLoad (keyword = null) {
			this.getItemBigTypeListData(keyword).then(res => {
				this.itemBigTypeLoading = false
				this.itemBigTypeListStart += ITEM_SIZE
				if (res.goodsTypes.length < ITEM_SIZE) {
					this.itemBigTypeListLoadFinished = true
				}
				this.itemBigTypeList.push(...res.goodsTypes)
			})
		},
		getItemBigTypeListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					start: this.itemBigTypeListStart,
					size: ITEM_SIZE,
					paged: true,
					bigOrSmall: 1,
					keyword: keyword
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/goodTypes/report`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		// }}}
		// {{{品项小类
		onItemSmallTypeClick () {
			if (this.itemBigTypeId === '') {
				this.$fxToast.fail('请先选择品项大类!')
				return false
			}
			this.onItemSmallTypeRefresh()
		},
		searchItemSmallType (keyword) {
			this.onItemSmallTypeRefresh(keyword)
		},
		selectItemSmallType (item) {
			this.itemSmallType = item.name
			this.itemSmallTypeId = item.id
		},
		onItemSmallTypeRefresh (keyword = null) {
			this.itemSmallTypeListStart = 0
			this.itemSmallTypeListLoadFinished = false
			this.getItemSmallTypeListData(keyword).then(res => {
				this.itemSmallTypePopShow = true
				this.itemSmallTypeLoading = false
				this.itemSmallTypeListStart += ITEM_SIZE
				if (res.goodsTypes.length < ITEM_SIZE) {
					this.itemSmallTypeListLoadFinished = true
				}
				this.itemSmallTypeList = res.goodsTypes
			})
		},
		onItemSmallTypeLoad (keyword = null) {
			this.getItemSmallTypeListData(keyword).then(res => {
				this.itemSmallTypeLoading = false
				this.itemSmallTypeListStart += ITEM_SIZE
				if (res.goodsTypes.length < ITEM_SIZE) {
					this.itemSmallTypeListLoadFinished = true
				}
				this.itemSmallTypeList.push(...res.goodsTypes)
			})
		},
		getItemSmallTypeListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					start: this.itemSmallTypeListStart,
					size: ITEM_SIZE,
					paged: true,
					bigOrSmall: 2,
					goodsBigType: this.itemBigTypeId,
					keyword: keyword
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/goodTypes/report`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		// }}}

		// {{{品项类
		onItemTypeClick () {
			this.onItemTypeRefresh()
		},
		searchItemType (keyword) {
			this.onItemTypeRefresh(keyword)
		},
		selectItemType (item) {
			this.itemType = item.name
			this.itemTypeId = item.id
		},
		onItemTypeRefresh (keyword = null) {
			this.itemTypeListStart = 0
			this.itemTypeListLoadFinished = false
			this.getItemTypeListData(keyword).then(res => {
				this.itemTypePopShow = true
				this.itemTypeLoading = false
				this.itemTypeListStart += ITEM_SIZE
				if (res.goodsStyle.length < ITEM_SIZE) {
					this.itemTypeListLoadFinished = true
				}
				this.itemTypeList = res.goodsStyle
			})
		},
		onItemTypeLoad (keyword = null) {
			this.getItemTypeListData(keyword).then(res => {
				this.itemTypeLoading = false
				this.itemTypeListStart += ITEM_SIZE
				if (res.goodsStyle.length < ITEM_SIZE) {
					this.itemTypeListLoadFinished = true
				}
				this.itemTypeList.push(...res.goodsStyle)
			})
		},
		getItemTypeListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					start: this.itemTypeListStart,
					size: ITEM_SIZE,
					paged: true,
					keyword: keyword
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/goodsStyle/report`,
					data: params
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
.filter-popup {
	height:100%
	width: 100%
	text-align:left
	display: flex
	flex-direction: column
	.filter-content {
		flex:1
		overflow:scroll
		.info-item-value {
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}
	.filter-bottom {
		display: flex
		flex-direction: row
		width:100%
		.reset-btn,.confirm-btn {
			flex:1
		}
	}
}
</style>
