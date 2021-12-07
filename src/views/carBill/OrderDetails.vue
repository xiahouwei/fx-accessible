<template>
	<div class="inteledi-carBill-details">
		<w-header :title="orderInfoData.sysbillCode" titleFontSize="3.733vw" :border="true"></w-header>
		<orderInfo
			ref="orderInfo"
			:data="orderInfoData"
			:isDisabled="!$fxAuth('carBill.save') || isBillState(1) || isWeightState(1) || isWeightState(2)"
			:collapseDisabled="itemInputFocusing"
			@on-busdate-click="onBusinessDateClick"
			@on-shop-click="onShopClick"
			@on-inStore-click="onInStoreClick"
			@on-outStore-click="onOutStoreClick"
			@on-billType-click="onBillTypeClick"
			@on-billType-clear="onBillTypeClear"
		></orderInfo>
		<orderItem
			:data="orderItemList"
			:isDisabled="!$fxAuth('carBill.save') || isBillState(1) || isWeightState(1) || isWeightState(2)"
			:itemInputFocusing.sync="itemInputFocusing"
			@on-add-click="onAddClick"
			@on-search-click="onSearchClick"
			@on-unit-edit="onUnitEdit"
			@on-item-edit="onItemEdit"
			@on-bom-view="onBomView"
			@on-item-focus="onItemFocus"
		></orderItem>
		<div class="carBill-bottom">
			<van-button
				v-show="$fxAuth('carBill.del') && isBillState(0) && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onClickHandler('onDeleteClick')"
			>删除</van-button>
			<van-button
				v-show="$fxAuth('carBill.check') && isBillState(0) && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius"
				type="info"
				@click="onClickHandler('onExpressClick')"
			>审核</van-button>
			<van-button
				v-show="$fxAuth('carBill.unCheck') && isBillState(1) && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onClickHandler('onUnExpressClick')"
			>反审</van-button>
			<van-button
				v-show="$fxAuth('carBill.save') && isBillState(0) && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius"
				type="primary"
				@click="onClickHandler('onSaveClick')"
			>保存</van-button>
			<!-- $fxAuth('carBill.weighState') -->
			<van-button
				v-show="$fxAuth('carBill.weighState') && isBillState(0) && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius yellow-btn"
				type="info"
				@click="onClickHandler('onWeightClick')"
			>下发称重</van-button>
			<van-button
				v-show="$fxAuth('carBill.weighState') && isBillState(0) && (isWeightState(1) || isWeightState(2))"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onClickHandler('onUnWeightClick')"
			>取消称重</van-button>
			<van-button
				v-show="$fxAuth('carBill.weighState') && isBillState(0) && isWeightState(2) && sysDZCManyLower"
				class="bottom-btn fx-no-radius"
				type="info"
				@click="onClickHandler('onEndWeightClick')"
			>结束称重</van-button>
		</div>
		<van-popup v-model="datePickerShow" position="bottom">
			<w-date-picker
				:visibleFlag.sync="datePickerShow"
				:currentDate="currentDate"
				@confirm="dateConfirmhandle"
			></w-date-picker>
		</van-popup>
		<van-popup v-model="shopPopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="shopPopShow"
				:data="shopList"
				:loadFinished="shopListLoadFinished"
				:loading.sync="onShopLoading"
				title="请选择机构"
				@on-search="searchShop"
				@on-select="selectShop"
				@on-load="onShopLoad"
			></listComp>
		</van-popup>
		<van-popup v-model="inStorePopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="inStorePopShow"
				:data="inStoreList"
				:loadFinished="true"
				title="成品仓库检索"
				@on-search="searchInStore"
				@on-select="selectInStore"
			></listComp>
		</van-popup>
		<van-popup v-model="outStorePopShow" position="right" class="fx-list-popup-300">
			<listComp
				:visibleFlag.sync="outStorePopShow"
				:data="outStoreList"
				title="材料仓库检索"
				:loadFinished="true"
				@on-select="selectOutStore"
				@on-search="searchOutStore"
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
		<van-actionsheet
			v-model="unitActionShow"
			:actions="unitActions"
			cancel-text="取消"
			@select="onUnitSelect"
		/>
		<van-popup
			v-model="itemPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<itemEditComp
				:visibleFlag.sync="itemPopShow"
				:inHouseId="orderInfoData.inHouseDTO && orderInfoData.inHouseDTO.id"
				:outHouseId="orderInfoData.outHouseDTO && orderInfoData.outHouseDTO.id"
				:shopId="orderInfoData.shopDTO && orderInfoData.shopDTO.id"
				:parentStoreItem="orderItemList"
				@on-confirm="onItemEditConfirm"
			></itemEditComp>
		</van-popup>
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
				:inHouseId="orderInfoData.inHouseDTO && orderInfoData.inHouseDTO.id"
				:outHouseId="orderInfoData.outHouseDTO && orderInfoData.outHouseDTO.id"
				:shopId="orderInfoData.shopDTO && orderInfoData.shopDTO.id"
				:isBillState="isBillState(1)"
				:isDisabled="isBillState(1) || !$fxAuth('carBill.save') || isWeightState(1) || isWeightState(2)"
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
				:orderInfoData="orderInfoData"
				:isDisabled="isBillState(1) || !$fxAuth('carBill.save') || isWeightState(1) || isWeightState(2)"
				@on-bom-view="onBomView"
				@on-search-confirm="onSearchConfirm"
			></itemSearchPop>
		</van-popup>
		<van-popup
			v-model="orderBomPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<orderBomPop
				:visibleFlag.sync="orderBomPopShow"
				:itemData="itemEditRowData"
				:orderInfoData="orderInfoData"
				:isBillState="isBillState(1)"
				:isDisabled="isBillState(1) || !$fxAuth('carBill.save') || isWeightState(1) || isWeightState(2)"
				@on-bom-save="onBomSave"
			></orderBomPop>
		</van-popup>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import orderInfo from '@/components/carBill/createOrder/OrderInfo.vue'
import orderItem from '@/components/carBill/createOrder/OrderItem.vue'
import listComp from '@/components/common/ListComp.vue'
import itemEditComp from '@/components/carBill/common/itemEditComp.vue'
import itemRowEditPop from '@/components/carBill/common/itemRowEditPop.vue'
import itemSearchPop from '@/components/carBill/common/itemSearchPop.vue'
import orderBomPop from '@/components/carBill/bom/orderBomPop.vue'
const ITEM_SIZE = 50
export default {
	name: 'carBillDetails',
	components: {
		orderInfo,
		orderItem,
		listComp,
		itemEditComp,
		itemRowEditPop,
		itemSearchPop,
		orderBomPop
	},
	data () {
		return {
			query: this.$route.query,
			orderInfoData: {},
			orderItemList: [],
			currentDate: new Date(),
			datePickerShow: false,
			itemPopShow: false,
			shopPopShow: false,
			shopList: [],
			searchShopKey: null,
			shopListStart: 0,
			onShopLoading: false,
			shopListLoadFinished: false,
			inStorePopShow: false,
			inStoreListStart: 0,
			inStoreLoading: false,
			inStoreLoadFinished: false,
			inStoreList: [],
			outStorePopShow: false,
			outStoreList: [],
			outStoreListStart: 0,
			outStoreLoading: false,
			outStoreLoadFinished: false,
			itemEditRowData: {},
			unitActionShow: false,
			unitActions: [],
			itemRowEditPopShow: false,
			itemInputFocusing: false,
			orderDeleteFlag: false,
			formatterSysPointKey: ['factCount', 'factMoney', 'processingFee', 'sumMoney', 'planCount', 'planMoney'],
			itemSearchPopShow: false,
			billTypeList: [],
			billTypePopShow: false,
			orderBomPopShow: false,
			searchItem: []
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
		if (to.path === '/carBill' && !this.orderDeleteFlag && this.orderInfoData.billState === 0) {
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
			loginerShopName: state => state.loginer.loginerShopName,
			loginerOrganType: state => state.loginer.loginerOrganType,
			loginerId: state => state.loginer.loginerId,
			sysDZCManyLower: state => state.systemParams.sysDZCManyLower
		}),
		isBillState (state) {
			return (state) => {
				if (Object.prototype.toString.call(state) === '[object Array]') {
					return state.includes(this.orderInfoData.billState)
				} else {
					return this.orderInfoData.billState === state
				}
			}
		},
		isWeightState (state) {
			return (state) => {
				if (Object.prototype.toString.call(state) === '[object Array]') {
					return state.includes(this.orderInfoData.weightState)
				} else {
					return this.orderInfoData.weightState === state
				}
			}
		}
	},
	methods: {
		createOrderDetails () {
			return new Promise(resolve => {
				this.getOrderDetails().then(res => {
					let orderDetailsData = res.carBills[0]
					this.formatterSysPoint(orderDetailsData.finishDetail)
					this.orderInfoData = orderDetailsData
					this.orderItemList = this.filterStoreItem(orderDetailsData.finishDetail)
					resolve()
				})
			})
		},
		getOrderDetails () {
			return new Promise(resolve => {
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/carBill/${this.query.orderId}/users/${this.loginerId}`
				}).then(res => {
					resolve(res)
				})
			})
		},
		formatterSysPoint (data) {
			data.forEach(item => {
				this.formatterSysPointKey.forEach(pointItem => {
					if (item[pointItem]) {
						item[pointItem] = this.toFixedNumberSize(item[pointItem])
					}
				})
			})
		},
		toFixedNumberSize (data) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysPointSize))
		},
		filterStoreItem (data) {
			data.forEach(dataItem => {
				let amount = parseFloat(dataItem.factCount)
				if (this.isBillState(1)) {
					dataItem.price = this.toFixedNumberSize(dataItem.sumMoney / amount)
				}
			})
			return data
		},
		onBusinessDateClick () {
			if (this.orderInfoData.businessDate) this.currentDate = new Date(this.orderInfoData.businessDate)
			this.datePickerShow = true
		},
		dateConfirmhandle (date) {
			let time = date.getTime()
			this.orderInfoData.businessDate = time
			this.datePickerShow = false
		},
		clearItemConfim (message) {
			return new Promise(resolve => {
				let items = this.orderItemList.filter(item => {
					return item.changeType !== 'del'
				})
				if (items.length === 0) {
					resolve()
				} else {
					this.$dialog.confirm({
						title: '提示',
						message: message
					}).then(() => {
						this.clearItemHandler()
						resolve()
					}).catch(() => {
					})
				}
			})
		},
		clearItemHandler () {
			let deleteItems = this.orderItemList.filter(item => {
				return !!item.id
			})
			deleteItems.forEach(item => {
				item.changeType = 'del'
			})
			this.orderItemList = deleteItems
		},
		// {{{ 机构
		onShopClick () {
			this.shopListStart = 0
			this.searchShopKey = null
			this.shopListLoadFinished = false
			this.onShopRefresh()
		},
		searchShop (keyword) {
			this.shopListStart = 0
			this.searchShopKey = keyword
			this.onShopRefresh(keyword)
		},
		onShopLoad () {
			this.getShopListData().then(res => {
				this.shopList.push(...res.shops)
			})
		},
		selectShop (item) {
			this.checkShop(item).then(() => {
				this.clearItemConfim('更换机构会清空品项,是否继续?').then(() => {
					this.orderInfoData.shopDTO = item
					this.orderInfoData.inHouseDTO = {}
					this.orderInfoData.outHouseDTO = {}
				})
			})
		},
		checkShop (shopDTO) {
			return new Promise(resolve => {
				let currentShopDTO = this.orderInfoData.shopDTO
				if (currentShopDTO.id !== shopDTO.id) {
					resolve()
				}
			})
		},
		onShopRefresh (keyword = null) {
			this.getShopListData(keyword).then(res => {
				this.shopList = res.shops
				this.shopPopShow = true
			})
		},
		getShopListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					start: this.shopListStart,
					size: ITEM_SIZE,
					m: 'list4ShopOtherOrderBill4Edit',
					keyword: keyword
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/shops`,
					data: params
				}).then(res => {
					this.onShopLoading = false
					this.shopListStart += ITEM_SIZE
					if (res.shops.length < ITEM_SIZE) {
						this.shopListLoadFinished = true
					} else {
						this.shopListLoadFinished = false
					}
					resolve(res)
				})
			})
		},
		// }}}
		// {{{ 成品仓库
		onInStoreClick () {
			if (!this.orderInfoData.shopDTO.id) {
				this.$fxToast.fail('请先选择机构!')
				return false
			}
			this.onInStoreRefresh()
		},
		searchInStore (keyword) {
			this.onInStoreRefresh(keyword)
		},
		selectInStore (item) {
			this.checkInStore(item).then(() => {
				this.clearItemConfim('更换成品仓库会清空品项,是否继续?').then(() => {
					this.orderInfoData.inHouseDTO = item
				})
			})
		},
		checkInStore (item) {
			return new Promise(resolve => {
				let currentData = this.orderInfoData.inHouseDTO
				if (currentData.id !== item.id) {
					resolve()
				}
			})
		},
		onInStoreRefresh (keyword = null) {
			this.getInStoreListData(keyword).then(res => {
				this.inStorePopShow = true
				this.inStoreList = res.shops
			})
		},
		getInStoreListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					keyword: keyword,
					m: 'list4ShopOrderBill'
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.orderInfoData.shopDTO.id}/users/${this.loginerId}/houses`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		// }}}
		// {{{ 材料仓库
		onOutStoreClick () {
			if (!this.orderInfoData.shopDTO.id) {
				this.$fxToast.fail('请先选择机构!')
				return false
			}
			this.onOutStoreRefresh()
		},
		searchOutStore (keyword) {
			this.onOutStoreRefresh(keyword)
		},
		selectOutStore (item) {
			this.checkOutStore(item).then(() => {
				this.clearItemConfim('更换材料仓库会清空品项,是否继续?').then(() => {
					this.orderInfoData.outHouseDTO = item
				})
			})
		},
		checkOutStore (item) {
			return new Promise(resolve => {
				let currentData = this.orderInfoData.outHouseDTO
				if (currentData.id !== item.id) {
					resolve()
				}
			})
		},
		onOutStoreRefresh (keyword = null) {
			this.getOutStoreListData(keyword).then(res => {
				this.outStorePopShow = true
				this.outStoreList = res.shops
			})
		},
		getOutStoreListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					keyword: keyword,
					m: 'list4ShopOrderBill'
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.orderInfoData.shopDTO.id}/users/${this.loginerId}/houses`,
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
			this.orderInfoData.businessTypeDTO = item
		},
		onBillTypeClear () {
			this.orderInfoData.businessTypeDTO = {}
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
					billType: '11_1',
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
		onUnitEdit (item) {
			this.itemEditRowData = item
			this.getItemUnit(item.goodsDTO.id).then(res => {
				this.unitActions = res
				this.unitActionShow = true
			})
		},
		getItemUnit (goodsId) {
			return new Promise(resolve => {
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/shopId/users/userId/goods/${goodsId}/units`,
					query: {
						userId: this.loginerId
					}
				}).then(res => {
					resolve(res.units)
				})
			})
		},
		onUnitSelect (unit) {
			this.unitActionShow = false
			let item = this.itemEditRowData
			let tempUnit = item.unitDTO
			let rate = tempUnit.value / unit.value
			let factCount = parseFloat(this.$fxUtils.toFixedSHW(item.factCount * rate, this.sysPointSize))
			item.unitDTO = unit
			item.factCount = factCount
			if (item.id) {
				item.changeType = 'edit'
			}
		},
		onAddClick () {
			this.checkOrderInfo().then(() => {
				this.itemPopShow = true
			})
		},
		checkOrderInfo () {
			return new Promise((resolve, reject) => {
				const checkInfo = [
					[this.orderInfoData.shopDTO.id, '机构'],
					[this.orderInfoData.inHouseDTO.id, '成品仓库'],
					[this.orderInfoData.outHouseDTO.id, '材料仓库']
				]
				let checkFlag = true
				for (let i = 0; i < checkInfo.length; i++) {
					if (!checkInfo[i][0]) {
						this.$toast.fail(`请选择${checkInfo[i][1]}!`)
						checkFlag = false
						break
					}
				}
				if (checkFlag) {
					resolve()
				}
			})
		},
		onItemEditConfirm (itemData) {
			this.orderItemList = itemData
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
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/carBill/${this.query.orderId}/users/${this.loginerId}`,
				data: params,
				query: {
					m: 'modifyBill'
				}
			}).then(res => {
				this.createOrderDetails().then(() => {
					this.$fxToast.success('保存成功')
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
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/carBill/${this.query.orderId}/users/${this.loginerId}`,
				data: params,
				query: {
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
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/carBill/${this.query.orderId}/users/${this.loginerId}`,
				data: params,
				query: {
					m: 'unCheck'
				}
			}).then(res => {
				this.createOrderDetails().then(() => {
					this.$fxToast.success('反审成功')
				})
			})
		},
		onDeleteClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要删除该单据吗?'
			}).then(() => {
				let params = this.getSaveParams()
				this.$fxHttp.requestDel({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/carBill/${this.query.orderId}/users/${this.loginerId}`,
					data: params,
					query: {
						userId: this.loginerId
					}
				}).then(res => {
					this.$fxToast.success('删除成功').then(() => {
						this.orderDeleteFlag = true
						this.$router.go(-1)
					})
				})
			}).catch(() => {
			})
		},
		// {{{称重
		onWeightClick () {
			this.checkHasDetails().then(() => {
				this.$dialog.confirm({
					title: '提示',
					message: '确定要下发称重吗?'
				}).then(() => {
					let params = this.getSaveParams()
					if (!params) {
						return false
					}
					this.$fxHttp.requestPut({
						url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/carBill/${this.query.orderId}/users/${this.loginerId}`,
						data: params,
						query: {
							userId: this.loginerId,
							m: 'weighBill'
						}
					}).then(res => {
						this.createOrderDetails().then(() => {
							this.$fxToast.success('下发称重成功')
						})
					})
				}).catch(() => {
				})
			})
		},
		onUnWeightClick () {
			this.checkHasDetails().then(() => {
				let msg = '确定要取消称重吗?'
				if (this.orderInfoData.weighState === 2) {
					msg = '称重中的单据，取消称重后电子秤可以继续称重并传回数据！确定要取消称重吗'
				}
				this.$dialog.confirm({
					title: '提示',
					message: msg
				}).then(() => {
					this.$fxHttp.requestPut({
						url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/carBill/${this.query.orderId}/users/${this.loginerId}`,
						query: {
							userId: this.loginerId,
							m: 'unWeighBill'
						}
					}).then(res => {
						this.createOrderDetails().then(() => {
							this.$fxToast.success('取消称重成功')
						})
					})
				}).catch(() => {
				})
			})
		},
		onEndWeightClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '结束称重后将不再接收此单据的称重数据'
			}).then(() => {
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/carBill/${this.query.orderId}/users/${this.loginerId}`,
					query: {
						userId: this.loginerId,
						m: 'endWeighBill'
					}
				}).then(res => {
					this.createOrderDetails().then(() => {
						this.$fxToast.success('结束称重成功')
					})
				})
			}).catch(() => {
			})
		},
		// }}}
		getSaveParams () {
			let addItems = this.orderItemList.filter(item => {
				return item.changeType === 'add'
			})
			let delItems = this.orderItemList.filter(item => {
				return item.changeType === 'del'
			})
			let editItems = this.orderItemList.filter(item => {
				return item.changeType === 'edit'
			})
			let addBomList = []
			let delBomList = []
			let editBomList = []
			this.orderItemList.forEach(item => {
				if (item.changeType === 'add') {
					addBomList.push(...item.bomDetail)
				} else if (item.changeType === 'del') {
					delBomList.push(...item.bomDetail)
				} else {
					item.bomDetail.forEach(bom => {
						if (bom.changeType === 'add') {
							addBomList.push(bom)
						}
						if (bom.changeType === 'del') {
							delBomList.push(bom)
						}
						if (bom.changeType === 'edit') {
							editBomList.push(bom)
						}
					})
				}
			})
			let params = Object.assign({}, this.orderInfoData, {
				finishDetailAdd: addItems.length > 0 ? addItems : null,
				finishDetailDel: delItems.length > 0 ? delItems : null,
				finishDetailMdf: editItems.length > 0 ? editItems : null,
				bomDetailAdd: addBomList.length > 0 ? addBomList : null,
				bomDetailDel: delBomList.length > 0 ? delBomList : null,
				bomDetailMdf: editBomList.length > 0 ? editBomList : null,
				finishDetail: []
			})
			return params
		},
		checkHasDetails () {
			return new Promise(resolve => {
				let msg = ''
				this.orderItemList.forEach(item => {
					let bomZeroL = item.bomDetail.filter(bom => {
						return bom.factCount === 0 && bom.changeType !== 'del'
					})
					if (bomZeroL.length === item.bomDetail.length) {
						msg += '成品【' + item.goodsDTO.name + '】至少含一条实际数量大于零的材料</br>'
					}
				})
				if (msg !== '') {
					this.$dialog.confirm({
						title: '提示',
						message: msg
					})
					return false
				}
				let items = this.orderItemList.filter(item => {
					return item.changeType !== 'del'
				})
				if (items.length === 0) {
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
			let index = this.orderItemList.findIndex(detailsItem => {
				return detailsItem.id === item.id
			})
			if (~index) {
				this.orderItemList[index] = item
			}
		},
		onClickHandler (method) {
			if (this.itemInputFocusing) {
				return false
			}
			this[method]()
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
		onSearchConfirm (searchItemData) {
			this.orderItemList = searchItemData
		},
		// {{{ 查看明细bom
		onBomView (itemData) {
			this.itemEditRowData = itemData
			this.orderBomPopShow = true
		},
		// }}}
		// {{{
		onBomSave (itemData) {
			let index = this.orderItemList.findIndex(detailsItem => {
				return detailsItem.goodsDTO.id === itemData.goodsDTO.id
			})
			if (~index) {
				this.orderItemList[index] = itemData
			}
		}
		// }}}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.inteledi-carBill-details {
	height: 100%
	background: $fxWhite
	display: flex
	flex-direction: column
	.carBill-bottom {
		width: 100%
		display: flex
		flex-direction: row
		.bottom-btn {
			flex: 1
		}
		.yellow-btn {
			background-color: $fxYellow
			border: 1px solid $fxYellow
		}
	}
}
</style>
