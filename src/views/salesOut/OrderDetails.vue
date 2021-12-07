<template>
	<div class="inteledi-salesOut-details">
		<w-header :title="orderInfoData.sysbillCode" titleFontSize="3.733vw" :border="true"></w-header>
		<orderInfo
			ref="orderInfo"
			:data="orderInfoData"
			:isDisabled="isBillState(1) || isWeightState(1) || isWeightState(2) || !$fxAuth('salesOutBill.save')"
			:collapseDisabled="itemInputFocusing"
			@on-shop-click="onShopClick"
			@on-house-click="onHouseClick"
			@on-customer-click="onCustomerClick"
			@on-busdate-click="onBusinessDateClick"
			@on-arriveDate-click="onArriveDateClick"
			@on-billType-click="onBillTypeClick"
			@on-item-clear="onItemClear"
			@on-billType-clear="onBillTypeClear"
		></orderInfo>
		<orderItem
			ref="orderItem"
			:data="orderItemList"
			:itemInputFocusing.sync="itemInputFocusing"
			:isDisabled="isBillState(1) || isWeightState(1) || isWeightState(2) || !$fxAuth('salesOutBill.save') || isAutoType(10)"
			:autoType="orderInfoData.autoType"
			@on-add-click="onAddClick"
			@on-search-click="onSearchClick"
			@on-item-edit="onItemEdit"
			@on-unit-edit="onUnitEdit"
			@on-item-focus="onItemFocus"
		></orderItem>
		<div class="salesOut-bottom">
			<van-button
				v-show="isBillState(0) && $fxAuth('salesOutBill.del') && (isWeightState(0) || isWeightState(3)) && !isAutoType(10)"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onClickHandler('onDeleteClick')"
			>删除</van-button>
			<van-button
				v-show="isBillState(0) && $fxAuth('salesOutBill.check') && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius"
				type="info"
				@click="onClickHandler('onExpressClick')"
			>审核</van-button>
			<van-button
				v-show="orderInfoData.stockType !== 2 && isBillReState([0, 2]) && isBillState(1) && $fxAuth('salesOutBill.unCheck') && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onClickHandler('onUnExpressClick')"
			>反审</van-button>
			<van-button
				v-show="isBillState(0) && $fxAuth('salesOutBill.save') && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius"
				type="primary"
				@click="onClickHandler('onSaveClick')"
			>保存</van-button>
			<van-button
				v-show="isBillReState(0) && isBillState(1) && $fxAuth('salesOutBill.reCheck')"
				class="bottom-btn fx-no-radius"
				type="info"
				@click="onClickHandler('onExpressAgainClick')"
			>复审</van-button>
			<van-button
				v-show="isBillReState(1) && isBillState(1) && $fxAuth('salesOutBill.unReCheck')"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onClickHandler('onUnExpressAgainClick')"
			>取消复审</van-button>
			<van-button
				v-show="$fxAuth('salesOutBill.weighState') && isBillState(0) && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius yellow-btn"
				type="info"
				@click="onClickHandler('onWeightClick')"
			>下发称重</van-button>
			<van-button
				v-show="$fxAuth('salesOutBill.weighState') && isBillState(0) && (isWeightState(1) || isWeightState(2))"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onClickHandler('onUnWeightClick')"
			>取消称重</van-button>
			<van-button
				v-show="$fxAuth('salesOutBill.weighState') && isBillState(0) && isWeightState(2) && sysDZCManyLower"
				class="bottom-btn fx-no-radius"
				type="info"
				@click="onClickHandler('onEndWeightClick')"
			>结束称重</van-button>
		</div>
		<van-popup v-model="shopPopShow" position="right" class="fx-list-popup-300">
			<listComp
				:visibleFlag.sync="shopPopShow"
				:data="shopList"
				title="请选择机构"
				:loading.sync="shopLoading"
				:loadFinished="shopLoadFinished"
				:immediateCheck="false"
				@on-select="selectShop"
				@on-search="searchShop"
				@on-load="loadShopList"
			></listComp>
		</van-popup>
		<van-popup v-model="housePopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="housePopShow"
				:data="houseList"
				:loadFinished="true"
				title="仓库检索"
				@on-search="searchHouse"
				@on-select="selectHouse"
			></listComp>
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
			v-model="itemPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<itemEditComp
				:visibleFlag.sync="itemPopShow"
				:shopId="orderInfoData.shopDTO && orderInfoData.shopDTO.id"
				:house="orderInfoData.houseDTO"
				:customerId="orderInfoData.customerDTO && orderInfoData.customerDTO.id"
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
				:isDisabled="isBillState(1) || isWeightState(1) || isWeightState(2) || !$fxAuth('salesOutBill.save') || isAutoType(10)"
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
				:customerId="orderInfoData.customerDTO && orderInfoData.customerDTO.id"
				:shopId="orderInfoData.shopDTO && orderInfoData.shopDTO.id"
				:isDisabled="isBillState(1) || isWeightState(1) || isWeightState(2) || !$fxAuth('salesOutBill.save') || isAutoType(10)"
				@on-search-confirm="onSearchConfirm"
			></itemSearchPop>
		</van-popup>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import orderInfo from '@/components/salesOut/createOrder/OrderInfo.vue'
import orderItem from '@/components/salesOut/createOrder/OrderItem.vue'
import listComp from '@/components/common/ListComp.vue'
import itemRowEditPop from '@/components/salesOut/common/ItemRowEditPop.vue'
import itemSearchPop from '@/components/salesOut/common/itemSearchPop.vue'
import itemEditComp from '@/components/salesOut/common/itemEditComp.vue'
const ITEM_SIZE = 50
export default {
	name: 'salesOutDetails',
	components: {
		orderInfo,
		orderItem,
		listComp,
		itemRowEditPop,
		itemSearchPop,
		itemEditComp
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
			shopListStart: 0,
			shopLoading: false,
			shopLoadFinished: false,
			searchShopKeyword: '',
			housePopShow: false,
			houseList: [],
			customerPopShow: false,
			customerList: [],
			customerListStart: 0,
			customerLoading: false,
			customerLoadFinished: false,
			searchCustomerKeyword: '',
			datePickerShow: false,
			billTypePopShow: false,
			billTypeList: [],
			unitActions: [],
			unitActionShow: false,
			itemSearchPopShow: false,
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
		if (to.path === '/salesOut' && !this.orderDeleteFlag && this.orderInfoData.billState === 0) {
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
		},
		// 生成方式 0自动生成 1手动生成 10极速订2.0
		// 极速定2.0不能编辑，仅支持审核和反审单据，反审后仅支持编辑“业务日期”
		isAutoType (state) {
			return state => {
				if (Object.prototype.toString.call(state) === '[object Array]') {
					return state.includes(this.orderInfoData.autoType)
				} else {
					return this.orderInfoData.autoType === state
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
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/salesout/${this.query.orderId}`
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
		filterStoreItem (data) {
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
			let StoreItem = []
			StoreItem[0] = JSON.parse(JSON.stringify(this.orderInfoData.houseDTO))
			StoreItem[0].details = data
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
		// {{{ 机构
		onShopClick () {
			this.shopListStart = 0
			this.searchShopKeyword = ''
			this.getShopListData().then(res => {
				this.shopLoading = false
				this.shopPopShow = true
				this.shopList = res.shops
			})
		},
		searchShop (keyword) {
			this.shopListStart = 0
			this.searchShopKeyword = keyword
			this.getShopListData(keyword).then(res => {
				if (res.shops.length < ITEM_SIZE) {
					this.shopLoadFinished = true
				}
				this.shopList = res.shops
			})
		},
		loadShopList () {
			if (this.shopLoadFinished === true) {
				return
			}
			this.shopListStart = this.shopListStart + ITEM_SIZE
			this.getShopListData(this.searchShopKeyword).then(res => {
				this.shopLoading = false
				if (res.shops.length < ITEM_SIZE) {
					this.shopLoadFinished = true
				}
				this.shopList.push(...res.shops)
			})
		},
		selectShop (item) {
			this.checkShop(item).then(() => {
				this.clearItemConfim('更换机构会清空品项,是否继续?').then(() => {
					this.orderInfoData.shopDTO = item
					this.orderInfoData.houseDTO = {}
					this.orderInfoData.customerDTO = {}
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
		getShopListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					start: this.shopListStart,
					size: ITEM_SIZE,
					keyword: keyword,
					disableFlag: 1
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/enableshop`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		// }}}
		// {{{ 仓库
		onHouseClick () {
			if (!this.orderInfoData.shopDTO.id) {
				this.$fxToast.top('请先选择调入机构！')
				return false
			}
			this.onHouseRefresh()
		},
		searchHouse (keyword) {
			this.onHouseRefresh(keyword)
		},
		selectHouse (item) {
			this.checkHouse(item).then(() => {
				this.clearItemConfim('更换仓库会清空品项,是否继续?').then(() => {
					this.orderInfoData.houseDTO = item
				})
			})
		},
		checkHouse (houseDTO) {
			return new Promise(resolve => {
				let currentHouseDTO = this.orderInfoData.houseDTO
				if (currentHouseDTO.id !== houseDTO.id) {
					resolve()
				}
			})
		},
		onHouseRefresh (keyword = null) {
			this.getHouseListData(keyword).then(res => {
				this.houseList = res.shops
				this.housePopShow = true
			})
		},
		getHouseListData (keyword = null) {
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
			this.checkCustomer(item).then(() => {
				this.clearItemConfim('更换客户会清空品项,是否继续?').then(() => {
					this.orderInfoData.customerDTO = item
				})
			})
		},
		checkCustomer (customerDTO) {
			return new Promise(resolve => {
				let currentCustomerDTO = this.orderInfoData.customerDTO
				if (currentCustomerDTO.id !== customerDTO.id) {
					resolve()
				}
			})
		},
		getCustomerListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					start: this.customerListStart,
					size: ITEM_SIZE,
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
					billType: '56_1',
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
				this.itemPopShow = true
			})
		},
		checkOrderInfo () {
			return new Promise((resolve, reject) => {
				if (!this.orderInfoData.businessDate) {
					this.$fxToast.top('请先选择业务日期!')
				} else if (!this.orderInfoData.shopDTO.id) {
					this.$fxToast.top('请先选择机构!')
				} else if (!this.orderInfoData.houseDTO.id) {
					this.$fxToast.top('请先选择仓库!')
				} else if (!this.orderInfoData.customerDTO.id) {
					this.$fxToast.top('请先选择客户!')
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
		onStoreItemSave (storeItemData) {
			this.orderItemList = storeItemData
		},
		onSaveClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要保存该单据吗?'
			}).then(() => {
				this.checkHasDetails().then(() => {
					this.saveHandler().then(res => {
						this.createOrderDetails().then(() => {
							this.$fxToast.success(res.message)
						})
					})
				})
			}).catch(() => {
			})
		},
		saveHandler () {
			return new Promise(resolve => {
				let params = this.getSaveParams()
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/salesout/${this.query.orderId}/users/${this.loginerId}`,
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
			this.checkPrice().then(() => {
				this.expressHandler()
			})
		},
		checkPrice (message = '确定要审核该单据吗?') {
			return new Promise((resolve) => {
				let zeroPrice = this.orderItemList.find(itemList => {
					return itemList.details.find((item) => {
						if (item.price === 0) {
							return true
						}
					})
				})
				if (zeroPrice) {
					message = '价格为0时自动获取价格方案价格，确定要审核该单据吗?'
				}
				this.$dialog.confirm({
					title: '提示',
					message: message
				}).then(() => {
					resolve()
				})
			})
		},
		expressHandler () {
			this.checkHasDetails().then(() => {
				let params = this.getSaveParams()
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/salesout/${this.query.orderId}/users/${this.loginerId}`,
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
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/salesout/${this.query.orderId}/users/${this.loginerId}`,
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
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/salesout/${this.query.orderId}`,
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
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/salesout/${this.query.orderId}/users/${this.loginerId}`,
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
			} else {
				item.taxPrice = parseFloat(item.taxPrice) * newUnit.value / oldUnitRate
				this.calcMoney('taxPrice', item.taxPrice, item)
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
		// }}}
		toFixedNumberSize (data, pointSize = this.sysMoneyPointSize) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, pointSize))
		},
		onEditRowConfirm (item) {
			let detailsIndex = this.orderItemList[0].details.findIndex(detailsItem => {
				return detailsItem.goodsDTO.id === item.goodsDTO.id && detailsItem.changeType !== 'del'
			})
			if (~detailsIndex) {
				this.orderItemList[0].details[detailsIndex] = item
			}
		},
		onExpressAgainClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要复审该单据吗?'
			}).then(() => {
				let params = this.getSaveParams()
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/salesout/${this.query.orderId}/users/${this.loginerId}`,
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
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/salesout/${this.query.orderId}/users/${this.loginerId}`,
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
						url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/salesout/${this.query.orderId}/users/${this.loginerId}`,
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
						url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/salesout/${this.query.orderId}/users/${this.loginerId}`,
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
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/salesout/${this.query.orderId}/users/${this.loginerId}`,
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
		getStoreItem () {
			if (this.$fxUtils.isEmptyObjSHW(this.orderInfoData)) {
				return []
			} else {
				let currentHouse = this.orderItemList.find(item => {
					return item.id === this.orderInfoData.houseDTO.id
				})
				if (currentHouse) {
					return currentHouse.details
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
				currentStore.details = selectedItemArr
			} else {
				let _store = Object.assign({}, store)
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
.inteledi-salesOut-details {
	height:100%
	background:$fxWhite
	display: flex
	flex-direction: column
	.salesOut-bottom {
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


