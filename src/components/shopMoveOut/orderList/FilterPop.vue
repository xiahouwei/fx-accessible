<template>
	<div class="filter-popup">
		<w-header title="筛选条件" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div ref="filterContent" class="filter-content">
			<van-cell-group>
				<van-cell title="业务日期"/>
				<van-cell title="起始时间" :value="beginDate" is-link @click="onBeginDateClick" />
				<van-cell title="结束时间" :value="endDate" is-link @click="endDateClick" />
				<van-cell title="调出机构" :value="outShop" value-class="info-item-value" is-link @click="onOutShopClick" />
				<van-cell title="调出仓库" :value="outStore" value-class="info-item-value" is-link @click="onOutStoreClick" />
				<van-cell title="调入机构" :value="inShop" value-class="info-item-value" is-link @click="onInShopClick" />
				<van-cell title="调入仓库" :value="inStore" value-class="info-item-value" is-link @click="onInStoreClick" />
				<van-cell title="品项" :value="item" value-class="info-item-value" is-link @click="onItemClick" />
				<van-field
					ref="billNo"
					v-model="billNo"
					label="系统单号"
					value-class="info-item-value"
					placeholder="请输入系统单号"
					input-align="right"
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
			v-model="outShopPopShow"
			title="调出机构检索"
			:rollingLoad="true"
			:getDataApi="getShopListData"
			@on-select="selectOutShop(arguments)"
		></filterListPopup>
		<van-popup v-model="outStorePopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="outStorePopShow"
				:data="outStoreList"
				:loadFinished="true"
				title="调出仓库检索"
				@on-search="searchOutStore"
				@on-select="selectOutStore"
			></listComp>
		</van-popup>
		<filterListPopup
			v-model="inShopPopShow"
			title="调入机构检索"
			:rollingLoad="true"
			:getDataApi="getShopListData"
			@on-select="selectInShop(arguments)"
		></filterListPopup>
		<van-popup v-model="inStorePopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="inStorePopShow"
				:data="inStoreList"
				:loadFinished="true"
				title="调入仓库检索"
				@on-search="searchInStore"
				@on-select="selectInStore"
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
			outShop: '请选择',
			outShopId: '',
			outStore: '请选择',
			outStoreId: '',
			inShop: '请选择',
			inShopId: '',
			inStore: '请选择',
			inStoreId: '',
			item: '请选择',
			itemId: '',
			billNo: '',
			datePickerShow: false,
			outShopPopShow: false,
			outStorePopShow: false,
			inShopPopShow: false,
			inStorePopShow: false,
			itemPopShow: false,
			outStoreList: [],
			inStoreList: [],
			itemList: [],
			itemListStart: 0,
			onItemLoading: false,
			itemListLoadFinished: false
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
				beginDate: this.beginDate || this.$fxCommon.orderFilterStartDate(),
				endDate: this.endDate || this.$fxCommon.orderFilterEndDate(),
				outShopId: this.outShopId,
				outStoreId: this.outStoreId,
				inShopId: this.inShopId,
				inStoreId: this.inStoreId,
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
			this.outShop = '请选择'
			this.outShopId = ''
			this.outStore = '请选择'
			this.outStoreId = ''
			this.inShop = '请选择'
			this.inShopId = ''
			this.inStore = '请选择'
			this.inStoreId = ''
			this.item = '请选择'
			this.itemId = ''
			this.billNo = ''
		},
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
		// {{{ 调出机构
		onOutShopClick () {
			this.outShopPopShow = true
		},
		selectOutShop ([item]) {
			this.outShop = item.name
			this.outShopId = item.id
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
		// {{{ 调入机构
		onInShopClick () {
			this.inShopPopShow = true
		},
		selectInShop ([item]) {
			this.inShop = item.name
			this.inShopId = item.id
		},
		// }}}
		// 调出仓库
		onOutStoreClick () {
			if (!this.outShopId) {
				this.$fxToast.fail('请先选择调出机构!')
				return false
			}
			this.onOutStoreRefresh()
		},
		searchOutStore (keyword) {
			this.onOutStoreRefresh(keyword)
		},
		selectOutStore (item) {
			this.outStore = item.name
			this.outStoreId = item.id
		},
		onOutStoreRefresh (keyword = null) {
			this.getOutStoreListData(keyword).then(res => {
				this.outStoreList = res.shops
				this.outStorePopShow = true
			})
		},
		getOutStoreListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					m: 'getAllHouseList',
					keyword: keyword
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.outShopId}/users/${this.loginerId}/houses`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		// }}}
		// {{{ 调入仓库
		onInStoreClick () {
			if (!this.inShopId) {
				this.$fxToast.fail('请先选择调入机构!')
				return false
			}
			this.onInStoreRefresh()
		},
		searchInStore (keyword) {
			this.onInStoreRefresh(keyword)
		},
		selectInStore (item) {
			this.inStore = item.name
			this.inStoreId = item.id
		},
		onInStoreRefresh (keyword = null) {
			this.getInStoreListData(keyword).then(res => {
				this.inStoreList = res.shops
				this.inStorePopShow = true
			})
		},
		getInStoreListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					m: 'getAllHouseList',
					keyword: keyword
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.inShopId}/users/${this.loginerId}/houses`,
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
