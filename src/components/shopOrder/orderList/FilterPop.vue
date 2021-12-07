<template>
	<div class="filter-popup">
		<w-header title="筛选条件" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div ref="filterContent" class="filter-content">
			<van-cell-group>
				<van-cell title="业务日期" class="fx-van-cell" />
				<van-cell title="起始时间" :value="beginDate" is-link @click="onBeginDateClick" class="fx-van-cell" />
				<van-cell title="结束时间" :value="endDate" is-link @click="onEndDateClick" class="fx-van-cell" />
				<van-cell title="到货日期" class="fx-van-cell" />
				<van-cell title="起始时间" :value="arriveBeginDate" is-link @click="onArriveBeginDateClick" class="fx-van-cell" />
				<van-cell title="结束时间" :value="arriveEndDate" is-link @click="onArriveEndDateClick" class="fx-van-cell" />
				<van-cell title="门店" :value="shop" value-class="info-item-value" is-link @click="onShopClick" class="fx-van-cell" />
				<van-cell title="仓库" :value="store" value-class="info-item-value" is-link @click="onStoreClick" class="fx-van-cell" />
				<van-cell title="品项" :value="item" value-class="info-item-value" is-link @click="onItemClick" class="fx-van-cell" />
				<van-cell
					title="单据类型"
					:value="billType"
					value-class="info-item-value"
					@click="onBillTypeClick"
					class="fx-van-cell"
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
					class="fx-van-cell"
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
			<w-date-picker
				:visibleFlag.sync="datePickerShow"
				:currentDate="currentDate"
				@confirm="dateConfirmhandle"
			></w-date-picker>
		</van-popup>
		<filterListPopup
			v-model="shopPopShow"
			title="门店检索"
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
			dateType: '',
			currentDate: new Date(),
			beginDate: this.$fxCommon.orderFilterStartDate(),
			endDate: this.$fxCommon.orderFilterEndDate(),
			arriveBeginDate: '',
			arriveEndDate: '',
			shop: '请选择',
			shopId: '',
			store: '请选择',
			storeId: '',
			item: '请选择',
			itemId: '',
			billType: '请选择',
			billTypeId: '',
			billNo: '',
			datePickerShow: false,
			shopPopShow: false,
			storePopShow: false,
			itemPopShow: false,
			billTypePopShow: false,
			storeList: [],
			itemList: [],
			billTypeList: [],
			itemListStart: 0,
			onItemLoading: false,
			itemListLoadFinished: false
		}
	},
	watch: {
		visibleFlag: {
			handler (val) {
				this.datePickerShow = false
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
				beginDate: this.beginDate || this.$fxCommon.orderFilterStartDate(),
				endDate: this.endDate || this.$fxCommon.orderFilterEndDate(),
				arriveBeginDate: this.arriveBeginDate || '',
				arriveEndDate: this.arriveEndDate || '',
				shopId: this.shopId,
				storeId: this.storeId,
				billTypeId: this.billTypeId,
				itemId: this.itemId,
				billNo: this.billNo
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
			this.beginDate = this.$fxCommon.orderFilterStartDate()
			this.endDate = this.$fxCommon.orderFilterEndDate()
			this.arriveBeginDate = ''
			this.arriveEndDate = ''
			this.shop = '请选择'
			this.shopId = ''
			this.store = '请选择'
			this.storeId = ''
			this.billType = '请选择'
			this.billTypeId = ''
			this.item = '请选择'
			this.itemId = ''
			this.billNo = ''
		},
		onBeginDateClick () {
			this.dateType = 'begin'
			if (this.beginDate) this.currentDate = new Date(this.beginDate)
			this.datePickerShow = true
		},
		onEndDateClick () {
			this.dateType = 'end'
			if (this.endDate) this.currentDate = new Date(this.endDate)
			this.datePickerShow = true
		},
		onArriveBeginDateClick () {
			this.dateType = 'arriveBegin'
			if (this.arriveBeginDate) this.currentDate = new Date(this.arriveBeginDate)
			this.datePickerShow = true
		},
		onArriveEndDateClick () {
			this.dateType = 'arriveEnd'
			if (this.arriveEndDate) this.currentDate = new Date(this.arriveEndDate)
			this.datePickerShow = true
		},
		dateConfirmhandle (date) {
			if (this.dateType === 'begin') {
				this.beginDate = this.$fxUtils.setDateTime(date, '时分')
				if (!this.endDate || !this.$fxCommon.orderFilterRangeDate(this.beginDate, this.endDate)) {
					this.endDate = this.$fxCommon.orderFilterDate(date)
				}
			} else if (this.dateType === 'end') {
				this.endDate = this.$fxUtils.setDateTime(date, '时分')
				if (!this.beginDate || !this.$fxCommon.orderFilterRangeDate(this.beginDate, this.endDate)) {
					this.beginDate = this.$fxCommon.orderFilterStartDate(date)
				}
			} else if (this.dateType === 'arriveBegin') {
				this.arriveBeginDate = this.$fxUtils.setDateTime(date, '时分')
				if (!this.arriveEndDate || !this.$fxCommon.orderFilterRangeDate(this.arriveBeginDate, this.arriveEndDate)) {
					this.arriveEndDate = this.$fxCommon.orderFilterDate(date)
				}
			} else if (this.dateType === 'arriveEnd') {
				this.arriveEndDate = this.$fxUtils.setDateTime(date, '时分')
				if (!this.arriveBeginDate || !this.$fxCommon.orderFilterRangeDate(this.arriveBeginDate, this.arriveEndDate)) {
					this.arriveBeginDate = this.$fxCommon.orderFilterStartDate(date)
				}
			}
			this.datePickerShow = false
		},
		// {{{ 门店
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
				size: size,
				orgFlag: 0
			}
			return this.$fxApi('z5common.getUserManageShop')({ data: params }).then(res => {
				return res.shops
			})
		},
		// }}}
		// {{{ 仓库
		onStoreClick () {
			if (!this.shopId) {
				this.$fxToast.fail('请先选择门店!')
				return false
			}
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
			this.getStoreListData(keyword).then(res => {
				this.storeList = res.shops
				this.storePopShow = true
			})
		},
		getStoreListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					keyword: keyword
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
			this.getItemListData(keyword).then(res => {
				this.itemPopShow = true
				this.onItemLoading = false
				this.itemListStart += ITEM_SIZE
				this.itemListLoadFinished = res.goods.length < ITEM_SIZE
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
		// 单据类型 {{{
		onBillTypeClick () {
			this.onBillTypeRefresh()
		},
		searchBillType (keyword) {
			this.onBillTypeRefresh(keyword)
		},
		selectBillType (item) {
			this.billType = item.name
			this.billTypeId = item.id
		},
		onBillTypeRefresh (keyword = null) {
			this.getBillTypeListData(keyword).then(res => {
				this.billTypeList = res.businessTypes
				this.billTypePopShow = true
			})
		},
		getBillTypeListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					m: 'list4ShopOrderBill',
					keyword: keyword
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
