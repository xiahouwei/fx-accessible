<template>
	<div class="inteledi-foodReckon-create">
		<w-header title="新增菜品预估单" :border="true"></w-header>
		<orderInfo
			ref="orderInfo"
			:data="orderInfoData"
			:reckonDays="reckonDays()"
			:collapseDisabled="itemInputFocusing"
			@on-shop-click="onShopClick"
			@on-busdate-click="onBusinessDateClick"
			@on-reckondays-click="onReckonDaysClick"
		></orderInfo>
		<orderItem
			:data="orderItemList"
			:itemInputFocusing.sync="itemInputFocusing"
			@on-add-click="onAddClick"
			@on-search-click="onSearchClick"
			@on-item-edit="onItemEdit"
		></orderItem>
		<div class="foodReckon-bottom">
			<van-button class="add-btn fx-no-radius" type="primary" @click="onCreateClick">生成单据</van-button>
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
			></listComp>
		</van-popup>
		<van-popup v-model="datePickerShow" position="bottom">
			<w-date-picker
				:visibleFlag.sync="datePickerShow"
				:currentDate="currentDate"
				@confirm="dateConfirmhandle"
			></w-date-picker>
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
				:isDisabled="!$fxAuth('foodReckonBill.save')"
				@on-search-confirm="onSearchConfirm"
			></itemSearchPop>
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
export default {
	name: 'createFoodReckonBill',
	components: {
		orderInfo,
		orderItem,
		filterListPopup,
		listComp,
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
				autoType: 1,
				accountDTO: {},
				billEmp: '',
				billMemo: '',
				billState: 0,
				businessDate: new Date().getTime(),
				shopDTO: {},
				details: [],
				updateIndicator: 'Append'
			},
			orderItemList: [],
			dateType: 'business',
			currentDate: new Date(),
			addDetailDate: null,
			shopPopShow: false,
			shopList: [],
			datePickerShow: false,
			reckonDatePickerShow: false,
			itemRowEditPopShow: false,
			itemEditRowData: {},
			itemInputFocusing: false,
			itemSearchPopShow: false,
			searchItem: [],
			parentStoreItem: [],
			itemPopShow: false,
			formatterReckonDays: [],
			reckonDaysPopShow: false
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize',
			ysMoneyPointSize: 'sysMoneyPointSize',
			loginerShopId: state => state.loginer.loginerShopId,
			loginerShopName: state => state.loginer.loginerShopName,
			loginerOrganType: state => state.loginer.loginerOrganType,
			loginerId: state => state.loginer.loginerId
		}),
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
	created () {
		if (this.loginerShopId && this.$fxStateMiddleware.stateIs('loginerOrganType')(['shop', 'center'])(this.loginerOrganType)) {
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
		if (to.path === '/foodReckonBill') {
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
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/foodReckonBill`,
				data: params
			}).then(res => {
				this.$fxToast.success('生成单据成功').then(() => {
					this.$router.replace({
						path: 'foodReckonBillDetails',
						query: {
							orderId: res.storeBills[0].id
						}
					})
				})
			})
		},
		getSaveParams () {
			return new Promise(resolve => {
				if (this.getItemLength() === 0) { // 单据明细为空，弹出新增明细页
					this.onAddClick()
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
		onItemClear () {
			this.orderInfoData.details = []
			this.orderItemList = this.orderInfoData.details
		},
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
				return detailsItem.foodUnitId === item.foodUnitId && detailsItem.changeType !== 'del'
			})
			if (~detailsIndex) {
				this.orderItemList[detailsIndex] = item
			}
		},
		// {{{ 搜索界面
		onSearchClick () {
			this.itemSearchPopShow = true
			this.searchItem = JSON.parse(JSON.stringify(this.orderItemList))
		},
		onSearchConfirm (searchItemData) {
			this.orderItemList = searchItemData
		},
		// }}}
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
.inteledi-foodReckon-create {
	height:100%
	background:$fxWhite
	display: flex
	flex-direction: column
	.foodReckon-bottom {
		width:100%
		.add-btn {
			width:100%
		}
	}
}
</style>

