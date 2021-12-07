<template>
	<div class="inteledi-insideMoveBill-create">
		<w-header title="新增内部调拨单" :border="true"></w-header>
		<orderInfo
			ref="orderInfo"
			:data="orderInfoData"
			:HouseManageDisabled="HouseManageDisabled"
			:collapseDisabled="itemInputFocusing"
			@on-busdate-click="onBusinessDateClick"
			@on-shop-click="onShopClick"
			@on-inStore-click="onInStoreClick"
			@on-outStore-click="onOutStoreClick"
			@on-houseManaged-click="onHouseManaged"
			@on-inStore-clear="onInStoreClear"
			@on-outStore-clear="onOutStoreClear"
		></orderInfo>
		<orderItem
			:data="orderItemList"
			:itemInputFocusing.sync="itemInputFocusing"
			@on-add-click="onAddClick"
			@on-search-click="onSearchClick"
			@on-unit-edit="onUnitEdit"
			@on-item-edit="onItemEdit"
			@on-item-focus="onItemFocus"
			@on-selectbom-click="onSelectBomClick"
			@on-viewbom-click="onViewBomClick"
		></orderItem>
		<div class="insideMoveBill-bottom">
			<van-button class="add-btn fx-no-radius" type="primary" @click="onCreateClick">生成单据</van-button>
		</div>
		<van-popup v-model="datePickerShow" position="bottom">
			<w-date-picker
				:visibleFlag.sync="datePickerShow"
				:currentDate="currentDate"
				@confirm="dateConfirmhandle"
			></w-date-picker>
		</van-popup>
		<van-popup v-model="shopPopShow" position="right" class="fx-list-popup-300">
			<listComp
				:visibleFlag.sync="shopPopShow"
				:data="shopList"
				title="机构检索"
				:loading.sync="shopLoading"
				:loadFinished="shopLoadFinished"
				:immediateCheck="false"
				@on-select="selectShop"
				@on-search="searchShop"
				@on-load="onShopLoad"
			></listComp>
		</van-popup>
		<van-popup v-model="inStorePopShow" position="right" class="fx-list-popup-300">
			<listComp
				:visibleFlag.sync="inStorePopShow"
				:data="inStoreList"
				title="入库仓库检索"
				:loading.sync="inStoreLoading"
				:loadFinished="inStoreLoadFinished"
				:immediateCheck="false"
				@on-select="selectInStore"
				@on-search="searchInStore"
				@on-load="onInStoreLoad"
			></listComp>
		</van-popup>
		<van-popup v-model="outStorePopShow" position="right" class="fx-list-popup-300">
			<listComp
				:visibleFlag.sync="outStorePopShow"
				:data="outStoreList"
				title="出库仓库检索"
				:loading.sync="outStoreLoading"
				:loadFinished="outStoreLoadFinished"
				:immediateCheck="false"
				@on-select="selectOutStore"
				@on-search="searchOutStore"
				@on-load="onOutStoreLoad"
			></listComp>
		</van-popup>
		<!-- zj -->
		<van-popup v-model="HouseManagedPopShow" position="right" class="fx-list-popup-300">
			<listComp
				:searchShow="searchShow"
				:visibleFlag.sync="HouseManagedPopShow"
				:data="HouseManagedList"
				title="调拨类型"
				:loading.sync="HouseManagedLoading"
				:loadFinished="HouseManagedLoadFinished"
				:immediateCheck="false"
				@on-select="houseManagedStore"
				@on-load="houseManagedLoad"
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
				:houseDTO="orderInfoData.inHouseDTO"
				:outHouseId="orderInfoData.outHouseDTO && orderInfoData.outHouseDTO.id"
				:shopId="orderInfoData.shopDTO && orderInfoData.shopDTO.id"
				:isDisabled="!$fxAuth('insideMoveBill.save')"
				@on-search-confirm="onSearchConfirm"
			></itemSearchPop>
		</van-popup>
		<van-popup
			v-model="bomPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<bomEditComp
				:visibleFlag.sync="bomPopShow"
				:shopId="orderInfoData.shopDTO && orderInfoData.shopDTO.id"
				@on-bom-confirm="onBomConfirm"
			></bomEditComp>
		</van-popup>
		<van-popup
			v-model="bomSearchPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<bomSearchPop
				:visibleFlag.sync="bomSearchPopShow"
				:data="searchBom"
				:searchKeywords="'code,name,pinYin'"
			></bomSearchPop>
		</van-popup>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import orderInfo from '@/components/insideMoveBill/createOrder/OrderInfo.vue'
import orderItem from '@/components/insideMoveBill/createOrder/OrderItem.vue'
import listComp from '@/components/common/ListComp.vue'
import itemEditComp from '@/components/insideMoveBill/common/itemEditComp.vue'
import itemRowEditPop from '@/components/insideMoveBill/common/itemRowEditPop.vue'
import itemSearchPop from '@/components/insideMoveBill/common/itemSearchPop.vue'
import bomEditComp from '@/components/insideMoveBill/bomImport/bomEditComp.vue'
import bomSearchPop from '@/components/insideMoveBill/bomImport/bomSearchPop.vue'
const ITEM_SIZE = 50
export default {
	name: 'createInsideMoveBill',
	components: {
		orderInfo,
		orderItem,
		listComp,
		itemEditComp,
		itemRowEditPop,
		itemSearchPop,
		bomEditComp,
		bomSearchPop
	},
	data () {
		return {
			query: this.$route.query,
			outHouseId: '',
			searchShow: false,
			activeNames: ['1'],
			tabActive: '选项1',
			HouseManagedStates: '',
			orderInfoData: {
				autoType: 1,
				houseManageDTO: {},
				accountDTO: {},
				billEmp: '',
				billMemo: '',
				insideMoveType: '',
				billState: 0,
				businessDate: new Date().getTime(),
				inHouseDTO: {},
				shopDTO: {},
				manualCode: '',
				outHouseDTO: {},
				updateIndicator: 'Append'
			},
			orderItemList: [],
			currentDate: new Date(),
			datePickerShow: false,
			itemPopShow: false,
			shopPopShow: false,
			shopList: [],
			shopListStart: 0,
			shopLoading: false,
			shopLoadFinished: false,
			inStorePopShow: false,
			HouseManagedStart: 0,
			HouseManagedPopShow: false,
			HouseManagedList: [],
			HouseManagedLoading: false,
			HouseManagedLoadFinished: false,
			HouseManageDisabled: true,
			inStoreList: [],
			inStoreListStart: 0,
			inStoreLoading: false,
			inStoreLoadFinished: false,
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
			itemSearchPopShow: false,
			searchItem: [],
			orderBomList: [],
			bomPopShow: false,
			bomSearchPopShow: false,
			searchBom: [],
			houseItem: {
				code: '',
				id: '',
				name: '',
				disabledFlag: true,
				pinYin: null,
				updateIndicator: 'Append'
			},
			houseManageDTO: [{
				code: '0',
				id: 0,
				name: '调入',
				pinYin: null,
				updateIndicator: 'Append',
				disabledFlag: true
			},
			{
				code: '1',
				id: 1,
				name: '调出',
				pinYin: null,
				updateIndicator: 'Append',
				disabledFlag: true
			}]
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
		if (this.$fxStateMiddleware.stateIs('loginerOrganType')(['shop', 'center'])(this.loginerOrganType)) {
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
		if (to.path === '/insideMoveBill') {
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
			this.orderItemList = []
		},
		// {{{ 机构
		onShopClick () {
			this.onShopRefresh()
		},
		searchShop (keyword) {
			this.onShopRefresh(keyword)
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
				let currentShopDTO = this.orderInfoData.shopDTO || {}
				if (currentShopDTO.id !== shopDTO.id) {
					resolve()
				}
			})
		},
		onShopRefresh (keyword = null) {
			this.shopListStart = 0
			this.getShopListData(keyword).then(res => {
				this.shopPopShow = true
				this.shopLoading = false
				this.shopListStart += ITEM_SIZE
				this.shopLoadFinished = res.shops.length < ITEM_SIZE
				this.shopList = res.shops
			})
		},
		onShopLoad (keyword = null) {
			this.getShopListData(keyword).then(res => {
				this.shopLoading = false
				this.shopListStart += ITEM_SIZE
				if (res.shops.length < ITEM_SIZE) {
					this.shopLoadFinished = true
				}
				this.shopList.push(...res.shops)
			})
		},
		getShopListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					m: 'getShopListForInsideMove',
					start: this.shopListStart,
					size: ITEM_SIZE,
					paged: true,
					keyword: keyword
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
		// {{{ 入库仓库
		onInStoreClick () {
			if (!this.orderInfoData.shopDTO.id) {
				this.$fxToast.top('请先选择机构！')
				return false
			}
			if (!this.orderInfoData.outHouseDTO.id) {
				this.$fxToast.top('请先选择出库仓库！')
				return false
			}
			this.onInStoreRefresh()
		},
		searchInStore (keyword) {
			this.onInStoreRefresh(keyword)
		},
		selectInStore (item) {
			this.checkInStore(item).then(() => {
				this.clearItemConfim('更换入库仓库会清空品项,是否继续?').then(() => {
					this.orderInfoData.inHouseDTO = item
					this.checkAllocateType('1') // 1 入库
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
			this.inStoreListStart = 0
			this.getInStoreListData(keyword).then(res => {
				this.inStorePopShow = true
				this.inStoreLoading = false
				this.inStoreListStart += ITEM_SIZE
				this.inStoreLoadFinished = res.shops.length < ITEM_SIZE
				this.inStoreList = res.shops
			})
		},
		onInStoreLoad (keyword = null) {
			this.getInStoreListData(keyword).then(res => {
				this.inStoreLoading = false
				this.inStoreListStart += ITEM_SIZE
				if (res.shops.length < ITEM_SIZE) {
					this.inStoreLoadFinished = true
				}
				this.inStoreList.push(...res.shops)
			})
		},
		getInStoreListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					m: 'getInHouseListForInsideMove',
					orgId: this.orderInfoData.shopDTO.id,
					houseId: this.orderInfoData.outHouseDTO.id,
					start: this.inStoreListStart,
					size: ITEM_SIZE,
					paged: true,
					keyword: keyword
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/houses`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		onInStoreClear () {
			this.clearItemConfim('更换入库仓库会清空品项,是否继续?').then(() => {
				this.orderInfoData.inHouseDTO = {}
				this.orderInfoData.insideMoveType = ''
				this.orderInfoData.houseManageDTO = {}
				this.HouseManageDisabled = true
			})
		},
		// }}}
		// {{{ 出库仓库
		onOutStoreClick () {
			if (!this.orderInfoData.shopDTO.id) {
				this.$fxToast.top('请先选择机构！')
				return false
			}
			this.onOutStoreRefresh()
		},
		searchOutStore (keyword) {
			this.onOutStoreRefresh(keyword)
		},
		selectOutStore (item) {
			this.checkOutStore(item).then(() => {
				this.clearItemConfim('更换出库仓库会清空品项,是否继续?').then(() => {
					this.orderInfoData.outHouseDTO = item
					this.checkAllocateType('2') // 2 出库
				})
			})
		},
		checkHouseStore (item) {
			return new Promise(resolve => {
				let currentData = this.orderInfoData.outHouseDTO
				if (currentData.id !== item.id) {
					resolve()
				}
			})
		},
		onHouseManaged () {
			console.log('123')
			this.onHouseManagedRefresh()
		},
		onHouseManagedRefresh () {
			this.HouseManagedStart = 0
			this.HouseManagedPopShow = true
			this.HouseManagedLoading = false
			this.HouseManagedStart += ITEM_SIZE
			this.HouseManagedLoadFinished = this.houseManageDTO.length < ITEM_SIZE
			this.HouseManagedList = this.houseManageDTO
			console.log('onHouseManagedRefresh')
		},
		houseManagedStore (item) {
			this.orderInfoData.insideMoveType = item.code
			this.orderInfoData.houseManageDTO = item
		},
		houseManagedLoad () {
			console.log('111')
		},
		settingHouseManaged (state) {
			if (state === '0') {
				this.orderInfoData.houseManageDTO = '调入'
			} else if (state === '1') {
				this.orderInfoData.houseManageDTO = '调出'
			}
		},
		// 初始化调拨类型
		initAllocateType () {
			const inHid = this.orderInfoData.inHouseDTO.id
			const outHid = this.orderInfoData.outHouseDTO.id
			if (inHid && outHid) {
				this.getHouseManagedStatus(inHid, outHid).then(result => {
					this.HouseManagedStates = result.shops[0].pinYin
					this.orderInfoData.houseManageDTO = this.houseItem
					if (this.HouseManagedStates === '1' || this.HouseManagedStates === '0') {
						this.HouseManageDisabled = true
					} else if (this.HouseManagedStates === '2') {
						this.HouseManageDisabled = true
					} else if (this.HouseManagedStates === '3') {
						this.HouseManageDisabled = false
					}
				})
			}
		},
		// 获取调拨类型 		// res 返回 0 或 1 管辖调入 2 管辖调入  3 全部管辖
		checkAllocateType (item) {
			const inHid = this.orderInfoData.inHouseDTO.id
			const outHid = this.orderInfoData.outHouseDTO.id
			if (inHid && outHid) {
				this.getHouseManagedStatus(inHid, outHid).then(result => {
					this.HouseManagedStates = result.shops[0].pinYin
					this.orderInfoData.houseManageDTO = this.houseItem
					if (this.HouseManagedStates === '0') {
						this.$fxToast.top('调出仓库和调入仓库必须管辖其中之一！')
						if (item === '1') {
							this.orderInfoData.inHouseDTO = ''
						} else if (item === '2') {
							this.orderInfoData.outHouseDTO = ''
						}
						return false
					} else if (this.HouseManagedStates === '1') {
						this.orderInfoData.houseManageDTO = this.houseManageDTO[0]
						this.orderInfoData.insideMoveType = '0'
						this.HouseManageDisabled = true
					} else if (this.HouseManagedStates === '2') {
						this.orderInfoData.houseManageDTO = this.houseManageDTO[1]
						this.orderInfoData.insideMoveType = '1'
						this.HouseManageDisabled = true
					} else if (this.HouseManagedStates === '3') {
						this.orderInfoData.insideMoveType = '0'
						this.orderInfoData.houseManageDTO = this.houseManageDTO[0]
						this.HouseManageDisabled = false
					}
				})
			}
		},
		getHouseManagedStatus (inHid, outHid) {
			const params = {
				m: 'selHouseManagedStatus',
				houseIds: inHid + ',' + outHid
			}
			return this.$fxApi('insideMoveBill.getHouseManagedStatus')({ data: params })
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
			this.outStoreListStart = 0
			this.getOutStoreListData(keyword).then(res => {
				this.outStorePopShow = true
				this.outStoreLoading = false
				this.outStoreListStart += ITEM_SIZE
				this.outStoreLoadFinished = res.shops.length < ITEM_SIZE
				this.outStoreList = res.shops
			})
		},
		onOutStoreLoad (keyword = null) {
			this.getOutStoreListData(keyword).then(res => {
				this.outStoreLoading = false
				this.outStoreListStart += ITEM_SIZE
				if (res.shops.length < ITEM_SIZE) {
					this.outStoreLoadFinished = true
				}
				this.outStoreList.push(...res.shops)
			})
		},
		getOutStoreListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					m: 'getOutHouseListForInsideMove',
					orgId: this.orderInfoData.shopDTO.id,
					houseId: this.orderInfoData.inHouseDTO.id,
					start: this.outStoreListStart,
					size: ITEM_SIZE,
					paged: true,
					keyword: keyword
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.orderInfoData.shopDTO.id}/users/${this.loginerId}/houses`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		onOutStoreClear () {
			this.clearItemConfim('更换出库仓库会清空品项,是否继续?').then(() => {
				this.orderInfoData.outHouseDTO = {}
				this.orderInfoData.insideMoveType = ''
				this.orderInfoData.houseManageDTO = {}
				this.HouseManageDisabled = true
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
			let busUnitInAmount = parseFloat(this.$fxUtils.toFixedSHW(item.busUnitInAmount * rate, this.sysPointSize))
			item.unitDTO = unit
			item.busUnitInAmount = busUnitInAmount
		},
		onAddClick () {
			this.checkOrderInfo().then(() => {
				this.itemPopShow = true
			})
		},
		checkOrderInfo () {
			return new Promise((resolve, reject) => {
				const checkInfo = [
					[this.orderInfoData.businessDate, '业务日期'],
					[this.orderInfoData.shopDTO.id, '机构'],
					[this.orderInfoData.inHouseDTO.id, '入库仓库'],
					[this.orderInfoData.outHouseDTO.id, '出库仓库']
				]
				let checkFlag = true
				for (let i = 0; i < checkInfo.length; i++) {
					if (!checkInfo[i][0]) {
						this.$fxToast.top(`请选择${checkInfo[i][1]}！`)
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
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/insideMoveBill/${this.orderInfoData.inHouseDTO.id}/${this.orderInfoData.outHouseDTO.id}`,
				data: params
			}).then(res => {
				this.$fxToast.success('生成单据成功').then(() => {
					this.$router.replace({
						path: 'insideMoveBillDetails',
						query: {
							orderId: res.storeBills[0].id
						}
					})
				})
			})
		},
		getSaveParams () {
			let addItems = this.orderItemList.filter(item => {
				if (item.changeType === 'add') {
					return true
				} else {
					return false
				}
			})
			let params = Object.assign(this.orderInfoData, {
				detailAdd: addItems,
				accountDTO: {
					id: this.loginerId
				}
			})
			return params
		},
		checkHasDetails () {
			return new Promise(resolve => {
				let items = this.orderItemList.filter(item => {
					return item.changeType !== 'del'
				})
				if (items.length === 0) { // 单据明细为空，弹出新增明细页
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
		onEditRowConfirm (item) {
			let index = this.orderItemList.findIndex(detailsItem => {
				return detailsItem.id === item.id
			})
			if (~index) {
				this.orderItemList[index] = item
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
		// {{{bom
		onSelectBomClick () {
			this.checkOrderInfo().then(() => {
				this.bomPopShow = true
			})
		},
		// 查看已选bom
		onViewBomClick () {
			if (!this.orderBomList.length) {
				this.$fxToast.top('没有已导入的BOM数据！')
				return
			}
			this.searchBom = JSON.parse(JSON.stringify(this.orderBomList))
			this.bomSearchPopShow = true
		},
		// 导入bom
		onBomConfirm (selectItems) {
			this.bomPopShow = false
			this.getBomItem(selectItems).then(res => {
				let resDetails = res.billBom[0].details
				resDetails.forEach(resItem => {
					let detailsIndex = this.orderItemList.findIndex(detailsItem => {
						return detailsItem.goodsDTO.id === resItem.goodsDTO.id
					})
					if (~detailsIndex) {
						let sameOrderItem = this.orderItemList[detailsIndex]
						if (sameOrderItem.changeType === 'del') {
							resItem.changeType = 'add'
							this.orderItemList.push(resItem)
							return
						} else if (sameOrderItem.changeType !== 'add') {
							this.$set(sameOrderItem, 'changeType', 'edit')
						}
						sameOrderItem.busUnitInAmount = resItem.busUnitInAmount
						sameOrderItem.busUnitOutAmount = resItem.busUnitOutAmount
					} else {
						resItem.changeType = 'add'
						this.orderItemList.push(resItem)
					}
				})
				this.orderBomList = res.billBom[0].billBom
			})
		},
		getBomItem (selectItems) {
			return new Promise(resolve => {
				selectItems.forEach(item => {
					item.bomId = item.id
					item.bomName = item.name
					delete item.checked
				})
				let details = this.orderItemList.filter(item => {
					return item.changeType !== 'del'
				})
				let bom = this.orderBomList
				let params = {
					houseId: this.orderInfoData.outHouseDTO.id,
					inHouseId: this.orderInfoData.inHouseDTO.id,
					outHouseId: this.orderInfoData.outHouseDTO.id,
					workDate: this.orderInfoData.businessDate,
					bom: selectItems,
					details: details,
					billBom: bom
				}
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/accounts/${this.orderInfoData.shopDTO.id}/users/${this.loginerId}/insideMoveBillDetails`,
					data: params,
					query: {
						m: 'inSideMoveBillBom'
					}
				}).then(res => {
					resolve(res)
				}).catch(res => { // 品项与盘点仓库包装盘点仓库 未关联或已被停用，仍然需要更新数据
					resolve(res)
				})
			})
		}
		// }}}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.inteledi-insideMoveBill-create {
	height:100%
	background:$fxWhite
	display: flex
	flex-direction: column
	.insideMoveBill-bottom {
		width:100%
		.add-btn {
			width:100%
		}
	}
}
</style>
