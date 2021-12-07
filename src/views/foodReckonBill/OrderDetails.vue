<template>
	<div class="inteledi-foodReckonBill-details">
		<w-header :title="orderInfoData.sysbillCode" titleFontSize="3.733vw" :border="true"></w-header>
		<orderInfo
			ref="orderInfo"
			:data="orderInfoData"
			:reckonDays="reckonDays()"
			:isDisabled="isBillState(1) || !$fxAuth('foodReckonBill.save')"
			:collapseDisabled="itemInputFocusing"
			@on-shop-click="onShopClick"
			@on-busdate-click="onBusinessDateClick"
			@on-reckondays-click="onReckonDaysClick"
		></orderInfo>
		<orderItem
			ref="orderItem"
			:data="orderItemList"
			:itemInputFocusing.sync="itemInputFocusing"
			:isDisabled="isBillState(1) || !$fxAuth('foodReckonBill.save')"
			:autoType="orderInfoData.autoType"
			@on-add-click="onAddClick"
			@on-search-click="onSearchClick"
			@on-item-edit="onItemEdit"
		></orderItem>
		<div class="foodReckonBill-bottom">
			<van-button
				v-show="isBillState(0) && $fxAuth('foodReckonBill.del')"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onClickHandler('onDeleteClick')"
			>删除</van-button>
			<van-button
				v-show="isBillState(0) && $fxAuth('foodReckonBill.check')"
				class="bottom-btn fx-no-radius"
				type="info"
				@click="onClickHandler('onExpressClick')"
			>审核</van-button>
			<van-button
				v-show="isAutoType(1) && !orderInfoData.hasOrder && isBillState(1) && $fxAuth('foodReckonBill.createOrder')"
				class="bottom-btn fx-no-radius"
				type="info"
				@click="onClickHandler('onGoodsReckonClick')"
			>原料用量预估</van-button>
			<van-button
				v-show="!isAutoType(0) && !orderInfoData.hasOrder && isBillState(1) && $fxAuth('foodReckonBill.createOrder')"
				class="bottom-btn fx-no-radius"
				type="primary"
				@click="onClickHandler('onCreateShopOrderClick')"
			>生成门店订货单</van-button>
			<van-button
				v-show="isAutoType(1) && isBillState(1) && $fxAuth('foodReckonBill.unCheck')"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onClickHandler('onUnExpressClick')"
			>反审</van-button>
			<van-button
				v-show="isBillState(0) && $fxAuth('foodReckonBill.save')"
				class="bottom-btn fx-no-radius"
				type="primary"
				@click="onClickHandler('onSaveClick')"
			>保存</van-button>
		</div>
		<filterListPopup
			v-model="shopPopShow"
			title="门店检索"
			:rollingLoad="true"
			:getDataApi="getShopListData"
			@on-select="selectShop(arguments)"
		></filterListPopup>
		<van-popup v-model="reckonDaysPopShow" position="right" class="fx-list-popup-300">
			<listComp
				:visibleFlag.sync="reckonDaysPopShow"
				:data="formatterReckonDays"
				title="预估天数"
				:loadFinished="true"
				:searchShow="false"
			></listComp>
		</van-popup>
		<van-popup v-model="datePickerShow" position="bottom">
			<w-date-picker
				:visibleFlag.sync="datePickerShow"
				:currentDate="currentDate"
				@confirm="dateConfirmhandle"
			></w-date-picker>
		</van-popup>
		<van-popup v-model="reckonDatePickerShow" position="bottom">
			<w-date-picker
				:visibleFlag.sync="reckonDatePickerShow"
				:currentDate="currentDate"
				:type="'date'"
				:mindate="new Date((new Date()).getFullYear(), (new Date()).getMonth(), 1)"
				:maxdate="new Date((new Date()).getFullYear(), (new Date()).getMonth() + 2, 0)"
				@confirm="reckonDateConfirmhandle"
			></w-date-picker>
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
				:parentStoreItem="parentStoreItem ? parentStoreItem : []"
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
				:isDisabled="isBillState(1) || !$fxAuth('foodReckonBill.save')"
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
				:isDisabled="isBillState(1) || !$fxAuth('foodReckonBill.save')"
				@on-search-confirm="onSearchConfirm"
			></itemSearchPop>
		</van-popup>
		<van-popup
			v-model="goodsReckonPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<goodsReckon
				:visibleFlag.sync="goodsReckonPopShow"
				:data="goodsReckonData"
				:billId="orderInfoData.id"
				:shopId="orderInfoData.shopDTO && orderInfoData.shopDTO.id"
				:isDisabled="isBillState(1) || !$fxAuth('foodReckonBill.save')"
				@on-search-confirm="onSearchConfirm"
			></goodsReckon>
		</van-popup>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import orderInfo from '@/components/foodReckonBill/createOrder/OrderInfo.vue'
import orderItem from '@/components/foodReckonBill/createOrder/OrderItem.vue'
import filterListPopup from '@/components/common/FilterListPopup.vue'
import listComp from '@/components/common/ListComp.vue'
import itemRowEditPop from '@/components/foodReckonBill/common/ItemRowEditPop.vue'
import itemSearchPop from '@/components/foodReckonBill/common/itemSearchPop.vue'
import itemEditComp from '@/components/foodReckonBill/common/itemEditComp.vue'
import goodsReckon from '@/components/foodReckonBill/goodsReckon/goodsListPop.vue'
export default {
	name: 'foodReckonBillDetails',
	components: {
		orderInfo,
		orderItem,
		filterListPopup,
		listComp,
		itemRowEditPop,
		itemSearchPop,
		itemEditComp,
		goodsReckon
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
			datePickerShow: false,
			reckonDatePickerShow: false,
			itemSearchPopShow: false,
			itemRowEditPopShow: false,
			itemEditRowData: {},
			itemInputFocusing: false,
			orderDeleteFlag: false,
			formatterSysPointKey: ['foodCount'],
			searchItem: [],
			goodsReckonData: [],
			parentStoreItem: [],
			addDetailDate: null,
			itemPopShow: false,
			formatterReckonDays: [],
			reckonDaysPopShow: false,
			goodsReckonPopShow: false
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
		if (to.path === '/foodReckonBill' && !this.orderDeleteFlag && this.orderInfoData.billState === 0) {
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
			sysMoneyPointSize: 'sysMoneyPointSize',
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId
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
		// 0: 菜谱计划生成，1：自动生成
		isAutoType (state) {
			return state => {
				if (Object.prototype.toString.call(state) === '[object Array]') {
					return state.includes(this.autoType)
				} else {
					return this.orderInfoData.autoType === state
				}
			}
		},
		reckonDays () {
			return () => {
				let days = []
				this.orderItemList.forEach(dataItem => {
					dataItem.details.forEach(item => {
						if (item.changeType !== 'del') {
							days.push(item.reckonDate)
						}
					})
				})
				days = Array.from(new Set(days))
				days.sort((a, b) => {
					return a - b
				})
				return days
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
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/foodReckonBill/${this.query.orderId}`
				}).then(res => {
					resolve(res)
				})
			})
		},
		formatterSysPoint (data) {
			data.details && data.details.forEach(item => {
				this.formatterSysPointKey.forEach(pointItem => {
					item[pointItem] = this.toFixedNumberSize(item[pointItem], this.sysPointSize)
				})
			})
		},
		filterStoreItem (data) {
			data.forEach(dataItem => {
				dataItem.totalFoodCount = this.toFixedNumberSize(dataItem.details.reduce((pre, cur) => {
					return pre + this.toFixedNumberSize(cur.foodCount)
				}, 0))
			})
			return data
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
		// {{{ 门店
		onShopClick () {
			this.shopPopShow = true
		},
		selectShop ([item]) {
			this.checkShop(item).then(() => {
				this.clearItemConfim('切换门店将清空菜品预估数据，是否继续?').then(() => {
					this.orderInfoData.shopDTO = item
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
		getShopListData (keyword = null, start, size) {
			let params = {
				keyword: keyword,
				start: start,
				size: size
			}
			return this.$fxApi('z5common.getListShop4ExceptPS')({ data: params }).then(res => {
				return res.shops
			})
		},
		// }}}
		// {{{预估天数
		onReckonDaysClick () {
			let days = this.reckonDays()
			if (!days.length) {
				return false
			}
			this.formatterReckonDays = days.map(item => {
				return {
					id: '',
					name: this.$fxUtils.setDate(new Date(item))
				}
			})
			this.reckonDaysPopShow = true
		},
		// }}}
		onBusinessDateClick () {
			this.dateType = 'business'
			if (this.orderInfoData.businessDate) this.currentDate = new Date(this.orderInfoData.businessDate)
			this.datePickerShow = true
		},
		dateConfirmhandle (date) {
			let time = date.getTime()
			this.datePickerShow = false
			if (this.dateType === 'business') {
				this.orderInfoData.businessDate = time
			}
		},
		reckonDateConfirmhandle (date) {
			if (this.dateType === 'addDetail') {
				this.reckonDatePickerShow = false
				let selectTime = this.$fxUtils.getCustomerDateAndTime(date, '00:00').getTime()
				if (selectTime < this.$fxUtils.getCustomerDateAndTime(new Date(), '00:00').getTime()) {
					this.$fxToast.top(`只能预估当日及以后的日期!`)
					return false
				}
				this.addDetailDate = selectTime
				this.parentStoreItem = this.getStoreItem()
				this.itemPopShow = true
			}
		},
		onAddClick () {
			this.checkOrderInfo().then(() => {
				this.dateType = 'addDetail'
				if (this.addDetailDate) this.currentDate = new Date(this.addDetailDate)
				this.reckonDatePickerShow = true
			})
		},
		checkOrderInfo () {
			return new Promise((resolve, reject) => {
				if (!this.orderInfoData.businessDate) {
					this.$fxToast.top('请先选择业务日期!')
				} else if (!this.orderInfoData.shopDTO.id) {
					this.$fxToast.top('请先选择门店!')
				} else {
					resolve()
				}
			})
		},
		// {{{ 搜索界面
		onSearchClick () {
			this.itemSearchPopShow = true
			this.searchItem = JSON.parse(JSON.stringify(this.orderItemList))
		},
		// }}}
		onSaveClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要保存该单据吗?'
			}).then(() => {
				this.checkHasDetails().then(() => {
					this.saveHandler().then(res => {
						this.createOrderDetails().then(() => {
							this.$fxToast.success(res.message)
						})
					})
				})
			}).catch(() => {
			})
		},
		saveHandler (check) {
			return new Promise(resolve => {
				let params = this.getSaveParams()
				let postData = {
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/foodReckonBill`,
					data: params
				}
				if (check) {
					postData.query = {
						tocheck: 1
					}
				}
				this.$fxHttp.requestPost(postData).then(res => {
					resolve(res)
				})
			})
		},
		onExpressClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要审核该单据吗?'
			}).then(() => {
				this.expressHandler()
			})
		},
		expressHandler () {
			this.checkHasDetails().then(() => {
				this.saveHandler(1).then(res => {
					let params = this.getSaveParams()
					this.$fxHttp.requestPut({
						url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/foodReckonBill/${this.query.orderId}/users/${this.loginerId}`,
						data: params,
						query: {
							m: 'editAndCheck',
							tocheck: 1
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
				})
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
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/foodReckonBill/${this.query.orderId}`,
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
		onCreateShopOrderClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要生成门店订货单吗?'
			}).then(() => {
				this.checkHasDetails().then(() => {
					let params = this.getSaveParams()
					this.createShopOrderHandler(params)
				})
			}).catch(() => {
			})
		},
		createShopOrderHandler (params) {
			this.$fxHttp.requestPut({
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/foodReckonBill/${this.query.orderId}`,
				data: params,
				query: {
					userId: this.loginerId,
					m: 'generateOrderBill'
				}
			}).then(res => {
				this.createOrderDetails().then(() => {
					this.$fxToast.success('生成门店订货单成功')
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
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/foodReckonBill/${this.query.orderId}`,
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
				details: [],
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
		// {{{ 原料预估
		onGoodsReckonClick () {
			this.getGoodsReckonList().then(res => {
				this.goodsReckonPopShow = true
				this.goodsReckonData = res.foodDTOData
			})
		},
		getGoodsReckonList () {
			return new Promise(resolve => {
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/foodReckonBill/${this.query.orderId}`,
					data: {
						m: 'goodsDetailByPage'
					}
				}).then(res => {
					resolve(res)
				})
			})
		},
		// }}}
		onItemEdit (itemData) {
			this.itemEditRowData = itemData
			this.itemRowEditPopShow = true
		},
		toFixedNumberSize (data, pointSize = this.sysMoneyPointSize) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, pointSize))
		},
		onEditRowConfirm (item) {
			// 算合计
			item.totalFoodCount = this.toFixedNumberSize(item.details.reduce((pre, cur) => {
				return pre + this.toFixedNumberSize(cur.foodCount)
			}, 0))
			// 赋值
			let detailsIndex = this.orderItemList.findIndex(detailsItem => {
				return detailsItem.foodUnitId === item.foodUnitId
			})
			if (~detailsIndex) {
				this.orderItemList[detailsIndex] = item
			}
		},
		onItemClear () {
			this.orderInfoData.details.forEach(orderItem => {
				let details = orderItem.details.filter(item => {
					return !!item.id
				})
				details.forEach(item => {
					item.changeType = 'del'
				})
				orderItem.details = details
			})
			this.orderItemList = JSON.parse(JSON.stringify(this.filterStoreItem(this.orderInfoData.details)))
		},
		onClickHandler (method) {
			if (this.itemInputFocusing) {
				return false
			}
			this[method]()
		},
		onSearchConfirm (searchItemData) {
			this.orderItemList = searchItemData
		},
		// {{{增加品项
		getStoreItem () {
			let itemList = []
			this.orderItemList.forEach(orderItem => {
				let goods = orderItem.details.filter(item => {
					return item.reckonDate === this.addDetailDate
				})
				itemList.push(...goods)
			})
			return itemList
		},
		onItemEditConfirm ([selectedItemArr]) {
			if (selectedItemArr.length) {
				selectedItemArr.forEach(selectedItem => {
					selectedItem.reckonDate = this.addDetailDate
					let goods = this.orderItemList.find(orderItem => {
						return selectedItem.foodUnitId === orderItem.foodUnitId
					})
					if (!goods) {
						let newData = JSON.parse(JSON.stringify(selectedItem))
						newData.totalFoodCount = selectedItem.foodCount
						newData.details = [selectedItem]
						this.orderItemList.push(newData)
					} else { // 增删改3种情况
						let detailsIndex = goods.details.findIndex(reckData => {
							return reckData.reckonDate && reckData.reckonDate === this.addDetailDate
						})
						if (~detailsIndex) { // 已存在
							if (selectedItem.changeType === 'add' || selectedItem.changeType === 'edit') {
								goods.details[detailsIndex] = selectedItem
							} else if (selectedItem.changeType === 'del') {
								if (goods.details[detailsIndex].id) { // 有id修改无id删除
									goods.details[detailsIndex] = selectedItem
								} else {
									goods.details.splice(detailsIndex, 1)
								}
							}
						} else { // 不存在
							goods.details.push(selectedItem)
						}
						// 更新视图
						this.sumCount(goods)
					}
				})
			}
		},
		sumCount (goods) {
			goods.totalFoodCount = goods.details.reduce((pre, cur) => {
				let count = cur.changeType !== 'del' ? cur.foodCount : 0
				return pre + this.$fxUtils.toFixedParseNumber(count, this.sysPointSize)
			}, 0)
			let goodsIndex = this.orderItemList.findIndex(orderItem => {
				return goods.foodUnitId === orderItem.foodUnitId
			})
			if (!~goodsIndex) {
				return false
			}
			let details = this.orderItemList[goodsIndex].details && this.orderItemList[goodsIndex].details.filter(detailsItem => {
				return detailsItem.changeType === 'del' && !detailsItem.id
			}).length > 0
			if (!details) { // 有该品项，则更新视图，没有则删除
				this.orderItemList.splice(goodsIndex, 1, goods)
			} else {
				this.orderItemList.splice(goodsIndex, 1)
			}
		}
		// }}}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.inteledi-foodReckonBill-details {
	height:100%
	background:$fxWhite
	display: flex
	flex-direction: column
	.foodReckonBill-bottom {
		width:100%
		display: flex
		flex-direction: row
		.bottom-btn {
			flex:1
			padding:0
			overflow:hidden
		}
	}
}
</style>


