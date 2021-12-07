<template>
	<div class="inteledi-salesOut-create">
		<w-header title="新增外销出库单" :border="true"></w-header>
		<orderInfo
			ref="orderInfo"
			:data="orderInfoData"
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
			:data="orderItemList"
			:itemInputFocusing.sync="itemInputFocusing"
			@on-add-click="onAddClick"
			@on-search-click="onSearchClick"
			@on-item-edit="onItemEdit"
			@on-unit-edit="onUnitEdit"
			@on-item-focus="onItemFocus"
		></orderItem>
		<div class="salesOut-bottom">
			<van-button class="add-btn fx-no-radius" type="primary" @click="onCreateClick">生成单据</van-button>
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
				:customerId="orderInfoData.customerDTO.id"
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
				:shopId="orderInfoData.shopDTO && orderInfoData.shopDTO.id"
				:customerId="orderInfoData.customerDTO && orderInfoData.customerDTO.id"
				:isDisabled="!$fxAuth('salesOutBill.save')"
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
	name: 'createSalesOut',
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
			orderInfoData: {
				autoType: 1,
				stockType: 3,
				accountDTO: {},
				billEmp: '',
				billMemo: '',
				billState: 0,
				arriveDate: new Date().getTime(),
				businessDate: new Date().getTime(),
				businessTypeDTO: {},
				shopDTO: {},
				houseDTO: {},
				customerDTO: {},
				details: [],
				updateIndicator: 'Append',
				expressFlag: false
			},
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
			itemRowEditPopShow: false,
			itemEditRowData: {},
			itemInputFocusing: false,
			itemSearchPopShow: false,
			searchItem: [],
			currentShopHouseObj: {},
			itemPopShow: false
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize',
			sysMoneyPointSize: 'sysMoneyPointSize',
			loginerShopId: state => state.loginer.loginerShopId,
			loginerShopName: state => state.loginer.loginerShopName,
			loginerOrganType: state => state.loginer.loginerOrganType,
			loginerId: state => state.loginer.loginerId
		})
	},
	created () {
		if (this.loginerShopId && this.$fxStateMiddleware.stateIs('loginerOrganType')(['shop', 'center'])(this.loginerOrganType)) {
			this.orderInfoData.shopDTO = {
				id: this.loginerShopId,
				name: this.loginerShopName
			}
		}
	},
	beforeRouteLeave (to, from, next) {
		if (this.itemInputFocusing) {
			this.$router.go(1)
			return false
		}
		if (to.path === '/salesOut') {
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
	methods: {
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
				this.$fxToast.top('请先选择机构！')
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
		onCreateClick () {
			if (this.itemInputFocusing) {
				return false
			}
			this.$dialog.confirm({
				title: '提示',
				message: '确定生成单据吗?'
			}).then(() => {
				this.getSaveParams().then(res => {
					this.createHandler(res)
				})
			}).catch(() => {
			})
		},
		createHandler (params) {
			this.$fxHttp.requestPost({
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/salesout`,
				data: params
			}).then(res => {
				this.$fxToast.success('生成单据成功').then(() => {
					this.$router.replace({
						path: 'salesOutDetails',
						query: {
							orderId: res.storeBills[0].id
						}
					})
				})
			})
		},
		getSaveParams () {
			return new Promise(resolve => {
				if (this.getItemLength() === 0) { // 单据明细为空，弹出新增明细页
					this.onAddClick()
				} else {
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
						}
					})
					resolve(params)
				}
			})
		},
		getValidItem () {
			let itemDetails = []
			this.orderItemList.forEach(item => {
				itemDetails.push(...item.details)
			})
			return itemDetails
		},
		getItemLength () {
			return this.getValidItem().length
		},
		onItemClear () {
			this.orderInfoData.details = []
			this.orderItemList = this.orderInfoData.details
		},
		onItemFocus () {
			this.$refs.orderInfo.closeCollapse()
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
				item.busUnitOutAmount = parseFloat(this.$fxUtils.toFixedSHW(amount, this.sysPointSize))
				this.calcMoney('moneyWithTax', item.sendMoneyWithTax, item)
			} else {
				item.taxPrice = parseFloat(item.taxPrice) * newUnit.value / oldUnitRate
				this.calcMoney('taxPrice', item.taxPrice, item)
			}
			// 订货数量
			let outOrderAmount = parseFloat(item.outOrderAmount)
			outOrderAmount = outOrderAmount * oldUnitRate / newUnit.value
			item.outOrderAmount = outOrderAmount
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
		// {{{ 搜索界面
		onSearchClick () {
			this.itemSearchPopShow = true
			this.searchItem = JSON.parse(JSON.stringify(this.orderItemList))
		},
		onSearchConfirm (searchItemData) {
			this.orderItemList = searchItemData
		},
		// }}}
		// {{{增加品项
		getStoreItem () {
			if (this.$fxUtils.isEmptyObjSHW(this.orderInfoData.houseDTO)) {
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
.inteledi-salesOut-create {
	height:100%
	background:$fxWhite
	display: flex
	flex-direction: column
	.salesOut-bottom {
		width:100%
		.add-btn {
			width:100%
		}
	}
}
</style>

