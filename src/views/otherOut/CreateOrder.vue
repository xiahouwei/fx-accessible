<template>
	<div class="inteledi-otherOut-create">
		<w-header title="新增其他出库单" :border="true"></w-header>
		<orderInfo
			ref="orderInfo"
			:data="orderInfoData"
			:collapseDisabled="itemInputFocusing"
			@on-shop-click="onShopClick"
			@on-busdate-click="onBusinessDateClick"
			@on-item-clear="onItemClear"
			@on-autoType-click="onAutoTypeClick"
		></orderInfo>
		<orderItem
			:data="orderItemList"
			:itemInputFocusing.sync="itemInputFocusing"
			:shopId="orderInfoData.shopDTO && orderInfoData.shopDTO.id"
			@on-search-click="onSearchClick"
			@on-add-click="onAddClick"
			@on-unit-edit="onUnitEdit"
			@on-item-edit="onItemEdit"
			@on-item-focus="onItemFocus"
		></orderItem>
		<div class="otherOut-bottom">
			<van-button class="add-btn fx-no-radius" type="primary" @click="onCreateClick">生成单据</van-button>
		</div>
		<van-popup v-model="shopPopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="shopPopShow"
				:data="shopList"
				:loadFinished="shopListLoadFinished"
				:loading.sync="onShopLoading"
				title="请选择出库机构"
				@on-search="searchShop"
				@on-select="selectShop"
				@on-load="onShopLoad"
			></listComp>
		</van-popup>
		<van-popup v-model="autoTypePopShow" position="right" class="fx-list-popup-300">
			<listComp
				:visibleFlag.sync="autoTypePopShow"
				:data="autoTypeList"
				title="生成方式检索"
				:loadFinished="true"
				@on-select="selectAutoType"
				@on-search="searchAutoType"
			></listComp>
		</van-popup>
		<van-popup v-model="datePickerShow" position="bottom">
			<w-date-picker
				:visibleFlag.sync="datePickerShow"
				:currentDate="currentDate"
				@confirm="dateConfirmhandle"
			></w-date-picker>
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
				@on-save="onStoreItemSave"
				@on-select-store="onStoreItemSelect"
			></storeItemComp>
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
			v-model="itemPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<itemEditComp
				:visibleFlag.sync="itemPopShow"
				:shopId="orderInfoData.shopDTO && orderInfoData.shopDTO.id"
				:store="currentStoreObj"
				:parentStoreItem="getStoreItem()"
				@on-confirm="onItemEditConfirm"
			></itemEditComp>
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
				:isDisabled="!$fxAuth('otherOutBill.save')"
				@on-search-confirm="onSearchConfirm"
			></itemSearchPop>
		</van-popup>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import orderInfo from '@/components/otherOut/createOrder/OrderInfo.vue'
import orderItem from '@/components/otherOut/createOrder/OrderItem.vue'
import listComp from '@/components/common/ListComp.vue'
import storeItemComp from '@/components/otherOut/common/StoreItemComp.vue'
import itemRowEditPop from '@/components/otherOut/common/ItemRowEditPop.vue'
import itemSearchPop from '@/components/otherOut/common/itemSearchPop.vue'
import itemEditComp from '@/components/otherOut/common/itemEditComp.vue'
const ITEM_SIZE = 50
export default {
	name: 'createOtherOut',
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
			activeNames: ['1'],
			tabActive: '选项1',
			orderInfoData: {
				accountDTO: {},
				billEmp: '',
				billMemo: '',
				billState: 0,
				businessDate: new Date().getTime(),
				shopDTO: {},
				details: [],
				autoType: 1,
				updateIndicator: 'Append'
			},
			orderItemList: [],
			dateType: 'business',
			currentDate: new Date(),
			shopPopShow: false,
			shopList: [],
			shopListStart: 0,
			searchShopKey: null,
			shopListLoadFinished: false,
			onShopLoading: false,
			datePickerShow: false,
			itemStorePopShow: false,
			storeItem: [],
			unitActions: [],
			unitActionShow: false,
			itemRowEditPopShow: false,
			itemEditRowData: {},
			itemInputFocusing: false,
			itemSearchPopShow: false,
			searchItem: [],
			currentStoreObj: {},
			itemPopShow: false,
			autoTypeList: [],
			autoTypeData: [
				{ id: 1, name: '手动生成' },
				{ id: 2, name: '冲减出库' }
			],
			autoTypePopShow: false
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize',
			loginerShopId: state => state.loginer.loginerShopId,
			loginerShopName: state => state.loginer.loginerShopName,
			loginerOrganType: state => state.loginer.loginerOrganType,
			loginerId: state => state.loginer.loginerId
		})
	},
	created () {
		if (this.loginerShopId && this.$fxStateMiddleware.stateIs('loginerOrganType')(['shop', 'center', 'area'])(this.loginerOrganType)) {
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
		if (to.path === '/otherOut') {
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
		// {{{ 入库机构
		onShopClick () {
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
		onShopRefresh () {
			this.getShopListData().then(res => {
				this.onShopLoading = false
				this.shopList = res.shops
				this.shopPopShow = true
			})
		},
		onShopLoad () {
			this.getShopListData().then(res => {
				this.onShopLoading = false
				this.shopList.push(...res.shops)
			})
		},
		getShopListData () {
			return new Promise(resolve => {
				let params = {
					start: this.shopListStart,
					size: ITEM_SIZE,
					keyword: this.searchShopKey,
					m: 'list4ShopOtherOrderBill4Edit'
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/shops`,
					data: params
				}).then(res => {
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
				this.clearItemConfim('更换入库机构清空明细,是否继续?').then(() => {
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
		// }}}
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
		// }}}
		// {{{更改日期
		onBusinessDateClick () {
			this.dateType = 'business'
			if (this.orderInfoData.businessDate) this.currentDate = new Date(this.orderInfoData.businessDate)
			this.datePickerShow = true
		},
		dateConfirmhandle (date) {
			let time = date.getTime()
			this.orderInfoData.businessDate = time
			this.datePickerShow = false
		},
		// }}}
		// {{{ 生成方式
		onAutoTypeClick () {
			this.autoTypeList = this.autoTypeData
			this.autoTypePopShow = true
		},
		selectAutoType (item) {
			this.orderInfoData.autoType = item.id
		},
		searchAutoType (keyword) {
			this.autoTypeList = this.autoTypeData.filter(item => {
				return item['name'].includes(keyword)
			})
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
					this.$fxToast.fail('请先选择业务日期!')
				} else if (!this.orderInfoData.shopDTO.id) {
					this.$fxToast.fail('请先选择申请机构!')
				} else {
					resolve()
				}
			})
		},
		onStoreItemSave (storeItemData) {
			this.orderInfoData.details = storeItemData
			this.orderItemList = this.orderInfoData.details
		},
		onCreateClick () {
			if (this.itemInputFocusing) {
				return false
			}
			this.$dialog.confirm({
				title: '提示',
				message: '确定生成单据吗?'
			}).then(() => {
				this.checkHasDetails().then(() => {
					let params = this.getSaveParams()
					this.createHandler(params)
				})
			}).catch(() => {
			})
		},
		createHandler (params) {
			this.$fxHttp.requestPost({
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/otherOutBills`,
				data: params
			}).then(res => {
				this.$fxToast.success('生成单据成功').then(() => {
					this.$router.replace({
						path: 'otherOutDetails',
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
		checkHasDetails () {
			return new Promise(resolve => {
				if (this.getItemLength() === 0) { // 单据明细为空，弹出新增明细页
					this.onAddClick()
				} else {
					resolve()
				}
			})
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
		// {{{ 搜索界面
		onSearchClick () {
			this.itemSearchPopShow = true
			this.searchItem = JSON.parse(JSON.stringify(this.orderItemList))
		},
		// }}}
		onSearchConfirm (searchItemData) {
			this.orderItemList = searchItemData
		},
		// {{{增加品项
		onStoreItemSelect (currentStoreObj) {
			this.currentStoreObj = currentStoreObj
			this.itemPopShow = true
		},
		getStoreItem () {
			if (this.$fxUtils.isEmptyObjSHW(this.currentStoreObj)) {
				return []
			} else {
				let currentStore = this.orderItemList.find(item => {
					return item.id === this.currentStoreObj.id
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
.inteledi-otherOut-create {
	height:100%
	background:$fxWhite
	display: flex
	flex-direction: column
	.otherOut-bottom {
		width:100%
		.add-btn {
			width:100%
		}
	}
}
</style>

