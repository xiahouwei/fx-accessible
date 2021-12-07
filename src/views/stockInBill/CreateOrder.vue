<template>
	<div class="inteledi-shopOrder-create">
		<w-header title="新增采购入库单" :border="true"></w-header>
		<orderInfo
			ref="orderInfo"
			:data="orderInfoData"
			:collapseDisabled="itemInputFocusing"
			:modifyBusinessDateFlag="modifyBusinessDateFlag"
			@on-shop-click="onShopClick"
			@on-supplier-click="onSupplierClick"
			@on-busdate-click="onBusinessDateClick"
			@on-orderDate-click="onOrderDateClick"
			@on-billType-click="onBillTypeClick"
			@on-billType-clear="onBillTypeClear"
		></orderInfo>
		<orderItem
			:data="orderItemList"
			:sysStockInChangeUnit="systemParams.sysStockInChangeUnit"
			:itemInputFocusing.sync="itemInputFocusing"
			@on-scan-click="onScanClick"
			@on-search-click="onSearchClick"
			@on-add-click="onAddClick"
			@on-item-edit="onItemEdit"
			@on-unit-edit="onUnitEdit"
			@on-item-focus="onItemFocus"
		></orderItem>
		<div class="shopOrder-bottom">
			<van-button class="add-btn fx-no-radius" type="primary" @click="onCreateClick">生成单据</van-button>
		</div>
		<van-popup v-model="shopPopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="shopPopShow"
				:data="shopList"
				:loadFinished="shopListLoadFinished"
				:loading.sync="onShopLoading"
				title="请选择门店"
				@on-search="searchShop"
				@on-select="selectShop"
				@on-load="onShopLoad"
			></listComp>
		</van-popup>
		<van-popup v-model="supplierPopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="supplierPopShow"
				:data="supplierList"
				:loadFinished="true"
				title="请选择供货商"
				@on-search="searchSupplier"
				@on-select="selectSupplier"
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
				:shopId="orderInfoData.shopDTO && orderInfoData.shopDTO.id"
				:supplierId="orderInfoData.supplierDTO && orderInfoData.supplierDTO.id"
				:businessDate="orderInfoData.businessDate"
				:sysStockInSameGoods="systemParams.sysStockInSameGoods"
				:sysStockInChangeUnit="systemParams.sysStockInChangeUnit"
				@on-save="onStoreItemSave"
			></storeItemComp>
		</van-popup>
		<van-popup
			v-model="storeScanPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<scanStoreComp
				:visibleFlag.sync="storeScanPopShow"
				:storeItemData="storeItem"
				:orderItemList="orderItemList"
				:shopId="orderInfoData.shopDTO && orderInfoData.shopDTO.id"
				:supplierId="orderInfoData.supplierDTO && orderInfoData.supplierDTO.id"
				@on-save="onStoreItemSave"
			></scanStoreComp>
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
				@on-Confirm="onEditRowConfirm"
			></itemRowEditPop>
		</van-popup>
		<!-- <van-popup
			v-model="itemRowEditPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<itemRowEditPop
				:visibleFlag.sync="itemRowEditPopShow"
				:itemData="itemEditRowData"
				:selcetPictureMode="selcetPictureMode"
				@on-selcet-iamge="selcetPictureActionsheet=true"
				:hasFatherBillFlag="orderInfoData.fatherId ? true : false"
				@on-Confirm="onEditRowConfirm"
			></itemRowEditPop>
		</van-popup>
		<van-actionsheet
			v-model="selcetPictureActionsheet"
			:actions="actions"
			cancel-text="取消"
			@select="onSelect"
		/> -->
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
				:isDisabled="!$fxAuth('shopStockInBill.save')"
				:supplierId="orderInfoData.supplierDTO && orderInfoData.supplierDTO.id"
				:sysStockInChangeUnit="systemParams.sysStockInChangeUnit"
				@on-search-confirm="onSearchConfirm"
			></itemSearchPop>
		</van-popup>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import orderInfo from '@/components/stockInBill/createBill/OrderInfo.vue'
import orderItem from '@/components/stockInBill/createBill/OrderItem.vue'
import listComp from '@/components/common/ListComp.vue'
import storeItemComp from '@/components/stockInBill/common/StoreItemComp.vue'
import itemRowEditPop from '@/components/stockInBill/common/ItemRowEditPop.vue'
import itemSearchPop from '@/components/stockInBill/common/itemSearchPop.vue'
import scanStoreComp from '@/components/stockInBill/common/ScanStoreComp.vue'
const ITEM_SIZE = 50
export default {
	name: 'createStockInBill',
	components: {
		orderInfo,
		orderItem,
		listComp,
		storeItemComp,
		itemRowEditPop,
		itemSearchPop,
		scanStoreComp
	},
	data () {
		return {
			query: this.$route.query,
			selcetPictureActionsheet: false,
			actions: [{
				name: '拍摄',
				value: 'Camera'
			}, {
				name: '从手机相册选择',
				value: 'Library'
			}],
			orderInfoData: {
				accountDTO: {},
				orderDate: new Date().getTime(),
				assignState: 0,
				billEmp: '',
				billMemo: '',
				billState: 0,
				businessDate: new Date().getTime(),
				businessTypeDTO: {},
				supplierDTO: {},
				shopDTO: {},
				details: [],
				updateIndicator: 'Append'
			},
			selcetPictureMode: {},
			orderItemList: [],
			dateType: 'business',
			currentDate: new Date(),
			shopPopShow: false,
			shopList: [],
			searchShopKey: null,
			onShopLoading: false,
			shopListLoadFinished: false,
			datePickerShow: false,
			supplierPopShow: false,
			supplierList: [],
			billTypePopShow: false,
			billTypeList: [],
			itemStorePopShow: false,
			storeItem: [],
			unitActions: [],
			unitActionShow: false,
			itemRowEditPopShow: false,
			itemEditRowData: {},
			itemInputFocusing: false,
			modifyBusinessDateFlag: true,
			itemSearchPopShow: false,
			searchItem: [],
			storeScanPopShow: false
		}
	},
	created () {
		if (this.$fxStateMiddleware.stateIs('loginerOrganType')(['shop', 'center'])(this.loginerOrganType)) {
			this.orderInfoData.shopDTO = {
				id: this.loginerShopId,
				name: this.loginerShopName
			}
			if (this.systemParams.sysShopInWorkDate === 2) {
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/nextaccountperiod`
				}).then(res => {
					if (res.shopAccountPeriods.length) {
						this.orderInfoData.businessDate = res.shopAccountPeriods[0].beginDate
					}
				})
			}
		}
		// 采购入库单业务日期系统设置 0:自定义(可修改); 1:采购订货单审核日期； 2：采购入库单审核日期（Z5新增单据时，去采购机构当前会计期开始日期） 3：采购订货单到货日期
		this.modifyBusinessDateFlag = true
	},
	beforeRouteLeave (to, from, next) {
		if (this.itemInputFocusing) {
			this.$router.go(1)
			return false
		}
		if (to.path === '/stockInBill') {
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
			systemParams: 'systemParams'
		}),
		isBillState (state) {
			return (state) => {
				if (Object.prototype.toString.call(state) === '[object Array]') {
					return state.includes(this.orderInfoData.billState)
				} else {
					return this.orderInfoData.billState === state
				}
			}
		}
	},
	methods: {
		setDetailGoodsUUid (data) { // 存在重复品项，故设置UUId
			data.forEach(dataItem => {
				dataItem.details.forEach(item => {
					item.goodsUUid = this.$fxUtils.createUUID()
				})
			})
		},
		// {{{ 入库机构
		onShopClick () {
			if (this.$fxStateMiddleware.stateIs('loginerOrganType')('shop')(this.loginerOrganType)) {
				return true
			}
			this.shopListStart = 0
			this.searchShopKey = null
			this.shopListLoadFinished = false
			this.onShopRefresh()
		},
		searchShop (keyword) {
			this.shopListStart = 0
			this.searchShopKey = keyword
			this.onShopRefresh()
		},
		onShopLoad () {
			this.getShopListData().then(res => {
				this.shopList.push(...res.shops)
			})
		},
		onShopRefresh () {
			this.getShopListData().then(res => {
				this.shopList = res.shops
				this.shopPopShow = true
			})
		},
		getShopListData () {
			return new Promise(resolve => {
				let params = {
					start: this.shopListStart,
					size: ITEM_SIZE,
					m: 'list4ShopOtherOrderBill4Edit',
					keyword: this.searchShopKey
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
		selectShop (item) {
			this.checkShop(item).then(() => {
				this.clearItemConfim('更换入库机构清空供货商和明细,是否继续?').then(() => {
					this.orderInfoData.shopDTO = item
					this.orderInfoData.supplierDTO = {}
					if (this.systemParams.sysShopInWorkDate === 2) {
						this.$fxHttp.requestGet({
							url: `${this.$fxBaseApi.url}/accounts/${item.id}/users/${this.loginerId}/nextaccountperiod`
						}).then(res => {
							if (res.shopAccountPeriods.length) {
								this.orderInfoData.businessDate = res.shopAccountPeriods[0].beginDate
							}
						})
					}
				})
			})
		},
		checkShop (shop) {
			return new Promise(resolve => {
				let currentShop = this.orderInfoData.shopDTO || {}
				if (currentShop.id !== shop.id) {
					resolve()
				}
			})
		},
		// }}}
		// {{{供货商类型
		onSupplierClick () {
			if (!this.orderInfoData.shopDTO.id) {
				this.$fxToast.fail('请选择入库机构！')
				return false
			}
			this.getSupplierListData().then(res => {
				this.supplierList = res.suppliers
				this.supplierPopShow = true
			})
		},
		searchSupplier (keyword) {
			this.getSupplierListData(keyword).then(res => {
				this.supplierList = res.suppliers
				this.supplierPopShow = true
			})
		},
		getSupplierListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					paged: true,
					size: 50,
					start: 0,
					searchText: keyword
				}
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/accounts/${this.orderInfoData.shopDTO.id}/users/${this.loginerId}/suppliers`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		selectSupplier (item) {
			this.checkSupplier(item).then(() => {
				this.clearItemConfim('更换供货商清空明细，是否确认修改?').then(() => {
					this.orderInfoData.supplierDTO = item
				})
			})
		},
		checkSupplier (supplier) {
			return new Promise(resolve => {
				let currentSupplier = this.orderInfoData.supplierDTO || {}
				if (currentSupplier.id !== supplier.id) {
					resolve()
				}
			})
		},
		// }}}
		// {{{日期选择
		onBusinessDateClick () {
			this.dateType = 'business'
			if (this.orderInfoData.businessDate) this.currentDate = new Date(this.orderInfoData.businessDate)
			this.datePickerShow = true
		},
		onOrderDateClick () {
			this.dateType = 'order'
			this.datePickerShow = true
		},
		dateConfirmhandle (date) {
			let time = date.getTime()
			if (this.dateType === 'business') {
				this.orderInfoData.businessDate = time
			} else {
				this.orderInfoData.orderDate = time
			}
			this.datePickerShow = false
		},
		// }}}
		// {{{单据类型
		getBillTypeListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					m: 'list4ShopStockInBillEdit',
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
		onBillTypeClick () {
			this.getBillTypeListData().then(res => {
				this.billTypeList = res.businessTypes
				this.billTypePopShow = true
			})
		},
		searchBillType (keyword) {
			this.getBillTypeListData(keyword).then(res => {
				this.billTypeList = res.businessTypes
				this.billTypePopShow = true
			})
		},
		selectBillType (item) {
			this.orderInfoData.businessTypeDTO = item
		},
		onBillTypeClear () {
			this.orderInfoData.businessTypeDTO = {}
		},
		// }}}
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
		onItemClear () {
			this.orderInfoData.details = []
			this.orderItemList = this.orderInfoData.details
		},
		onAddClick () {
			this.checkOrderInfo().then(() => {
				this.storeItem = JSON.parse(JSON.stringify(this.orderItemList))
				this.itemStorePopShow = true
			})
		},
		onScanClick () {
			this.checkOrderInfo().then(() => {
				this.storeItem = JSON.parse(JSON.stringify(this.orderItemList))
				this.storeScanPopShow = true
			})
		},
		// 47102 zj
		checkOrderInfo () {
			return new Promise((resolve, reject) => {
				if (!this.orderInfoData.businessDate) {
					this.$fxToast.fail('请先选择业务日期!')
				} else if (!this.orderInfoData.shopDTO.id) {
					this.$fxToast.fail('请先选择入库机构!')
				} else if (!this.orderInfoData.supplierDTO.id) {
					this.$fxToast.fail('请先选择供货商!')
				} else if (!this.orderInfoData.billMemo && this.$fxAuth('shopStockInBill.billMemoRequired')) {
					this.$fxToast.fail('请填写备注!')
				} else {
					resolve()
				}
			})
		},
		onStoreItemSave (storeItemData) {
			this.orderInfoData.details = storeItemData
			this.orderItemList = this.orderInfoData.details
			this.setDetailGoodsUUid(this.orderItemList)
		},
		onCreateClick () {
			if (this.itemInputFocusing) {
				return false
			}
			this.$dialog.confirm({
				title: '提示',
				message: '确定生成单据吗?'
			}).then(() => {
				this.checkDetails().then(() => {
					let params = this.getSaveParams()
					this.createHandler(params)
				})
			}).catch(() => {
			})
		},
		createHandler (params) {
			this.$fxHttp.requestPost({
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/stockinbills`,
				data: params
			}).then(res => {
				this.$fxToast.success('生成单据成功').then(() => {
					this.$router.replace({
						path: 'stockInBillDetails',
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
				}
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
		getItemLength () {
			return this.getValidItem().length
		},
		checkDetails () {
			return new Promise(resolve => {
				if (this.$fxSysAuth('shopStockInBill.sysStockProductionDate')) {
					let itemDetails = this.getValidItem()
					let produceDateItem = itemDetails.reduce((pre, cur) => {
						let arr = ''
						if (!cur.productDate && cur.goodsDTO.periodFlag) {
							arr = pre === '' ? pre + cur.goodsDTO.name : pre + '<br/>' + cur.goodsDTO.name
						} else {
							arr = pre
						}
						return arr
					}, '')
					if (produceDateItem !== '') {
						this.$dialog.alert({
							title: '提示',
							message: produceDateItem + '生产日期不能为空！'
						})
						return false
					}
				}
				if (this.getItemLength() === 0) { // 单据明细为空，弹出新增明细页
					this.onAddClick()
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
			let amount = parseFloat(item.busUnitInAmount)
			if (amount > 0) {
				amount = amount * oldUnitRate / newUnit.value
				item.busUnitInAmount = parseFloat(this.$fxUtils.toFixedSHW(amount, this.sysPointSize))
				this.calcMoney('moneyWithTax', item.inMoneyWithTax, item)
			} else {
				item.taxPrice = parseFloat(item.taxPrice) * newUnit.value / oldUnitRate
				item.costTaxPrice = parseFloat(item.costTaxPrice) * newUnit.value / oldUnitRate
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
			let { taxPrice, busUnitInAmount, price, tax } = itemData
			let money = 0
			let moneyWithTax = 0
			let itemPrice = 0
			let itemTaxPrice = 0
			amountOrMoney = this.toFixedNumberSize(amountOrMoney)
			if (itemData.giftFlag || (target === 'money' && amountOrMoney === 0)) {
				// 赠送、数量为0
				itemData.inMoney = 0
				itemData.inMoneyWithTax = 0
				itemData.taxInMoney = 0
				return true
			}
			if (target === 'money') {
				money = amountOrMoney
				itemPrice = this.toFixedNumberSize(money / busUnitInAmount)
				moneyWithTax = money * (1 + tax)
				itemTaxPrice = this.toFixedNumberSize(moneyWithTax / busUnitInAmount)
			} else if (target === 'amount') {
				itemData.busUnitInAmount = amountOrMoney
				itemPrice = price
				itemTaxPrice = taxPrice
				money = this.toFixedNumberSize(price * amountOrMoney)
				moneyWithTax = this.toFixedNumberSize(taxPrice * amountOrMoney)
			} else if (target === 'moneyWithTax') {
				moneyWithTax = amountOrMoney
				itemTaxPrice = this.toFixedNumberSize(moneyWithTax / busUnitInAmount)
				money = this.toFixedNumberSize(moneyWithTax / (1 + tax))
				itemPrice = this.toFixedNumberSize(money / busUnitInAmount)
			} else if (target === 'taxPrice') {
				itemTaxPrice = amountOrMoney
				moneyWithTax = this.toFixedNumberSize(busUnitInAmount * itemTaxPrice)
				itemPrice = this.toFixedNumberSize(itemTaxPrice / (1 + tax))
				money = this.toFixedNumberSize(itemPrice * busUnitInAmount)
			} else if (target === 'price') {
				itemPrice = amountOrMoney
				money = this.toFixedNumberSize(itemPrice * busUnitInAmount)
				itemTaxPrice = this.toFixedNumberSize(itemPrice * (1 + tax))
				moneyWithTax = this.toFixedNumberSize(busUnitInAmount * itemTaxPrice)
			}
			itemData.inMoney = money
			itemData.inMoneyWithTax = moneyWithTax
			itemData.taxInMoney = this.toFixedNumberSize(this.toFixedNumberSize(moneyWithTax) - this.toFixedNumberSize(money))
			itemData.price = itemPrice
			itemData.taxPrice = itemTaxPrice
		},
		// }}}
		toFixedNumberSize (data) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysPointSize))
		},
		onEditRowConfirm (item) {
			let storeIndex = this.orderItemList.findIndex(storeItem => {
				return storeItem.id === item.inHouseDTO.id
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
		onSelect (item) {
			this.selcetPictureMode = {
				...item,
				random: Math.random()
			}
			this.selcetPictureActionsheet = false
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.inteledi-shopOrder-create {
	height:100%
	background:$fxWhite
	display: flex
	flex-direction: column
	.shopOrder-bottom {
		width:100%
		.add-btn {
			width:100%
		}
	}
}
</style>

