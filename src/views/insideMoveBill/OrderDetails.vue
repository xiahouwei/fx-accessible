<template>
	<div class="inteledi-insideMoveBill-details">
		<w-header :title="orderInfoData.sysbillCode" titleFontSize="3.733vw" :border="true"></w-header>
		<orderInfo
			ref="orderInfo"
			:data="orderInfoData"
			:HouseManageDisabled="HouseManageDisabled"
			:isDisabled="!$fxAuth('insideMoveBill.save') || isBillState(1) || isWeightState(1) || isWeightState(2)"
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
			:isDisabled="!$fxAuth('insideMoveBill.save') || isBillState(1) || isWeightState(1) || isWeightState(2)"
			:itemInputFocusing.sync="itemInputFocusing"
			:autoType8="orderInfoData.autoType === 8"
			@on-add-click="onAddClick"
			@on-search-click="onSearchClick"
			@on-unit-edit="onUnitEdit"
			@on-item-edit="onItemEdit"
			@on-item-focus="onItemFocus"
			@on-selectbom-click="onSelectBomClick"
			@on-viewbom-click="onViewBomClick"
		></orderItem>
		<div class="insideMoveBill-bottom">
			<van-button
				v-show="$fxAuth('insideMoveBill.del') && isBillState(0) && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onClickHandler('onDeleteClick')"
			>删除</van-button>
			<van-button
				v-show="$fxAuth('insideMoveBill.check') && isBillState(0)  && (isWeightState(0) && insideFlag || isWeightState(3))"
				class="bottom-btn fx-no-radius"
				type="info"
				@click="onClickHandler('onExpressClick')"
			>审核</van-button>
			<van-button
				v-show="$fxAuth('insideMoveBill.unCheck') && isBillState(1) && isBillReState(0) && insideFlag && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onClickHandler('onUnExpressClick')"
			>反审</van-button>
			<van-button
				v-show="$fxAuth('insideMoveBill.reCheck') && isBillState(1) && isBillReState(0) && insideFlag"
				class="bottom-btn fx-no-radius"
				type="primary"
				@click="onClickHandler('onBillReStateClick')"
			>复审</van-button>
			<van-button
				v-show="$fxAuth('insideMoveBill.unReCheck') && isBillReState(1)"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onClickHandler('onUnBillReStateClick')"
			>取消复审</van-button>
			<van-button
				v-show="$fxAuth('insideMoveBill.save') && isBillState(0) && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius"
				type="primary"
				@click="onClickHandler('onSaveClick')"
			>保存</van-button>
			<van-button
				v-show="$fxAuth('insideMoveBill.weighState') && isBillState(0) && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius yellow-btn"
				type="info"
				@click="onClickHandler('onWeightClick')"
			>下发称重</van-button>
			<van-button
				v-show="$fxAuth('insideMoveBill.weighState') && isBillState(0) && (isWeightState(1) || isWeightState(2))"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onClickHandler('onUnWeightClick')"
			>取消称重</van-button>
			<van-button
				v-show="$fxAuth('insideMoveBill.weighState') && isBillState(0) && isWeightState(2) && sysDZCManyLower"
				class="bottom-btn fx-no-radius"
				type="info"
				@click="onClickHandler('onEndWeightClick')"
			>结束称重</van-button>
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
				title="请选择机构"
				:loading.sync="shopLoading"
				:loadFinished="shopLoadFinished"
				:immediateCheck="false"
				@on-select="selectShop"
				@on-search="searchShop"
				@on-load="onShopLoad"
			></listComp>
		</van-popup>
		<van-popup v-model="inStorePopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="inStorePopShow"
				:data="inStoreList"
				:loadFinished="true"
				title="入库仓库检索"
				@on-search="searchInStore"
				@on-select="selectInStore"
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
		<van-popup v-model="HouseManagedPopShow" position="right" class="fx-list-popup-300">
			<listComp
				:visibleFlag.sync="HouseManagedPopShow"
				:searchShow="searchShow"
				:data="HouseManagedList"
				title="调拨类型"
				:loading.sync="HouseManagedLoading"
				:loadFinished="HouseManagedLoadFinished"
				:immediateCheck="false"
				@on-select="houseManagedStore"
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
				:isDisabled="isBillState(1) || !$fxAuth('insideMoveBill.save') || isWeightState(1) || isWeightState(2)"
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
				:autoType8="orderInfoData.autoType === 8"
				:isDisabled="isBillState(1) || !$fxAuth('insideMoveBill.save') || isWeightState(1) || isWeightState(2)"
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
	name: 'insideMoveBillDetails',
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
			searchShow: false,
			activeNames: ['1'],
			tabActive: '选项1',
			orderInfoData: {},
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
			inStoreListStart: 0,
			inStoreLoading: false,
			inStoreLoadFinished: false,
			inStoreList: [],
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
			orderDeleteFlag: false,
			formatterSysPointKey: ['busUnitInAmount', 'inMoney', 'inMoneyWithTax', 'taxInMoney'],
			itemSearchPopShow: false,
			searchItem: [],
			orderBomList: [],
			bomPopShow: false,
			insideFlag: false,
			bomSearchPopShow: false,
			searchBom: [],
			HouseManagedStart: 0,
			HouseManagedPopShow: false,
			HouseManagedList: [],
			HouseManagedLoading: false,
			HouseManagedLoadFinished: false,
			HouseManageDisabled: true,
			houseManageDTO: [{
				code: '0',
				id: '0',
				name: '调入',
				pinYin: null,
				updateIndicator: 'Append',
				disabledFlag: true
			},
			{
				code: '1',
				id: '1',
				name: '调出',
				pinYin: null,
				updateIndicator: 'Append',
				disabledFlag: true
			}]
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
		if (to.path === '/insideMoveBill' && !this.orderDeleteFlag && this.orderInfoData.billState === 0) {
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
			sysDZCManyLower: state => state.systemParams.sysDZCManyLower,
			sysInsideMoveBillCheckWay: state => state.systemParams.sysInsideMoveBillCheckWay
		}),
		isBillState (state) {
			return (state) => {
				if (Object.prototype.toString.call(state) === '[object Array]') {
					return state.includes(this.orderInfoData.billState)
				} else {
					return this.orderInfoData.billState === state
				}
			}
		},
		isBillReState (state) {
			return (state) => {
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
		checkHouseStore (item) {
			return new Promise(resolve => {
				let currentData = this.orderInfoData.outHouseDTO
				if (currentData.id !== item.id) {
					resolve()
				}
			})
		},
		// 根据管辖状态禁用 审核按钮
		isinAllocateType () {
			console.log(this.sysInsideMoveBillCheckWay)
			if (this.sysInsideMoveBillCheckWay === '0') {
				this.insideFlag = this.HouseManagedStates === '1' || this.HouseManagedStates === '2' || this.HouseManagedStates === '3'
			} else if (this.sysInsideMoveBillCheckWay === '1') {
				this.insideFlag = this.HouseManagedStates === '2'
			} else if (this.sysInsideMoveBillCheckWay === '2') {
				this.insideFlag = this.HouseManagedStates === '1' || this.HouseManagedStates === '3'
			} else if (this.sysInsideMoveBillCheckWay === '3') {
				if (this.orderInfoData.insideMoveType === '1' && this.HouseManagedStates === '1') {
					this.insideFlag = true
				} else if (this.orderInfoData.insideMoveType === '0' && this.HouseManagedStates === '2') {
					this.insideFlag = true
				} else if (this.HouseManagedStates === '3') {
					this.insideFlag = true
				} else {
					this.insideFlag = false
				}
			}
		},
		onHouseManaged () {
			this.onHouseManagedRefresh()
		},
		onHouseManagedRefresh () {
			this.HouseManagedStart = 0
			this.HouseManagedPopShow = true
			this.HouseManagedLoading = false
			this.HouseManagedStart += ITEM_SIZE
			this.HouseManagedLoadFinished = this.houseManageDTO.length < ITEM_SIZE
			this.HouseManagedList = this.houseManageDTO
		},
		houseManagedStore (item) {
			this.orderInfoData.houseManageDTO = item
			this.orderInfoData.insideMoveType = item.code
		},
		houseManagedLoad () {
			console.log('111')
		},
		initAllocateType () {
			const inHid = this.orderInfoData.inHouseDTO.id
			const outHid = this.orderInfoData.outHouseDTO.id
			if (inHid && outHid) {
				this.getHouseManagedStatus(inHid, outHid).then(result => {
					this.HouseManagedStates = result.shops[0].pinYin
					if (this.HouseManagedStates === '1' || this.HouseManagedStates === '0') {
						this.HouseManageDisabled = true
					} else if (this.HouseManagedStates === '2') {
						this.HouseManageDisabled = true
					} else if (this.HouseManagedStates === '3') {
						this.HouseManageDisabled = false
					}
					this.isinAllocateType()
				})
			}
		},
		// res 返回 0 或 1 管辖调入 2 管辖调入  3 全部管辖
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
					this.isinAllocateType()
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
		settingHouseManageDTO (od) {
			if (od.insideMoveType === '0') {
				od.houseManageDTO = this.houseManageDTO[0]
			} else if (od.insideMoveType === '1') {
				od.houseManageDTO = this.houseManageDTO[1]
			} else {
				return false
			}
		},
		createOrderDetails () {
			return new Promise(resolve => {
				this.getOrderDetails().then(res => {
					let orderDetailsData = res.storeBills[0]
					orderDetailsData.houseManageDTO = {}
					this.settingHouseManageDTO(orderDetailsData)
					this.formatterSysPoint(orderDetailsData.details)
					this.orderInfoData = orderDetailsData
					this.initAllocateType()
					this.orderItemList = this.filterStoreItem(orderDetailsData.details)
					if (orderDetailsData.billBom && orderDetailsData.billBom.length) {
						this.orderBomList = orderDetailsData.billBom
					}
					resolve()
				})
			})
		},
		getOrderDetails () {
			return new Promise(resolve => {
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/insideMoveBill/${this.query.orderId}`
				}).then(res => {
					resolve(res)
				})
			})
		},
		formatterSysPoint (data) {
			data.forEach(item => {
				this.formatterSysPointKey.forEach(pointItem => {
					item[pointItem] = this.toFixedNumberSize(item[pointItem])
				})
			})
		},
		toFixedNumberSize (data) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysPointSize))
		},
		filterStoreItem (data) {
			data.forEach(dataItem => {
				let amount = parseFloat(dataItem.busUnitInAmount)
				if (amount) {
					// 数量不为0，反算单价，便于后期计算
					dataItem.price = this.toFixedNumberSize(dataItem.inMoney / amount)
					dataItem.taxPrice = this.toFixedNumberSize(dataItem.inMoneyWithTax / amount)
				} else {
					// 数量为0，取单价，便于后期计算
					dataItem.price = this.toFixedNumberSize(dataItem.price)
					dataItem.taxPrice = this.toFixedNumberSize(dataItem.taxPrice)
				}
			})
			return data
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
			let deleteItems = this.orderItemList.filter(item => {
				return !!item.id
			})
			deleteItems.forEach(item => {
				item.changeType = 'del'
			})
			this.orderItemList = deleteItems
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
				let currentShopDTO = this.orderInfoData.shopDTO
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
				this.$fxToast.fail('请先选择机构!')
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
					url: `${this.$fxBaseApi.url}/accounts/${this.orderInfoData.shopDTO.id}/users/${this.loginerId}/houses`,
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
				this.$fxToast.fail('请先选择机构!')
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
					this.checkAllocateType('2') // 出库
				})
			})
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
			let oldUnitRate = item.unitDTO.value // 新增的品项明细获取之前单位换算值方式
			let newUnit = unit // 新增的品项明细获取之后单位换算值方式
			let rate = oldUnitRate / newUnit.value
			let busUnitInAmount = parseFloat(this.$fxUtils.toFixedSHW(item.busUnitInAmount * rate, this.sysPointSize))
			item.unitDTO = newUnit
			item.busUnitInAmount = busUnitInAmount
			// 数量为 0 时不反算单价
			if (item.busUnitInAmount === 0) {
				item.price = parseFloat(this.$fxUtils.toFixedSHW(item.price * newUnit.value / oldUnitRate, this.sysPointSize))
				item.taxPrice = parseFloat(this.$fxUtils.toFixedSHW(item.taxPrice * newUnit.value / oldUnitRate, this.sysPointSize))
			} else {
				item.price = parseFloat(this.$fxUtils.toFixedSHW(item.inMoney / item.busUnitInAmount, this.sysPointSize))
				item.taxPrice = parseFloat(this.$fxUtils.toFixedSHW(item.inMoneyWithTax / item.busUnitInAmount, this.sysPointSize))
			}
			if (item.id) {
				item.changeType = 'edit'
			}
		},
		onAddClick () {
			this.checkOrderInfo().then(() => {
				this.itemPopShow = true
			})
		},
		checkOrderInfo () {
			return new Promise((resolve, reject) => {
				const checkInfo = [
					[this.orderInfoData.shopDTO.id, '机构'],
					[this.orderInfoData.inHouseDTO.id, '入库仓库'],
					[this.orderInfoData.outHouseDTO.id, '出库仓库']
				]
				let checkFlag = true
				for (let i = 0; i < checkInfo.length; i++) {
					if (!checkInfo[i][0]) {
						this.$toast.fail(`请选择${checkInfo[i][1]}!`)
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
		onSaveClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要保存该单据吗?'
			}).then(() => {
				this.checkHasDetails().then(() => {
					let params = this.getSaveParams()
					this.saveHandler(params)
				})
			}).catch(() => {
			})
		},
		saveHandler (params) {
			this.$fxHttp.requestPut({
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/insideMoveBill/users/${this.loginerId}/${this.orderInfoData.inHouseDTO.id}/${this.orderInfoData.outHouseDTO.id}/${this.query.orderId}`,
				data: params,
				query: {
					userId: this.loginerId,
					m: 'modify'
				}
			}).then(res => {
				this.createOrderDetails().then(() => {
					this.$fxToast.success('保存成功')
				})
			})
		},
		onExpressClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要审核该单据吗?'
			}).then(() => {
				this.checkHasDetails().then(() => {
					let params = this.getSaveParams()
					this.expressHandler(params)
				})
			}).catch(() => {
			})
		},
		expressHandler (params) {
			this.$fxHttp.requestPut({
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/insideMoveBill/${this.query.orderId}`,
				data: params,
				query: {
					userId: this.loginerId,
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
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/insideMoveBill/${this.query.orderId}`,
				data: params,
				query: {
					userId: this.loginerId,
					m: 'unCheck'
				}
			}).then(res => {
				this.createOrderDetails().then(() => {
					this.$fxToast.success('反审成功')
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
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/insideMoveBill/${this.query.orderId}`,
					data: params,
					query: {
						userId: this.loginerId
					}
				}).then(res => {
					this.$fxToast.success('删除成功').then(() => {
						this.orderDeleteFlag = true
						this.$router.go(-1)
					})
				})
			}).catch(() => {
			})
		},
		onBillReStateClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要复审该单据吗?'
			}).then(() => {
				let params = this.getSaveParams()
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/insideMoveBill/${this.query.orderId}/users/${this.loginerId}`,
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
		onUnBillReStateClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要取消复审该单据吗?'
			}).then(() => {
				let params = this.getSaveParams()
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/insideMoveBill/${this.query.orderId}/users/${this.loginerId}`,
					data: params,
					query: {
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
						url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/insideMoveBill/${this.query.orderId}/users/${this.loginerId}`,
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
						url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/insideMoveBill/${this.query.orderId}/users/${this.loginerId}`,
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
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/insideMoveBill/${this.query.orderId}/users/${this.loginerId}`,
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
			let addItems = this.orderItemList.filter(item => {
				return item.changeType === 'add'
			})
			let delItems = this.orderItemList.filter(item => {
				return item.changeType === 'del'
			})
			let editItems = this.orderItemList.filter(item => {
				return item.changeType === 'edit'
			})
			let params = Object.assign({}, this.orderInfoData, {
				detailAdd: addItems.length > 0 ? addItems : null,
				detailDel: delItems.length > 0 ? delItems : null,
				detailMdf: editItems.length > 0 ? editItems : null,
				billBom: this.orderBomList,
				details: []
			})
			return params
		},
		checkHasDetails () {
			return new Promise(resolve => {
				let items = this.orderItemList.filter(item => {
					return item.changeType !== 'del'
				})
				if (items.length === 0) {
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
		onEditRowConfirm (item) {
			let index = this.orderItemList.findIndex(detailsItem => {
				return detailsItem.id === item.id
			})
			if (~index) {
				this.orderItemList[index] = item
			}
		},
		onClickHandler (method) {
			if (this.itemInputFocusing) {
				return false
			}
			this[method]()
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
.inteledi-insideMoveBill-details {
	height:100%
	background:$fxWhite
	display: flex
	flex-direction: column
	.insideMoveBill-bottom {
		width:100%
		display: flex
		flex-direction: row
		.bottom-btn {
			flex:1
		}
		.yellow-btn {
			background-color: $fxYellow
			border: 1px solid $fxYellow
		}
	}
}
</style>
