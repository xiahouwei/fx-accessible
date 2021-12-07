<template>
	<div class="inteledi-shopOrder-create">
		<w-header title="新增调拨申请单" :border="true"></w-header>
		<orderInfo
			ref="orderInfo"
			:data="orderInfoData"
			:collapseDisabled="itemInputFocusing"
			@on-busdate-click="onBusinessDateClick"
			@on-inShop-click="onInShopClick"
			@on-inStore-click="onInStoreClick"
			@on-outShop-click="onOutShopClick"
			@on-outStore-click="onOutStoreClick"
			@on-billType-click="onBillTypeClick"
			@on-billType-clear="onBillTypeClear"
		></orderInfo>
		<orderItem
			:data="orderItemList"
			:itemInputFocusing.sync="itemInputFocusing"
			@on-add-click="onAddClick"
			@on-search-click="onSearchClick"
			@on-unit-edit="onUnitEdit"
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
		<van-popup v-model="inShopPopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="inShopPopShow"
				:data="inShopList"
				:loadFinished="true"
				title="调入机构检索"
				@on-search="searchInShop"
				@on-select="selectInShop"
			></listComp>
		</van-popup>
		<van-popup v-model="inStorePopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="inStorePopShow"
				:data="inStoreList"
				:loadFinished="true"
				title="调入仓库检索"
				@on-search="searchInStore"
				@on-select="selectInStore"
			></listComp>
		</van-popup>
		<van-popup v-model="outShopPopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="outShopPopShow"
				:data="outShopList"
				:loadFinished="true"
				title="调出机构检索"
				@on-search="searchOutShop"
				@on-select="selectOutShop"
			></listComp>
		</van-popup>
		<van-popup v-model="outStorePopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="outStorePopShow"
				:data="outStoreList"
				:loadFinished="true"
				title="调出仓库检索"
				@on-search="searchOutStore"
				@on-select="selectOutStore"
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
				:inShopDTO="orderInfoData.inShopDTO && orderInfoData.inShopDTO.id"
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
				:isDisabled="!$fxAuth('shopMoveApplyBill.save')"
				@on-search-confirm="onSearchConfirm"
			></itemSearchPop>
		</van-popup>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import orderInfo from '@/components/moveOrder/createOrder/OrderInfo.vue'
import orderItem from '@/components/moveOrder/createOrder/OrderItem.vue'
import listComp from '@/components/common/ListComp.vue'
import itemEditComp from '@/components/moveOrder/common/itemEditComp.vue'
import itemRowEditPop from '@/components/moveOrder/common/itemRowEditPop.vue'
import itemSearchPop from '@/components/moveOrder/common/itemSearchPop.vue'
export default {
	name: 'createMoveOrder',
	components: {
		orderInfo,
		orderItem,
		listComp,
		itemEditComp,
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
				inHouseDTO: {},
				inShopDTO: {},
				manualCode: '',
				outHouseDTO: {},
				outShopDTO: {},
				updateIndicator: 'Append'
			},
			orderItemList: [],
			currentDate: new Date(),
			datePickerShow: false,
			inShopPopShow: false,
			outShopPopShow: false,
			inStorePopShow: false,
			outStorePopShow: false,
			itemPopShow: false,
			billTypePopShow: false,
			billTypeList: [],
			inShopList: [],
			outShopList: [],
			inStoreList: [],
			outStoreList: [],
			itemEditRowData: {},
			unitActionShow: false,
			unitActions: [],
			itemRowEditPopShow: false,
			itemInputFocusing: false,
			itemSearchPopShow: false,
			searchItem: []
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
		if (this.$fxSysAuth('shopMoveApplyBill.shopMoveOutAdd')) {
			return true
		}
		// 将登录人所属机构默认置到调入方机构上,该机构下有一个仓库，仓库默认显示该仓库
		// 如果存在多个仓库，则随机显示一个仓库
		// 企业人员默认显示配送中心的机构和仓库，管理多个配送中心和仓库时，随机选择一个显示
		this.getDefaultShopListData().then(res => {
			if (!res.shops) {
				return false
			}
			this.orderInfoData.inShopDTO = res.shops[0]
			// 新增需要取得机构下默认仓库
			this.getInStoreListData().then(res => {
				if (res.shops && res.shops.length) {
					this.orderInfoData.inHouseDTO = res.shops[0]
				}
			})
		})
	},
	beforeRouteLeave (to, from, next) {
		if (this.itemInputFocusing) {
			this.$router.go(1)
			return false
		}
		if (to.path === '/moveOrder') {
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
		// {{{获取默认机构
		getDefaultShopListData () {
			return new Promise(resolve => {
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/inshopDefault`
				}).then(res => {
					resolve(res)
				})
			})
		},
		// }}}
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
		checkInShop2OutShop (inShopDTO, outShopDTO) {
			return new Promise(resolve => {
				if (!inShopDTO.id || !outShopDTO.id) {
					resolve()
					return true
				}
				let sameRegion = (inShopDTO.shopAreaId ? inShopDTO.shopAreaId : '') === (outShopDTO.shopAreaId ? outShopDTO.shopAreaId : '')
				if (inShopDTO.id === outShopDTO.id) {
					this.$fxToast.top('调入机构与调出机构不能相同！')
					return false
				}
				if (!this.$fxSysAuth('shopMoveApplyBill.limitOrgan')) {
					resolve()
					return true
				}
				if (
					this.$fxUtils.isDef(inShopDTO.organType) &&
					this.$fxUtils.isDef(outShopDTO.organType) &&
					inShopDTO.organType !== outShopDTO.organType
				) {
					this.$fxToast.top('调出机构和调入机构应同为区域配送中心、配送中心或门店！')
					return false
				}
				if (
					inShopDTO.organType === 0 &&
					outShopDTO.organType === 0 &&
					this.$fxAuth('shopMoveApplyBill.checkRegion') && !sameRegion
				) {
					this.$fxToast.top('请选择同一区域的门店！')
					return false
				}
				resolve()
			})
		},
		// {{{ 单据类型
		onBillTypeClick () {
			this.onBillTYpeRefresh()
		},
		searchBillType (keyword) {
			this.onBillTYpeRefresh(keyword)
		},
		selectBillType (item) {
			this.orderInfoData.businessTypeDTO = item
			this.orderInfoData = JSON.parse(JSON.stringify(this.orderInfoData))
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
					billType: '6_1',
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
		// {{{ 调入机构
		onInShopClick () {
			this.onInShopRefresh()
		},
		searchInShop (keyword) {
			this.onInShopRefresh(keyword)
		},
		selectInShop (item) {
			this.checkInShop(item).then(() => {
				this.clearItemConfim('更换调入机构会清空品项,是否继续?').then(() => {
					this.orderInfoData.inShopDTO = item
					this.orderInfoData.inHouseDTO = {}
					this.getInStoreListData().then(res => {
						if (!res.shops) {
							return true
						}
						this.orderInfoData.inHouseDTO = res.shops[0]
					})
				})
			})
		},
		checkInShop (inShopDTO) {
			return new Promise(resolve => {
				let currentInShopDTO = this.orderInfoData.inShopDTO || {}
				if (currentInShopDTO.id !== inShopDTO.id) {
					this.checkInShop2OutShop(inShopDTO, this.orderInfoData.outShopDTO || {}).then(() => {
						resolve()
					})
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
					keyword: keyword
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/inshops`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		// }}}
		// {{{ 调入仓库
		onInStoreClick () {
			if (!this.orderInfoData.inShopDTO.id) {
				this.$fxToast.top('请先选择调入机构！')
				return false
			}
			this.onInStoreRefresh()
		},
		searchInStore (keyword) {
			this.onInStoreRefresh(keyword)
		},
		selectInStore (item) {
			this.clearItemConfim('更换调入仓库会清空品项,是否继续?').then(() => {
				this.orderInfoData.inHouseDTO = item
			})
		},
		onInStoreRefresh (keyword = null) {
			this.getInStoreListData(keyword).then(res => {
				this.inStoreList = res.shops
				this.inStorePopShow = true
			})
		},
		getInStoreListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					searchText: keyword
				}
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/accounts/${this.orderInfoData.inShopDTO.id}/users/${this.loginerId}/houses`,
					data: params,
					query: {
						m: 'getInHouses'
					}
				}).then(res => {
					resolve(res)
				})
			})
		},
		// }}}
		// {{{ 调出机构
		onOutShopClick () {
			this.onOutShopRefresh()
		},
		searchOutShop (keyword) {
			this.onOutShopRefresh(keyword)
		},
		selectOutShop (item) {
			this.checkOutShop(item).then(() => {
				this.clearItemConfim('更换调出机构会清空品项,是否继续?').then(() => {
					this.orderInfoData.outShopDTO = item
					this.orderInfoData.outHouseDTO = {}
					this.getOutStoreListData().then(res => {
						if (!res.shops) {
							return true
						}
						this.orderInfoData.outHouseDTO = res.shops[0]
					})
				})
			})
		},
		checkOutShop (outShopDTO) {
			return new Promise(resolve => {
				let currentOutShopDTO = this.orderInfoData.outShopDTO
				if (currentOutShopDTO.id !== outShopDTO.id) {
					this.checkInShop2OutShop(this.orderInfoData.inShopDTO, outShopDTO).then(() => {
						resolve()
					})
				}
			})
		},
		onOutShopRefresh (keyword = null) {
			this.getOutShopListData(keyword).then(res => {
				this.outShopList = res.shops
				this.outShopPopShow = true
			})
		},
		getOutShopListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					keyword: keyword
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/outshops`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		// }}}
		// {{{ 调出仓库
		onOutStoreClick () {
			if (!this.orderInfoData.outShopDTO.id) {
				this.$fxToast.top('请先选择调出机构！')
				return false
			}
			this.onOutStoreRefresh()
		},
		searchOutStore (keyword) {
			this.onOutStoreRefresh(keyword)
		},
		selectOutStore (item) {
			this.clearItemConfim('更换调出仓库会清空品项,是否继续?').then(() => {
				this.orderInfoData.outHouseDTO = item
			})
		},
		onOutStoreRefresh (keyword = null) {
			this.getOutStoreListData(keyword).then(res => {
				this.outStoreList = res.shops
				this.outStorePopShow = true
			})
		},
		getOutStoreListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					searchText: keyword
				}
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/accounts/${this.orderInfoData.outShopDTO.id}/users/${this.loginerId}/houses`,
					data: params,
					query: {
						m: 'getOutHouses'
					}
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
			let busUnitAmount = parseFloat(this.$fxUtils.toFixedSHW(item.busUnitAmount * rate, this.sysPointSize))
			item.unitDTO = unit
			item.busUnitAmount = busUnitAmount
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
					[this.orderInfoData.inShopDTO.id, '调入机构'],
					[this.orderInfoData.inHouseDTO.id, '调入仓库'],
					[this.orderInfoData.outShopDTO.id, '调出机构'],
					[this.orderInfoData.outHouseDTO.id, '调出仓库']
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
					let organTypeFlag = this.$fxStateMiddleware.stateIs('loginerOrganType')(['shop', 'center'])(this.loginerOrganType)
					if (organTypeFlag && this.loginerShopId !== this.orderInfoData.inShopDTO.id && this.loginerShopId !== this.orderInfoData.outShopDTO.id) {
						// 至少一方为当前机构
						this.$fxToast({
							message: '调出机构和调入机构应有一个为“' + this.loginerShopName + '”机构！',
							position: 'top'
						})
						return
					}
					this.compareHouse().then(() => {
						resolve()
					})
				}
			})
		},
		compareHouse () {
			return new Promise(resolve => {
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/shopmoveapplybills`,
					query: {
						userId: this.loginerId,
						m: 'getQXHouseByInOrOutHouseId',
						inHouseId: this.orderInfoData.inHouseDTO.id,
						outHouseId: this.orderInfoData.outHouseDTO.id
					}
				}).then(res => {
					resolve(res)
				})
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
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/shopmoveapplybills`,
				data: params
			}).then(res => {
				this.$fxToast.success('生成单据成功').then(() => {
					this.$router.replace({
						path: 'moveOrderDetails',
						query: {
							orderId: res.storeBills[0].id
						}
					})
				})
			})
		},
		getSaveParams () {
			let addItems = this.orderItemList.filter(item => {
				return item.changeType === 'add'
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
