<template>
	<w-app-page>
		<w-header :title="orderInfoData.sysbillCode" titleFontSize="3.733vw" :border="true"></w-header>
		<orderInfo
			ref="orderInfo"
			:data="orderInfoData"
			:isDisabled="isBillState(['unCheck', 'checked']) || isBillSortingState(['sorting']) || !$fxAuth('distributionOutBill4cld.save')"
			@on-shop-click="onInShopClick"
			@on-rdc-click="onRdcClick"
			@on-busdate-click="onBusinessDateClick"
			@on-arriveDate-click="onArriveDateClick"
			@on-billType-click="onBillTypeClick"
			@on-item-clear="onItemClear"
			@on-billType-clear="onBillTypeClear"
		></orderInfo>
		<orderItem
			ref="orderItem"
			:data="orderItemList"
			:isDisabled="isBillState(['unCheck', 'checked']) || isBillSortingState(['sorting']) || !$fxAuth('distributionOutBill4cld.save')"
			:itemInputFocusing.sync="itemInputFocusing"
			:showAddItemBtn="isHandCreate"
			:inShopId="orderInfoData.inShopDTO && orderInfoData.inShopDTO.id"
			:rdcId="orderInfoData.rdcDTO && orderInfoData.rdcDTO.id"
			@on-add-click="onAddClick"
			@on-search-click="onSearchClick"
			@on-item-edit="onItemEdit"
			@on-item-focus="onItemFocus"
		></orderItem>
		<w-bottom-btn-bar>
			<w-button
				v-show="isBillState(['unSubmit', 'returned']) && $fxAuth('distributionOutBill4cld.del')"
				size="large"
				type="danger"
				@click="onClickHandler('onDeleteClick')"
			>删除</w-button>
			<w-button
				v-show="isBillState('unCheck') && $fxAuth('distributionOutBill4cld.drawback')"
				size="large"
				type="danger"
				@click="onClickHandler('onReturnClick')"
			>退回</w-button>
			<w-button
				v-show="isBillReState('unRecheck') && isBillState('checked') && $fxAuth('distributionOutBill4cld.unCheck')"
				size="large"
				type="danger"
				@click="onClickHandler('onUnExpressClick')"
			>反审</w-button>
			<w-button
				v-show="isBillReState('rechecked') && $fxAuth('distributionOutBill4cld.unReCheck')"
				size="large"
				type="danger"
				@click="onClickHandler('onUnExpressAgainClick')"
			>取消复审</w-button>
			<w-button
				v-show="isBillState(['unCheck', 'unSubmit', 'returned']) && $fxAuth('distributionOutBill4cld.check')"
				size="large"
				type="info"
				@click="onClickHandler('onExpressClick')"
			>审核</w-button>
			<w-button
				v-show="isBillState(['unSubmit', 'returned']) && $fxAuth('distributionOutBill4cld.submit')"
				size="large"
				type="info"
				@click="onClickHandler('onSubmitClick')"
			>提交</w-button>
			<w-button
				v-show="isBillState(['unSubmit', 'returned']) && $fxAuth('distributionOutBill4cld.save')"
				size="large"
				type="primary"
				@click="onClickHandler('onSaveClick')"
			>保存</w-button>
			<w-button
				v-show="isBillReState('unRecheck') && isBillState('checked') && $fxAuth('distributionOutBill4cld.reCheck')"
				size="large"
				type="info"
				@click="onClickHandler('onExpressAgainClick')"
			>复审</w-button>
			<w-button
				v-show="!isBillState('checked') && $fxAuth('distributionOutBill4cld.sorting')"
				size="large"
				type="info"
				@click="onClickHandler('onSortingClick')"
			>分拣</w-button>
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
		<van-popup v-fx-history-back="inShopPopShow" v-model="inShopPopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="inShopPopShow"
				:data="inShopList"
				:loadFinished="true"
				title="请选择门店"
				@on-search="searchInShop"
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
				title="单据类型检索"
				@on-search="searchBillType"
				@on-select="selectBillType"
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
				:rdcId="orderInfoData.rdcDTO && orderInfoData.rdcDTO.id"
				:shopHouseDTO="currentShopHouseObj"
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
				:isDisabled="isBillState(['unCheck', 'checked']) || !$fxAuth('distributionOutBill4cld.save')"
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
				:rdcId="orderInfoData.rdcDTO && orderInfoData.rdcDTO.id"
				:isDisabled="isBillState(['unCheck', 'checked']) || !$fxAuth('distributionOutBill4cld.save')"
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
		<w-action-sheet
			v-fx-history-back="sortingActionSheetShow"
			ref="sortingActionSheet"
			v-model="sortingActionSheetShow"
			:actions="sortingCheckActions"
		></w-action-sheet>
	</w-app-page>
</template>

<script>
import { mapState } from 'vuex'
import orderInfo from '@/components/distributionOutBill4cld/createOrder/OrderInfo.vue'
import orderItem from '@/components/distributionOutBill4cld/createOrder/OrderItem.vue'
import listComp from '@/components/common/ListComp.vue'
import storeItemComp from '@/components/distributionOutBill4cld/common/StoreItemComp.vue'
import itemRowEditPop from '@/components/distributionOutBill4cld/common/ItemRowEditPop.vue'
import itemSearchPop from '@/components/distributionOutBill4cld/common/itemSearchPop.vue'
import itemEditComp from '@/components/distributionOutBill4cld/common/itemEditComp.vue'
export default {
	name: 'distributionOutBill4cldDetails',
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
			currentShopHouseObj: {},
			currentOutHouseObj: {},
			itemPopShow: false,
			itemInputFocusing: false,
			checkActionSheetShow: false,
			checkActions: [],
			fxOrderInfoVerification: this.$fxUtils.fxDataVerification(),
			fxOrderDetailsVerification: this.$fxUtils.fxDataVerification(),
			backAbsolute: false,
			sortingActionSheetShow: false,
			sortingCheckActions: this.$fxStateMiddleware.getStateList('sortingState')
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
		if (to.path === '/distributionOutBill4cld' && this.isChange && !this.backAbsolute) {
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
			disOut_arrivalIntervalTime: state => state.systemParamsCld.disOut_arrivalIntervalTime,
			disOut_setDate4Check: state => state.systemParamsCld.disOut_setDate4Check
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
		isBillSortingState (state) {
			return state => {
				return this.$fxStateMiddleware.stateIs('sortingState')(state)(this.orderInfoData.sortingState)
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
			return this.$fxApi('distributionOutBill4cld.getBillOtherAuth', this.query.orderId).then(res => {
				this.$store.commit({
					type: 'EXTEND_AUTH',
					billAuth: res.functionMapData[0]
				})
				return Promise.resolve(res)
			})
		},
		refreshOrderDetails () {
			return this.$fxApi('distributionOutBill4cld.getOrderDetails', this.query.orderId).then(this.initOrderDetails)
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
			let shopHouseIds = Array.from(new Set(data.map(item => {
				return item.shopHouseDTO.id
			})))
			let outHouseIds = Array.from(new Set(data.map(item => {
				return item.outHouseDTO.id
			})))
			let StoreItem = []
			shopHouseIds.forEach(shopHouseItem => {
				outHouseIds.forEach(outHouseItem => {
					let itemObjs = data.filter(dataItem => {
						return dataItem.outHouseDTO.id === outHouseItem && dataItem.shopHouseDTO.id === shopHouseItem
					})
					if (!itemObjs.length) {
						return
					}
					let storeObj = JSON.parse(JSON.stringify(itemObjs[0].outHouseDTO))
					storeObj.shopHouseDTO = itemObjs[0].shopHouseDTO
					storeObj.details = itemObjs
					StoreItem.push(storeObj)
				})
			})
			return StoreItem
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
		// {{{ 门店
		onInShopClick () {
			this.onInShopRefresh()
		},
		searchInShop (keyword) {
			this.onInShopRefresh(keyword)
		},
		selectInShop (item) {
			this.checkShop(item).then(() => {
				this.clearItemConfirm('更换门店会清空品项,是否继续?').then(() => {
					this.orderInfoData.inShopDTO = item
				})
			})
		},
		checkShop (shopDTO) {
			return new Promise(resolve => {
				let currentInShopDTO = this.orderInfoData.inShopDTO
				if (currentInShopDTO.id !== shopDTO.id) {
					resolve()
				}
			})
		},
		onInShopRefresh (keyword = null) {
			this.getInShopListData(keyword).then(res => {
				this.inShopList = res.shops
				this.inShopPopShow = true
			})
		},
		getInShopListData (keyword = null) {
			const params = {
				pid: this.orderInfoData.rdcDTO.id,
				keyword: keyword
			}
			return this.$fxApi('distributionOutBill4cld.getInShopListData')({ data: params })
		},
		// }}}
		// {{{ 配送中心
		onRdcClick () {
			this.onRdcRefresh()
		},
		searchRdc (keyword) {
			this.onRdcRefresh(keyword)
		},
		selectRdc (item) {
			this.checkRdc(item).then(() => {
				this.clearItemConfirm('修改配送中心将清空发货仓库、门店和单据明细，是否继续?').then(() => {
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
			return this.$fxApi('distributionOutBill4cld.getRdcListData')({ data: params })
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
			const params = {
				m: 'list4DistributionOutListBillEdit',
				keyword: keyword
			}
			return this.$fxApi('distributionOutBill4cld.getBillTypeListData')({ data: params })
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
				this.orderInfoData.arriveDate = time + this.$fxUtils.h2ms(this.disOut_arrivalIntervalTime)
			} else {
				this.orderInfoData.arriveDate = time
			}
			this.datePickerShow = false
		},
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
					this.$fxToast.top('请先选择门店!')
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
			this.$dialog.confirm({ title: '提示', message: '确定要保存该单据吗?' })
				.then(this.checkHasDetails)
				.then(this.saveHandler)
				.then(this.refreshOrderDetails)
				.then(() => {
					this.$fxToast.success('保存成功')
				})
		},
		saveHandler () {
			if (this.isBillState(['unSubmit', 'returned'])) {
				const params = this.getSaveParams()
				return this.$fxApi('distributionOutBill4cld.saveOrder', this.query.orderId)({ data: params })
			} else {
				return Promise.resolve()
			}
		},
		checkSorting () {
			return new Promise(resolve => {
				let message = ''
				if (this.$fxAuth('distributionOutBill4cld.sorting') && this.$fxStateMiddleware.stateIs('sortingState')(['sorting', 'unSorting'])(this.orderInfoData.sortingState)) {
					message = '所选择单据中分拣状态含有待分拣或分拣中单据，若强制审核单据分拣状态自动更新为：“已分拣”，是否继续审核？'
				} else {
					message = '是否审核所选单据？审核后单据将不能修改，确定要审核吗？'
				}
				this.$dialog.confirm({ title: '提示', message }).then(resolve)
			})
		},
		onExpressClick () {
			this.checkSorting().then(() => {
				if (this.disOut_setDate4Check === 0) {
					this.checkHasDetails()
						.then(this.saveHandler)
						.then(this.refreshOrderDetails)
						.then(this.expressHandler)
				} else {
					if (this.disOut_setDate4Check === 1) {
						this.checkActions = [
							{ id: 1, name: '审核并重置业务日期' },
							{ id: 0, name: '审核但不重置业务日期' }
						]
					} else if (this.disOut_setDate4Check === 2) {
						this.checkActions = [
							{ id: 1, name: '审核并重置业务日期' }
						]
					}
					this.$refs.checkActionSheet.doSelect().then(res => {
						this.checkHasDetails()
							.then(this.saveHandler)
							.then(this.refreshOrderDetails)
							.then(() => {
								this.expressByBusinessDate(res.id)
							})
					})
				}
			})
		},
		expressByBusinessDate (businessDateFlag) {
			let params = this.getSaveParams()
			return this.$fxApi('distributionOutBill4cld.checkOrderByBusinessDate', this.query.orderId, businessDateFlag)({ data: params }).then(res => {
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
			return this.$fxApi('distributionOutBill4cld.checkOrder', this.query.orderId)({ data: params }).then(res => {
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
			this.$dialog.confirm({ title: '提示', message: '确定要反审该单据吗?' })
				.then(this.unExpressHandler)
				.then(this.refreshOrderDetails)
				.then(() => {
					this.$fxToast.success('反审成功')
				})
		},
		unExpressHandler () {
			let params = this.getSaveParams()
			return this.$fxApi('distributionOutBill4cld.uncheckOrder', this.query.orderId)({ data: params })
		},
		onCopyClick () {
			this.$dialog.confirm({ title: '提示', message: '确定要复制该单据吗?' })
				.then(this.checkHasDetails)
				.then(this.copyHandler)
				.then(this.refreshOrderDetails)
				.then(() => {
					this.$fxToast.success('复制成功')
				})
		},
		copyHandler () {
			const params = this.getSaveParams()
			return this.$fxApi('distributionOutBill4cld.copyOrder', this.query.orderId)({ data: params })
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
			return this.$fxApi('distributionOutBill4cld.deleteOrder', this.query.orderId)({ data: params })
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
			return this.$fxApi('distributionOutBill4cld.checkAgain', this.query.orderId)({ data: params })
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
			return this.$fxApi('distributionOutBill4cld.unReCheck', this.query.orderId)({ data: params })
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
		onStoreItemSelect (outHouse, shopHouse) {
			this.currentOutHouseObj = outHouse
			this.currentShopHouseObj = shopHouse
			this.itemPopShow = true
		},
		getStoreItem () {
			if (
				this.$fxUtils.isEmptyObjSHW(this.currentShopHouseObj) ||
				this.$fxUtils.isEmptyObjSHW(this.currentOutHouseObj)
			) {
				return []
			} else {
				let currentStore = this.orderItemList.find(item => {
					return item.shopHouseDTO.id === this.currentShopHouseObj.id && item.id === this.currentOutHouseObj.id
				})
				if (currentStore) {
					return currentStore.details
				} else {
					return []
				}
			}
		},
		onItemEditConfirm ([selectedItemArr, outHouse, shopHouse]) {
			let currentStore = this.orderItemList.find(item => {
				return item.id === outHouse.id && item.shopHouseDTO.id === shopHouse.id
			})
			if (currentStore) {
				if (this.$fxAuth('distributionOutBill4cld.inputMultipleDetails')) {
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
				let _store = Object.assign({}, outHouse)
				_store.shopHouseDTO = shopHouse
				_store.details = selectedItemArr
				this.orderItemList.push(_store)
			}
		},
		onSubmitClick () {
			this.$dialog.confirm({ title: '提示', message: '确定要提交该单据吗?' })
				.then(this.checkHasDetails)
				.then(this.saveHandler)
				.then(this.refreshOrderDetails)
				.then(this.onSubmitHandler)
				.then(this.refreshOrderDetails)
				.then(() => {
					this.$fxToast.success('提交成功')
				})
		},
		onSubmitHandler () {
			return this.$fxApi('distributionOutBill4cld.submitOrder', this.query.orderId)
		},
		onReturnClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要退回该单据吗?'
			}).then(this.onReturnHandler)
				.then(this.refreshOrderDetails)
				.then(() => {
					this.$fxToast.success('退回成功')
				})
		},
		onReturnHandler () {
			return this.$fxApi('distributionOutBill4cld.returnOrder', this.query.orderId)
		},
		setOrderInfoHasNoticed () {
			this.orderInfoData.hasNoticed = true
		},
		onSortingClick () {
			this.sortingCheckActions.forEach(item => {
				item.disabled = this.orderInfoData.sortingState === item.id
			})
			this.$refs.sortingActionSheet.doSelect().then(res => {
				this.checkHasDetails()
					.then(this.saveHandler)
					.then(() => {
						this.sortingHandler(res.id).then(this.refreshOrderDetails).then(this.$fxCommon.orderSuccess('sorting'))
					})
			})
		},
		sortingHandler (sortingState) {
			let params = {
				sortingState
			}
			return this.$fxApi('distributionOutBill4cld.sortingOrder', this.query.orderId)({ data: params })
		}
	}
}
</script>
