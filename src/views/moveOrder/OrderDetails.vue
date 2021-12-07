<template>
	<div class="inteledi-shopOrder-details">
		<w-header :title="orderInfoData.sysbillCode" titleFontSize="3.733vw" :border="true"></w-header>
		<orderInfo
			ref="orderInfo"
			:data="orderInfoData"
			:isDisabled="isBillState(1) || !$fxAuth('shopMoveApplyBill.save')"
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
			:isDisabled="isBillState(1) || !$fxAuth('shopMoveApplyBill.save')"
			:itemInputFocusing.sync="itemInputFocusing"
			@on-add-click="onAddClick"
			@on-search-click="onSearchClick"
			@on-unit-edit="onUnitEdit"
			@on-item-edit="onItemEdit"
			@on-item-focus="onItemFocus"
		></orderItem>
		<div class="shopOrder-bottom">
			<van-button
				v-show="isBillState(0) && $fxAuth('shopMoveApplyBill.delete')"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onClickHandler('onDeleteClick')"
			>删除</van-button>
			<van-button
				v-show="isBillState(0) && $fxAuth('shopMoveApplyBill.check')"
				class="bottom-btn fx-no-radius"
				type="info"
				@click="onClickHandler('onExpressClick')"
			>审核</van-button>
			<van-button
				v-show="isBillState(1) &&
						isMoveState(2) &&
						!outShopIsLoginShop &&
						$fxAuth('shopMoveApplyBill.unCheck')"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onClickHandler('onUnExpressClick')"
			>反审</van-button>
			<van-button
				v-show="isBillState(0) && $fxAuth('shopMoveApplyBill.save')"
				class="bottom-btn fx-no-radius"
				type="primary"
				@click="onClickHandler('onSaveClick')"
			>保存</van-button>
			<van-button
				v-show="isBillState(1) && isMoveState(0) && !inShopIsLoginShop"
				class="bottom-btn fx-no-radius"
				type="primary"
				@click="onClickHandler('onAgreeClick')"
			>同意</van-button>
			<van-button
				v-show="isBillState(1) && isMoveState(0) && !inShopIsLoginShop"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onClickHandler('onRejectClick')"
			>拒绝</van-button>
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
				:isDisabled="isBillState(1) || !$fxAuth('shopMoveApplyBill.save')"
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
				:isDisabled="isBillState(1) || !$fxAuth('shopMoveApplyBill.save')"
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
	name: 'moveOrderDetails',
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
			orderInfoData: {},
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
			orderDeleteFlag: false,
			formatterSysPointKey: ['busUnitAmount'],
			itemSearchPopShow: false,
			searchItem: []
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
		if (to.path === '/moveOrder' && !this.orderDeleteFlag && this.orderInfoData.billState === 0) {
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
			loginerId: state => state.loginer.loginerId
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
		isMoveState (state) {
			return (state) => {
				if (Object.prototype.toString.call(state) === '[object Array]') {
					return state.includes(this.orderInfoData.moveState)
				} else {
					return this.orderInfoData.moveState === state
				}
			}
		},
		inShopIsLoginShop () {
			return this.orderInfoData.inShopDTO.id === this.loginerShopId
		},
		outShopIsLoginShop () {
			return this.orderInfoData.outShopDTO.id === this.loginerShopId
		}
	},
	methods: {
		createOrderDetails () {
			return new Promise(resolve => {
				this.getOrderDetails().then(res => {
					let orderDetailsData = res.storeBills[0]
					this.formatterSysPoint(orderDetailsData.details)
					this.orderInfoData = orderDetailsData
					this.orderItemList = orderDetailsData.details
					resolve()
				})
			})
		},
		getOrderDetails () {
			return new Promise(resolve => {
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/shopmoveapplybills/users/${this.loginerId}/${this.query.orderId}`
				}).then(res => {
					resolve(res)
				})
			})
		},
		formatterSysPoint (data) {
			let toFixedNumberSize = (data) => {
				return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysPointSize))
			}
			data.forEach(item => {
				this.formatterSysPointKey.forEach(pointItem => {
					item[pointItem] = toFixedNumberSize(item[pointItem])
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
				let currentInShopDTO = this.orderInfoData.inShopDTO
				if (currentInShopDTO.id !== inShopDTO.id) {
					this.checkInShop2OutShop(inShopDTO, this.orderInfoData.outShopDTO).then(() => {
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
				this.$fxToast.fail('请先选择调入机构!')
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
				this.$fxToast.fail('请先选择调出机构!')
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
					[this.orderInfoData.inShopDTO.id, '调入机构'],
					[this.orderInfoData.inHouseDTO.id, '调入仓库'],
					[this.orderInfoData.outShopDTO.id, '调出机构'],
					[this.orderInfoData.outHouseDTO.id, '调出仓库']
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
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/shopmoveapplybills/${this.query.orderId}`,
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
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/shopmoveapplybills/${this.query.orderId}`,
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
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/shopmoveapplybills/${this.query.orderId}`,
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
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/shopmoveapplybills/${this.query.orderId}`,
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
		onAgreeClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要同意调拨吗?确认后将自动生成调出单!'
			}).then(() => {
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/shopmoveapplybills/${this.query.orderId}`,
					query: {
						userId: this.loginerId,
						m: 'agree'
					}
				}).then(res => {
					this.createOrderDetails().then(res => {
						this.$fxToast.success('同意调拨操作成功')
					})
				})
			}).catch(() => {
			})
		},
		onRejectClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要拒绝调拨申请单吗?'
			}).then(() => {
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/shopmoveapplybills/${this.query.orderId}`,
					query: {
						userId: this.loginerId,
						m: 'disagree'
					}
				}).then(res => {
					this.createOrderDetails().then(() => {
						this.$fxToast.success('拒绝调拨操作成功')
					})
				})
			}).catch(() => {
			})
		},
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
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.inteledi-shopOrder-details {
	height:100%
	background:$fxWhite
	display: flex
	flex-direction: column
	.shopOrder-bottom {
		width:100%
		display: flex
		flex-direction: row
		.bottom-btn {
			flex:1
		}
	}
}
</style>
