<template>
	<div class="inteledi-uniformDistributionOut-details">
		<w-header :title="orderInfoData.sysbillCode" titleFontSize="3.733vw" :border="true"></w-header>
		<orderInfo
			ref="orderInfo"
			:data="orderInfoData"
			:isDisabled="isBillState(1) || !$fxAuth('distributionOutBill.save') || isWeightState(1) || isWeightState(2)"
			:collapseDisabled="itemInputFocusing"
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
			:billId="orderInfoData.id"
			:data="orderItemList"
			:itemInputFocusing.sync="itemInputFocusing"
			:isDisabled="isBillState(1) || !$fxAuth('distributionOutBill.save') || isWeightState(1) || isWeightState(2)"
			:autoType="orderInfoData.autoType"
			:inShopId="orderInfoData.inShopDTO && orderInfoData.inShopDTO.id"
			:rdcId="orderInfoData.rdcDTO && orderInfoData.rdcDTO.id"
			@on-add-click="onAddClick"
			@on-search-click="onSearchClick"
			@on-send-click="onSendOutClick"
			@on-item-edit="onItemEdit"
			@on-unit-edit="onUnitEdit"
			@on-item-focus="onItemFocus"
		></orderItem>
		<div class="uniformDistributionOut-bottom">
			<van-button
				v-show="isBillState(0) && $fxAuth('distributionOutBill.del') && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onClickHandler('onDeleteClick')"
			>删除</van-button>
			<van-button
				v-show="isBillState(0) && $fxAuth('distributionOutBill.check') && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius"
				type="info"
				@click="onClickHandler('onExpressClick')"
			>审核</van-button>
			<van-button
				v-show="isBillReState([0, 2]) && isBillState(1) && $fxAuth('distributionOutBill.unCheck') && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onClickHandler('onUnExpressClick')"
			>反审</van-button>
			<van-button
				v-show="isBillState(0) && $fxAuth('distributionOutBill.save') && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius"
				type="primary"
				@click="onClickHandler('onSaveClick')"
			>保存</van-button>
			<van-button
				v-show="isBillReState(0) && isBillState(1) && $fxAuth('distributionOutBill.reCheck')"
				class="bottom-btn fx-no-radius"
				type="info"
				@click="onClickHandler('onExpressAgainClick')"
			>复审</van-button>
			<van-button
				v-show="isBillReState(1) && isBillState(1) && $fxAuth('distributionOutBill.unReCheck')"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onClickHandler('onUnExpressAgainClick')"
			>取消复审</van-button>
			<van-button
				v-show="$fxAuth('distributionOutBill.billWeighState') && isBillState(0) && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius yellow-btn"
				type="info"
				@click="onClickHandler('onWeightClick')"
			>下发称重</van-button>
			<van-button
				v-show="$fxAuth('distributionOutBill.billWeighState') && isBillState(0) && (isWeightState(1) || isWeightState(2))"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onClickHandler('onUnWeightClick')"
			>取消称重</van-button>
			<van-button
				v-show="$fxAuth('distributionOutBill.billWeighState') && isBillState(0) && isWeightState(2) && sysDZCManyLower"
				class="bottom-btn fx-no-radius"
				type="info"
				@click="onClickHandler('onEndWeightClick')"
			>结束称重</van-button>
		</div>
		<van-popup v-model="rdcPopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="rdcPopShow"
				:data="rdcList"
				:loadFinished="true"
				title="请选择配送中心"
				@on-search="searchRdc"
				@on-select="selectRdc"
			></listComp>
		</van-popup>
		<van-popup v-model="inShopPopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="inShopPopShow"
				:data="inShopList"
				:loadFinished="true"
				title="请选择门店"
				@on-search="searchInShop"
				@on-select="selectInShop"
			></listComp>
		</van-popup>
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
				:autoType="orderInfoData.autoType"
				:inShopId="orderInfoData.inShopDTO && orderInfoData.inShopDTO.id"
				:rdcId="orderInfoData.rdcDTO && orderInfoData.rdcDTO.id"
				:businessDate="orderInfoData.businessDate"
				@on-save="onStoreItemSave"
				@on-select-store="onStoreItemSelect"
			></storeItemComp>
		</van-popup>
		<van-popup
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
			v-model="itemRowEditPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<itemRowEditPop
				:visibleFlag.sync="itemRowEditPopShow"
				:itemData="itemEditRowData"
				:isDisabled="isBillState(1) || !$fxAuth('distributionOutBill.save') || isWeightState(1) || isWeightState(2)"
				@on-Confirm="onEditRowConfirm"
			></itemRowEditPop>
		</van-popup>
		<van-actionsheet
			v-model="unitActionShow"
			:actions="unitActions"
			cancel-text="取消"
			@select="onUnitSelect"
		/>
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
				:rdcId="orderInfoData.rdcDTO && orderInfoData.rdcDTO.id"
				:inShopId="orderInfoData.inShopDTO && orderInfoData.inShopDTO.id"
				:autoType="orderInfoData.autoType"
				:isDisabled="isBillState(1) || !$fxAuth('distributionOutBill.save') || isWeightState(1) || isWeightState(2)"
				@on-search-confirm="onSearchConfirm"
			></itemSearchPop>
		</van-popup>
		<van-popup
			v-model="itemSendPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<itemSendOutPop
				:visibleFlag.sync="itemSendPopShow"
				:data="searchItem"
				:orderId="orderInfoData.id"
				:rdcId="orderInfoData.rdcDTO && orderInfoData.rdcDTO.id"
				:inShopId="orderInfoData.inShopDTO && orderInfoData.inShopDTO.id"
				:autoType="orderInfoData.autoType"
				:isDisabled="isBillState(1) || !$fxAuth('distributionOutBill.save') || isWeightState(1) || isWeightState(2)"
				@on-send-confirm="onSendConfirm"
			></itemSendOutPop>
		</van-popup>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import orderInfo from '@/components/uniformDistributionOut/createOrder/OrderInfo.vue'
import orderItem from '@/components/uniformDistributionOut/createOrder/OrderItem.vue'
import listComp from '@/components/common/ListComp.vue'
import storeItemComp from '@/components/uniformDistributionOut/common/StoreItemComp.vue'
import itemRowEditPop from '@/components/uniformDistributionOut/common/ItemRowEditPop.vue'
import itemSearchPop from '@/components/uniformDistributionOut/common/itemSearchPop.vue'
import itemEditComp from '@/components/uniformDistributionOut/common/itemEditComp.vue'
import itemSendOutPop from '@/components/uniformDistributionOut/sendOut/itemListPop.vue'
export default {
	name: 'uniformDistributionOutDetails',
	components: {
		orderInfo,
		orderItem,
		listComp,
		storeItemComp,
		itemRowEditPop,
		itemSearchPop,
		itemEditComp,
		itemSendOutPop
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
			inShopPopShow: false,
			inShopList: [],
			rdcPopShow: false,
			rdcList: [],
			datePickerShow: false,
			billTypePopShow: false,
			billTypeList: [],
			itemStorePopShow: false,
			storeItem: [],
			unitActions: [],
			unitActionShow: false,
			itemSearchPopShow: false,
			itemSendPopShow: false,
			itemRowEditPopShow: false,
			itemEditRowData: {},
			itemInputFocusing: false,
			orderDeleteFlag: false,
			formatterSysPointKey: ['busUnitAmount'],
			searchItem: [],
			currentShopHouseObj: {},
			currentOutHouseObj: {},
			itemPopShow: false
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
		if (to.path === '/uniformDistributionOut' && !this.orderDeleteFlag && this.orderInfoData.billState === 0) {
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
			sysMoneyPointSize: 'sysMoneyPointSize',
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId,
			sysDZCManyLower: state => state.systemParams.sysDZCManyLower
		}),
		isBillState (state) {
			return state => {
				if (Object.prototype.toString.call(state) === '[object Array]') {
					return state.includes(this.orderInfoData.billState)
				} else {
					return this.orderInfoData.billState === state
				}
			}
		},
		isBillReState (state) {
			return state => {
				if (Object.prototype.toString.call(state) === '[object Array]') {
					return state.includes(this.orderInfoData.billReState)
				} else {
					return this.orderInfoData.billReState === state
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
					let orderDetailsData = res.storeBills[0]
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
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/distributionOutBills/${this.query.orderId}`
				}).then(res => {
					resolve(res)
				})
			})
		},
		formatterSysPoint (data) {
			data.forEach(item => {
				this.formatterSysPointKey.forEach(pointItem => {
					item[pointItem] = this.toFixedNumberSize(item[pointItem], this.sysPointSize)
				})
			})
		},
		filterStoreItem (data) { // shopHouseDTO发货仓库
			// 重新计算金额
			data.forEach(dataItem => {
				let amount = parseFloat(dataItem.busUnitOutAmount)
				if (amount && !dataItem.giftFlag) {
					// 数量不为0，且不是赠送，反算单价，便于后期计算
					dataItem.price = this.toFixedNumberSize(dataItem.sendMoney / amount)
					dataItem.taxPrice = this.toFixedNumberSize(dataItem.sendMoneyWithTax / amount)
					dataItem.costPrice = this.toFixedNumberSize(dataItem.outMoney / amount)
				} else {
					// 数量为0，反算单价，便于后期计算
					dataItem.price = this.toFixedNumberSize(dataItem.price)
					dataItem.taxPrice = this.toFixedNumberSize(dataItem.taxPrice)
					dataItem.costPrice = this.toFixedNumberSize(dataItem.costPrice)
				}
				dataItem.busUnitOutAmount = this.toFixedNumberSize(amount)
				dataItem.sendMoney = this.toFixedNumberSize(dataItem.sendMoney)
				dataItem.sendTaxMoney = this.toFixedNumberSize(dataItem.sendTaxMoney)
				dataItem.sendMoneyWithTax = this.toFixedNumberSize(dataItem.sendMoneyWithTax)
				dataItem.outMoney = this.toFixedNumberSize(dataItem.outMoney)
			})
			// z5 发货仓库（outHouse）一样，收货仓库（shopHouse）可不同
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
		onInShopClick () {
			this.onInShopRefresh()
		},
		searchInShop (keyword) {
			this.onInShopRefresh(keyword)
		},
		selectInShop (item) {
			this.checkShop(item).then(() => {
				this.clearItemConfim('更换门店会清空品项,是否继续?').then(() => {
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
			return new Promise(resolve => {
				let params = {
					pid: this.orderInfoData.rdcDTO.id,
					keyword: keyword
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/shopsByRdc`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
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
				this.clearItemConfim('修改配送中心将清空发货仓库、门店和单据明细，是否继续?').then(() => {
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
			return new Promise(resolve => {
				let params = {
					keyword: keyword
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/rdcs`,
					data: params
				}).then(res => {
					resolve(res)
				})
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
					m: 'list4DistributionOutListBillEdit',
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
		// {{{ 搜索界面
		onSearchClick () {
			this.itemSearchPopShow = true
			this.searchItem = JSON.parse(JSON.stringify(this.orderItemList))
		},
		// }}}
		// {{{ 发货界面
		onSendOutClick () {
			this.saveBill().then(() => {
				this.getoEnoughAmountIsExist().then(res => {
					this.getNoEnoughAmountGoodsList().then(res => {
						this.itemSendPopShow = true
						this.searchItem = this.filterShopHouseItem(res.noEnoughGoods)
					})
				})
			})
		},
		getoEnoughAmountIsExist () {
			return this.$fxApi('uniformDistributionOutBill.noEnoughAmountIsExist', this.query.orderId).then(res => {
				return res
			})
		},
		getNoEnoughAmountGoodsList () {
			return this.$fxApi('uniformDistributionOutBill.getNoEnoughAmountGoodsList', this.query.orderId).then(res => {
				return res
			})
		},
		filterShopHouseItem (data) { // shopHouseDTO发货仓库
			// 重新计算金额
			data.forEach(dataItem => {
				dataItem.busUnitOutAmount = this.toFixedNumberSize(dataItem.busUnitOutAmount)
				dataItem.amount = this.toFixedNumberSize(dataItem.amount)
				dataItem.currentAmount = this.toFixedNumberSize(dataItem.amount / dataItem.unitDTO.value)
			})
			// z5 发货仓库（outHouse）一样，收货仓库（shopHouse）可不同
			let shopHouseIds = Array.from(new Set(data.map(item => {
				return item.shopHouseDTO.id
			})))
			let StoreItem = []
			shopHouseIds.forEach(shopHouseItem => {
				let itemObjs = data.filter(dataItem => {
					return dataItem.shopHouseDTO.id === shopHouseItem
				})
				if (!itemObjs.length) {
					return
				}
				let storeObj = JSON.parse(JSON.stringify(itemObjs[0].shopHouseDTO))
				storeObj.details = itemObjs
				StoreItem.push(storeObj)
			})
			return StoreItem
		},
		onSendConfirm (message) {
			if (message !== '') {
				this.$dialog.alert({
					title: '提示',
					message: message
				})
			}
			this.createOrderDetails()
		},
		// }}}
		onStoreItemSave (storeItemData) {
			this.orderItemList = storeItemData
		},
		onSaveClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要保存该单据吗?'
			}).then(() => {
				this.saveBill()
			}).catch(() => {
			})
		},
		saveBill () {
			return this.checkHasDetails().then(() => {
				return this.saveHandler().then(res => {
					return this.createOrderDetails().then(() => {
						this.$fxToast.success(res.message)
					})
				})
			})
		},
		saveHandler () {
			return new Promise(resolve => {
				let params = this.getSaveParams()
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/distributionOutBills/${this.query.orderId}/users/${this.loginerId}`,
					data: params,
					query: {
						m: 'modify'
					}
				}).then(res => {
					resolve(res)
				})
			})
		},
		onExpressClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要审核该单据吗?'
			}).then(() => {
				this.expressHandler()
			})
		},
		expressHandler () {
			this.checkHasDetails().then(() => {
				let params = this.getSaveParams()
				params.otherCheck = 1
				this.expressRequest(params).then(res => {
					this.createOrderDetails().then(() => {
						this.$fxToast.success('审核成功')
					})
				}).catch(error => {
					if (error.errorCode === '1') {
						this.$dialog.alert({
							title: '提示',
							message: error.message
						})
						this.createOrderDetails()
					} else if (error.errorCode === 'otherCheck') {
						this.$dialog.confirm({
							title: '提示',
							message: error.message + '，继续审核吗？'
						}).then(() => {
							params.otherCheck = 0
							this.expressRequest(params).then(res => {
								this.createOrderDetails().then(() => {
									this.$fxToast.success('审核成功')
								})
							}).catch(error => {
								this.$dialog.alert({
									title: '提示',
									message: error.message
								})
							})
						})
					}
				})
			})
		},
		expressRequest (params) {
			return new Promise((resolve, reject) => {
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/distributionOutBills/${this.query.orderId}/users/${this.loginerId}`,
					data: params,
					query: {
						m: 'editAndCheck'
					},
					autoErrorMsg: false
				}).then(res => {
					resolve(res)
				}).catch(error => {
					reject(error)
				})
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
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/distributionOutBills/${this.query.orderId}/users/${this.loginerId}`,
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
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/distributionOutBills/${this.query.orderId}`,
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
		onDeleteClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要删除该单据吗?'
			}).then(() => {
				let params = this.getSaveParams()
				this.$fxHttp.requestDel({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/distributionOutBills/${this.query.orderId}/users/${this.loginerId}`,
					data: params
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
						url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/distributionOutBills/${this.query.orderId}/users/${this.loginerId}`,
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
						url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/distributionOutBills/${this.query.orderId}/users/${this.loginerId}`,
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
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/distributionOutBills/${this.query.orderId}/users/${this.loginerId}`,
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
				houseDTO: addItems.length > 0 ? JSON.parse(JSON.stringify(addItems[0].outHouseDTO)) : this.orderInfoData.houseDTO
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
			let oldUnitRate = item.unitDTO.value // 新增的品项明细获取之前单位换算值方式
			let newUnit = unit // 新增的品项明细获取之后单位换算值方式
			let amount = parseFloat(item.busUnitOutAmount)
			if (amount > 0) {
				amount = amount * oldUnitRate / newUnit.value
				item.busUnitOutAmount = this.toFixedNumberSize(amount, this.sysPointSize)
				this.calcMoney('moneyWithTax', item.sendMoneyWithTax, item)
				this.calcCostMoney('outMoney', item.outMoney, item)
			} else {
				item.taxPrice = parseFloat(item.taxPrice) * newUnit.value / oldUnitRate
				this.calcMoney('taxPrice', item.taxPrice, item)
				this.calcCostMoney('taxPrice', item.costPrice, item)
			}
			// 订货数量
			let outOrderAmount = parseFloat(item.outOrderAmount)
			outOrderAmount = outOrderAmount * oldUnitRate / newUnit.value
			item.outOrderAmount = this.toFixedNumberSize(outOrderAmount)
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
		// {{{计算税额并渲染
		calcMoney (target, amountOrMoney, itemData) {
			let { taxPrice, busUnitOutAmount, price, sendTaxes } = itemData
			let money = 0
			let moneyWithTax = 0
			let itemPrice = 0
			let itemTaxPrice = 0
			let amountOrMoneyFixedNum = this.toFixedNumberSize(amountOrMoney)
			if (itemData.giftFlag || (target === 'money' && amountOrMoneyFixedNum === 0)) {
				// 赠送、数量为0
				itemData.sendMoney = 0
				itemData.sendMoneyWithTax = 0
				itemData.sendTaxMoney = 0
				return true
			}
			if (target === 'money') {
				money = amountOrMoneyFixedNum
				itemPrice = this.toFixedNumberSize(money / busUnitOutAmount)
				moneyWithTax = money * (1 + sendTaxes)
				itemTaxPrice = this.toFixedNumberSize(moneyWithTax / busUnitOutAmount)
			} else if (target === 'amount') {
				itemData.busUnitOutAmount = this.toFixedNumberSize(amountOrMoney, this.sysPointSize)
				itemPrice = price
				itemTaxPrice = taxPrice
				money = this.toFixedNumberSize(price * amountOrMoneyFixedNum)
				moneyWithTax = this.toFixedNumberSize(taxPrice * amountOrMoneyFixedNum)
			} else if (target === 'moneyWithTax') {
				moneyWithTax = amountOrMoneyFixedNum
				itemTaxPrice = this.toFixedNumberSize(moneyWithTax / busUnitOutAmount)
				money = this.toFixedNumberSize(moneyWithTax / (1 + sendTaxes))
				itemPrice = this.toFixedNumberSize(money / busUnitOutAmount)
			} else if (target === 'taxPrice') {
				itemTaxPrice = amountOrMoneyFixedNum
				moneyWithTax = this.toFixedNumberSize(busUnitOutAmount * itemTaxPrice)
				itemPrice = this.toFixedNumberSize(itemTaxPrice / (1 + sendTaxes))
				money = this.toFixedNumberSize(itemPrice * busUnitOutAmount)
			} else if (target === 'price') {
				itemPrice = amountOrMoneyFixedNum
				money = this.toFixedNumberSize(itemPrice * busUnitOutAmount)
				itemTaxPrice = this.toFixedNumberSize(itemPrice * (1 + sendTaxes))
				moneyWithTax = this.toFixedNumberSize(busUnitOutAmount * itemTaxPrice)
			}
			itemData.sendMoney = money
			itemData.sendMoneyWithTax = moneyWithTax
			itemData.sendTaxMoney = this.toFixedNumberSize(this.toFixedNumberSize(moneyWithTax) - this.toFixedNumberSize(money))
			itemData.price = itemPrice
			itemData.taxPrice = itemTaxPrice
		},
		calcCostMoney (target, amountOrMoney, itemData) {
			let { costPrice, busUnitOutAmount } = itemData
			let outMoney = 0
			let itemTaxPrice = 0
			let amountOrMoneyFixedNum = this.toFixedNumberSize(amountOrMoney)
			if (target === 'amount') {
				itemData.busUnitOutAmount = this.toFixedNumberSize(amountOrMoney, this.sysPointSize)
				itemTaxPrice = costPrice
				outMoney = this.toFixedNumberSize(costPrice * amountOrMoneyFixedNum)
			} else if (target === 'outMoney') {
				outMoney = amountOrMoneyFixedNum
				itemTaxPrice = this.toFixedNumberSize(outMoney / busUnitOutAmount)
			} else if (target === 'taxPrice') {
				itemTaxPrice = amountOrMoneyFixedNum
				outMoney = this.toFixedNumberSize(busUnitOutAmount * itemTaxPrice)
			}
			itemData.outMoney = outMoney
			itemData.costPrice = itemTaxPrice
		},
		// }}}
		toFixedNumberSize (data, pointSize = this.sysMoneyPointSize) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, pointSize))
		},
		onEditRowConfirm (item) {
			let storeIndex = this.orderItemList.findIndex(storeItem => {
				return storeItem.id === item.outHouseDTO.id && storeItem.shopHouseDTO.id === item.shopHouseDTO.id
			})
			if (~storeIndex) {
				let detailsIndex = this.orderItemList[storeIndex].details.findIndex(detailsItem => {
					return detailsItem.goodsDTO.id === item.goodsDTO.id && detailsItem.changeType !== 'del'
				})
				if (~detailsIndex) {
					this.orderItemList[storeIndex].details[detailsIndex] = item
				}
			}
		},
		onExpressAgainClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要复审该单据吗?'
			}).then(() => {
				let params = this.getSaveParams()
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/distributionOutBills/${this.query.orderId}/users/${this.loginerId}`,
					data: params,
					query: {
						m: 'reCheck'
					}
				}).then(res => {
					this.createOrderDetails().then(() => {
						this.$fxToast.success('复审成功')
					})
				})
			}).catch(() => {
			})
		},
		onUnExpressAgainClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要取消复审该单据吗?'
			}).then(() => {
				let params = this.getSaveParams()
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/distributionOutBills/${this.query.orderId}/users/${this.loginerId}`,
					data: params,
					query: {
						userId: this.loginerId,
						m: 'unReCheck'
					}
				}).then(res => {
					this.createOrderDetails().then(() => {
						this.$fxToast.success('取消复审成功')
					})
				})
			}).catch(() => {
			})
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
		onSearchConfirm (searchItemData) {
			this.orderItemList = searchItemData
		},
		// {{{增加品项
		onStoreItemSelect (outHouse, shopHouse) {
			this.currentOutHouseObj = outHouse
			this.currentShopHouseObj = shopHouse
			this.itemPopShow = true
		},
		getStoreItem () {
			if (this.$fxUtils.isEmptyObjSHW(this.currentShopHouseObj) || this.$fxUtils.isEmptyObjSHW(this.currentOutHouseObj)) {
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
				currentStore.details = selectedItemArr
			} else {
				let _store = Object.assign({}, outHouse)
				_store.shopHouseDTO = shopHouse
				_store.details = selectedItemArr
				this.orderItemList.push(_store)
			}
		}
		// }}}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.inteledi-uniformDistributionOut-details {
	height:100%
	background:$fxWhite
	display: flex
	flex-direction: column
	.uniformDistributionOut-bottom {
		width:100%
		display: flex
		flex-direction: row
		.bottom-btn {
			flex:1
			padding:0
			overflow:hidden
		}
		.yellow-btn {
			background-color: $fxYellow
			border: 1px solid $fxYellow
		}
	}
}
</style>


