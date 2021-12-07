<template>
	<w-app-page>
		<w-header title="新增中心统配出库单" :border="true"></w-header>
		<orderInfo
			ref="orderInfo"
			:data="orderInfoData"
			@on-shop-click="onInShopClick"
			@on-rdc-click="onRdcClick"
			@on-busdate-click="onBusinessDateClick"
			@on-arriveDate-click="onArriveDateClick"
			@on-billType-click="onBillTypeClick"
			@on-item-clear="onItemClear"
			@on-billType-clear="onBillTypeClear"
		></orderInfo>
		<orderItem
			:data="orderItemList"
			:itemInputFocusing.sync="itemInputFocusing"
			:showAddItemBtn="true"
			:inShopId="orderInfoData.inShopDTO && orderInfoData.inShopDTO.id"
			:rdcId="orderInfoData.rdcDTO && orderInfoData.rdcDTO.id"
			@on-add-click="onAddClick"
			@on-search-click="onSearchClick"
			@on-item-edit="onItemEdit"
		></orderItem>
		<w-bottom-btn-bar>
			<w-button
				size="large"
				type="primary"
				@click="onCreateClick"
			>生成单据
			</w-button>
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
				@on-search-confirm="onSearchConfirm"
			></itemSearchPop>
		</van-popup>
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
	name: 'createUniformDistributionOut',
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
			itemRowEditPopShow: false,
			itemEditRowData: {},
			itemSearchPopShow: false,
			searchItem: [],
			currentShopHouseObj: {},
			currentOutHouseObj: {},
			itemPopShow: false,
			itemInputFocusing: false,
			backAbsolute: false
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize',
			sysMoneyPointSize: 'sysMoneyPointSize',
			loginerShopId: state => state.loginer.loginerShopId,
			loginerShopName: state => state.loginer.loginerShopName,
			loginerId: state => state.loginer.loginerId,
			disOut_arrivalIntervalTime: state => state.systemParamsCld.disOut_arrivalIntervalTime
		})
	},
	created () {
		this.getBillOtherAuth().then(this.initDefaultOrderData)
	},
	beforeRouteLeave (to, from, next) {
		if (this.itemInputFocusing) {
			this.$router.go(1)
			return false
		}
		if (to.path === '/distributionOutBill4cld' && this.orderItemList.length !== 0 && !this.backAbsolute) {
			this.$dialog.confirm({
				title: '提示',
				message: '当前单据未生成<br/>是否生成单据?'
			}).then(() => {
				this.$router.go(1)
				this.verifyCreateBill().then(() => {
					let params = this.getSaveParams()
					this.createHandler(params)
				})
				return false
			}).catch(() => {
				next()
			})
		} else {
			next()
		}
	},
	methods: {
		initDefaultOrderData () {
			this.orderInfoData = {
				accountDTO: {},
				arriveDate: new Date().getTime() + this.$fxUtils.h2ms(this.disOut_arrivalIntervalTime),
				billEmp: '',
				billMemo: '',
				billState: 0,
				businessDate: new Date().getTime(),
				businessTypeDTO: {
					id: '0430_0020_0100',
					name: '中心统配出库单'
				},
				inShopDTO: {},
				rdcDTO: {
					id: this.loginerShopId,
					name: this.loginerShopName
				},
				details: [],
				updateIndicator: 'Append',
				expressFlag: false,
				freight: 0
			}
		},
		getBillOtherAuth () {
			return this.$fxApi('distributionOutBill4cld.getBillOtherAuth', '0').then(res => {
				this.$store.commit({
					type: 'EXTEND_AUTH',
					billAuth: res.functionMapData[0]
				})
				return Promise.resolve(res)
			})
		},
		clearItemConfirm (message) {
			return new Promise(resolve => {
				let items = this.orderItemList.filter(item => {
					let details = item.details.filter(details => {
						return details.changeType !== 'del'
					})
					return details.length !== 0
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
			if (!this.orderInfoData.rdcDTO.id) {
				this.$fxToast.top('请先选择配送中心!')
				return false
			}
			this.onInShopRefresh()
		},
		searchInShop (keyword) {
			this.onInShopRefresh(keyword)
		},
		selectInShop (item) {
			this.checkInShop(item).then(() => {
				this.clearItemConfirm('更换门店会清空品项,是否继续?').then(() => {
					this.orderInfoData.inShopDTO = item
				})
			})
		},
		checkInShop (inShopDTO) {
			return new Promise(resolve => {
				let currentInShopDTO = this.orderInfoData.inShopDTO
				if (currentInShopDTO.id !== inShopDTO.id) {
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
				keyword: keyword,
				selAll: 'on'
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
					this.$fxToast.top('请先选择业务日期!')
				} else if (!this.orderInfoData.rdcDTO.id) {
					this.$fxToast.top('请先选择配送中心!')
				} else if (!this.orderInfoData.inShopDTO.id) {
					this.$fxToast.top('请先选择门店!')
				} else if (!this.orderInfoData.businessTypeDTO.id) {
					this.$fxToast.top('请先选择单据类型!')
				} else {
					resolve()
				}
			})
		},
		onStoreItemSave (storeItemData) {
			this.orderInfoData.details = storeItemData
			this.orderItemList = this.orderInfoData.details
		},
		verifyCreateBill () {
			return new Promise(resolve => {
				if (this.getValidItem().length === 0) {
					this.onAddClick()
					return false
				} else {
					resolve()
				}
			})
		},
		onCreateClick () {
			if (this.itemInputFocusing) {
				return false
			}
			this.verifyCreateBill().then(() => {
				this.$dialog.confirm({
					title: '提示',
					message: '确定生成单据吗?'
				}).then(() => {
					let params = this.getSaveParams()
					this.createHandler(params)
				})
			})
		},
		createHandler (params) {
			this.$fxApi('distributionOutBill4cld.createOrder')({ data: params }).then(res => {
				this.$fxToast.success('生成单据成功').then(() => {
					this.$router.replace({
						path: 'distributionOutBill4cldDetails',
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
				},
				houseDTO: JSON.parse(JSON.stringify(addItems[0].outHouseDTO))
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
		onItemClear () {
			this.orderInfoData.details = []
			this.orderItemList = this.orderInfoData.details
		},
		onItemEdit (itemData) {
			this.itemEditRowData = itemData
			this.itemRowEditPopShow = true
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
		}
		// }}}
	}
}
</script>
