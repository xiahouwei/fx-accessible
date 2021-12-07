<template>
	<div class="inteledi-shopMoveIn-details">
		<w-header :title="orderInfoData.sysbillCode" titleFontSize="3.733vw" :border="true"></w-header>
		<orderInfo
			ref="orderInfo"
			:data="orderInfoData"
			:isDisabled="isBillState(1) || !$fxAuth('shopMoveInBill.save')"
			:collapseDisabled="itemInputFocusing"
			@on-busdate-click="onBusinessDateClick"
			@on-item-clear="onItemClear"
		></orderInfo>
		<orderItem
			ref="orderItem"
			:data="orderItemList"
			:isDisabled="isBillState(1) || !$fxAuth('shopMoveInBill.save')"
			:itemInputFocusing.sync="itemInputFocusing"
			:shopId="orderInfoData.shopDTO && orderInfoData.shopDTO.id"
			@on-search-click="onSearchClick"
			@on-item-edit="onItemEdit"
			@on-item-focus="onItemFocus"
		></orderItem>
		<div class="shopMoveIn-bottom">
			<van-button
				v-show="isBillState(0) && $fxAuth('shopMoveInBill.check')"
				class="bottom-btn fx-no-radius"
				type="info"
				@click="onClickHandler('onExpressClick')"
			>审核</van-button>
			<van-button
				v-show="isBillState(1) && $fxAuth('shopMoveInBill.unCheck')"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onClickHandler('onUnExpressClick')"
			>反审</van-button>
			<van-button
				v-show="isBillState(0) && $fxAuth('shopMoveInBill.save')"
				class="bottom-btn fx-no-radius"
				type="primary"
				@click="onClickHandler('onSaveClick')"
			>保存</van-button>
		</div>
		<van-popup v-model="datePickerShow" position="bottom">
			<w-date-picker
				:visibleFlag.sync="datePickerShow"
				:currentDate="currentDate"
				@confirm="dateConfirmhandle"
			></w-date-picker>
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
				:isDisabled="isBillState(1) || !$fxAuth('shopMoveInBill.save')"
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
				:isDisabled="isBillState(1) || !$fxAuth('shopMoveInBill.save')"
				@on-search-confirm="onSearchConfirm"
			></itemSearchPop>
		</van-popup>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import orderInfo from '@/components/shopMoveIn/createOrder/OrderInfo.vue'
import orderItem from '@/components/shopMoveIn/createOrder/OrderItem.vue'
import itemRowEditPop from '@/components/shopMoveIn/common/ItemRowEditPop.vue'
import itemSearchPop from '@/components/shopMoveIn/common/itemSearchPop.vue'
export default {
	name: 'shopMoveInDetails',
	components: {
		orderInfo,
		orderItem,
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
			dateType: 'business',
			currentDate: new Date(),
			datePickerShow: false,
			storeItem: [],
			itemRowEditPopShow: false,
			itemEditRowData: {},
			itemInputFocusing: false,
			orderDeleteFlag: false,
			formatterSysPointKey: ['busUnitInAmount'],
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
		if (to.path === '/shopMoveIn' && !this.orderDeleteFlag && this.orderInfoData.billState === 0) {
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
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/shopMoveInBills/${this.query.orderId}`
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
				let amount = parseFloat(item.busUnitInAmount)
				if (amount) {
					// 数量不为0，反算单价，便于后期计算
					item.price = toFixedNumberSize(item.inMoney / amount)
					item.taxPrice = toFixedNumberSize(item.inMoneyWithTax / amount)
				} else {
					// 数量为0，不反算单价，便于后期计算
					item.price = toFixedNumberSize(item.price)
					item.taxPrice = toFixedNumberSize(item.taxPrice)
				}
				this.formatterSysPointKey.forEach(pointItem => {
					item[pointItem] = toFixedNumberSize(item[pointItem])
				})
			})
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
						this.onItemClear()
						resolve()
					}).catch(() => {
					})
				}
			})
		},
		onBusinessDateClick () {
			this.dateType = 'business'
			if (this.orderInfoData.businessDate) this.currentDate = new Date(this.orderInfoData.businessDate)
			this.datePickerShow = true
		},
		dateConfirmhandle (date) {
			let time = date.getTime()
			if (this.dateType === 'business') {
				this.orderInfoData.businessDate = time
			}
			this.datePickerShow = false
		},
		getShopOrderBillDetailDTO () {
			let items = this.getValidItem()
			let shopOrderBillDetailDTO = Array.from(new Set(items.map(item => {
				return item.goodsDTO.id
			})))
			return shopOrderBillDetailDTO.map(item => {
				return {
					goodsDTO: {
						id: item
					}
				}
			})
		},
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
		saveHandler () {
			return new Promise(resolve => {
				let params = this.getSaveParams()
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/shopMoveInBills/${this.query.orderId}`,
					data: params,
					query: {
						userId: this.loginerId,
						m: 'modify'
					}
				}).then(res => {
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
				let params = this.getSaveParams()
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/shopMoveInBills/${this.query.orderId}`,
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
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/shopMoveInBills/${this.query.orderId}`,
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
		getSaveParams () {
			let itemDetails = this.orderItemList
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
			return this.orderItemList.filter(item => {
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
			let detailsIndex = this.orderItemList.findIndex(detailsItem => {
				return detailsItem.goodsDTO.id === item.goodsDTO.id
			})
			if (~detailsIndex) {
				this.orderItemList[detailsIndex] = item
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
			this.orderItemList = details
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
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.inteledi-shopMoveIn-details {
	height:100%
	background:$fxWhite
	display: flex
	flex-direction: column
	.shopMoveIn-bottom {
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


