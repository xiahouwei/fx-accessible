<template>
	<div class="inteledi-shopOrder-details">
		<w-header :title="orderInfoData.sysbillCode" titleFontSize="3.733vw" :border="true"></w-header>
		<orderInfo
			ref="orderInfo"
			:data="orderInfoData"
			:isDisabled="isBillState(1) || !$fxAuth('stockApplyBill.save')"
			:collapseDisabled="itemInputFocusing"
			@on-shop-click="onShopClick"
			@on-busdate-click="onBusinessDateClick"
			@on-arriveDate-click="onArriveDateClick"
			@on-billType-click="onBillTypeClick"
			@on-item-clear="onItemClear"
			@on-billType-clear="onBillTypeClear"
		></orderInfo>
		<orderItem
			ref="orderItem"
			:data="orderItemList"
			:isDisabled="isBillState(1) || !$fxAuth('stockApplyBill.save')"
			:itemInputFocusing.sync="itemInputFocusing"
			:shopId="orderInfoData.shopDTO && orderInfoData.shopDTO.id"
			@on-search-click="onSearchClick"
			@on-add-click="onAddClick"
			@on-item-edit="onItemEdit"
			@on-unit-edit="onUnitEdit"
			@on-item-focus="onItemFocus"
		></orderItem>
		<div class="shopOrder-bottom">
			<van-button
				v-show="isBillState(0) && $fxAuth('stockApplyBill.del')"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onClickHandler('onDeleteClick')"
			>删除</van-button>
			<van-button
				v-show="$fxAuth('stockApplyBill.copy')"
				class="bottom-btn fx-no-radius"
				type="primary"
				@click="onClickHandler('onCopyClick')"
			>复制</van-button>
			<van-button
				v-show="isBillState(1) && $fxAuth('stockApplyBill.reduce')"
				class="bottom-btn fx-no-radius minus-btn"
				type="primary"
				@click="onClickHandler('onMinusClick')"
			>减单</van-button>
			<van-button
				v-show="isBillState(0) && $fxAuth('stockApplyBill.check')"
				class="bottom-btn fx-no-radius"
				type="info"
				@click="onClickHandler('onExpressClick')"
			>审核</van-button>
			<van-button
				v-show="isBillState(1) && $fxAuth('stockApplyBill.unCheck')"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onClickHandler('onUnExpressClick')"
			>反审</van-button>
			<van-button
				v-show="isBillState(0) && $fxAuth('stockApplyBill.save')"
				class="bottom-btn fx-no-radius"
				type="primary"
				@click="onClickHandler('onSaveClick')"
			>保存</van-button>
		</div>
		<filterListPopup
			v-model="shopPopShow"
			title="请选择申请机构"
			:rollingLoad="true"
			:getDataApi="getShopListData"
			@on-select="selectShop(arguments)"
		></filterListPopup>
		<van-popup v-model="datePickerShow" position="bottom">
			<w-date-picker
				:visibleFlag.sync="datePickerShow"
				:currentDate="currentDate"
				@confirm="dateConfirmhandle"
			></w-date-picker>
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
		<van-popup
			v-model="itemStorePopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<storeItemComp
				:visibleFlag.sync="itemStorePopShow"
				:storeItemData="storeItem"
				:shopId="orderInfoData.shopDTO && orderInfoData.shopDTO.id"
				:businessDate="orderInfoData.businessDate"
				@on-save="onStoreItemSave"
			></storeItemComp>
		</van-popup>
		<van-actionsheet
			v-model="unitActionShow"
			:actions="unitActions"
			cancel-text="取消"
			@select="onUnitSelect"
		/>
		<van-popup
			v-model="itemRowEditPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<itemRowEditPop
				:visibleFlag.sync="itemRowEditPopShow"
				:itemData="itemEditRowData"
				:isDisabled="isBillState(1) || !$fxAuth('stockApplyBill.save')"
				:reduceFlag="orderInfoData.reduce && orderInfoData.reduce.length ? true : false"
				@on-Confirm="onEditRowConfirm"
			></itemRowEditPop>
		</van-popup>
		<van-popup
			v-model="itemSearchPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<itemSearchPop
				:visibleFlag.sync="itemSearchPopShow"
				:data="searchItem"
				:isDisabled="isBillState(1) || !$fxAuth('stockApplyBill.save')"
				@on-search-confirm="onSearchConfirm"
			></itemSearchPop>
		</van-popup>
		<van-popup
			v-model="minusPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<minusPop
				:visibleFlag.sync="minusPopShow"
				:minusData="minusData"
				:isDisabled="isBillState(1) || !$fxAuth('stockApplyBill.reduce')"
				@on-confirm="onMinusConfirm"
			></minusPop>
		</van-popup>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import orderInfo from '@/components/stockApply/createOrder/OrderInfo.vue'
import orderItem from '@/components/stockApply/createOrder/OrderItem.vue'
import listComp from '@/components/common/ListComp.vue'
import storeItemComp from '@/components/stockApply/common/StoreItemComp.vue'
import itemRowEditPop from '@/components/stockApply/common/ItemRowEditPop.vue'
import itemSearchPop from '@/components/stockApply/common/itemSearchPop.vue'
import minusPop from '@/components/stockApply/minusBill/MinusPop.vue'
import filterListPopup from '@/components/common/FilterListPopup.vue'
export default {
	name: 'stockApplyOrderDetails',
	components: {
		orderInfo,
		orderItem,
		listComp,
		storeItemComp,
		itemRowEditPop,
		itemSearchPop,
		minusPop,
		filterListPopup
	},
	data () {
		return {
			query: this.$route.query,
			activeNames: ['1'],
			tabActive: '选项1',
			orderInfoData: {},
			orderItemList: [],
			dateType: 'business',
			currentDate: new Date(),
			shopPopShow: false,
			shopList: [],
			datePickerShow: false,
			billTypePopShow: false,
			billTypeList: [],
			itemStorePopShow: false,
			storeItem: [],
			itemRowEditPopShow: false,
			itemEditRowData: {},
			unitActions: [],
			unitActionShow: false,
			itemInputFocusing: false,
			orderDeleteFlag: false,
			formatterSysPointKey: ['busUnitAmount', 'originalAmount', 'reduceAmount'],
			itemSearchPopShow: false,
			searchItem: [],
			minusPopShow: false,
			minusData: {}
		}
	},
	created () {
		this.createOrderDetails()
	},
	beforeRouteLeave (to, from, next) {
		if (this.itemInputFocusing) {
			this.$router.go(1)
			return false
		}
		if (to.path === '/stockApply' && !this.orderDeleteFlag && this.orderInfoData.billState === 0) {
			this.$dialog.confirm({
				title: '提示',
				message: '若已修改,请先保存单据<br/>是否关闭页面?'
			}).then(() => {
				next()
			}).catch(() => {
				this.$router.go(1)
				return false
			})
		} else {
			next()
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize',
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId
		}),
		isBillState (state) {
			return state => {
				if (Object.prototype.toString.call(state) === '[object Array]') {
					return state.includes(this.orderInfoData.billState)
				} else {
					return this.orderInfoData.billState === state
				}
			}
		}
	},
	methods: {
		createOrderDetails () {
			return new Promise(resolve => {
				this.getOrderDetails().then(res => {
					let orderDetailsData = res.stockApplyBills[0]
					this.formatterSysPoint(orderDetailsData.details)
					this.orderInfoData = orderDetailsData
					this.orderItemList = this.filterStoreItem(orderDetailsData.details)
					resolve()
				})
			})
		},
		getOrderDetails () {
			return new Promise(resolve => {
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/stockApplies/${this.query.orderId}`
				}).then(res => {
					resolve(res)
				})
			})
		},
		formatterSysPoint (data) {
			let toFixedNumberSize = (data) => {
				return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysPointSize))
			}
			data.forEach(item => {
				this.formatterSysPointKey.forEach(pointItem => {
					item[pointItem] = toFixedNumberSize(item[pointItem])
				})
			})
		},
		filterStoreItem (data) {
			let stores = Array.from(new Set(data.map(item => {
				return item.houseDTO.id
			})))
			let StoreItem = stores.map(item => {
				let storeObj = data.find(dataItem => {
					return dataItem.houseDTO.id === item
				}).houseDTO
				storeObj = JSON.parse(JSON.stringify(storeObj))
				storeObj.details = data.filter(dataItem => {
					return dataItem.houseDTO.id === item
				})
				return storeObj
			})
			return StoreItem
		},
		clearItemConfim (message) {
			return new Promise(resolve => {
				let items = this.orderItemList.filter(item => {
					let details = item.details.filter(details => {
						return details.changeType !== 'del'
					})
					if (details.length === 0) {
						return false
					} else {
						return true
					}
				})
				if (items.length === 0) {
					resolve()
				} else {
					this.$dialog.confirm({
						title: '提示',
						message: message
					}).then(() => {
						this.onItemClear()
						resolve()
					}).catch(() => {
					})
				}
			})
		},
		// {{{ 门店
		onShopClick () {
			this.shopPopShow = true
		},
		selectShop ([item]) {
			this.checkShop(item).then(() => {
				this.clearItemConfim('更换申请机构会清空品项,是否继续?').then(() => {
					this.orderInfoData.shopDTO = item
				})
			})
		},
		checkShop (shopDTO) {
			return new Promise(resolve => {
				let currentInShopDTO = this.orderInfoData.shopDTO
				if (currentInShopDTO.id !== shopDTO.id) {
					resolve()
				}
			})
		},
		getShopListData (keyword = null, start, size) {
			let params = {
				keyword: keyword,
				start: start,
				size: size
			}
			return this.$fxApi('z5common.list4ShopOtherOrderBill4Edit')({ data: params }).then(res => {
				return res.shops
			})
		},
		// }}}
		// {{{ 单据类型
		onBillTypeClick () {
			this.onBillTYpeRefresh()
		},
		searchBillType (keyword) {
			this.onBillTYpeRefresh(keyword)
		},
		selectBillType (item) {
			this.orderInfoData.businessTypeDTO = item
		},
		onBillTypeClear () {
			this.orderInfoData.businessTypeDTO = {}
		},
		onBillTYpeRefresh (keyword = null) {
			this.getBillTypeListData(keyword).then(res => {
				this.billTypeList = res.businessTypes
				this.billTypePopShow = true
			})
		},
		getBillTypeListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					m: 'list4StockApplyListBill',
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
		// {{{更换时间
		onBusinessDateClick () {
			this.dateType = 'business'
			if (this.orderInfoData.businessDate) this.currentDate = new Date(this.orderInfoData.businessDate)
			this.datePickerShow = true
		},
		onArriveDateClick () {
			this.dateType = 'arrive'
			if (this.orderInfoData.arriveDate) this.currentDate = new Date(this.orderInfoData.arriveDate)
			this.datePickerShow = true
		},
		dateConfirmhandle (date) {
			let time = date.getTime()
			if (this.dateType === 'business') {
				this.orderInfoData.businessDate = time
			} else {
				this.orderInfoData.arriveDate = time
			}
			this.datePickerShow = false
		},
		// }}}
		// {{{切换单位
		onUnitEdit (item) {
			this.itemEditRowData = item
			this.getItemUnit(item.goodsDTO.id).then(res => {
				this.unitActions = res
				this.unitActionShow = true
			})
		},
		onUnitSelect (unit) {
			this.unitActionShow = false
			let item = this.itemEditRowData
			// 设置单位
			item.unitDTO = unit
		},
		getItemUnit (goodsId) {
			return new Promise(resolve => {
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/goods/${goodsId}/units`
				}).then(res => {
					resolve(res.units)
				})
			})
		},
		// }}}
		onAddClick () {
			this.checkOrderInfo().then(() => {
				this.storeItem = JSON.parse(JSON.stringify(this.orderItemList))
				this.itemStorePopShow = true
			})
		},
		checkOrderInfo () {
			return new Promise((resolve, reject) => {
				if (!this.orderInfoData.businessDate) {
					this.$toast.fail('请先选择业务日期!')
				} else if (!this.orderInfoData.shopDTO.id) {
					this.$fxToast.fail('请先选择申请机构!')
				} else {
					resolve()
				}
			})
		},
		onStoreItemSave (storeItemData) {
			this.orderItemList = storeItemData
		},
		onSaveClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要保存该单据吗?'
			}).then(() => {
				this.checkHasDetails().then(() => {
					let params = this.getSaveParams()
					this.saveHandler(params)
				})
			}).catch(() => {
			})
		},
		saveHandler (params) {
			this.$fxHttp.requestPut({
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/stockApplies/${this.query.orderId}`,
				data: params,
				query: {
					userId: this.loginerId,
					m: 'modify'
				}
			}).then(res => {
				this.createOrderDetails().then(() => {
					this.$fxToast.success(res.message)
				})
			})
		},
		onExpressClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要审核该单据吗?'
			}).then(() => {
				this.checkHasDetails().then(() => {
					let params = this.getSaveParams()
					this.expressHandler(params)
				})
			}).catch(() => {
			})
		},
		expressHandler (params) {
			this.$fxHttp.requestPut({
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/stockApplies/${this.query.orderId}`,
				data: params,
				query: {
					userId: this.loginerId,
					m: 'editAndCheck'
				}
			}).then(res => {
				this.createOrderDetails().then(() => {
					this.$fxToast.success('审核成功')
				})
			}).catch(error => {
				if (error.errorCode === '1') {
					this.createOrderDetails()
				}
			})
		},
		onUnExpressClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要反审该单据吗?'
			}).then(() => {
				this.checkHasDetails().then(() => {
					let params = this.getSaveParams()
					this.unExpressHandler(params)
				})
			}).catch(() => {
			})
		},
		unExpressHandler (params) {
			this.$fxHttp.requestPut({
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/stockApplies/${this.query.orderId}`,
				data: params,
				query: {
					userId: this.loginerId,
					m: 'unCheck'
				}
			}).then(res => {
				this.createOrderDetails().then(() => {
					this.$fxToast.success('反审成功')
				})
			})
		},
		onCopyClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要复制该单据吗?'
			}).then(() => {
				this.checkHasDetails().then(() => {
					let params = this.getSaveParams()
					this.copyHandler(params)
				})
			}).catch(() => {
			})
		},
		copyHandler (params) {
			this.$fxHttp.requestPut({
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/stockApplies/${this.query.orderId}`,
				data: params,
				query: {
					userId: this.loginerId,
					m: 'copy'
				}
			}).then(res => {
				this.createOrderDetails().then(() => {
					this.$fxToast.success('复制成功')
				})
			})
		},
		// {{{
		onMinusClick () {
			this.getOrderDetails().then(res => {
				this.minusPopShow = true
				this.formatterSysPoint(res.stockApplyBills[0].details)
				this.minusData = res.stockApplyBills[0]
			})
		},
		onMinusConfirm (res) {
			if (!res) {
				return false
			}
			this.createOrderDetails()
		},
		// }}}
		onDeleteClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要删除该单据吗?'
			}).then(() => {
				let params = this.getSaveParams()
				this.$fxHttp.requestDel({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/stockApplies/${this.query.orderId}`,
					data: params,
					query: {
						userId: this.loginerId
					}
				}).then(res => {
					this.$fxToast.success({
						message: '删除成功',
						mask: true
					}).then(() => {
						this.orderDeleteFlag = true
						this.$router.go(-1)
					})
				})
			}).catch(() => {
			})
		},
		getSaveParams () {
			let itemDetails = []
			this.orderItemList.forEach(item => {
				itemDetails.push(...item.details)
			})
			let addItems = itemDetails.filter(item => {
				return item.changeType === 'add'
			})
			let delItems = itemDetails.filter(item => {
				return item.changeType === 'del'
			})
			let editItems = itemDetails.filter(item => {
				return item.changeType === 'edit'
			})
			let params = Object.assign({}, this.orderInfoData, {
				detailAdd: addItems.length > 0 ? addItems : null,
				detailDel: delItems.length > 0 ? delItems : null,
				detailMdf: editItems.length > 0 ? editItems : null,
				details: []
			})
			return params
		},
		getValidItem () {
			let itemDetails = []
			this.orderItemList.forEach(item => {
				itemDetails.push(...item.details)
			})
			return itemDetails.filter(item => {
				return item.changeType !== 'del'
			})
		},
		getItemLength () {
			return this.getValidItem().length
		},
		checkHasDetails () {
			return new Promise(resolve => {
				if (this.getItemLength() === 0) {
					this.$fxToast.fail('单据明细不能为空')
				} else {
					resolve()
				}
			})
		},
		onItemEdit (itemData) {
			this.itemEditRowData = itemData
			this.itemRowEditPopShow = true
		},
		onEditRowConfirm (item) {
			let storeIndex = this.orderItemList.findIndex(storeItem => {
				return storeItem.id === item.houseDTO.id
			})
			if (~storeIndex) {
				let detailsIndex = this.orderItemList[storeIndex].details.findIndex(detailsItem => {
					return detailsItem.goodsDTO.id === item.goodsDTO.id
				})
				if (~detailsIndex) {
					this.orderItemList[storeIndex].details[detailsIndex] = item
				}
			}
		},
		onItemClear () {
			let details = this.orderInfoData.details.filter(item => {
				return !!item.id
			})
			details.forEach(item => {
				item.changeType = 'del'
			})
			this.orderInfoData.details = details
			this.orderItemList = this.filterStoreItem(details)
		},
		onItemFocus () {
			this.$refs.orderInfo.closeCollapse()
		},
		onClickHandler (method) {
			if (this.itemInputFocusing) {
				return false
			}
			this[method]()
		},
		// {{{ 搜索界面
		onSearchClick () {
			this.itemSearchPopShow = true
			this.searchItem = JSON.parse(JSON.stringify(this.orderItemList))
		},
		// }}}
		onSearchConfirm (searchItemData) {
			this.orderItemList = searchItemData
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.inteledi-shopOrder-details {
	height:100%
	background:$fxWhite
	display: flex
	flex-direction: column
	.shopOrder-bottom {
		width:100%
		display: flex
		flex-direction: row
		.bottom-btn {
			flex:1
			padding:0
			overflow:hidden
		}
		.minus-btn {
			background-color: $fxBlueBtn
		}
	}
}
</style>


