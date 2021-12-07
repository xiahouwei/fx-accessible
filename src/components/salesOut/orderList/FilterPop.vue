<template>
	<div class="filter-popup">
		<w-header title="筛选条件" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div ref="filterContent" class="filter-content">
			<van-cell-group>
				<van-cell title="业务日期"/>
				<van-cell title="起始时间" :value="beginDate" is-link @click="onBeginDateClick" />
				<van-cell title="结束时间" :value="endDate" is-link @click="endDateClick" />
				<van-cell title="机构" :value="inShop.name" value-class="info-item-value" is-link @click="onShopClick" />
				<van-cell title="发货仓库" :value="house.name" value-class="info-item-value" is-link @click="onHouseClick" />
				<van-cell title="客户" :value="customer.name" value-class="info-item-value" is-link @click="onCustomerClick" />
				<van-cell title="品项" :value="goods.name" value-class="info-item-value" is-link @click="onGoodsClick" />
				<!-- van-cell
					v-show="$fxSysAuth('distributionOutBill.seeBillType')"
					title="单据类型"
					:value="billType.name"
					value-class="info-item-value"
					@click="onBillTypeClick"
				>
					<van-icon
						slot="right-icon"
						:name="!billType.id ? 'arrow' : 'close'"
						class="item-clear-btn"
						@click.stop="!billType.id ? onBillTypeClick() : onBillTypeClearClick()"
					/>
				</van-cell -->
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
		<van-popup v-model="customerPopShow" position="right" class="fx-list-popup-300">
			<listComp
				:visibleFlag.sync="customerPopShow"
				:data="customerList"
				title="客户检索"
				:loading.sync="customerLoading"
				:loadFinished="customerLoadFinished"
				@on-select="selectCustomer"
				@on-search="searchCustomer"
				@on-load="loadCustomerList"
			></listComp>
		</van-popup>
		<filterListPopup
			v-model="shopPopShow"
			title="机构检索"
			:rollingLoad="true"
			:getDataApi="getShopListData"
			@on-select="selectShop(arguments)"
		></filterListPopup>
		<van-popup v-model="housePopShow" position="right" class="fx-list-popup-300">
			<listComp
				:visibleFlag.sync="housePopShow"
				:data="houseList"
				title="发货仓库检索"
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
		<!-- van-popup v-model="billTypePopShow" position="right" class="fx-list-popup-300">
			<listComp
				:visibleFlag.sync="billTypePopShow"
				:data="billTypeList"
				title="单据类型检索"
				:loadFinished="true"
				@on-select="selectBillType"
				@on-search="searchBillType"
			></listComp>
		</van-popup -->
	</div>
</template>

<script>
import { mapState } from 'vuex'
import listComp from '@/components/common/ListComp.vue'
import filterListPopup from '@/components/common/FilterListPopup.vue'
const ITEM_SIZE = 50
export default {
	name: 'FilterPop',
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
			currentDate: new Date(),
			datePickerShow: false,
			beginDate: this.$fxCommon.orderFilterStartDate(),
			endDate: this.$fxCommon.orderFilterEndDate(),
			inShop: {
				name: '请选择'
			},
			shopPopShow: false,
			house: {
				name: '请选择'
			},
			houseList: [],
			housePopShow: false,
			customer: {
				name: '请选择'
			},
			customerPopShow: false,
			customerList: [],
			customerListStart: 0,
			customerLoading: false,
			customerLoadFinished: false,
			goods: {
				name: '请选择'
			},
			goodsListStart: 0,
			goodsList: [],
			goodsLoading: false,
			goodsLoadFinished: false,
			goodsPopShow: false,
			searchGoodsKeyword: '',
			/* billType: {
				name: '请选择'
			},
			billTypeList: [],
			billTypePopShow: false, */
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
		onBeginDateClick () {
			this.datePickerShow = true
			if (this.beginDate) this.currentDate = new Date(this.beginDate)
			this.dateType = 'begin'
		},
		endDateClick () {
			this.datePickerShow = true
			if (this.endDate) this.currentDate = new Date(this.endDate)
			this.dateType = 'end'
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
		// {{{ 客户
		onCustomerClick () {
			this.customerListStart = 0
			this.searchCustomerKeyword = ''
			this.getCustomerListData().then(res => {
				this.customerLoading = false
				this.customerPopShow = true
				this.customerList = res.employeeDTOData
			})
		},
		searchCustomer (keyword) {
			this.customerListStart = 0
			this.searchCustomerKeyword = keyword
			this.getCustomerListData(keyword).then(res => {
				if (res.employeeDTOData.length < ITEM_SIZE) {
					this.customerLoadFinished = true
				}
				this.customerList = res.employeeDTOData
			})
		},
		loadCustomerList () {
			if (this.customerLoadFinished === true) {
				return
			}
			this.customerListStart = this.customerListStart + ITEM_SIZE
			this.getCustomerListData(this.searchCustomerKeyword).then(res => {
				this.customerLoading = false
				if (res.employeeDTOData.length < ITEM_SIZE) {
					this.customerLoadFinished = true
				}
				this.customerList.push(...res.employeeDTOData)
			})
		},
		selectCustomer (item) {
			this.customer = item
		},
		getCustomerListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					start: this.customerListStart,
					size: ITEM_SIZE,
					selAll: 'on',
					keyword: keyword
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/customer`,
					data: params
				}).then(res => {
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
			this.inShop = item
			this.house = {}
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
		onHouseClick () {
			if (!this.inShop.id) {
				this.$fxToast.fail('请先选择机构!')
				return false
			}
			this.getHouseListData().then(res => {
				this.houseList = res.shops
				this.housePopShow = true
			})
		},
		selectHouse (item) {
			this.house = item
		},
		searchHouse (keyword) {
			this.getHouseListData(keyword).then(res => {
				this.houseList = res.shops
			})
		},
		getHouseListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					m: 'list4ShopOrderBill',
					selAll: 'on',
					keyword: keyword
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.inShop.id}/users/${this.loginerId}/houses`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
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
			return new Promise(resolve => {
				let params = {
					start: this.goodsListStart,
					size: ITEM_SIZE,
					paged: true,
					m: 'list4ShopOrderBill',
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
		/*
		// {{{单据类型
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
			return new Promise(resolve => {
				let params = {
					m: 'list4DistributionOutListBill',
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
		onBillTypeClearClick () {
			this.billType = {
				name: '请选择',
				id: ''
			}
		}
		// }}}
		*/
		onResetClick () {
			this.resetHandler()
		},
		resetHandler () {
			this.beginDate = this.$fxCommon.orderFilterStartDate()
			this.endDate = this.$fxCommon.orderFilterEndDate()
			this.customer = {
				name: '请选择'
			}
			this.inShop = {
				name: '请选择'
			}
			this.house = {
				name: '请选择'
			}
			/* this.billType = {
				name: '请选择'
			} */
			this.goods = {
				name: '请选择'
			}
			this.billNo = ''
			this.customerListStart = 0
			this.goodsListStart = 0
			this.customerListStart = 0
			this.customerLoading = false
			this.customerLoadFinished = false
			this.goodsLoading = false
			this.goodsLoadFinished = false
			this.searchGoodsKeyword = ''
		},
		onConfirmClick () {
			this.$emit('update:visibleFlag', false)
			this.$emit('update:filterParams', this.getFilterParams())
			this.$emit('on-confirm', this.getFilterParams())
		},
		getFilterParams () {
			return {
				beginDate: this.beginDate || this.$fxCommon.orderFilterStartDate(),
				endDate: this.endDate || this.$fxCommon.orderFilterEndDate(),
				customerId: this.customer.id,
				inShopId: this.inShop.id,
				houseId: this.house.id,
				// billTypeId: this.billType.id,
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
