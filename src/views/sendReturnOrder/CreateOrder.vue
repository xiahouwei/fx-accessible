<template>
	<div class="inteledi-shopOrder-create">
		<w-header title="新增直送退货单" :border="true"></w-header>
		<orderInfo
			ref="orderInfo"
			:data="orderInfoData"
			:isCreated="$fxUtils.isEmptyObjSHW($route.params)"
			:collapseDisabled="itemInputFocusing"
			@on-busdate-click="onBusinessDateClick"
			@on-billType-click="onBillTypeClick"
			@on-supplier-click="onSupplierClick"
			@on-shop-click="onShopClick"
			@on-billType-clear="onBillTypeClear"
		></orderInfo>
		<orderItem
			ref="orderItem"
			:data="orderItemList"
			:itemInputFocusing.sync="itemInputFocusing"
			@on-import-click="onImportClick"
			@on-search-click="onSearchClick"
			@on-item-edit="onItemEdit"
			@on-item-focus="onItemFocus"
		></orderItem>
		<div class="shopOrder-bottom">
			<van-button class="add-btn fx-no-radius" type="primary" @click="onCreateClick">生成单据</van-button>
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
				title="退货机构检索"
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
				title="供货商检索"
				@on-search="searchSupplier"
				@on-select="selectSupplier"
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
		<van-popup
			v-model="importPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<importBillComp
				:visibleFlag.sync="importPopShow"
				:orderInfo="orderInfoData"
				@on-item-import-confirm="onImportConfirm"
			></importBillComp>
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
				:isDisabled="!$fxAuth('shopDirectRtnBill.save')"
				@on-search-confirm="onSearchConfirm"
			></itemSearchPop>
		</van-popup>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import orderInfo from '@/components/sendReturnOrder/createOrder/OrderInfo.vue'
import orderItem from '@/components/sendReturnOrder/createOrder/OrderItem.vue'
import listComp from '@/components/common/ListComp.vue'
import importBillComp from '@/components/sendReturnOrder/common/ImportBillComp.vue'
import itemRowEditPop from '@/components/sendReturnOrder/common/ItemRowEditPop.vue'
import itemSearchPop from '@/components/sendReturnOrder/common/itemSearchPop.vue'
const SHOP_SIZE = 50
export default {
	name: 'createSendReturnOrder',
	components: {
		orderInfo,
		orderItem,
		listComp,
		importBillComp,
		itemRowEditPop,
		itemSearchPop
	},
	data () {
		return {
			query: this.$route.query,
			activeNames: ['1'],
			tabActive: '选项1',
			orderInfoData: {
				accountDTO: {},
				billEmp: '',
				billMemo: '',
				billState: 0,
				businessDate: new Date().getTime(),
				details: [],
				supplierDTO: {},
				shopDTO: {},
				rdcDTO: {},
				businessTypeDTO: {},
				manualCode: '',
				updateIndicator: 'Append'
			},
			orderItemList: [],
			currentDate: new Date(),
			datePickerShow: false,
			supplierPopShow: false,
			shopPopShow: false,
			billTypePopShow: false,
			importPopShow: false,
			supplierList: [],
			shopList: [],
			billTypeList: [],
			itemEditRowData: {},
			itemRowEditPopShow: false,
			itemInputFocusing: false,
			shopListStart: 0,
			onShopLoading: false,
			shopListLoadFinished: false,
			itemSearchPopShow: false,
			searchItem: []
		}
	},
	created () {
		if (!this.$fxUtils.isEmptyObjSHW(this.$route.params)) {
			this.orderInfoData = this.$route.params
			this.orderItemList = this.filterStoreItem(this.orderInfoData
				.details)
		} else if (this.loginerIsShop) {
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
		if (to.path === '/sendReturnOrder') {
			this.$dialog.confirm({
				title: '提示',
				message: '若已修改,请先保存单据<br/>是否关闭页面?'
			}).then(() => {
				next()
			}).catch(() => {
				this.$router.go(1)
				return false
			})
		} else if (to.path === '/sendOrder') {
			this.$router.replace('sendReturnOrder')
		} else {
			next()
		}
	},
	computed: {
		...mapState({
			loginerShopName: state => state.loginer.loginerShopName,
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId,
			loginerOrganType: state => state.loginer.loginerOrganType
		}),
		loginerIsShop () {
			return this.$fxStateMiddleware.stateIs('loginerOrganType')('shop')(this.loginerOrganType)
		}
	},
	methods: {
		filterStoreItem (data) {
			let stores = Array.from(new Set(data.map(item => {
				return item.outHouseDTO.id
			})))
			let StoreItem = stores.map(item => {
				let storeObj = data.find(dataItem => {
					return dataItem.outHouseDTO.id === item
				}).outHouseDTO
				storeObj = JSON.parse(JSON.stringify(storeObj))
				storeObj.details = data.filter(dataItem => {
					return dataItem.outHouseDTO.id === item
				})
				return storeObj
			})
			return StoreItem
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
					m: 'list4ShopDirectRtnBill',
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
		// {{{ 供货商
		onSupplierClick () {
			this.onSupplierRefresh()
		},
		searchSupplier (keyword) {
			this.onSupplierRefresh(keyword)
		},
		selectSupplier (item) {
			this.checkSupplier(item).then(() => {
				this.clearItemConfim('更换供货商会清空品项,是否继续?').then(() => {
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
		onSupplierRefresh (keyword = null) {
			this.getSupplierListData(keyword).then(res => {
				this.supplierList = res.suppliers
				this.supplierPopShow = true
			})
		},
		getSupplierListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					keyword: keyword
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.orderInfoData.shopDTO.id}/users/${this.loginerId}/suppliers`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		// }}}
		// {{{ 门店
		onShopClick () {
			this.onShopRefresh()
		},
		searchShop (keyword) {
			this.onShopRefresh(keyword)
		},
		selectShop (item) {
			this.checkShop(item).then(() => {
				this.clearItemConfim('更换退货机构会清空品项,是否继续?').then(() => {
					this.orderInfoData.shopDTO = item
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
		onShopRefresh (keyword = null) {
			this.shopListStart = 0
			this.getShopListData(keyword).then(res => {
				this.shopPopShow = true
				this.onShopLoading = false
				this.shopListStart += SHOP_SIZE
				if (res.shops.length < SHOP_SIZE) {
					this.shopListLoadFinished = true
				} else {
					this.shopListLoadFinished = false
				}
				this.shopList = res.shops
			})
		},
		onShopLoad (keyword = null) {
			this.getShopListData(keyword).then(res => {
				this.onShopLoading = false
				this.shopListStart += SHOP_SIZE
				if (res.shops.length < SHOP_SIZE) {
					this.shopListLoadFinished = true
				}
				this.shopList.push(...res.shops)
			})
		},
		getShopListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					start: this.shopListStart,
					size: SHOP_SIZE,
					paged: true,
					keyword: keyword
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/organs`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		// }}}
		onImportClick () {
			this.checkOrderInfo().then(() => {
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
				if (items.length !== 0) {
					this.$dialog.confirm({
						title: '提示',
						message: '重新导入单据？会清空明细！'
					}).then(() => {
						this.onItemClear()
						this.importPopShow = true
					}).catch(() => {
					})
				} else {
					this.importPopShow = true
				}
			})
		},
		checkOrderInfo () {
			return new Promise(resolve => {
				if (!this.orderInfoData.shopDTO.id) {
					this.$fxToast.top(`请选择退货机构！`)
				} else if (!this.orderInfoData.supplierDTO.id) {
					this.$fxToast.top(`请选择供货商！`)
				} else {
					resolve()
				}
			})
		},
		checkBillType () {
			return new Promise(resolve => {
				if (!this.orderInfoData.businessTypeDTO.id) {
					if (this.$fxAuth('shopDirectRtnBill.billType')) {
						this.$fxToast.top(`请选择单据类型`)
					} else {
						resolve()
					}
				} else {
					resolve()
				}
			})
		},
		onImportConfirm (itemData) {
			if (itemData.length === 0) {
				return false
			}
			let details = this.orderInfoData.details.filter(item => {
				return !!item.id
			})
			let fatherId = ''
			details.forEach(item => {
				item.changeType = 'del'
			})
			itemData.forEach(item => {
				fatherId = item.billId
				item.changeType = 'add'
				item.preDetailId = item.id
				item.billId = ''
				item.busUnitOutAmount = item.busUnitInAmount
				item.outHouseDTO = item.inHouseDTO
				item.outMoney = item.inMoney
				item.outMoneyWithTax = item.inMoneyWithTax
				item.taxOutMoney = item.taxInMoney
				delete item['inHouseDTO']
				delete item['id']
				delete item['busUnitInAmount']
				delete item['inMoney']
				delete item['inMoneyWithTax']
				delete item['taxInMoney']
				delete item['outOrderAmount']
			})
			details.push(...itemData)
			this.orderInfoData.details = details
			this.orderItemList = this.filterStoreItem(details)
			this.orderInfoData.fatherId = fatherId
		},
		onCreateClick () {
			if (this.itemInputFocusing) {
				return false
			}
			this.$dialog.confirm({
				title: '提示',
				message: '确定生成单据吗?'
			}).then(() => {
				this.checkBillType().then(cres => {
					this.getSaveParams().then(res => {
						this.createHandler(res)
					})
				})
			}).catch(() => {
			})
		},
		createHandler (params) {
			this.$fxHttp.requestPost({
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/directrtnbills`,
				data: params
			}).then(res => {
				this.$fxToast.success('生成单据成功').then(() => {
					this.$router.replace({
						path: 'sendReturnOrderDetails',
						query: {
							orderId: res.storeBills[0].id
						}
					})
				})
			})
		},
		getSaveParams () {
			return new Promise(resolve => {
				if (this.orderItemList.length === 0) { // 单据明细为空，弹出新增明细页
					this.onImportClick()
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
		onItemEdit (itemData) {
			this.itemEditRowData = itemData
			this.itemRowEditPopShow = true
		},
		onEditRowConfirm (item) {
			let storeIndex = this.orderItemList.findIndex(storeItem => {
				return storeItem.id === item.outHouseDTO.id
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
		onItemClear () {
			this.orderInfoData.details = []
			this.orderItemList = this.orderInfoData.details
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

