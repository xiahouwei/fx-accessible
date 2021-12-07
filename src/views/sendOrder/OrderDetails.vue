<template>
	<div class="inteledi-shopOrder-details">
		<w-header :title="orderInfoData.sysbillCode" titleFontSize="3.733vw" :border="true"></w-header>
		<orderInfo
			ref="orderInfo"
			:data="orderInfoData"
			:collapseDisabled="itemInputFocusing"
			:isDisabled="isBillState(1) || !$fxAuth('shopDirectInBill.save') || isWeightState(1) || isWeightState(2)"
			@on-busdate-click="onBusinessDateClick"
		></orderInfo>
		<orderItem
			:data="orderItemList"
			:isDisabled="isBillState(1) || !$fxAuth('shopDirectInBill.save') || isWeightState(1) || isWeightState(2)"
			:itemInputFocusing.sync="itemInputFocusing"
			@on-item-edit="onItemEdit"
			@on-unit-edit="onUnitEdit"
			@on-item-focus="onItemFocus"
			@on-search-click="onSearchClick"
		></orderItem>
		<div class="shopOrder-bottom">
			<van-button
				v-show="isBillState(1) && $fxAuth('shopDirectInBill.unCheck') && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onClickHandler('onUnExpressClick')"
			>反审单据</van-button>
			<van-button
				v-show="isBillState(1) && $fxAuth('shopDirectInBill.createRtn')"
				class="bottom-btn fx-no-radius"
				type="primary"
				@click="onClickHandler('onRetrunClick')"
			>生成退货单</van-button>
			<van-button
				v-show="isBillState(0) && $fxAuth('shopDirectInBill.check') && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius"
				type="info"
				@click="onClickHandler('onExpressClick')"
			>审核单据</van-button>
			<van-button
				v-show="isBillState(0) && $fxAuth('shopDirectInBill.save') && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius"
				type="primary"
				@click="onClickHandler('onSaveClick')"
			>保存单据</van-button>
			<van-button
				v-show="$fxAuth('shopDirectInBill.weighState') && isBillState(0) && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius yellow-btn"
				type="info"
				@click="onClickHandler('onWeightClick')"
			>下发称重</van-button>
			<van-button
				v-show="$fxAuth('shopDirectInBill.weighState') && isBillState(0) && (isWeightState(1) || isWeightState(2))"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onClickHandler('onUnWeightClick')"
			>取消称重</van-button>
			<van-button
				v-show="$fxAuth('shopDirectInBill.weighState') && isBillState(0) && isWeightState(2) && sysDZCManyLower"
				class="bottom-btn fx-no-radius"
				type="info"
				@click="onClickHandler('onEndWeightClick')"
			>结束称重</van-button>
			<van-button
				v-show="$fxAuth('shopDirectInBill.quickAccess') && isBillState(1)"
				class="bottom-btn fx-no-radius"
				type="info"
				@click="onClickHandler('onQuickAccessClick')"
			>快速领用</van-button>
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
				:isDisabled="isBillState(1) || isWeightState(1) || isWeightState(2) || !$fxAuth('shopDirectInBill.save')"
				@on-Confirm="onEditRowConfirm"
			></itemRowEditPop>
		</van-popup>
		<van-actionsheet
			v-model="unitActionShow"
			:actions="unitActions"
			cancel-text="取消"
			@select="onUnitSelect"
		/>
		<van-popup v-model="importItemPopShow" position="right" class="fx-list-popup-full" :close-on-click-overlay="false" :lock-scroll="false">
			<importItemComp
				:visibleFlag.sync="importItemPopShow"
				:storeItemData="importItemData"
				@on-item-import-confirm="onImportConfirm"
			></importItemComp>
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
				:isDisabled="isBillState(1) || isWeightState(1) || isWeightState(2) || !$fxAuth('shopDirectInBill.save')"
				@on-search-confirm="onSearchConfirm"
			></itemSearchPop>
		</van-popup>
		<van-popup
			v-model="quickAccessPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<quickAccessPop
				:visibleFlag.sync="quickAccessPopShow"
				:data="searchItem"
				:billId="orderInfoData.id"
				:shopId="orderInfoData.shopDTO && orderInfoData.shopDTO.id"
				:isDisabled="isBillState(1) || isWeightState(1) || isWeightState(2) || !$fxAuth('shopDirectInBill.save')"
			></quickAccessPop>
		</van-popup>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import orderInfo from '@/components/sendOrder/orderDetails/OrderInfo.vue'
import orderItem from '@/components/sendOrder/orderDetails/OrderItem.vue'
import importItemComp from '@/components/sendReturnOrder/common/ImportItemComp.vue'
import itemRowEditPop from '@/components/sendOrder/common/itemRowEditPop.vue'
import itemSearchPop from '@/components/sendOrder/common/itemSearchPop.vue'
import quickAccessPop from '@/components/sendOrder/common/quickAccessPop.vue'
export default {
	name: 'directOrderDetails',
	components: {
		orderInfo,
		orderItem,
		importItemComp,
		itemRowEditPop,
		itemSearchPop,
		quickAccessPop
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
			itemRowEditPopShow: false,
			itemEditRowData: {},
			unitActionShow: false,
			unitActions: [],
			importItemPopShow: false,
			importItemData: [],
			formatterSysPointKey: ['price', 'inMoney', 'taxInMoney', 'taxPrice', 'inMoneyWithTax', 'busUnitInAmount'],
			itemSearchPopShow: false,
			quickAccessPopShow: false,
			searchItem: [],
			itemInputFocusing: false
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
		if (to.path === '/sendOrder' && this.orderInfoData.billState === 0) {
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
			sysDZCManyLower: state => state.systemParams.sysDZCManyLower,
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId,
			loginerName: state => state.loginer.loginerName
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
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/shopdirectinbills/${this.query.orderId}`
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
			let stores = Array.from(new Set(data.map(item => {
				return item.inHouseDTO.id
			})))
			let StoreItem = stores.map(item => {
				let storeObj = data.find(dataItem => {
					return dataItem.inHouseDTO.id === item
				}).inHouseDTO
				storeObj = JSON.parse(JSON.stringify(storeObj))
				storeObj.details = data.filter(dataItem => {
					return dataItem.inHouseDTO.id === item
				})
				return storeObj
			})
			return StoreItem
		},
		toFixedNumberSize (data) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysPointSize))
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
		onClickHandler (method) {
			if (this.itemInputFocusing) {
				return false
			}
			this[method]()
		},
		onSaveClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要保存该单据吗?'
			}).then(() => {
				let params = this.getSaveParams()
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/shopdirectinbills/${this.query.orderId}`,
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
			}).catch(() => {
			})
		},
		onExpressClick () {
			this.checkHasDetails().then(() => {
				let msg = ''
				if (this.$fxSysAuth('shopDirectInBill.checkPrice')) {
					let hasZeroMoney = this.orderItemList.find(item => {
						return item.details.find(detailItem => {
							return detailItem.inMoneyWithTax === 0
						})
					})
					if (hasZeroMoney) {
						msg = '存在价格为0的品项，是否继续审核?'
					} else {
						msg = '确定要审核该单据吗?'
					}
				} else {
					msg = '确定要审核该单据吗?'
				}
				this.$dialog.confirm({
					title: '提示',
					message: msg
				}).then(() => {
					this.expressHandler()
				})
			})
		},
		expressHandler () {
			this.checkHasDetails().then(() => {
				let params = this.getSaveParams()
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/shopdirectinbills/${this.query.orderId}`,
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
				let params = this.getSaveParams()
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/shopdirectinbills/${this.query.orderId}`,
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
						url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/shopdirectinbills/${this.query.orderId}/users/${this.loginerId}`,
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
						url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/shopdirectinbills/${this.query.orderId}/users/${this.loginerId}`,
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
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/shopdirectinbills/${this.query.orderId}/users/${this.loginerId}`,
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
		checkHasDetails () {
			return new Promise(resolve => {
				if (this.getItemLength() === 0) {
					this.$fxToast.fail('单据明细不能为空')
				} else {
					resolve()
				}
			})
		},
		getItemLength () {
			return this.getValidItem().length
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
		getSaveParams () {
			let itemDetails = []
			this.orderItemList.forEach(item => {
				itemDetails.push(...item.details)
			})
			let editItems = itemDetails.filter(item => {
				return item.changeType === 'edit'
			})
			let params = Object.assign({}, this.orderInfoData, {
				detailMdf: editItems,
				details: []
			})
			return params
		},
		onItemEdit (itemData) {
			this.itemEditRowData = itemData
			this.itemRowEditPopShow = true
		},
		onEditRowConfirm (item) {
			this.orderItemList.forEach(storeItem => {
				let index = storeItem.details.findIndex(detailsItem => {
					return detailsItem.id === item.id
				})
				if (~index) {
					storeItem.details[index] = item
				}
			})
		},
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
			let tempUnit = item.unitDTO
			let factor = tempUnit.value / unit.value
			let busUnitInAmount = parseFloat(this.$fxUtils.toFixedSHW(item.busUnitInAmount * factor, this.sysPointSize))
			let taxPrice = parseFloat(this.$fxUtils.toFixedSHW(item.inMoneyWithTax / busUnitInAmount, this.sysPointSize))
			let price = parseFloat(this.$fxUtils.toFixedSHW(item.inMoney / busUnitInAmount, this.sysPointSize))
			item.unitDTO = unit
			item.busUnitInAmount = busUnitInAmount
			item.taxPrice = taxPrice
			item.price = price
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
		onRetrunClick () {
			this.importItemPopShow = true
			this.importItemData = this.orderItemList
		},
		onImportConfirm (itemData) {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要生成退货单吗?'
			}).then(() => {
				let itemIds = itemData.map(item => {
					return item.id
				})
				this.createReturnOrder(itemIds).then(params => {
					this.$router.replace({
						name: 'createSendReturnOrder',
						params: params
					})
				})
			}).catch(() => {
			})
		},
		createReturnOrder (itemIds) {
			return new Promise(resolve => {
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/directindetails/bill/${this.orderInfoData.id}/users/${this.loginerId}`,
					data: itemIds
				}).then(res => {
					resolve(this.createReturnOrderParams(res.billAndDetails))
				})
			})
		},
		createReturnOrderParams (itemData) {
			itemData.forEach((item, index) => {
				item.changeType = 'add'
				item.preDetailId = item.id
				item.busUnitOutAmount = item.busUnitInAmount
				item.outHouseDTO = item.inHouseDTO
				item.outMoney = item.inMoney
				item.outMoneyWithTax = item.inMoneyWithTax
				item.taxOutMoney = item.taxInMoney
				item.num = index
				delete item['id']
				delete item['inHouseDTO']
				delete item['busUnitInAmount']
				delete item['inMoney']
				delete item['inMoneyWithTax']
				delete item['taxInMoney']
				delete item['outOrderAmount']
			})
			let orderInfoData = {
				accountDTO: this.orderInfoData.accountDTO,
				billDate: new Date().getTime(),
				billEmp: this.loginerName,
				billState: 0,
				businessDate: new Date().getTime(),
				businessTypeDTO: this.orderInfoData.businessTypeDTO,
				details: itemData,
				difference: this.orderInfoData.difference,
				fatherId: this.orderInfoData.id,
				rdcDTO: {},
				shopDTO: this.orderInfoData.shopDTO,
				supplierDTO: this.orderInfoData.supplierDTO,
				updateIndicator: 'Append'
			}
			return orderInfoData
		},
		onItemFocus () {
			this.$refs.orderInfo.closeCollapse()
		},
		// {{{ 搜索
		onSearchClick () {
			this.itemSearchPopShow = true
			this.searchItem = JSON.parse(JSON.stringify(this.orderItemList))
		},
		onSearchConfirm (searchItemData) {
			this.orderItemList = searchItemData
		},
		// }}}
		/// {{{快速领用
		onQuickAccessClick () {
			this.quickAccessPopShow = true
			this.searchItem = JSON.parse(JSON.stringify(this.orderItemList))
		}
		// }}}
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
		.yellow-btn {
			background-color: $fxYellow
			border: 1px solid $fxYellow
		}
	}
}
</style>

