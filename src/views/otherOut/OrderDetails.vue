<template>
	<div class="inteledi-otherOut-details">
		<w-header :title="orderInfoData.sysbillCode" titleFontSize="3.733vw" :border="true"></w-header>
		<orderInfo
			ref="orderInfo"
			:data="orderInfoData"
			:isDisabled="isBillState(1) || !$fxAuth('otherOutBill.save') || isWeightState(1) || isWeightState(2)"
			:collapseDisabled="itemInputFocusing"
			@on-shop-click="onShopClick"
			@on-busdate-click="onBusinessDateClick"
			@on-item-clear="onItemClear"
			@on-autoType-click="onAutoTypeClick"
		></orderInfo>
		<orderItem
			ref="orderItem"
			:data="orderItemList"
			:isDisabled="isBillState(1) || !$fxAuth('otherOutBill.save') || isWeightState(1) || isWeightState(2)"
			:itemInputFocusing.sync="itemInputFocusing"
			:shopId="orderInfoData.shopDTO && orderInfoData.shopDTO.id"
			@on-search-click="onSearchClick"
			@on-add-click="onAddClick"
			@on-item-edit="onItemEdit"
			@on-unit-edit="onUnitEdit"
			@on-item-focus="onItemFocus"
		></orderItem>
		<div class="otherOut-bottom">
			<van-button
				v-show="isBillState(0) && $fxAuth('otherOutBill.del') && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onClickHandler('onDeleteClick')"
			>删除</van-button>
			<van-button
				v-show="isBillState(0) && $fxAuth('otherOutBill.check') && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius"
				type="info"
				@click="onClickHandler('onExpressClick')"
			>审核</van-button>
			<van-button
				v-show="isBillReState([0, 2]) && isBillState(1) && $fxAuth('otherOutBill.unCheck') && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onClickHandler('onUnExpressClick')"
			>反审</van-button>
			<van-button
				v-show="isBillState(0) && $fxAuth('otherOutBill.save') && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius"
				type="primary"
				@click="onClickHandler('onSaveClick')"
			>保存</van-button>
			<van-button
				v-show="isBillReState(0) && isBillState(1) && $fxAuth('otherOutBill.reCheck')"
				class="bottom-btn fx-no-radius"
				type="info"
				@click="onClickHandler('onExpressAgainClick')"
			>复审</van-button>
			<van-button
				v-show="isBillReState(1) && isBillState(1) && $fxAuth('otherOutBill.unReCheck')"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onClickHandler('onUnExpressAgainClick')"
			>取消复审</van-button>
			<van-button
				v-show="$fxAuth('otherOutBill.weighState') && isBillState(0) && (isWeightState(0) || isWeightState(3)) && isOffsetFlag(false)"
				class="bottom-btn fx-no-radius yellow-btn"
				type="info"
				@click="onClickHandler('onWeightClick')"
			>下发称重</van-button>
			<van-button
				v-show="$fxAuth('otherOutBill.weighState') && isBillState(0) && (isWeightState(1) || isWeightState(2))"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onClickHandler('onUnWeightClick')"
			>取消称重</van-button>
			<van-button
				v-show="$fxAuth('otherOutBill.weighState') && isBillState(0) && isWeightState(2) && sysDZCManyLower"
				class="bottom-btn fx-no-radius"
				type="info"
				@click="onClickHandler('onEndWeightClick')"
			>结束称重</van-button>
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
			v-model="itemRowEditPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<itemRowEditPop
				:visibleFlag.sync="itemRowEditPopShow"
				:itemData="itemEditRowData"
				:isDisabled="isBillState(1) || !$fxAuth('otherOutBill.save') || isWeightState(1) || isWeightState(2)"
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
				:shopId="orderInfoData.shopDTO && orderInfoData.shopDTO.id"
				:isDisabled="isBillState(1) || !$fxAuth('otherOutBill.save') || isWeightState(1) || isWeightState(2)"
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
	name: 'otherOutDetails',
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
			orderInfoData: {},
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
			itemRowEditPopShow: false,
			itemEditRowData: {},
			unitActions: [],
			unitActionShow: false,
			itemInputFocusing: false,
			orderDeleteFlag: false,
			formatterSysPointKey: ['busUnitOutAmount'],
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
	created () {
		this.createOrderDetails()
	},
	beforeRouteLeave (to, from, next) {
		if (this.itemInputFocusing) {
			this.$router.go(1)
			return false
		}
		if (to.path === '/otherOut' && !this.orderDeleteFlag && this.orderInfoData.billState === 0) {
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
			loginerId: state => state.loginer.loginerId,
			loginerOrganType: state => state.loginer.loginerOrganType,
			sysDZCManyLower: state => state.systemParams.sysDZCManyLower
		}),
		isBillState (state) {
			return state => {
				if (Object.prototype.toString.call(state) === '[object Array]') {
					return state.includes(this.orderInfoData.billState)
				} else {
					return this.orderInfoData.billState === state
				}
			}
		},
		isBillReState (state) {
			return state => {
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
		},
		// 生成方式 1手动
		// 冲减出库不能称重
		isAutoType (state) {
			return state => {
				if (Object.prototype.toString.call(state) === '[object Array]') {
					return state.includes(this.orderInfoData.autoType)
				} else {
					return this.orderInfoData.autoType === state
				}
			}
		},
		// 冲减出库不能称重
		isOffsetFlag (state) {
			return state => {
				if (Object.prototype.toString.call(state) === '[object Array]') {
					return state.includes(this.orderInfoData.offsetFlag)
				} else {
					return this.orderInfoData.offsetFlag === state
				}
			}
		}
	},
	methods: {
		createOrderDetails () {
			return new Promise(resolve => {
				this.getOrderDetails().then(res => {
					let orderDetailsData = res.storeBills[0]
					this.formatterSysPoint(orderDetailsData.details)
					this.orderInfoData = orderDetailsData
					this.orderItemList = this.filterStoreItem(orderDetailsData.details)
					resolve()
				})
			})
		},
		getOrderDetails () {
			return new Promise(resolve => {
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/otherOutBills/${this.query.orderId}`
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
		filterStoreItem (data) {
			data.forEach(dataItem => {
				let amount = parseFloat(dataItem.busUnitOutAmount)
				if (amount) {
					// 数量不为0，且不是赠送，反算单价，便于后期计算
					dataItem.price = this.toFixedNumberSize(dataItem.outMoney / amount)
				} else {
					// 数量为0，反算单价，便于后期计算
					dataItem.price = this.toFixedNumberSize(dataItem.price)
				}
				dataItem.busUnitOutAmount = this.toFixedNumberSize(amount)
				dataItem.outMoney = this.toFixedNumberSize(dataItem.outMoney)
			})
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
		toFixedNumberSize (data) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysPointSize))
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
		// {{{更换时间
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
		onAddClick () {
			this.checkOrderInfo().then(() => {
				this.storeItem = JSON.parse(JSON.stringify(this.orderItemList))
				this.itemStorePopShow = true
			})
		},
		checkOrderInfo () {
			return new Promise((resolve, reject) => {
				if (!this.orderInfoData.businessDate) {
					this.$toast.fail('请先选择业务日期!')
				} else if (!this.orderInfoData.shopDTO.id) {
					this.$fxToast.fail('请先选择申请机构!')
				} else {
					resolve()
				}
			})
		},
		onStoreItemSave (storeItemData) {
			this.orderItemList = storeItemData
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
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/otherOutBills/${this.query.orderId}`,
				data: params,
				query: {
					userId: this.loginerId,
					m: 'modify'
				}
			}).then(res => {
				this.createOrderDetails().then(() => {
					this.$fxToast.success(res.message)
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
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/otherOutBills/${this.query.orderId}/users/${this.loginerId}`,
				data: params,
				query: {
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
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/otherOutBills/${this.query.orderId}`,
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
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/otherOutBills/${this.query.orderId}`,
					data: params,
					query: {
						userId: this.loginerId
					}
				}).then(res => {
					this.$fxToast.success({
						message: '删除成功',
						mask: true
					}).then(() => {
						this.orderDeleteFlag = true
						this.$router.go(-1)
					})
				})
			}).catch(() => {
			})
		},
		onExpressAgainClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要复审该单据吗?'
			}).then(() => {
				let params = this.getSaveParams()
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/otherOutBills/${this.query.orderId}/users/${this.loginerId}`,
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
		onUnExpressAgainClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要取消复审该单据吗?'
			}).then(() => {
				let params = this.getSaveParams()
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/otherOutBills/${this.query.orderId}/users/${this.loginerId}`,
					data: params,
					query: {
						userId: this.loginerId,
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
						url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/otherOutBills/${this.query.orderId}/users/${this.loginerId}`,
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
						url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/otherOutBills/${this.query.orderId}/users/${this.loginerId}`,
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
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/otherOutBills/${this.query.orderId}/users/${this.loginerId}`,
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
			let itemDetails = []
			this.orderItemList.forEach(item => {
				itemDetails.push(...item.details)
			})
			let addItems = itemDetails.filter(item => {
				return item.changeType === 'add'
			})
			let delItems = itemDetails.filter(item => {
				return item.changeType === 'del'
			})
			let editItems = itemDetails.filter(item => {
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
		getValidItem () {
			let itemDetails = []
			this.orderItemList.forEach(item => {
				itemDetails.push(...item.details)
			})
			return itemDetails.filter(item => {
				return item.changeType !== 'del'
			})
		},
		getItemLength () {
			return this.getValidItem().length
		},
		checkHasDetails () {
			return new Promise(resolve => {
				if (this.getItemLength() === 0) {
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
			let details = this.orderInfoData.details.filter(item => {
				return !!item.id
			})
			details.forEach(item => {
				item.changeType = 'del'
			})
			this.orderInfoData.details = details
			this.orderItemList = this.filterStoreItem(details)
		},
		onItemFocus () {
			this.$refs.orderInfo.closeCollapse()
		},
		onClickHandler (method) {
			if (this.itemInputFocusing) {
				return false
			}
			this[method]()
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
.inteledi-otherOut-details {
	height:100%
	background:$fxWhite
	display: flex
	flex-direction: column
	.otherOut-bottom {
		width:100%
		display: flex
		flex-direction: row
		.bottom-btn {
			flex:1
			padding:0
			overflow:hidden
		}
		.yellow-btn {
			background-color: $fxYellow
			border: 1px solid $fxYellow
		}
	}
}
</style>


