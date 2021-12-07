<template>
	<div class="filter-popup">
		<w-header title="筛选条件" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div ref="filterContent" class="filter-content">
			<van-cell-group>
				<van-cell title="业务日期"/>
				<van-cell title="起始时间" :value="beginDate" is-link @click="onBeginDateClick" />
				<van-cell title="结束时间" :value="endDate" is-link @click="endDateClick" />
				<van-cell title="供货商" :value="supplier" value-class="info-item-value" is-link @click="onSupplierClick" />
				<van-cell title="退货机构" :value="shop" value-class="info-item-value" is-link @click="onShopClick" />
				<van-cell title="退货仓库" :value="store" value-class="info-item-value" is-link @click="onStoreClick" />
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
			<w-date-picker
				:visibleFlag.sync="datePickerShow"
				:currentDate="currentDate"
				@confirm="dateConfirmhandle"
			></w-date-picker>
		</van-popup>
		<filterListPopup
			v-model="shopPopShow"
			title="采购机构检索"
			:rollingLoad="true"
			:getDataApi="getShopListData"
			@on-select="selectShop(arguments)"
		></filterListPopup>
		<filterListPopup
			v-model="supplierPopShow"
			title="供货商检索"
			:rollingLoad="true"
			:getDataApi="getSupplierListData"
			@on-select="selectSupplier(arguments)"
		></filterListPopup>
		<filterListPopup
			v-model="storePopShow"
			title="仓库检索"
			:rollingLoad="true"
			:getDataApi="getStoreListData"
			@on-select="selectStore(arguments)"
		></filterListPopup>
		<filterListPopup
			v-model="itemPopShow"
			title="品项检索"
			:rollingLoad="true"
			:getDataApi="getItemListData"
			@on-select="selectItem(arguments)"
		></filterListPopup>
		<filterListPopup
			v-model="billTypePopShow"
			title="单据类型检索"
			:rollingLoad="true"
			:getDataApi="getBillType"
			@on-select="selectBillType(arguments)"
		></filterListPopup>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import filterListPopup from '@/components/common/FilterListPopup.vue'
export default {
	name: 'filterPop',
	components: {
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
			shop: '请选择',
			shopId: '',
			supplier: '请选择',
			supplierId: '',
			supplierList: [],
			supplierPopShow: false,
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
				supplierId: this.supplierId,
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
			this.shop = '请选择'
			this.shopId = ''
			this.supplier = '请选择'
			this.supplierId = ''
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
				size: size
			}
			return this.$fxApi('z5common.getUserManageShop')({ data: params }).then(res => {
				return res.shops
			})
		},
		// }}}
		// {{{ 供货商
		onSupplierClick () {
			this.supplierPopShow = true
		},
		selectSupplier ([item]) {
			this.supplier = item.name
			this.supplierId = item.id
		},
		getSupplierListData (keyword = null, start, size) {
			let params = {
				paged: true,
				keyword: keyword,
				start: start,
				size: size
			}
			return this.$fxApi('z5common.getSuppliers')({ data: params }).then(res => {
				return res.suppliers
			})
		},
		// }}}
		// {{{ 仓库
		onStoreClick () {
			if (!this.shopId) {
				this.$fxToast.fail('请先选择机构!')
				return false
			} else {
				this.storePopShow = true
			}
		},
		selectStore ([item]) {
			this.store = item.name
			this.storeId = item.id
		},
		getStoreListData (keyword = null, start, size) {
			let params = {
				paged: true,
				keyword: keyword,
				start: start,
				size: size
			}
			return this.$fxApi('z5common.getGoodsByShop', this.shopId)({ data: params }).then(res => {
				return res.shops
			})
		},
		// }}}
		// {{{品项
		onItemClick () {
			this.itemPopShow = true
		},
		selectItem ([item]) {
			this.item = item.name
			this.itemId = item.id
		},
		getItemListData (keyword = null, start, size) {
			let params = {
				paged: true,
				keyword: keyword,
				start: start,
				size: size
			}
			return this.$fxApi('z5common.getGoods')({ data: params }).then(res => {
				return res.goods
			})
		},
		// }}}
		// 单据类型 {{{
		onBillTypeClick () {
			this.billTypePopShow = true
		},
		selectBillType ([item]) {
			this.billType = item.name
			this.billTypeId = item.id
		},
		getBillType (keyword = null, start, size) {
			let params = {
				billType: '21',
				keyword: keyword,
				start: start,
				size: size
			}
			return this.$fxApi('z5common.getBusinessTypes')({ data: params }).then(res => {
				return res.businessTypes
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
