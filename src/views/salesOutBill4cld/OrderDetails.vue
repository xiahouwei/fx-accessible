<template>
	<w-app-page>
		<w-header :title="orderInfoData.sysbillCode" titleFontSize="3.733vw" :border="true"></w-header>
		<orderInfo
			ref="orderInfo"
			:data="orderInfoData"
			:isDisabled="isBillState(['unCheck', 'checked']) || !$fxAuth('salesOutBill4cld.save')"
			@on-shop-click="onInShopRefresh"
			@on-rdc-click="onRdcRefresh"
			@on-picker-click="onPickerRefresh"
			@on-busdate-click="onBusinessDateClick"
			@on-arriveDate-click="onArriveDateClick"
			@on-billType-click="onBillTypeRefresh"
			@on-item-clear="onItemClear"
		></orderInfo>
		<orderItem
			ref="orderItem"
			:data="orderItemList"
			:isDisabled="isBillState(['unCheck', 'checked']) || !$fxAuth('salesOutBill4cld.save')"
			:itemInputFocusing.sync="itemInputFocusing"
			:showAddItemBtn="isHandCreate && $fxAuth('salesOutBill4cld.addDetail')"
			:inShopId="orderInfoData.inShopDTO && orderInfoData.inShopDTO.id"
			:pickerId="orderInfoData.pickerDTO && orderInfoData.pickerDTO.id"
			:rdcId="orderInfoData.rdcDTO && orderInfoData.rdcDTO.id"
			@on-add-click="onAddClick"
			@on-search-click="onSearchClick"
			@on-item-edit="onItemEdit"
			@on-item-focus="onItemFocus"
		></orderItem>
		<w-bottom-btn-bar>
			<w-button
				v-show="isBillState(['unSubmit', 'returned']) && $fxAuth('salesOutBill4cld.del')"
				size="large"
				type="danger"
				@click="onClickHandler('onDeleteClick')"
			>删除</w-button>
			<w-button
				v-show="isBillState('unCheck') && $fxAuth('salesOutBill4cld.drawback')"
				size="large"
				type="danger"
				@click="onClickHandler('onReturnClick')"
			>退回</w-button>
			<w-button
				v-show="isBillReState('unRecheck') && isBillState('checked') && $fxAuth('salesOutBill4cld.unCheck')"
				size="large"
				type="danger"
				@click="onClickHandler('onUnExpressClick')"
			>反审</w-button>
			<w-button
				v-show="isBillReState('rechecked') && $fxAuth('salesOutBill4cld.unReCheck')"
				size="large"
				type="danger"
				@click="onClickHandler('onUnExpressAgainClick')"
			>取消复审</w-button>
			<w-button
				v-show="isBillState(['unCheck', 'unSubmit', 'returned']) && $fxAuth('salesOutBill4cld.check')"
				size="large"
				type="info"
				@click="onClickHandler('onExpressClick')"
			>审核</w-button>
			<w-button
				v-show="isBillState(['unSubmit', 'returned']) && $fxAuth('salesOutBill4cld.submit')"
				size="large"
				type="info"
				@click="onClickHandler('onSubmitClick')"
			>提交</w-button>
			<w-button
				v-show="isBillState(['unSubmit', 'returned']) && $fxAuth('salesOutBill4cld.save')"
				size="large"
				type="primary"
				@click="onClickHandler('onSaveClick')"
			>保存</w-button>
			<w-button
				v-show="isBillReState('unRecheck') && isBillState('checked') && $fxAuth('salesOutBill4cld.reCheck')"
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
				@on-search="onRdcRefresh"
				@on-select="selectRdc"
			></listComp>
		</van-popup>
		<van-popup v-fx-history-back="inShopPopShow" v-model="inShopPopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="inShopPopShow"
				:data="inShopList"
				:loadFinished="true"
				title="请选择客户"
				@on-search="onInShopRefresh"
				@on-select="selectInShop"
			></listComp>
		</van-popup>
		<van-popup v-fx-history-back="datePickerShow" v-model="datePickerShow" position="bottom">
			<w-date-picker
				:visibleFlag.sync="datePickerShow"
				:currentDate="currentDate"
				@confirm="dateConfirmhandle"
			></w-date-picker>
		</van-popup>
		<van-popup v-fx-history-back="billTypePopShow" v-model="billTypePopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="billTypePopShow"
				:data="billTypeList"
				:loadFinished="true"
				title="业务类型检索"
				@on-search="onBillTypeRefresh"
				@on-select="selectBillType"
			></listComp>
		</van-popup>
		<van-popup v-fx-history-back="pickerPopShow" v-model="pickerPopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="pickerPopShow"
				:data="pickerList"
				:loadFinished="true"
				title="请选择拣货人"
				@on-search="onPickerRefresh"
				@on-select="selectPicker"
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
				:autoType="orderInfoData.autoType"
				:inShopId="orderInfoData.inShopDTO && orderInfoData.inShopDTO.id"
				:pickerId="orderInfoData.pickerDTO && orderInfoData.pickerDTO.id"
				:rdcId="orderInfoData.rdcDTO && orderInfoData.rdcDTO.id"
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
				:inShopId="orderInfoData.inShopDTO && orderInfoData.inShopDTO.id"
				:pickerId="orderInfoData.pickerDTO && orderInfoData.pickerDTO.id"
				:rdcId="orderInfoData.rdcDTO && orderInfoData.rdcDTO.id"
				:outHouse="currentOutHouseObj"
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
				:isDisabled="isBillState(['unCheck', 'checked']) || !$fxAuth('salesOutBill4cld.save')"
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
				:inShopId="orderInfoData.inShopDTO && orderInfoData.inShopDTO.id"
				:pickerId="orderInfoData.pickerDTO && orderInfoData.pickerDTO.id"
				:rdcId="orderInfoData.rdcDTO && orderInfoData.rdcDTO.id"
				:isDisabled="isBillState(['unCheck', 'checked']) || !$fxAuth('salesOutBill4cld.save')"
				:showScanCode="!isHandCreate"
				:businessDate="orderInfoData.businessDate"
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
import orderInfo from '@/components/salesOutBill4cld/createOrder/OrderInfo.vue'
import orderItem from '@/components/salesOutBill4cld/createOrder/OrderItem.vue'
import listComp from '@/components/common/ListComp.vue'
import storeItemComp from '@/components/salesOutBill4cld/common/StoreItemComp.vue'
import itemRowEditPop from '@/components/salesOutBill4cld/common/ItemRowEditPop.vue'
import itemSearchPop from '@/components/salesOutBill4cld/common/itemSearchPop.vue'
import itemEditComp from '@/components/salesOutBill4cld/common/itemEditComp.vue'
export default {
	name: 'salesOutBill4cld4cldDetails',
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
			inShopPopShow: false,
			inShopList: [],
			rdcPopShow: false,
			rdcList: [],
			datePickerShow: false,
			billTypePopShow: false,
			billTypeList: [],
			itemStorePopShow: false,
			storeItem: [],
			itemSearchPopShow: false,
			itemRowEditPopShow: false,
			itemEditRowData: {},
			searchItem: [],
			currentOutHouseObj: {},
			itemPopShow: false,
			itemInputFocusing: false,
			checkActionSheetShow: false,
			checkActions: [],
			fxOrderInfoVerification: this.$fxUtils.fxDataVerification(),
			fxOrderDetailsVerification: this.$fxUtils.fxDataVerification(),
			backAbsolute: false,
			pickerList: [],
			pickerPopShow: false
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
		if (to.path === '/salesOutBill4cld' && this.isChange && !this.backAbsolute) {
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
			saleOut_arrivalIntervalTime: state => state.systemParamsCld.saleOut_arrivalIntervalTime
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
		isHandCreate () {
			return this.orderInfoData.createWay === 0
		},
		isChange () {
			return !this.fxOrderInfoVerification.checkData(this.orderInfoData) || !this.fxOrderDetailsVerification.checkData(this.orderItemList)
		}
	},
	methods: {
		getBillOtherAuth () {
			return this.$fxApi('salesOutBill4cld.getBillOtherAuth', this.query.orderId).then(res => {
				this.$store.commit('RESET_BILL_AUTH', res.functionMapData[0])
				return Promise.resolve(res)
			})
		},
		refreshOrderDetails () {
			return this.$fxApi('salesOutBill4cld.getOrderDetails', this.query.orderId).then(this.initOrderDetails)
		},
		initOrderDetails (res) {
			let orderDetailsData = res.storeBills[0]
			const pickerDTO = {
				id: orderDetailsData.pickerId,
				name: orderDetailsData.pickerName
			}
			this.orderInfoData = orderDetailsData
			this.orderInfoData.pickerDTO = pickerDTO
			this.orderItemList = this.filterStoreItem(orderDetailsData.details)
			this.setDataUUID(this.orderItemList)
			this.$nextTick(() => {
				this.fxOrderInfoVerification.resetData(this.orderInfoData)
				this.fxOrderDetailsVerification.resetData(this.orderItemList)
			})
			return Promise.resolve()
		},
		filterStoreItem (data) {
			const outHouseIds = Array.from(new Set(data.map(item => {
				return item.outHouseDTO.id
			})))
			return outHouseIds.map(outHouseItem => {
				const itemObjs = data.filter(dataItem => {
					return dataItem.outHouseDTO.id === outHouseItem
				})
				let storeObj = JSON.parse(JSON.stringify(itemObjs[0].outHouseDTO))
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
		// {{{ 业务日期/到货日期
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
				this.orderInfoData.arriveDate = time + this.$fxUtils.h2ms(this.saleOut_arrivalIntervalTime)
			} else {
				this.orderInfoData.arriveDate = time
			}
			this.datePickerShow = false
		},
		// }}}
		selectPicker (item) {
			this.orderInfoData.pickerId = item.id
			this.orderInfoData.pickerName = item.name
			this.orderInfoData.pickerDTO = item
		},
		onPickerRefresh (keyword = null) {
			this.getPickerListData(keyword).then(res => {
				this.pickerList = res
				this.pickerPopShow = true
			})
		},
		getPickerListData (keyword = null) {
			const params = {
				searchText: keyword,
				rdcId: this.orderInfoData.rdcDTO ? this.orderInfoData.rdcDTO.id : ''
			}
			return this.$fxApi('stockInBill4cld.getAccountListData')({ data: params })
		},
		// {{{ 配送中心
		selectRdc (item) {
			this.checkRdc(item).then(() => {
				this.clearItemConfirm('修改配送中心将清空发货仓库、客户和单据明细，是否继续?').then(() => {
					this.orderInfoData.rdcDTO = item
					this.orderInfoData.inShopDTO = {}
				})
			})
		},
		checkRdc (rdcDTO) {
			return new Promise(resolve => {
				let currentInRdcDTO = this.orderInfoData.rdcDTO
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
				keyword: keyword
			}
			return this.$fxApi('common.getRdcListData', keyword)({ data: params })
		},
		// }}}
		// {{{ 客户
		selectInShop (item) {
			this.checkInShop(item).then(() => {
				this.clearItemConfirm('更换客户会清空品项,是否继续?').then(() => {
					this.orderInfoData.inShopDTO = item
				})
			})
		},
		checkInShop (inShopDTO) {
			return new Promise(resolve => {
				let currentInShopDTO = this.orderInfoData.inShopDTO
				if (currentInShopDTO.id !== inShopDTO.id) {
					resolve()
				}
			})
		},
		onInShopRefresh (keyword = null) {
			this.getInShopListData(keyword).then(res => {
				this.inShopList = res.customerDataVO
				this.inShopPopShow = true
			})
		},
		getInShopListData (keyword = null) {
			const params = {
				keyword: keyword
			}
			return this.$fxApi('common.getCustomerListData', keyword)({ data: params })
		},
		// }}}
		// {{{ 业务类型
		selectBillType (item) {
			this.orderInfoData.businessTypeDTO = item
		},
		onBillTypeRefresh (keyword = null) {
			this.getBillTypeListData(keyword).then(res => {
				this.billTypeList = res.businessTypes
				this.billTypePopShow = true
			})
		},
		getBillTypeListData (keyword = null) {
			const params = {
				m: 'list4SaleOutListBillEdit',
				keyword: keyword
			}
			return this.$fxApi('common.getBusinessTypeListData')({ data: params })
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
				} else if (!this.orderInfoData.rdcDTO.id) {
					this.$fxToast.top('请先选择配送中心!')
				} else if (!this.orderInfoData.inShopDTO.id) {
					this.$fxToast.top('请先选择客户!')
				} else if (!this.orderInfoData.businessTypeDTO.id) {
					this.$fxToast.top('请先选择业务类型!')
				} else {
					resolve()
				}
			})
		},
		onItemFocus () {
			this.$refs.orderInfo.closeCollapse()
		},
		// {{{ 搜索界面
		onSearchClick () {
			this.itemSearchPopShow = true
			this.searchItem = JSON.parse(JSON.stringify(this.orderItemList))
		},
		// }}}
		onStoreItemSave (storeItemData) {
			this.orderItemList = storeItemData
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
				return this.$fxApi('salesOutBill4cld.saveOrder', this.query.orderId)({ data: params })
			} else {
				return Promise.resolve()
			}
		},
		onExpressClick () {
			this.$fxCommon.orderFrontFunc('check')
				.then(this.checkHasDetails)
				.then(this.saveHandler)
				.then(this.expressHandler)
		},
		expressHandler () {
			let params = this.getSaveParams()
			return this.$fxApi('salesOutBill4cld.checkOrder', this.query.orderId)({ data: params }).then(res => {
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
			return this.$fxApi('salesOutBill4cld.uncheckOrder', this.query.orderId)({ data: params })
		},
		onCopyClick () {
			this.$fxCommon.orderFrontFunc('copy')
				.then(this.checkHasDetails)
				.then(this.copyHandler)
				.then(this.refreshOrderDetails)
				.then(this.$fxCommon.orderSuccess('copy'))
		},
		copyHandler () {
			const params = this.getSaveParams()
			return this.$fxApi('salesOutBill4cld.copyOrder', this.query.orderId)({ data: params })
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
			return this.$fxApi('salesOutBill4cld.deleteOrder', this.query.orderId)({ data: params })
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
				pickerId: this.orderInfoData.pickerDTO.id,
				pickerName: this.orderInfoData.pickerDTO.name
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
					this.onDeleteClick('当前单据没有明细,是否要删除该单据吗?')
				} else {
					resolve()
				}
			})
		},
		onItemEdit (itemData) {
			this.itemEditRowData = itemData
			this.itemRowEditPopShow = true
		},
		toFixedNumberSize (data, pointSize = this.sysMoneyPointSize) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, pointSize))
		},
		onExpressAgainClick () {
			this.$fxCommon.orderFrontFunc('reCheck')
				.then(this.checkAgainHandler)
				.then(this.refreshOrderDetails)
				.then(this.$fxCommon.orderSuccess('reCheck'))
		},
		checkAgainHandler () {
			const params = this.getSaveParams()
			return this.$fxApi('salesOutBill4cld.checkAgain', this.query.orderId)({ data: params })
		},
		onUnExpressAgainClick () {
			this.$fxCommon.orderFrontFunc('unReCheck')
				.then(this.UnExpressAgainHandler)
				.then(this.refreshOrderDetails)
				.then(this.$fxCommon.orderSuccess('unReCheck'))
		},
		UnExpressAgainHandler () {
			const params = this.getSaveParams()
			return this.$fxApi('salesOutBill4cld.unReCheck', this.query.orderId)({ data: params })
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
		onClickHandler (method) {
			if (this.itemInputFocusing) {
				return false
			}
			this[method]()
		},
		onSearchConfirm (searchItemData) {
			this.orderItemList = searchItemData
		},
		onStoreItemSelect (outHouse) {
			this.currentOutHouseObj = outHouse
			this.itemPopShow = true
		},
		getStoreItem () {
			if (this.$fxUtils.isEmptyObjSHW(this.currentOutHouseObj)) {
				return []
			} else {
				let currentStore = this.orderItemList.find(item => {
					return item.id === this.currentOutHouseObj.id
				})
				if (currentStore) {
					return currentStore.details
				} else {
					return []
				}
			}
		},
		onItemEditConfirm ([selectedItemArr, store]) {
			let currentStore = this.orderItemList.find(item => {
				return item.id === store.id
			})
			if (currentStore) {
				if (this.$fxAuth('salesOutBill4cld.inputMultipleDetails')) {
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
				let _store = Object.assign({}, store)
				_store.details = selectedItemArr
				this.orderItemList.push(_store)
			}
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
			return this.$fxApi('salesOutBill4cld.submitOrder', this.query.orderId)
		},
		onReturnClick () {
			this.$fxCommon.orderFrontFunc('returned')
				.then(this.onReturnHandler)
				.then(this.refreshOrderDetails)
				.then(this.$fxCommon.orderSuccess('returned'))
		},
		onReturnHandler () {
			return this.$fxApi('salesOutBill4cld.returnOrder', this.query.orderId)
		},
		setOrderInfoHasNoticed () {
			this.orderInfoData.isToContinue = '1'
		}
	}
}
</script>
