<template>
	<w-app-page>
		<w-app-container>
			<w-header :title="orderInfoData.sysbillCode" titleFontSize="3.733vw" :border="true"></w-header>
			<orderInfo
				ref="orderInfo"
				:data="orderInfoData"
				:isDisabled="isBillState(['unCheck', 'checked']) || !$fxAuth('centerCheckBill4cld.save')"
				@on-rdc-click="onRdcClick"
				@on-house-click="onHouseClick"
				@on-checkType-click="onCheckTypeClick"
				@on-busdate-click="onBusinessDateClick"
				@on-notCheckType-click="onNotCheckTypeClick"
				@on-groupFlag-click="onGroupFlagClick"
				@on-costType-click="onCostTypeClick"
				@on-businessType-click="onBillTypeClick"
				@on-item-clear="onItemClear"
			></orderInfo>
			<orderItem
				ref="orderItem"
				:data="orderItemList"
				:isDisabled="isBillState(['unCheck', 'checked']) || !$fxAuth('centerCheckBill4cld.save')"
				:itemInputFocusing.sync="itemInputFocusing"
				:showAddItemBtn="!$fxAuth('centerCheckBill4cld.notAllAddDetail')"
				:inShopId="orderInfoData.inShopDTO && orderInfoData.inShopDTO.id"
				:rdcId="orderInfoData.rdcDTO && orderInfoData.rdcDTO.id"
				:editAmountType="editAmountType"
				:editIndex="editIndex"
				:showPackInfo="centerCheck_enableItemPack==='1'"
				@on-add-click="onAddClick"
				@on-search-click="onSearchClick"
				@on-item-edit="onItemEdit"
				@on-amount-edit="onAmountEdit"
			></orderItem>
			<div v-show="showKeyboard" class="keyboard-masker" @click="onKeyboardClose"></div>
		</w-app-container>
		<w-bottom-btn-bar v-show="!showKeyboard">
			<w-button
				v-show="isBillState(['unSubmit', 'returned']) && $fxAuth('centerCheckBill4cld.del')"
				size="large"
				type="danger"
				@click="onClickHandler('onDeleteClick')"
			>删除</w-button>
			<w-button
				v-show="isBillState('unCheck') && $fxAuth('centerCheckBill4cld.drawback')"
				size="large"
				type="danger"
				@click="onClickHandler('onReturnClick')"
			>退回</w-button>
			<w-button
				v-show="isBillState('checked') && $fxAuth('centerCheckBill4cld.unCheck')"
				size="large"
				type="danger"
				@click="onClickHandler('onUnExpressClick')"
			>反审</w-button>
			<w-button
				v-show="isBillState('rechecked') && $fxAuth('centerCheckBill4cld.unReCheck')"
				size="large"
				type="danger"
				@click="onClickHandler('onUnExpressAgainClick')"
			>取消复审</w-button>
			<w-button
				v-show="isBillState(['unCheck', 'unSubmit', 'returned']) && $fxAuth('centerCheckBill4cld.check')"
				size="large"
				type="info"
				@click="onClickHandler('onExpressClick')"
			>审核</w-button>
			<w-button
				v-show="isBillState(['unSubmit', 'returned']) && $fxAuth('centerCheckBill4cld.submit')"
				size="large"
				type="info"
				@click="onClickHandler('onSubmitClick')"
			>提交</w-button>
			<w-button
				v-show="isBillState(['unSubmit', 'returned']) && $fxAuth('centerCheckBill4cld.save')"
				size="large"
				type="primary"
				@click="onClickHandler('onSaveClick')"
			>保存</w-button>
			<w-button
				v-show="isBillState(['checked', 'cancelRechecked']) && $fxAuth('centerCheckBill4cld.reCheck')"
				size="large"
				type="info"
				@click="onClickHandler('onExpressAgainClick')"
			>复审</w-button>
			<w-button
				v-show="orderInfoData.checkInBill"
				size="large"
				type="primary"
				@click="onClickHandler('goCenterCheckInBill')"
			>去盘盈单</w-button>
			<w-button
				v-show="orderInfoData.checkOutBill"
				size="large"
				type="primary"
				@click="onClickHandler('goCenterCheckOutBill')"
			>去盘亏单</w-button>
			<w-button
				v-show="isBillState(['unSubmit', 'returned']) && $fxAuth('centerCheckBill4cld.save')"
				size="large"
				type="primary"
				@click="onClickHandler('onMoreClick')"
			>更多</w-button>
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
		<van-popup v-fx-history-back="housePopShow" v-model="housePopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="housePopShow"
				:data="houseList"
				:loadFinished="true"
				title="请选择盘点仓库"
				@on-search="searchHouse"
				@on-select="selectHouse"
			></listComp>
		</van-popup>
		<van-popup v-fx-history-back="checkTypePopShow" v-model="checkTypePopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="checkTypePopShow"
				:data="checkTypeList"
				:loadFinished="true"
				title="请选择盘点分类"
				@on-search="searchCheckType"
				@on-select="selectCheckType"
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
			v-fx-history-back="itemPopShow"
			v-model="itemPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<itemEditComp
				ref="itemEditComp"
				:visibleFlag.sync="itemPopShow"
				:orderInfoData="orderInfoData"
				:orderItemList="orderItemList"
				:superaddition="superaddition"
				:beforeConfirm="itemEditBeforeConfirm"
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
				:isDisabled="isBillState(['unCheck', 'checked']) || !$fxAuth('centerCheckBill4cld.save')"
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
				:isDisabled="isBillState(['unCheck', 'checked']) || !$fxAuth('centerCheckBill4cld.save')"
				showScanCode
				:businessDate="orderInfoData.businessDate"
				@on-search-confirm="onSearchConfirm"
			></itemSearchPop>
		</van-popup>
		<w-action-sheet
			v-fx-history-back="notCheckTypeActionShow"
			ref="notCheckTypeActionSheet"
			v-model="notCheckTypeActionShow"
			:actions="notCheckTypeList"
		></w-action-sheet>
		<w-action-sheet
			v-fx-history-back="groupFlagActionShow"
			ref="groupFlagActionSheet"
			v-model="groupFlagActionShow"
			:actions="groupFlagList"
		></w-action-sheet>
		<w-action-sheet
			v-fx-history-back="costTypeActionShow"
			ref="costTypeActionSheet"
			v-model="costTypeActionShow"
			:actions="costTypeList"
		></w-action-sheet>
		<w-action-sheet
			v-fx-history-back="moreActionShow"
			ref="moreActionSheet"
			v-model="moreActionShow"
			:actions="moreList"
		></w-action-sheet>
		<itemNumberKeyboard
			ref="itemNumberKeyboard"
			v-model="showKeyboard"
			@prev="onKeyboardPrev"
			@next="onKeyboardNext"
			@close="onKeyboardClose"
			@on-edit-amount-type-change="onEditAmountTypeChange"
		></itemNumberKeyboard>
	</w-app-page>
</template>

<script>
import { mapState } from 'vuex'
import orderInfo from '@/components/centerCheckBill4cld/createOrder/OrderInfo.vue'
import orderItem from '@/components/centerCheckBill4cld/createOrder/OrderItem.vue'
import listComp from '@/components/common/ListComp.vue'
import itemRowEditPop from '@/components/centerCheckBill4cld/common/ItemRowEditPop.vue'
import itemSearchPop from '@/components/centerCheckBill4cld/common/itemSearchPop.vue'
import itemEditComp from '@/components/centerCheckBill4cld/common/itemEditComp.vue'
import itemNumberKeyboard from '@/components/centerCheckBill4cld/common/ItemNumberKeyboard.vue'
const MORE_MENU_LIST = [{
	id: 0,
	name: '实盘为0',
	handler: 'doCheckZero'
}, {
	id: 1,
	name: '实盘取账存',
	handler: 'doCheckAccount'
}, {
	id: 2,
	name: '导入必盘品项',
	handler: 'doImportMust'
}, {
	id: 3,
	name: '导入盘点品项',
	handler: 'doImportCheck'
}, {
	id: 4,
	name: '追加',
	handler: 'doSuperaddition'
}]
export default {
	name: 'centerCheckBill4cldDetails',
	components: {
		orderInfo,
		orderItem,
		listComp,
		itemRowEditPop,
		itemSearchPop,
		itemEditComp,
		itemNumberKeyboard
	},
	data () {
		return {
			query: this.$route.query,
			orderInfoData: {},
			orderItemList: [],
			currentDate: new Date(),
			rdcPopShow: false,
			rdcList: [],
			housePopShow: false,
			houseList: [],
			checkTypePopShow: false,
			checkTypeList: [],
			datePickerShow: false,
			notCheckTypeActionShow: false,
			notCheckTypeList: this.$fxTypeMiddleware.getCommonTypeList('notCheckType'),
			groupFlagActionShow: false,
			groupFlagList: this.$fxTypeMiddleware.getCommonTypeList('checkWay'),
			costTypeActionShow: false,
			costTypeList: this.$fxTypeMiddleware.getCommonTypeList('costType'),
			billTypePopShow: false,
			billTypeList: [],
			itemSearchPopShow: false,
			itemRowEditPopShow: false,
			itemEditRowData: {},
			searchItem: [],
			itemPopShow: false,
			itemInputFocusing: false,
			checkActionSheetShow: false,
			checkActions: [],
			fxOrderInfoVerification: this.$fxUtils.fxDataVerification(),
			fxOrderDetailsVerification: this.$fxUtils.fxDataVerification(),
			backAbsolute: false,
			moreActionShow: false,
			superaddition: false,
			saveDebounce: this.$fxUtils.debounce(),
			showKeyboard: false,
			editIndex: -1,
			editAmountType: ''
		}
	},
	created () {
		this.getSystemParams().then(this.refreshOrderDetails)
	},
	beforeRouteLeave (to, from, next) {
		if (this.itemInputFocusing) {
			this.$router.go(1)
			return false
		}
		if ((to.path === '/centerCheckBill4cld' || to.path === '/centerCheckIn4cld') && this.isChange && !this.backAbsolute) {
			this.$dialog.confirm({
				title: '提示',
				message: '当前单据已修改<br/>是否保存单据?'
			}).then(() => {
				this.$router.go(1)
				this.checkOrderInfo().then(this.saveHandler).then(() => {
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
			disOut_setDate4Check: state => state.systemParamsCld.disOut_setDate4Check,
			centerCheck_showAllCheckType: state => state.systemParamsCld.centerCheck_showAllCheckType,
			centerCheck_enableItemPack: state => state.systemParamsCld.centerCheck_enableItemPack
		}),
		isBillState (state) {
			return state => {
				return this.$fxStateMiddleware.stateIs('stateAndRecheckSingleCld')(state)(this.orderInfoData.billStateFlag)
			}
		},
		isChange () {
			return !this.fxOrderInfoVerification.checkData(this.orderInfoData) || !this.fxOrderDetailsVerification.checkData(this.orderItemList)
		},
		moreList () {
			const moreListAuth = [
				this.$fxAuth('centerCheckBill4cld.actualAmountZero'),
				this.$fxAuth('centerCheckBill4cld.actualAmountEqualsAcc'),
				this.$fxAuth('centerCheckBill4cld.importMustItems') && !this.$fxAuth('centerCheckBill4cld.notAllAddDetail'),
				this.$fxAuth('centerCheckBill4cld.importCheckItems') && !this.$fxAuth('centerCheckBill4cld.notAllAddDetail'),
				!this.$fxAuth('centerCheckBill4cld.notAllAddDetail')
			]
			return MORE_MENU_LIST.filter(item => moreListAuth[item.id])
		}
	},
	methods: {
		getSystemParams () {
			return this.$fxApi('centerCheckBill4cld.getSystemParams').then(res => {
				const params = {}
				const baseDataVO = res.baseDataVO
				baseDataVO.forEach(item => {
					params[item.key] = item.value
				})
				this.$store.commit({
					type: 'ADD_SYSTEM_PARAMS_CLD',
					state: {
						centerCheck_defaultCurrentTime: params.defaultCurrentTime,
						centerCheck_defaultCurrentDay: params.defaultCurrentDay,
						centerCheck_unCheckDoWay: params.unCheckDoWay,
						centerCheck_showAllCheckType: params.showAllCheckType,
						centerCheck_enableItemPack: params.enableItemPack
					}
				})
				return Promise.resolve(res)
			})
		},
		refreshOrderDetails () {
			return this.$fxApi('centerCheckBill4cld.getOrderDetails', this.query.orderId).then(this.initOrderDetails)
		},
		initOrderDetails (res) {
			let orderDetailsData = res.storeBills[0]
			this.orderInfoData = orderDetailsData
			this.orderItemList = orderDetailsData.details
			this.setDataUUID(this.orderItemList)
			this.$nextTick(() => {
				this.fxOrderInfoVerification.resetData(this.orderInfoData)
				this.fxOrderDetailsVerification.resetData(this.orderItemList)
			})
			return Promise.resolve()
		},
		setDataUUID (data) {
			data.forEach(dataItem => {
				dataItem.uuid = this.$fxUtils.createUUID()
			})
		},
		clearItemConfirm (message) {
			return new Promise(resolve => {
				const items = this.orderItemList.filter(item => {
					return item.changeType !== 'del'
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
			this.getRdcListData().then(res => {
				this.rdcList = res.shops
				this.rdcPopShow = true
			})
		},
		searchRdc (keyword) {
			this.getRdcListData(keyword).then(res => {
				this.houserdcListList = res.shops
			})
		},
		selectRdc (item) {
			this.checkRdc(item).then(() => {
				const items = this.orderItemList.filter(item => {
					return item.changeType !== 'del'
				})
				if (items.length === 0) {
					this.$dialog.confirm({
						title: '提示',
						message: '修改配送中心将清空盘点仓库，是否继续?'
					}).then(() => {
						this.orderInfoData.rdcDTO = item
						this.orderInfoData.houseDTO = {}
					})
				} else {
					this.$dialog.confirm({
						title: '提示',
						message: '修改配送中心将清空盘点仓库和单据明细，是否继续?'
					}).then(() => {
						this.onItemClear()
						this.orderInfoData.rdcDTO = item
						this.orderInfoData.houseDTO = {}
					})
				}
			})
		},
		checkRdc (rdcDTO) {
			return new Promise(resolve => {
				let current = this.orderInfoData.rdcDTO
				if (current.id !== rdcDTO.id) {
					resolve()
				}
			})
		},
		getRdcListData (keyword = null) {
			const params = {
				keyword: keyword
			}
			return this.$fxApi('common.getRdcListData')({ data: params })
		},
		// }}}
		// {{{ 盘点仓库
		onHouseClick () {
			if (!this.orderInfoData.rdcDTO.id) {
				this.$fxToast.fail('请先选择配送中心!')
				return false
			}
			this.getHouseListData().then(res => {
				this.houseList = res.shops
				this.housePopShow = true
			})
		},
		searchHouse (keyword) {
			this.getHouseListData(keyword).then(res => {
				this.houseList = res.shops
			})
		},
		selectHouse (item) {
			this.checkHouse(item).then(() => {
				if (item.refItemFlag === '1') {
					this.clearItemConfirm('切换关联品项的仓库将清空单据明细，是否继续?').then(() => {
						this.orderInfoData.houseDTO = item
					})
				} else {
					this.orderInfoData.houseDTO = item
				}
			})
		},
		checkHouse (houseDTO) {
			return new Promise(resolve => {
				let current = this.orderInfoData.houseDTO
				if (current.id !== houseDTO.id) {
					resolve()
				}
			})
		},
		getHouseListData (keyword = null) {
			const params = {
				keyword: keyword
			}
			return this.$fxApi('common.getStoreListData', this.orderInfoData.rdcDTO.id)({ data: params })
		},
		// {{{ 盘点分类
		onCheckTypeClick () {
			this.getCheckTypeListData().then(res => {
				this.checkTypeList = res.baseDataVO
				this.checkTypePopShow = true
			})
		},
		searchCheckType (keyword) {
			this.getCheckTypeListData(keyword).then(res => {
				this.checkTypeList = res.baseDataVO
			})
		},
		selectCheckType (item) {
			this.checkCheckType(item).then(() => {
				this.clearItemConfirm('切换盘点分类将清空单据明细，是否继续?').then(() => {
					this.orderInfoData.checkTypeDTO = item
				})
			})
		},
		checkCheckType (checkTypeDTO) {
			return new Promise(resolve => {
				let current = this.orderInfoData.checkTypeDTO
				if (current.id !== checkTypeDTO.id) {
					resolve()
				}
			})
		},
		getCheckTypeListData (keyword = null) {
			const params = {
				keyword: keyword
			}
			return this.$fxApi('centerCheckBill4cld.getCheckTypeList', this.orderInfoData.rdcDTO.id)({ data: params })
		},
		// }}}
		// {{{ 业务日期
		onBusinessDateClick () {
			if (this.orderInfoData.businessDate) this.currentDate = new Date(this.orderInfoData.businessDate)
			this.datePickerShow = true
		},
		dateConfirmhandle (date) {
			let time = date.getTime()
			this.orderInfoData.businessDate = time
			this.datePickerShow = false
		},
		// }}}
		// {{{ 未盘品项处理方式
		onNotCheckTypeClick () {
			this.$refs.notCheckTypeActionSheet.doSelect().then(item => {
				this.orderInfoData.unCheckItemDoType = item.id
			})
		},
		// }}}
		// {{{ 盘点方式
		onGroupFlagClick () {
			this.$refs.groupFlagActionSheet.doSelect().then(item => {
				this.orderInfoData.groupFlag = item.id
			})
		},
		// }}}
		// {{{ 成本类型
		onCostTypeClick () {
			this.$refs.costTypeActionSheet.doSelect().then(item => {
				if (this.$fxTypeMiddleware.isCommonType('costType')(['all'])(item.id)) {
					this.orderInfoData.costType = item.id
				} else {
					this.clearItemConfirm('修改成本类型将清空单据明细，是否继续?').then(() => {
						this.orderInfoData.costType = item.id
					})
				}
			})
		},
		// }}}
		// {{{ 业务类型
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
			const params = {
				m: 'list4CenterCheck',
				keyword: keyword
			}
			return this.$fxApi('common.getBusinessTypeListData')({ data: params })
		},
		// }}}
		onAddClick () {
			this.checkOrderInfo()
				.then(this.saveHandler)
				.then(this.refreshOrderDetails)
				.then(this.canAddItem)
				.then(() => {
					this.superaddition = false
					this.itemPopShow = true
				})
		},
		checkOrderInfo () {
			return new Promise((resolve, reject) => {
				if (!this.orderInfoData.rdcDTO.id) {
					this.$fxToast.top('请先选择配送中心!')
				} else if (!this.orderInfoData.houseDTO.id) {
					this.$fxToast.top('请先选择盘点仓库!')
				} else if (!this.orderInfoData.checkTypeDTO.id) {
					this.$fxToast.top('请先选择盘点分类!')
				} else if (!this.orderInfoData.businessDate) {
					this.$fxToast.top('请先选择业务日期!')
				} else {
					resolve()
				}
			})
		},
		canAddItem () {
			return this.$fxApi('centerCheckBill4cld.canAddItem', this.query.orderId)
		},
		// {{{ 搜索界面
		onSearchClick () {
			this.itemSearchPopShow = true
			this.searchItem = this.$fxUtils.deepClone(this.orderItemList)
		},
		// }}}
		onSaveClick () {
			this.checkOrderInfo().then(() => {
				this.$dialog.confirm({ title: '提示', message: '确定要保存该单据吗?' })
					.then(this.saveHandler)
					.then(this.refreshOrderDetails)
					.then(() => {
						this.$fxToast.success('保存成功')
					})
			})
		},
		saveHandler () {
			if (this.isBillState(['unSubmit', 'returned']) && this.isChange) {
				const params = this.getSaveParams()
				return this.$fxApi('centerCheckBill4cld.saveOrder')({ data: params })
			} else {
				return Promise.resolve()
			}
		},
		onExpressClick () {
			this.checkOrderInfo().then(() => {
				this.checkValidate().then(message => {
					this.$dialog.confirm({ title: '提示', message })
						.then(this.saveHandler)
						.then(this.refreshOrderDetails)
						.then(this.expressHandler)
				})
			})
		},
		expressHandler () {
			let params = this.getSaveParams()
			return this.$fxApi('centerCheckBill4cld.checkOrder', this.query.orderId)({ data: params }).then(res => {
				this.refreshOrderDetails().then(() => {
					this.$fxToast.success('审核成功')
				})
			})
		},
		checkValidate () {
			return new Promise(resolve => {
				this.$fxApi('centerCheckBill4cld.checkValidate', this.query.orderId).then(res => {
					resolve('确定要审核该单据吗?')
				}).catch(error => {
					if (error.errorCode === '3') {
						resolve(error.message)
					} else {
						this.$dialog.alert({
							title: '提示',
							message: error.message
						})
					}
				})
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
			return this.$fxApi('centerCheckBill4cld.uncheckOrder', this.query.orderId)({ data: params })
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
			return this.$fxApi('centerCheckBill4cld.deleteOrder', this.query.orderId)({ data: params })
		},
		getSaveParams (itemDetails = this.orderItemList) {
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
			return this.orderItemList.filter(item => {
				return item.changeType !== 'del'
			})
		},
		getItemLength () {
			return this.getValidItem().length
		},
		onItemEdit (itemData) {
			this.itemEditRowData = itemData
			this.itemRowEditPopShow = true
		},
		toFixedNumberSize (data, pointSize = this.sysMoneyPointSize) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, pointSize))
		},
		onItemClear () {
			let details = this.orderInfoData.details.filter(item => {
				return !!item.id
			})
			details.forEach(item => {
				item.changeType = 'del'
			})
			this.orderInfoData.details = details
			this.orderItemList = details
		},
		onClickHandler (method) {
			if (this.itemInputFocusing) {
				return false
			}
			this[method]()
		},
		onSearchConfirm (searchItemData) {
			this.orderItemList = searchItemData
			this.orderInfoData.details = searchItemData
			this.saveHandler()
				.then(this.refreshOrderDetails)
				.then(() => {
					this.$fxToast.success('保存成功')
				})
		},
		itemEditBeforeConfirm (selectedItemArr) {
			return new Promise(resolve => {
				if (selectedItemArr.length > 0) {
					let num = '1'
					if (this.orderItemList.length > 0) {
						num = this.orderItemList[0].num - 0 + 1
					}
					const _select = selectedItemArr.filter(select => {
						const index = this.orderItemList.findIndex(item => {
							return item.goodsDTO.id === select.goodsDTO.id
						})
						return !~index
					})
					_select.forEach(item => {
						item.changeType = 'add'
						item.num = num
					})
					this.itemEditConfirmsaveHandler([...this.orderItemList, ..._select])
						.then(this.refreshOrderDetails)
						.then(() => {
							this.$fxToast.success('保存成功')
							resolve()
						})
				} else {
					resolve()
				}
			})
		},
		itemEditConfirmsaveHandler (orderItemList) {
			const params = this.getSaveParams(orderItemList)
			return this.$fxApi('centerCheckBill4cld.saveOrder')({ data: params })
		},
		onSubmitClick () {
			this.checkOrderInfo().then(() => {
				this.$dialog.confirm({ title: '提示', message: '确定要提交该单据吗?' })
					.then(this.saveHandler)
					.then(this.refreshOrderDetails)
					.then(this.onSubmitHandler)
					.then(this.refreshOrderDetails)
					.then(() => {
						this.$fxToast.success('提交成功')
					})
			})
		},
		onSubmitHandler () {
			return this.$fxApi('centerCheckBill4cld.submitOrder', this.query.orderId)
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
			return this.$fxApi('centerCheckBill4cld.returnOrder', this.query.orderId)
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
			return this.$fxApi('centerCheckBill4cld.checkAgain', this.query.orderId)({ data: params })
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
			return this.$fxApi('centerCheckBill4cld.unReCheck', this.query.orderId)({ data: params })
		},
		onMoreClick () {
			this.checkOrderInfo().then(this.$refs.moreActionSheet.doSelect).then(item => {
				this[item.handler]()
			})
		},
		doCheckZero (name) {
			this.$dialog.confirm({
				title: '提示',
				message: '确定进行实盘为0操作吗?'
			}).then(this.saveHandler)
				.then(this.checkZeroHandler)
				.then(this.refreshOrderDetails)
				.then(() => {
					this.$fxToast.success('操作成功')
				})
		},
		checkZeroHandler () {
			return this.$fxApi('centerCheckBill4cld.checkZero', this.query.orderId)
		},
		doCheckAccount () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定进行实盘取账存操作吗?'
			}).then(this.saveHandler)
				.then(this.checkAccountHandler)
				.then(this.refreshOrderDetails)
				.then(() => {
					this.$fxToast.success('操作成功')
				})
		},
		checkAccountHandler () {
			return this.$fxApi('centerCheckBill4cld.checkAccount', this.query.orderId)
		},
		doImportMust () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定进行导入必盘项操作吗?'
			}).then(this.saveHandler)
				.then(this.importMustHandler)
				.then(this.refreshOrderDetails)
				.then(() => {
					this.$fxToast.success('导入成功')
				})
		},
		importMustHandler () {
			const params = {
				checkBillId: this.query.orderId,
				storeId: this.orderInfoData.houseDTO.name,
				checkWay: this.orderInfoData.groupFlag
			}
			return this.$fxApi('centerCheckBill4cld.importMustItem', this.query.orderId)({ data: params })
		},
		doImportCheck () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定进行导入盘点品项操作吗?'
			}).then(this.saveHandler)
				.then(this.importCheckHandler)
				.then(this.refreshOrderDetails)
				.then(() => {
					this.$fxToast.success('导入成功')
				})
		},
		importCheckHandler () {
			const params = {
				checkBillId: this.query.orderId,
				storeId: this.orderInfoData.houseDTO.name,
				checkWay: this.orderInfoData.groupFlag
			}
			return this.$fxApi('centerCheckBill4cld.importCheckItem', this.query.orderId)({ data: params })
		},
		doSuperaddition () {
			this.checkOrderInfo()
				.then(this.saveHandler)
				.then(this.refreshOrderDetails)
				.then(this.canAddItem)
				.then(() => {
					this.superaddition = true
					this.itemPopShow = true
				})
		},
		saveSilenceHandler () {
			this.saveDebounce(10000).then(() => {
				if (this.isBillState(['unSubmit', 'returned']) && this.isChange) {
					const params = this.getSaveParams()
					this.$fxApi('centerCheckBill4cld.saveOrderSilence')({ data: params }).then(() => {
						this.fxOrderInfoVerification.resetData(this.orderInfoData)
						this.fxOrderDetailsVerification.resetData(this.orderItemList)
					})
				}
			})
		},
		goCenterCheckInBill () {
			this.$router.replace({
				path: 'centerCheckIn4cldDetails',
				query: {
					orderId: this.orderInfoData.checkInBill
				}
			})
		},
		goCenterCheckOutBill () {
			this.$router.replace({
				path: 'centerCheckOut4cldDetails',
				query: {
					orderId: this.orderInfoData.checkOutBill
				}
			})
		},
		onAmountEdit (type, itemData, itemIndex) {
			this.editAmountType = type
			this.editIndex = itemIndex
			this.$refs.orderInfo.closeCollapse()
			this.$refs.itemNumberKeyboard.open(type, itemData, itemIndex)
			this.$refs.orderItem.scrollTop(itemIndex)
		},
		onKeyboardPrev (itemIndex) {
			this.$refs.orderItem.prev(itemIndex)
			this.saveSilenceHandler()
		},
		onKeyboardNext (itemIndex) {
			this.$refs.orderItem.next(itemIndex)
			this.saveSilenceHandler()
		},
		onKeyboardClose () {
			this.editAmountType = ''
			this.editIndex = -1
			this.showKeyboard = false
			this.saveSilenceHandler()
		},
		onEditAmountTypeChange (type) {
			this.editAmountType = type
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.keyboard-masker {
	position: absolute
	top: 0
	left: 0
	right: 0
	bottom: 0
	z-index: 500
}
</style>
