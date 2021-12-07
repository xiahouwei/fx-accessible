<template>
	<div class="inteledi-shopStraightRtnBill-create">
		<w-header title="新增门店直通退货单" :border="true"></w-header>
		<orderInfo
			ref="orderInfo"
			:data="orderInfoData"
			:collapseDisabled="itemInputFocusing"
			@on-busdate-click="onBusinessDateClick"
			@on-billType-click="onBillTypeClick"
			@on-rdc-click="onRdcClick"
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
			@on-unit-edit="onUnitEdit"
			@on-item-edit="onItemEdit"
			@on-item-focus="onItemFocus"
		></orderItem>
		<div class="shopStraightRtnBill-bottom">
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
				title="机构检索"
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
		<van-popup v-model="rdcPopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="rdcPopShow"
				:data="rdcList"
				:loadFinished="true"
				title="配送中心检索"
				@on-search="searchRdc"
				@on-select="selectRdc"
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
				:isDisabled="!$fxAuth('shopStraightRtnBill.save')"
				@on-search-confirm="onSearchConfirm"
			></itemSearchPop>
		</van-popup>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import orderInfo from '@/components/shopStraightRtnBill/createOrder/OrderInfo.vue'
import orderItem from '@/components/shopStraightRtnBill/createOrder/OrderItem.vue'
import listComp from '@/components/common/ListComp.vue'
import importBillComp from '@/components/shopStraightRtnBill/common/ImportBillComp.vue'
import itemRowEditPop from '@/components/shopStraightRtnBill/common/ItemRowEditPop.vue'
import itemSearchPop from '@/components/shopStraightRtnBill/common/itemSearchPop.vue'
const SHOP_SIZE = 50
export default {
	name: 'createShopStraightRtnBill',
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
				shopDTO: {},
				supplierDTO: {},
				rdcDTO: {},
				businessTypeDTO: {},
				manualCode: '',
				updateIndicator: 'Append'
			},
			orderItemList: [],
			currentDate: new Date(),
			datePickerShow: false,
			shopPopShow: false,
			supplierPopShow: false,
			rdcPopShow: false,
			billTypePopShow: false,
			importPopShow: false,
			shopList: [],
			supplierList: [],
			rdcList: [],
			billTypeList: [],
			itemEditRowData: {},
			itemRowEditPopShow: false,
			itemInputFocusing: false,
			shopListStart: 0,
			onShopLoading: false,
			shopListLoadFinished: false,
			itemSearchPopShow: false,
			unitActionShow: false,
			unitActions: [],
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
		if (to.path === '/shopStraightRtnBill') {
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
			loginerShopName: state => state.loginer.loginerShopName,
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId,
			loginerOrganType: state => state.loginer.loginerOrganType,
			sysPointSize: 'sysPointSize'
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
		setDetailGoodsUUid (data) { // 存在重复品项，故设置UUId
			data.forEach(dataItem => {
				dataItem.details.forEach(item => {
					item.goodsUUid = this.$fxUtils.createUUID()
				})
			})
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
					m: 'list4ShopStraightRtnBillEdit',
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
		// {{{ 门店
		onShopClick () {
			this.onShopRefresh()
		},
		searchShop (keyword) {
			this.onShopRefresh(keyword)
		},
		selectShop (item) {
			this.checkShop(item).then(() => {
				this.clearItemConfim('更换所属机构会清空品项,是否继续?').then(() => {
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
					keyword: keyword,
					m: 'getShopListForUserhouse',
					orgFlag: 0
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/shops`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		// }}}
		// {{{供货商类型
		onSupplierClick () {
			if (!this.orderInfoData.shopDTO.id) {
				this.$fxToast.fail('请选择所属门店！')
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
		// {{{ 配送中心
		onRdcClick () {
			this.onRdcRefresh()
		},
		searchRdc (keyword) {
			this.onRdcRefresh(keyword)
		},
		selectRdc (item) {
			this.checkRdc(item).then(() => {
				this.clearItemConfim('更换配送中心会清空品项,是否继续?').then(() => {
					this.orderInfoData.rdcDTO = item
				})
			})
		},
		checkRdc (rdc) {
			return new Promise(resolve => {
				let currentRdc = this.orderInfoData.rdcDTO || {}
				if (currentRdc.id !== rdc.id) {
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
					keyword: keyword,
					selAll: 'on'
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
					this.$fxToast.top(`请选择所属门店！`)
				} else if (!this.orderInfoData.rdcDTO.id) {
					this.$fxToast.top(`请选择配送中心！`)
				} else if (!this.orderInfoData.supplierDTO.id) {
					this.$fxToast.fail('请先选择供货商!')
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
			this.setDetailGoodsUUid(this.orderItemList)
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
				this.getSaveParams().then(res => {
					this.createHandler(res)
				})
			}).catch(() => {
			})
		},
		createHandler (params) {
			this.$fxHttp.requestPost({
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/shopStraightRtn`,
				data: params
			}).then(res => {
				this.$fxToast.success('生成单据成功').then(() => {
					this.$router.replace({
						path: 'shopStraightRtnBillDetails',
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
		// {{{单位
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
			let busUnitOutAmount = parseFloat(this.$fxUtils.toFixedSHW(item.busUnitOutAmount * rate, this.sysPointSize))
			let taxPrice = parseFloat(this.$fxUtils.toFixedSHW(item.outMoneyWithTax / busUnitOutAmount, this.sysPointSize))
			let price = parseFloat(this.$fxUtils.toFixedSHW(item.outMoney / busUnitOutAmount, this.sysPointSize))
			item.unitDTO = unit
			item.busUnitOutAmount = busUnitOutAmount
			item.taxPrice = taxPrice
			item.price = price
			if (item.id) {
				item.changeType = 'edit'
			}
		},
		// }}}
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
					return detailsItem.goodsUUid === item.goodsUUid
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
.inteledi-shopStraightRtnBill-create {
	height:100%
	background:$fxWhite
	display: flex
	flex-direction: column
	.shopStraightRtnBill-bottom {
		width:100%
		.add-btn {
			width:100%
		}
	}
}
</style>

