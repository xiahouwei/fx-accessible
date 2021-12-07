<template>
	<w-app-page>
		<w-header :title="orderInfoData.sysbillCode" titleFontSize="3.733vw" :border="true"></w-header>
		<orderInfo
			ref="orderInfo"
			:isDisabled="isBillState(['unCheck', 'checked']) || !$fxAuth('stockInBill4cld.save') || isBillWeightState(['waitWeight', 'weighting']) || !isHandCreate"
			:data="orderInfoData"
			@on-rdc-click="onRdcClick"
			@on-supplier-click="onSupplierClick"
			@on-busdate-click="onBusinessDateClick"
			@on-account-click="onAccountClick"
			@on-item-clear="onItemClear"
		></orderInfo>
		<orderItem
			ref="orderItem"
			:data="orderItemList"
			:isDisabled="isBillState(['unCheck', 'checked']) || !$fxAuth('stockInBill4cld.save') || isBillWeightState(['waitWeight', 'weighting'])"
			:itemInputFocusing.sync="itemInputFocusing"
			:showAddItemBtn="isHandCreate"
			:rdcId="orderInfoData.rdcDTO && orderInfoData.rdcDTO.id"
			:supplierId="orderInfoData.supplierDTO && orderInfoData.supplierDTO.id"
			@on-add-click="onAddClick"
			@on-search-click="onSearchClick"
			@on-item-edit="onItemEdit"
			@on-item-focus="onItemFocus"
		></orderItem>
		<w-bottom-btn-bar>
			<w-button
				v-show="isBillState(['unSubmit', 'returned']) && $fxAuth('stockInBill4cld.del') && isBillWeightState(['unWeight', 'hasWeight'])"
				size="large"
				type="danger"
				@click="onClickHandler('onDeleteClick')"
			>删除</w-button>
			<w-button
				v-show="$fxAuth('stockInBill4cld.copy')"
				size="large"
				type="primary"
				@click="onClickHandler('onCopyClick')"
			>复制</w-button>
			<w-button
				v-show="isBillState('unCheck') && $fxAuth('stockInBill4cld.drawback') && isBillWeightState(['unWeight', 'hasWeight'])"
				size="large"
				type="danger"
				@click="onClickHandler('onReturnClick')"
			>退回</w-button>
			<w-button
				v-show="isBillState('checked') && $fxAuth('stockInBill4cld.unCheck') && isBillWeightState(['unWeight', 'hasWeight'])"
				size="large"
				type="danger"
				@click="onClickHandler('onUnExpressClick')"
			>反审</w-button>
			<w-button
				v-show="isBillReState('rechecked') && $fxAuth('stockInBill4cld.unReCheck') && isBillWeightState(['unWeight', 'hasWeight'])"
				size="large"
				type="danger"
				@click="onClickHandler('onUnExpressAgainClick')"
			>取消复审</w-button>
			<w-button
				v-show="isBillState(['unCheck', 'unSubmit', 'returned']) && $fxAuth('stockInBill4cld.check') && isBillWeightState(['unWeight', 'hasWeight'])"
				size="large"
				type="info"
				@click="onClickHandler('onExpressClick')"
			>审核</w-button>
			<w-button
				v-show="isBillState(['unSubmit', 'returned']) && $fxAuth('stockInBill4cld.submit') && isBillWeightState(['unWeight', 'hasWeight'])"
				size="large"
				type="info"
				@click="onClickHandler('onSubmitClick')"
			>提交</w-button>
			<w-button
				v-show="isBillState(['unSubmit', 'returned']) && $fxAuth('stockInBill4cld.save') && isBillWeightState(['unWeight', 'hasWeight'])"
				size="large"
				type="primary"
				@click="onClickHandler('onSaveClick')"
			>保存</w-button>
			<w-button
				v-show="isBillReState('unRecheck') && isBillState('checked') && $fxAuth('stockInBill4cld.reCheck') && isBillWeightState(['unWeight', 'hasWeight'])"
				size="large"
				type="info"
				@click="onClickHandler('onExpressAgainClick')"
			>复审</w-button>
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
				:isDisabled="isBillState(['unCheck', 'checked']) || !$fxAuth('stockInBill4cld.save')"
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
				:isDisabled="isBillState(['unCheck', 'checked']) || !$fxAuth('stockInBill4cld.save')"
				@on-search-confirm="onSearchConfirm"
			></itemSearchPop>
		</van-popup>
		<w-action-sheet
			v-fx-history-back="checkActionSheetShow"
			ref="checkActionSheet"
			v-model="checkActionSheetShow"
			:actions="checkActions"
		></w-action-sheet>
	</w-app-page>
</template>

<script>
import { mapState } from 'vuex'
import orderInfo from '@/components/stockInBill4cld/createOrder/OrderInfo'
import orderItem from '@/components/stockInBill4cld/createOrder/OrderItem'
import listComp from '@/components/common/ListComp.vue'
import storeItemComp from '@/components/stockInBill4cld/common/StoreItemComp'
import itemRowEditPop from '@/components/stockInBill4cld/common/ItemRowEditPop'
import itemSearchPop from '@/components/stockInBill4cld/common/itemSearchPop'
import itemEditComp from '@/components/stockInBill4cld/common/itemEditComp'
export default {
	name: 'stockInBill4cldDetails',
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
			checkActionSheetShow: false,
			checkActions: [],
			fxOrderInfoVerification: this.$fxUtils.fxDataVerification(),
			fxOrderDetailsVerification: this.$fxUtils.fxDataVerification(),
			backAbsolute: false
		}
	},
	created () {
		this.getBillOtherAuth().then(this.refreshOrderDetails)
	},
	beforeRouteLeave (to, from, next) {
		if (this.itemInputFocusing) {
			this.$router.go(1)
			return false
		}
		if (to.path === '/stockInBill4cld' && this.isChange && !this.backAbsolute) {
			this.$dialog.confirm({
				title: '提示',
				message: '当前单据已修改<br/>是否保存单据?'
			}).then(() => {
				this.$router.go(1)
				this.checkHasDetails()
					.then(this.saveHandler)
					.then(() => {
						this.backAbsolute = true
						this.$fxGo('BACK', this.$router)
					})
				return false
			}).catch(() => {
				next()
			})
		} else {
			next()
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize',
			sysMoneyPointSize: 'sysMoneyPointSize',
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId,
			stockIn_resetBusDate: state => state.systemParamsCld.stockIn_resetBusDate
		}),
		isBillState (state) {
			return state => {
				return this.$fxStateMiddleware.stateIs('stateCld')(state)(this.orderInfoData.billStateFlag)
			}
		},
		isBillReState (state) {
			return state => {
				return this.$fxStateMiddleware.stateIs('reState')(state)(this.orderInfoData.billReState)
			}
		},
		isBillWeightState (state) {
			return state => {
				return this.$fxStateMiddleware.stateIs('weightStateCld')(state)(this.orderInfoData.weightState)
			}
		},
		isHandCreate () {
			return this.orderInfoData.createWay === 3
		},
		isChange () {
			return !this.fxOrderInfoVerification.checkData(this.orderInfoData) || !this.fxOrderDetailsVerification.checkData(this.orderItemList)
		}
	},
	methods: {
		getBillOtherAuth () {
			return this.$fxApi('stockInBill4cld.getBillOtherAuth', this.query.orderId).then(res => {
				this.$store.commit('RESET_BILL_AUTH', res.functionMapData[0])
				return Promise.resolve(res)
			})
		},
		refreshOrderDetails () {
			return this.$fxApi('stockInBill4cld.getOrderDetails', this.query.orderId).then(this.initOrderDetails)
		},
		initOrderDetails (res) {
			let orderDetailsData = res.storeBills[0]
			this.orderInfoData = orderDetailsData
			this.orderItemList = this.filterStoreItem(orderDetailsData.details)
			this.setDataUUID(this.orderItemList)
			this.$nextTick(() => {
				this.fxOrderInfoVerification.resetData(this.orderInfoData)
				this.fxOrderDetailsVerification.resetData(this.orderItemList)
			})
			return Promise.resolve()
		},
		filterStoreItem (data) {
			const inHouseIds = Array.from(new Set(data.map(item => {
				return item.inHouseDTO.id
			})))
			return inHouseIds.map(inHouseItem => {
				const itemObjs = data.filter(dataItem => {
					return dataItem.inHouseDTO.id === inHouseItem
				})
				let storeObj = JSON.parse(JSON.stringify(itemObjs[0].inHouseDTO))
				storeObj.details = itemObjs
				return storeObj
			})
		},
		setDataUUID (data) {
			data.forEach(dataItem => {
				dataItem.uuid = this.$fxUtils.createUUID()
				dataItem.details.forEach(item => {
					item.uuid = this.$fxUtils.createUUID()
				})
			})
		},
		clearItemConfirm (message) {
			return new Promise(resolve => {
				let items = this.orderItemList.filter(item => {
					return item.details.filter(details => {
						return details.changeType !== 'del'
					}).length !== 0
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
					})
				}
			})
		},
		// {{{ 配送中心
		onRdcClick () {
			if (this.$fxAuth('stockInBill4cld.changeOrgan')) {
				this.onRdcRefresh()
			}
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
			if (this.$fxAuth('stockInBill4cld.modifySupplier')) {
				this.onSupplierRefresh()
			}
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
		dateConfirmhandle (date) {
			let time = date.getTime()
			if (this.dateType === 'business') {
				this.orderInfoData.businessDate = time
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
			return this.$fxApi('stockInBill4cld.getAccountListData')({ data: params })
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
					this.onDeleteClick('当前单据没有明细,是否要删除该单据吗?')
				} else {
					resolve()
				}
			})
		},
		onItemClear () {
			this.orderInfoData.details = []
			this.orderItemList = this.orderInfoData.details
		},
		onItemEdit (itemData) {
			this.itemEditRowData = itemData
			this.itemRowEditPopShow = true
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
					this.$toast.fail('请先选择业务日期!')
				} else if (!this.orderInfoData.rdcDTO.id) {
					this.$fxToast.top('请先选择配送中心!')
				} else if (!this.orderInfoData.supplierDTO.id) {
					this.$fxToast.top('请先选择供货商!')
				} else {
					resolve()
				}
			})
		},
		onItemFocus () {
			this.$refs.orderInfo.closeCollapse()
		},
		// {{{ 明细搜索
		onSearchClick () {
			this.itemSearchPopShow = true
			this.searchItem = JSON.parse(JSON.stringify(this.orderItemList))
		},
		onSearchConfirm (searchItemData) {
			this.orderItemList = searchItemData
		},
		// }}}
		onStoreItemSave (storeItemData) {
			this.orderInfoData.details = storeItemData
			this.orderItemList = this.orderInfoData.details
		},
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
				if (this.$fxAuth('stockInBill4cld.inputMultipleDetails')) {
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
				_store.details = selectedItemArr
				this.orderItemList.push(_store)
			}
		},
		onClickHandler (method) {
			if (this.itemInputFocusing) {
				return false
			}
			this[method]()
		},
		onSaveClick () {
			this.$fxCommon.orderFrontFunc('save')
				.then(this.checkHasDetails)
				.then(this.saveHandler)
				.then(this.refreshOrderDetails)
				.then(this.$fxCommon.orderSuccess('save'))
		},
		saveHandler () {
			if (this.isBillState(['unSubmit', 'returned']) && this.isChange) {
				const params = this.getSaveParams()
				return this.$fxApi('stockInBill4cld.saveOrder', this.query.orderId)({ data: params })
			} else {
				return Promise.resolve()
			}
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
				details: [],
				resetFlag: this.stockIn_resetBusDate === 0
			})
			return params
		},
		onSubmitClick () {
			this.$fxCommon.orderFrontFunc('submit')
				.then(this.checkHasDetails)
				.then(this.saveHandler)
				.then(this.onSubmitHandler)
				.then(this.refreshOrderDetails)
				.then(this.$fxCommon.orderSuccess('submit'))
		},
		onSubmitHandler () {
			return this.$fxApi('stockInBill4cld.submitOrder', this.query.orderId)
		},
		onReturnClick () {
			this.$fxCommon.orderFrontFunc('returned')
				.then(this.onReturnHandler)
				.then(this.refreshOrderDetails)
				.then(this.$fxCommon.orderSuccess('returned'))
		},
		onReturnHandler () {
			return this.$fxApi('stockInBill4cld.returnOrder', this.query.orderId)
		},
		setOrderInfoHasNoticed () {
			this.orderInfoData.hasNoticed = true
		},
		onDeleteClick (message = '确定要删除该单据吗?') {
			this.$dialog.confirm({ title: '提示', message })
				.then(this.deleteOrderHandler)
				.then(() => {
					this.$fxToast.success('删除成功').then(() => {
						this.backAbsolute = true
						this.$router.go(-1)
					})
				})
		},
		deleteOrderHandler () {
			const params = this.getSaveParams()
			return this.$fxApi('stockInBill4cld.deleteOrder', this.query.orderId)({ data: params })
		},
		onExpressClick () {
			if (this.stockIn_resetBusDate === 0) {
				this.$fxCommon.orderFrontFunc('check')
					.then(this.checkHasDetails)
					.then(this.saveHandler)
					.then(this.expressHandler)
			} else {
				if (this.stockIn_resetBusDate === 1) {
					this.checkActions = [
						{ id: 1, name: '审核并重置业务日期' },
						{ id: 0, name: '审核但不重置业务日期' }
					]
				} else if (this.stockIn_resetBusDate === 2) {
					this.checkActions = [
						{ id: 1, name: '审核并重置业务日期' }
					]
				}
				this.$refs.checkActionSheet.doSelect().then(res => {
					this.$fxCommon.orderFrontFunc('check')
						.then(this.checkHasDetails)
						.then(this.saveHandler)
						.then(() => {
							this.expressByBusinessDate(res.id)
						})
				})
			}
		},
		expressByBusinessDate (businessDateFlag) {
			let params = this.getSaveParams()
			return this.$fxApi('stockInBill4cld.checkOrderByBusinessDate', this.query.orderId, businessDateFlag)({ data: params }).then(res => {
				this.refreshOrderDetails().then(() => {
					this.$fxToast.success(res.message)
				})
			}).catch(error => {
				if (error.errorCode === '1') {
					this.refreshOrderDetails()
				} else if (error.errorCode === 'isToContinue') {
					this.setOrderInfoHasNoticed()
					this.expressByBusinessDate(businessDateFlag)
				}
			})
		},
		expressHandler () {
			let params = this.getSaveParams()
			return this.$fxApi('stockInBill4cld.checkOrder', this.query.orderId)({ data: params }).then(res => {
				this.refreshOrderDetails().then(() => {
					this.$fxToast.success(res.message)
				})
			}).catch(error => {
				if (error.errorCode === '1') {
					this.refreshOrderDetails()
				} else if (error.errorCode === 'isToContinue') {
					this.setOrderInfoHasNoticed()
					this.expressHandler()
				}
			})
		},
		onUnExpressClick () {
			this.$fxCommon.orderFrontFunc('uncheck')
				.then(this.unExpressHandler)
				.then(this.refreshOrderDetails)
				.then(this.$fxCommon.orderSuccess('uncheck'))
		},
		unExpressHandler () {
			let params = this.getSaveParams()
			return this.$fxApi('stockInBill4cld.uncheckOrder', this.query.orderId)({ data: params })
		},
		onExpressAgainClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要复审该单据吗?'
			}).then(this.checkAgainHandler)
				.then(this.refreshOrderDetails)
				.then(() => {
					this.$fxToast.success('复审成功')
				})
		},
		checkAgainHandler () {
			const params = this.getSaveParams()
			return this.$fxApi('stockInBill4cld.checkAgain', this.query.orderId)({ data: params })
		},
		onUnExpressAgainClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要取消复审该单据吗?'
			}).then(this.UnExpressAgainHandler)
				.then(this.refreshOrderDetails)
				.then(() => {
					this.$fxToast.success('取消复审成功')
				})
		},
		UnExpressAgainHandler () {
			const params = this.getSaveParams()
			return this.$fxApi('stockInBill4cld.unReCheck', this.query.orderId)({ data: params })
		},
		onCopyClick () {
			this.$fxCommon.orderFrontFunc('copy')
				.then(this.checkHasDetails)
				.then(this.copyHandler)
				.then(res => {
					this.query.orderId = res
					this.refreshOrderDetails()
				})
				.then(this.$fxCommon.orderSuccess('copy'))
		},
		copyHandler () {
			const params = this.getSaveParams()
			return this.$fxApi('stockInBill4cld.copyOrder', this.query.orderId)({ data: params })
		}
	}
}
</script>
