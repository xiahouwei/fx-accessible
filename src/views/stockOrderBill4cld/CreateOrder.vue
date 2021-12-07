<template>
	<w-app-page>
		<w-header title="新增中心采购订货单" :border="true"></w-header>
		<orderInfo
			ref="orderInfo"
			:data="orderInfoData"
			@on-rdc-click="onRdcClick"
			@on-supplier-click="onSupplierClick"
			@on-busdate-click="onBusinessDateClick"
			@on-arriveDate-click="onArriveDateClick"
			@on-account-click="onAccountClick"
			@on-item-clear="onItemClear"
		></orderInfo>
		<orderItem
			:data="orderItemList"
			:itemInputFocusing.sync="itemInputFocusing"
			:showAddItemBtn="true"
			:rdcId="orderInfoData.rdcDTO && orderInfoData.rdcDTO.id"
			:supplierId="orderInfoData.supplierDTO && orderInfoData.supplierDTO.id"
			@on-add-click="onAddClick"
			@on-search-click="onSearchClick"
			@on-item-edit="onItemEdit"
		></orderItem>
		<w-bottom-btn-bar>
			<w-button
				size="large"
				type="primary"
				@click="onCreateClick"
			>生成单据
			</w-button>
		</w-bottom-btn-bar>
		<van-popup v-fx-history-back="rdcPopShow" v-model="rdcPopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="rdcPopShow"
				:data="rdcList"
				:loadFinished="true"
				title="请选择配送中心"
				@on-search="searchRdc"
				@on-select="selectRdc"
			></listComp>
		</van-popup>
		<van-popup v-fx-history-back="supplierPopShow" v-model="supplierPopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="supplierPopShow"
				:data="supplierList"
				:loadFinished="true"
				title="请选择供货商"
				@on-search="searchSupplier"
				@on-select="selectSupplier"
			></listComp>
		</van-popup>
		<van-popup v-fx-history-back="datePickerShow" v-model="datePickerShow" position="bottom">
			<w-date-picker
				:visibleFlag.sync="datePickerShow"
				:currentDate="currentDate"
				@confirm="dateConfirmhandle"
			></w-date-picker>
		</van-popup>
		<van-popup v-fx-history-back="accountPopShow" v-model="accountPopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="accountPopShow"
				:data="accountList"
				:loadFinished="true"
				title="请选择业务人"
				@on-search="searchAccount"
				@on-select="selectAccount"
			></listComp>
		</van-popup>
		<van-popup
			v-fx-history-back="itemStorePopShow"
			v-model="itemStorePopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<storeItemComp
				:visibleFlag.sync="itemStorePopShow"
				:storeItemData="storeItem"
				:rdcId="orderInfoData.rdcDTO && orderInfoData.rdcDTO.id"
				:supplierId="orderInfoData.supplierDTO && orderInfoData.supplierDTO.id"
				:businessDate="orderInfoData.businessDate"
				@on-save="onStoreItemSave"
				@on-select-store="onStoreItemSelect"
			></storeItemComp>
		</van-popup>
		<van-popup
			v-fx-history-back="itemPopShow"
			v-model="itemPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<itemEditComp
				:visibleFlag.sync="itemPopShow"
				:rdcId="orderInfoData.rdcDTO && orderInfoData.rdcDTO.id"
				:supplierId="orderInfoData.supplierDTO && orderInfoData.supplierDTO.id"
				:inHouse="currentInHouseObj"
				:businessDate="orderInfoData.businessDate"
				:parentStoreItem="getStoreItem()"
				@on-confirm="onItemEditConfirm"
			></itemEditComp>
		</van-popup>
		<van-popup
			v-fx-history-back="itemRowEditPopShow"
			v-model="itemRowEditPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<itemRowEditPop
				:visibleFlag.sync="itemRowEditPopShow"
				:itemData="itemEditRowData"
			></itemRowEditPop>
		</van-popup>
		<van-popup
			v-fx-history-back="itemSearchPopShow"
			v-model="itemSearchPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<itemSearchPop
				:visibleFlag.sync="itemSearchPopShow"
				:data="searchItem"
				@on-search-confirm="onSearchConfirm"
			></itemSearchPop>
		</van-popup>
	</w-app-page>
</template>

<script>
import { mapState } from 'vuex'
import orderInfo from '@/components/stockOrderBill4cld/createOrder/OrderInfo'
import orderItem from '@/components/stockOrderBill4cld/createOrder/OrderItem'
import listComp from '@/components/common/ListComp.vue'
import storeItemComp from '@/components/stockOrderBill4cld/common/StoreItemComp'
import itemRowEditPop from '@/components/stockOrderBill4cld/common/ItemRowEditPop'
import itemSearchPop from '@/components/stockOrderBill4cld/common/itemSearchPop'
import itemEditComp from '@/components/stockOrderBill4cld/common/itemEditComp'
export default {
	name: 'createStockOrderBill4cld',
	components: {
		orderInfo,
		orderItem,
		listComp,
		storeItemComp,
		itemRowEditPop,
		itemSearchPop,
		itemEditComp
	},
	data () {
		return {
			query: this.$route.query,
			orderInfoData: {},
			orderItemList: [],
			dateType: 'business',
			currentDate: new Date(),
			rdcPopShow: false,
			rdcList: [],
			datePickerShow: false,
			supplierPopShow: false,
			supplierList: [],
			billTypePopShow: false,
			billTypeList: [],
			itemStorePopShow: false,
			storeItem: [],
			itemRowEditPopShow: false,
			itemEditRowData: {},
			itemSearchPopShow: false,
			searchItem: [],
			currentInHouseObj: {},
			itemPopShow: false,
			accountList: [],
			accountPopShow: false,
			itemInputFocusing: false,
			backAbsolute: false
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize',
			sysMoneyPointSize: 'sysMoneyPointSize',
			loginerShopId: state => state.loginer.loginerShopId,
			loginerShopName: state => state.loginer.loginerShopName,
			loginerId: state => state.loginer.loginerId,
			loginerUserName: state => state.loginer.loginerUserName,
			centerPur_arrivalIntervalTime: state => state.systemParamsCld.centerPur_arrivalIntervalTime
		})
	},
	created () {
		this.getBillOtherAuth().then(this.initDefaultOrderData)
	},
	beforeRouteLeave (to, from, next) {
		if (this.itemInputFocusing) {
			this.$router.go(1)
			return false
		}
		if (to.path === '/stockOrderBill4cld' && this.orderItemList.length !== 0 && !this.backAbsolute) {
			this.$dialog.confirm({
				title: '提示',
				message: '当前单据未生成<br/>是否生成单据?'
			}).then(() => {
				this.$router.go(1)
				this.onCreateClick()
				return false
			}).catch(() => {
				next()
			})
		} else {
			next()
		}
	},
	methods: {
		initDefaultOrderData () {
			this.orderInfoData = {
				arriveDate: new Date().getTime() + this.$fxUtils.h2ms(this.centerPur_arrivalIntervalTime),
				busUser: {
					id: this.loginerId,
					name: this.loginerUserName
				},
				billEmp: '',
				billMemo: '',
				billState: 0,
				ediSendState: 1,
				businessDate: new Date().getTime(),
				businessTypeDTO: {
					id: '0450_0030_0600',
					name: '中心采购订货单'
				},
				rdcDTO: {
					id: this.loginerShopId,
					name: this.loginerShopName
				},
				supplierDTO: {},
				details: [],
				updateIndicator: 'Append'
			}
		},
		getBillOtherAuth () {
			return this.$fxApi('stockOrderBill4cld.getBillOtherAuth', '0').then(res => {
				this.$store.commit({
					type: 'EXTEND_AUTH',
					billAuth: res.functionMapData[0]
				})
				return Promise.resolve(res)
			})
		},
		clearItemConfirm (message) {
			return new Promise(resolve => {
				let items = this.orderItemList.filter(item => {
					let details = item.details.filter(details => {
						return details.changeType !== 'del'
					})
					return details.length !== 0
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
		// {{{ 配送中心
		onRdcClick () {
			this.onRdcRefresh()
		},
		searchRdc (keyword = null) {
			this.onRdcRefresh(keyword)
		},
		selectRdc (item) {
			this.checkRdc(item).then(() => {
				this.clearItemConfirm('修改配送中心将清空发货仓库和单据明细，是否继续?').then(() => {
					this.orderInfoData.rdcDTO = item
				})
			})
		},
		checkRdc (rdcDTO) {
			return new Promise(resolve => {
				const currentInRdcDTO = this.orderInfoData.rdcDTO
				if (currentInRdcDTO.id !== rdcDTO.id) {
					resolve()
				}
			})
		},
		onRdcRefresh (keyword = null) {
			this.getRdcListData(keyword).then(res => {
				this.rdcList = res.shops
				this.rdcPopShow = true
			})
		},
		getRdcListData (keyword = null) {
			const params = {
				keyword: keyword,
				selAll: 'on'
			}
			return this.$fxApi('common.getRdcListData')({ data: params })
		},
		// }}}
		// {{{ 供货商
		onSupplierClick () {
			this.onSupplierRefresh()
		},
		searchSupplier (keyword = null) {
			this.onSupplierRefresh(keyword)
		},
		selectSupplier (item) {
			this.checkSupplier(item).then(() => {
				this.clearItemConfirm('修改供货商将清空发货仓库和单据明细，是否继续?').then(() => {
					this.orderInfoData.supplierDTO = item
				})
			})
		},
		checkSupplier (supplierDTO) {
			return new Promise(resolve => {
				const currentInSupplierDTO = this.orderInfoData.supplierDTO
				if (currentInSupplierDTO.id !== supplierDTO.id) {
					resolve()
				}
			})
		},
		onSupplierRefresh (keyword = null) {
			this.getSupplierListData(keyword).then(res => {
				this.supplierList = res.suppliers
				this.supplierPopShow = true
			})
		},
		getSupplierListData (keyword = null) {
			const params = {
				keyword: keyword,
				selAll: 'on'
			}
			return this.$fxApi('common.getSupplierListData')({ data: params })
		},
		// }}}
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
				this.orderInfoData.arriveDate = time + this.$fxUtils.h2ms(this.centerPur_arrivalIntervalTime)
			} else {
				this.orderInfoData.arriveDate = time
			}
			this.datePickerShow = false
		},
		onAccountClick () {
			this.getAccountListData().then(res => {
				this.accountList = res
				this.accountPopShow = true
			})
		},
		selectAccount (item) {
			this.orderInfoData.busUser = item
		},
		searchAccount (keyword = null) {
			this.getAccountListData(keyword).then(res => {
				this.accountList = res
			})
		},
		getAccountListData (keyword = null) {
			const params = {
				searchText: keyword,
				rdcId: this.orderInfoData.rdcDTO ? this.orderInfoData.rdcDTO.id : ''
			}
			return this.$fxApi('stockOrderBill4cld.getAccountListData')({ data: params })
		},
		// {{{ 明细
		onAddClick () {
			this.checkOrderInfo().then(() => {
				this.storeItem = JSON.parse(JSON.stringify(this.orderItemList))
				this.itemStorePopShow = true
			})
		},
		checkOrderInfo () {
			return new Promise((resolve, reject) => {
				if (!this.orderInfoData.businessDate) {
					this.$fxToast.top('请先选择业务日期!')
				} else if (!this.orderInfoData.rdcDTO.id) {
					this.$fxToast.top('请先选择配送中心!')
				} else if (!this.orderInfoData.supplierDTO.id) {
					this.$fxToast.top('请先选择供货商!')
				} else {
					resolve()
				}
			})
		},
		// {{{ 明细
		onSearchClick () {
			this.itemSearchPopShow = true
			this.searchItem = JSON.parse(JSON.stringify(this.orderItemList))
		},
		onSearchConfirm (searchItemData) {
			this.orderItemList = searchItemData
		},
		onStoreItemSave (storeItemData) {
			this.orderInfoData.details = storeItemData
			this.orderItemList = this.orderInfoData.details
		},
		verifyCreateBill () {
			return new Promise(resolve => {
				if (this.getValidItem().length === 0) {
					this.onAddClick()
					return false
				} else {
					resolve()
				}
			})
		},
		onCreateClick () {
			if (this.itemInputFocusing) {
				return false
			}
			this.verifyCreateBill().then(() => {
				this.$dialog.confirm({
					title: '提示',
					message: '确定生成单据吗?'
				}).then(() => {
					let params = this.getSaveParams()
					this.createHandler(params)
				})
			})
		},
		createHandler (params) {
			this.$fxApi('stockOrderBill4cld.createOrder')({ data: params }).then(res => {
				this.$fxToast.success('生成单据成功').then(() => {
					this.$router.replace({
						path: 'stockOrderBill4cldDetails',
						query: {
							orderId: res.storeBills[0].id
						}
					})
				})
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
			let params = Object.assign({}, this.orderInfoData, {
				detailAdd: addItems,
				accountDTO: {
					id: this.loginerId
				},
				houseDTO: JSON.parse(JSON.stringify(addItems[0].inHouseDTO))
			})
			return params
		},
		getValidItem () {
			let itemDetails = []
			this.orderItemList.forEach(item => {
				itemDetails.push(...item.details)
			})
			return itemDetails
		},
		onItemClear () {
			this.orderInfoData.details = []
			this.orderItemList = this.orderInfoData.details
		},
		onItemEdit (itemData) {
			this.itemEditRowData = itemData
			this.itemRowEditPopShow = true
		},
		// {{{增加品项
		onStoreItemSelect (shopHouse) {
			this.currentInHouseObj = shopHouse
			this.itemPopShow = true
		},
		getStoreItem () {
			if (this.$fxUtils.isEmptyObjSHW(this.currentInHouseObj)) {
				return []
			} else {
				let currentStore = this.orderItemList.find(item => {
					return item.id === this.currentInHouseObj.id
				})
				if (currentStore) {
					return currentStore.details
				} else {
					return []
				}
			}
		},
		onItemEditConfirm ([selectedItemArr, inHouse]) {
			let currentStore = this.orderItemList.find(item => {
				return item.id === inHouse.id
			})
			if (currentStore) {
				if (this.$fxAuth('stockOrderBill4cld.inputMultipleDetails')) {
					let _details = currentStore.details.filter(item => {
						const index = selectedItemArr.findIndex(selectItem => {
							return selectItem.goodsDTO.id === item.goodsDTO.id && selectItem.unitDTO.id === item.unitDTO.id && selectItem.batchCode === item.batchCode && this.$fxUtils.isDef(item.batchCode)
						})
						return !~index
					})
					currentStore.details = selectedItemArr.concat(_details)
				} else {
					currentStore.details = selectedItemArr
				}
			} else {
				let _store = Object.assign({}, inHouse)
				console.log(_store)
				_store.details = selectedItemArr
				this.orderItemList.push(_store)
			}
		}
		// }}}
	}
}
</script>
