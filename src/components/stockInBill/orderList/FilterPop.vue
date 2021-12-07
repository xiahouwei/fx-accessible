<template>
	<div class="filter-popup">
		<w-header title="筛选条件" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div ref="filterContent" class="filter-content">
			<van-cell-group>
				<van-cell title="业务日期"/>
				<van-cell title="起始时间" :value="beginDate" is-link @click="onBeginDateClick" />
				<van-cell title="结束时间" :value="endDate" is-link @click="endDateClick" />
				<van-cell title="供货商" :value="supplier" value-class="info-item-value" is-link @click="onSupplierClick" />
				<van-cell title="入库机构" :value="shop" value-class="info-item-value" is-link @click="onShopClick" />
				<van-cell title="仓库" :value="store" value-class="info-item-value" is-link @click="onStoreClick" />
				<van-cell title="品项" :value="item" value-class="info-item-value" is-link @click="onItemClick" />
				<van-cell
					title="单据类型"
					:value="billType"
					value-class="info-item-value"
					@click="onBillTypeClick"
				>
					<van-icon
						slot="right-icon"
						:name="!billTypeId ? 'arrow' : 'close'"
						class="item-clear-btn"
						@click.stop="!billTypeId ? onBillTypeClick() : onBillTypeClearClick()"
					/>
				</van-cell>
				<van-field
					ref="billNo"
					v-model="billNo"
					label="系统单号"
					value-class="info-item-value"
					placeholder="请输入系统单号"
					input-align="right"
					@focus="onFocus('billNo')"
				/>
			</van-cell-group>
		</div>
		<div class="filter-bottom">
			<van-button class="reset-btn fx-no-radius" type="info" @click="onResetClick">重置</van-button>
			<van-button class="confirm-btn fx-no-radius" type="primary" @click="onConfirmClick">确定</van-button>
		</div>
		<van-popup v-model="datePickerShow" position="bottom">
			<w-date-picker :visibleFlag.sync="datePickerShow" :currentDate="currentDate" @confirm="dateConfirmhandle"></w-date-picker>
		</van-popup>
		<van-popup v-model="supplierPopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="supplierPopShow"
				:data="supplierList"
				:loadFinished="supplierListLoadFinished"
				:loading.sync="onSupplierLoading"
				title="供货商检索"
				@on-search="searchSupplier"
				@on-select="selectSupplier"
				@on-load="onSupplierLoad"
			></listComp>
		</van-popup>
		<filterListPopup
			v-model="shopPopShow"
			title="机构检索"
			:rollingLoad="true"
			:getDataApi="getShopListData"
			@on-select="selectShop(arguments)"
		></filterListPopup>
		<van-popup v-model="storePopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="storePopShow"
				:data="storeList"
				:loadFinished="true"
				title="仓库检索"
				@on-search="searchStore"
				@on-select="selectStore"
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
		<van-popup v-model="billTypePopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="billTypePopShow"
				:data="billTypeList"
				:loadFinished="true"
				title="单据类型检索"
				@on-search="searchBillType"
				@on-select="selectBillType"
			></listComp>
		</van-popup>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import listComp from '@/components/common/ListComp.vue'
import filterListPopup from '@/components/common/FilterListPopup.vue'
const ITEM_SIZE = 50
export default {
	name: 'filterPop',
	components: {
		listComp,
		filterListPopup
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
			supplierListStart: 0,
			supplierListLoadFinished: false,
			onSupplierLoading: false,
			supplierPopShow: false,
			supplierList: [],
			supplierKeyword: null,
			supplier: '请选择',
			supplierId: '',
			shopPopShow: false,
			shop: '请选择',
			shopId: '',
			storeListStart: 0,
			storeListLoadFinished: false,
			onStoreLoading: false,
			storePopShow: false,
			storeList: [],
			storeKeyword: null,
			store: '请选择',
			storeId: '',
			itemListStart: 0,
			itemListLoadFinished: false,
			onItemLoading: false,
			itemPopShow: false,
			itemList: [],
			itemKeyword: null,
			item: '请选择',
			itemId: '',
			billTypeListStart: 0,
			billTypeListLoadFinished: false,
			onBillTypeLoading: false,
			billTypePopShow: false,
			billTypeList: [],
			billTypeKeyword: null,
			billType: '请选择',
			billTypeId: '',
			billNo: '',
			datePickerShow: false,
			currentDate: new Date(),
			beginDate: this.$fxCommon.orderFilterStartDate(),
			endDate: this.$fxCommon.orderFilterEndDate(),
			dateType: ''
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
		onCloseClick () {
			this.$emit('update:visibleFlag', false)
		},
		onConfirmClick () {
			this.$emit('update:visibleFlag', false)
			this.$emit('on-confirm', this.getFilterParams())
			this.$emit('update:filterParams', this.getFilterParams())
		},
		getFilterParams () {
			return {
				beginDate: this.beginDate || this.$fxCommon.orderFilterStartDate(),
				endDate: this.endDate || this.$fxCommon.orderFilterEndDate(),
				supplierId: this.supplierId,
				shopId: this.shopId,
				storeId: this.storeId,
				itemId: this.itemId,
				billTypeId: this.billTypeId,
				billNo: this.billNo
			}
		},
		onResetClick () {
			this.resetHandler()
		},
		resetHandler () {
			this.beginDate = this.$fxCommon.orderFilterStartDate()
			this.endDate = this.$fxCommon.orderFilterEndDate()
			this.supplier = '请选择'
			this.supplierId = ''
			this.supplierKeyword = null
			this.shop = '请选择'
			this.shopId = ''
			this.store = '请选择'
			this.storeId = ''
			this.storeKeyword = null
			this.item = '请选择'
			this.itemId = ''
			this.itemKeyword = null
			this.billType = '请选择'
			this.billTypeId = ''
			this.billTypeKeyword = null
			this.billNo = ''
		},
		// {{{供货商
		onSupplierClick () {
			this.supplierKeyword = null
			this.supplierListLoadFinished = false
			this.onSupplierRefresh()
		},
		searchSupplier (keyword) {
			this.supplierKeyword = keyword
			this.onSupplierRefresh()
		},
		selectSupplier (item) {
			this.supplier = item.name
			this.supplierId = item.id
		},
		onSupplierLoad () {
			this.getSupplierListData().then(res => {
				this.supplierList.push(...res.suppliers)
			})
		},
		onSupplierRefresh () {
			this.supplierListStart = 0
			this.getSupplierListData().then(res => {
				this.supplierPopShow = true
				this.supplierList = res.suppliers
			})
		},
		getSupplierListData () {
			return new Promise(resolve => {
				let params = {
					start: this.supplierListStart,
					size: ITEM_SIZE,
					keyword: this.supplierKeyword
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/suppliers`,
					data: params
				}).then(res => {
					this.onSupplierLoading = false
					this.supplierListStart += ITEM_SIZE
					if (res.suppliers.length < ITEM_SIZE) {
						this.supplierListLoadFinished = true
					} else {
						this.supplierListLoadFinished = false
					}
					resolve(res)
				})
			})
		},
		// }}}
		// {{{机构
		onShopClick () {
			this.shopPopShow = true
		},
		selectShop ([item]) {
			this.shop = item.name
			this.shopId = item.id
		},
		getShopListData (keyword = null, start, size) {
			let params = {
				keyword: keyword,
				start: start,
				size: size
			}
			return this.$fxApi('z5common.getUserManageShop')({ data: params }).then(res => {
				return res.shops
			})
		},
		// }}}
		// {{{仓库
		onStoreClick () {
			this.onStoreRefresh()
		},
		searchStore (keyword) {
			this.storeKeyword = keyword
			this.onStoreRefresh()
		},
		selectStore (item) {
			this.store = item.name
			this.storeId = item.id
		},
		onStoreLoad () {
			this.getStoreListData().then(res => {
				this.onStoreLoading = false
				this.storeListStart += ITEM_SIZE
				if (res.shops.length < ITEM_SIZE) {
					this.storeListLoadFinished = true
				}
				this.storeList.push(...res.shops)
			})
		},
		onStoreRefresh () {
			this.storeListStart = 0
			this.storeListLoadFinished = false
			this.getStoreListData().then(res => {
				this.onStoreLoading = false
				this.storePopShow = true
				this.storeListStart += ITEM_SIZE
				if (res.shops.length < ITEM_SIZE) {
					this.storeListLoadFinished = true
				}
				this.storeList = res.shops
			})
		},
		getStoreListData () {
			return new Promise(resolve => {
				if (!this.shopId) {
					this.$fxToast.fail('请选择入库机构！')
					return false
				}
				let params = {
					start: this.storeListStart,
					size: ITEM_SIZE,
					keyword: this.storeKeyword
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
		// {{{品项
		onItemClick () {
			this.itemKeyword = null
			this.onItemRefresh()
		},
		searchItem (keyword) {
			this.itemKeyword = keyword
			this.onItemRefresh(keyword)
		},
		selectItem (item) {
			this.item = item.name
			this.itemId = item.id
		},
		onItemRefresh () {
			this.itemListStart = 0
			this.getItemListData().then(res => {
				this.itemPopShow = true
				this.itemList = res.goods
			})
		},
		onItemLoad () {
			this.getItemListData().then(res => {
				this.itemList.push(...res.goods)
			})
		},
		getItemListData () {
			return new Promise(resolve => {
				let params = {
					start: this.itemListStart,
					size: ITEM_SIZE,
					paged: true,
					keyword: this.itemKeyword
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/goods`,
					data: params
				}).then(res => {
					this.onItemLoading = false
					this.itemListStart += ITEM_SIZE
					if (res.goods.length < ITEM_SIZE) {
						this.itemListLoadFinished = true
					} else {
						this.itemListLoadFinished = false
					}
					resolve(res)
				})
			})
		},
		// }}}
		// {{{单据类型
		onBillTypeClick () {
			this.onBillTypeRefresh()
		},
		searchBillType (keyword) {
			this.billTypeKeyword = keyword
			this.onBillTypeRefresh()
		},
		selectBillType (item) {
			this.billType = item.name
			this.billTypeId = item.id
		},
		onBillTypeLoad () {
			this.getBillTypeListData().then(res => {
				this.onBillTypeLoading = false
				this.billTypeListStart += ITEM_SIZE
				if (res.billTypes.length < ITEM_SIZE) {
					this.billTypeListLoadFinished = true
				}
				this.billTypeList.push(...res.billTypes)
			})
		},
		onBillTypeRefresh () {
			this.billTypeListStart = 0
			this.billTypeListLoadFinished = false
			this.getBillTypeListData().then(res => {
				this.onBillTypeLoading = false
				this.billTypePopShow = true
				this.billTypeListStart += ITEM_SIZE
				if (res.businessTypes.length < ITEM_SIZE) {
					this.billTypeListLoadFinished = true
				}
				this.billTypeList = res.businessTypes
			})
		},
		getBillTypeListData () {
			return new Promise(resolve => {
				let params = {
					start: this.billTypeListStart,
					size: ITEM_SIZE,
					m: 'list4ShopStockInBillQuery',
					keyword: this.billTypeKeyword
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/businessTypes`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		// }}}
		// {{{业务日期
		onBeginDateClick () {
			this.dateType = 'begin'
			if (this.beginDate) this.currentDate = new Date(this.beginDate)
			this.datePickerShow = true
		},
		endDateClick () {
			this.dateType = 'end'
			if (this.endDate) this.currentDate = new Date(this.endDate)
			this.datePickerShow = true
		},
		dateConfirmhandle (date) {
			if (this.dateType === 'begin') {
				this.beginDate = this.$fxUtils.setDateTime(date, '时分')
				if (!this.endDate || !this.$fxCommon.orderFilterRangeDate(this.beginDate, this.endDate)) {
					this.endDate = this.$fxCommon.orderFilterDate(date)
				}
			} else {
				this.endDate = this.$fxUtils.setDateTime(date, '时分')
				if (!this.beginDate || !this.$fxCommon.orderFilterRangeDate(this.beginDate, this.endDate)) {
					this.beginDate = this.$fxCommon.orderFilterStartDate(date)
				}
			}
			this.datePickerShow = false
		},
		// }}}
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
			this.billType = '请选择'
			this.billTypeId = ''
		}
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
		.item-clear-btn {
			width:16px
			height:24px
			line-height:24px
			margin-left:5px
			color: $fxGraylight
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
