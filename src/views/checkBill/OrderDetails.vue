<template>
	<div class="inteledi-shopOrder-details">
		<w-header :title="orderInfoData.sysbillCode" titleFontSize="3.733vw" :border="true"></w-header>
		<orderInfo
			ref="orderInfo"
			:data="orderInfoData"
			:isDisabled="isBillState(1) || isWeightState(1) || isWeightState(2) || !$fxAuth('shopCheckBill.save')"
			:collapseDisabled="itemInputFocusing"
		></orderInfo>
		<orderItem
			:data="orderItemList"
			:isDisabled="isBillState(1) || isWeightState(1) || isWeightState(2) || !$fxAuth('shopCheckBill.save')"
			:itemInputFocusing.sync="itemInputFocusing"
			:planId="orderInfoData.planId"
			:hasSumBatch="orderInfoData.hasSumBatch"
			@on-item-edit="onItemEdit"
			@on-add-click="onAddClick"
			@on-search-click="onSearchClick"
			@on-item-focus="onItemFocus"
			@on-mic-click="onMicClick"
			@on-selectbom-click="onSelectBomClick"
			@on-viewbom-click="onViewBomClick"
		></orderItem>
		<div class="shopOrder-bottom">
			<van-button
				v-show="$fxAuth('shopCheckBill.refreshAccounts') && isBillState(0) && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius"
				type="info"
				@click="onRefreshAccountsClick"
			>刷新账存</van-button>
			<van-button
				v-show="$fxAuth('shopCheckBill.del') && isBillState(0) && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onDelBillClick"
			>删除</van-button>
			<van-button
				v-show="$fxAuth('shopCheckBill.check') && isBillState(0) && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius"
				type="info"
				@click="onExpressClick"
			>审核</van-button>
			<van-button
				v-show="$fxAuth('shopCheckBill.unCheck') && isBillState(1) && isBillReState(0) && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onUnExpressClick"
			>反审</van-button>
			<van-button
				v-show="$fxAuth('shopCheckBill.rdCheck') && isBillState(1) && isBillReState(0)"
				class="bottom-btn fx-no-radius"
				type="primary"
				@click="onBillReStateClick"
			>复审</van-button>
			<van-button
				v-show="$fxAuth('shopCheckBill.unReCheck') && isBillReState(1)"
				class="bottom-btn fx-no-radius"
				type="primary"
				@click="onUnBillReStateClick"
			>取消复审</van-button>
			<van-button
				v-show="$fxAuth('shopCheckBill.save') && isBillState(0) && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius"
				type="primary"
				@click="onSaveClick"
			>保存</van-button>
			<van-button
				v-show="$fxAuth('shopCheckBill.weighState') && isBillState(0) && (isWeightState(0) || isWeightState(3)) && orderInfoData.hasSumBatch"
				class="bottom-btn fx-no-radius yellow-btn"
				type="info"
				@click="onClickHandler('onWeightClick')"
			>下发称重</van-button>
			<van-button
				v-show="$fxAuth('shopCheckBill.weighState') && isBillState(0) && (isWeightState(1) || isWeightState(2))"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onClickHandler('onUnWeightClick')"
			>取消称重</van-button>
			<van-button
				v-show="$fxAuth('shopCheckBill.weighState') && isBillState(0) && isWeightState(2) && sysDZCManyLower"
				class="bottom-btn fx-no-radius"
				type="info"
				@click="onClickHandler('onEndWeightClick')"
			>结束称重</van-button>
		</div>
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
				:store="orderInfoData.houseDTO"
				:businessDate="orderInfoData.businessDate"
				:parentStoreItem="orderItemList"
				:createBillFlag="false"
				:hasSumBatch="orderInfoData.hasSumBatch"
				@on-confirm="onConfirm"
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
				:isCheckedBill="isBillState(1)"
				:isDisabled="isBillState(1) || isWeightState(1) || isWeightState(2) || !$fxAuth('shopCheckBill.save')"
				:hasSumBatch="orderInfoData.hasSumBatch"
				@on-Confirm="onEditRowConfirm"
			></itemRowEditPop>
		</van-popup>
		<van-popup
			v-model="itemMicEditPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<itemMicEditComp
				:visibleFlag.sync="itemMicEditPopShow"
				:shopId="orderInfoData.shopDTO && orderInfoData.shopDTO.id"
				:billId="orderInfoData.id"
				:checkPlanId="orderInfoData.planId"
				:houseId="orderInfoData.houseDTO && orderInfoData.houseDTO.id"
				:checkDate="orderInfoData.businessDate"
				@on-micAdd-item="onMicAddItem"
			></itemMicEditComp>
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
				:planId="orderInfoData.planId"
				:house="orderInfoData.houseDTO"
				:isCheckedBill="isBillState(1)"
				:isDisabled="isBillState(1) || isWeightState(1) || isWeightState(2) || !$fxAuth('shopCheckBill.save')"
				:hasSumBatch="orderInfoData.hasSumBatch"
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
				:orderId="orderInfoData.id"
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
import orderInfo from '@/components/checkBill/orderDetails/OrderInfo.vue'
import orderItem from '@/components/checkBill/orderDetails/OrderItem.vue'
import itemEditComp from '@/components/checkBill/common/itemEditComp.vue'
import itemRowEditPop from '@/components/checkBill/common/ItemRowEditPop.vue'
import itemMicEditComp from '@/components/checkBill/common/ItemMicEditComp.vue'
import itemSearchPop from '@/components/checkBill/common/itemSearchPop.vue'
import bomEditComp from '@/components/checkBill/common/bomEditComp.vue'
import bomSearchPop from '@/components/checkBill/common/bomSearchPop.vue'
export default {
	name: 'checkBillDetails',
	components: {
		orderInfo,
		orderItem,
		itemEditComp,
		itemRowEditPop,
		itemMicEditComp,
		itemSearchPop,
		bomEditComp,
		bomSearchPop
	},
	data () {
		return {
			query: this.$route.query,
			activeNames: ['1'],
			tabActive: '选项1',
			orderInfoData: {},
			orderItemList: [],
			orderBomItemList: [],
			storeItem: {},
			itemPopShow: false,
			bomPopShow: false,
			itemEditRowData: {},
			itemRowEditPopShow: false,
			itemInputFocusing: false,
			orderDeleteFlag: false,
			itemMicEditPopShow: false,
			itemSearchPopShow: false,
			searchItem: [],
			bomSearchPopShow: false,
			searchBom: []
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
		if (to.path === '/checkBill' && !this.orderDeleteFlag && this.orderInfoData.billState === 0) {
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
			sysDZCManyLower: state => state.systemParams.sysDZCManyLower
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
		createOrderDetails () {
			return new Promise(resolve => {
				this.getOrderDetails().then(res => {
					let orderDetailsData = res.checkBills[0]
					this.orderInfoData = orderDetailsData
					this.orderItemList = this.setDataToFixedSize(orderDetailsData.details)
					if (orderDetailsData.billBom && orderDetailsData.billBom.length) {
						this.orderBomItemList = orderDetailsData.billBom
					}
					resolve()
				})
			})
		},
		getOrderDetails () {
			return new Promise(resolve => {
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/checkbills/${this.query.orderId}/users/${this.loginerId}`
				}).then(res => {
					resolve(res)
				})
			})
		},
		onSaveClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要保存该单据吗?'
			}).then(() => {
				this.checkHasDetails().then(() => {
					this.saveBill()
				})
			}).catch(() => {
			})
		},
		saveBill () {
			return new Promise(resolve => {
				let params = this.getSaveParams()
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/checkbills/${this.query.orderId}/users/${this.loginerId}`,
					data: params,
					query: {
						m: 'modify'
					}
				}).then(res => {
					this.createOrderDetails().then(() => {
						this.$fxToast.success('保存成功')
						resolve()
					})
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
					this.$fxHttp.requestPut({
						url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/checkbills/${this.query.orderId}/users/${this.loginerId}`,
						data: params,
						query: {
							m: 'editAndCheck'
						}
					}).then(res => {
						this.createOrderDetails().then(() => {
							this.$fxToast.success('审核成功')
						})
					})
				})
			}).catch(() => {
			})
		},
		onUnExpressClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要反审该单据吗?'
			}).then(() => {
				let params = this.getSaveParams()
				if (!params) {
					return false
				}
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/checkbills/${this.query.orderId}/users/${this.loginerId}`,
					data: params,
					query: {
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
		onBillReStateClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要复审该单据吗?'
			}).then(() => {
				let params = this.getSaveParams()
				if (!params) {
					return false
				}
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/checkbills/${this.query.orderId}/users/${this.loginerId}`,
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
				if (!params) {
					return false
				}
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/checkbills/${this.query.orderId}/users/${this.loginerId}`,
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
		onRefreshAccountsClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要刷新账存吗?'
			}).then(() => {
				this.checkHasDetails().then(() => {
					this.saveBill().then(billRes => {
						let params = this.getSaveParams()
						if (!params) {
							return false
						}
						this.$fxHttp.requestPut({
							url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/checkbills/${this.query.orderId}/users/${this.loginerId}`,
							data: params,
							query: {
								m: 'refreshBill'
							}
						}).then(billRes => {
							this.createOrderDetails().then(() => {
								this.$fxToast.success('刷新账存成功')
							})
						})
					})
				})
			}).catch(() => {
			})
		},
		onDelBillClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要删除单据吗?'
			}).then(() => {
				this.$fxHttp.requestDel({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/checkbills/${this.query.orderId}/users/${this.loginerId}`
				}).then(res => {
					this.$fxToast.success('删除成功！').then(() => {
						this.orderDeleteFlag = true
						this.$router.go(-1)
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
						url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/checkbills/${this.query.orderId}/users/${this.loginerId}`,
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
						url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/checkbills/${this.query.orderId}/users/${this.loginerId}`,
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
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/checkbills/${this.query.orderId}/users/${this.loginerId}`,
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
		onClickHandler (method) {
			if (this.itemInputFocusing) {
				return false
			}
			this[method]()
		},
		getSaveParams () {
			let editItems = this.orderItemList.filter(item => {
				return item.changeType === 'edit'
			})
			let addItems = this.orderItemList.filter(item => {
				return item.changeType === 'add'
			})
			let delItems = this.orderItemList.filter(item => {
				return item.changeType === 'del'
			})
			let params = Object.assign(this.orderInfoData, {
				detailDel: delItems.length > 0 ? delItems : null,
				detailMdf: editItems,
				detailAdd: addItems,
				details: [],
				billBom: this.orderBomItemList
			})
			return params
		},
		getValidItem () {
			let itemDetails = this.orderItemList
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
		onAddClick () {
			this.storeItem = JSON.parse(JSON.stringify(this.orderItemList))
			this.itemPopShow = true
		},
		onConfirm (selectItems) {
			this.itemPopShow = false
			this.getSelectItemUnit(selectItems).then(res => {
				res.checkBillDetails.forEach(item => {
					item.changeType = 'add'
				})
				this.orderItemList = this.orderItemList.concat(res.checkBillDetails)
			})
		},
		getSelectItemUnit (selectItems) {
			let params = []
			selectItems.forEach(item => {
				let itemObj = {
					billId: this.query.orderId,
					goodsDTO: {
						id: item.id
					},
					houseId: this.orderInfoData.houseDTO.id,
					workDate: this.orderInfoData.businessDate
				}
				params.push(itemObj)
			})
			return new Promise(resolve => {
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/checkbills/${this.query.orderId}/details`,
					data: params
				}).then(res => {
					resolve(res)
				})
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
		// {{{
		setDataToFixedSize (data) {
			data.forEach(item => {
				item.accountMoney = this.toFixedNumberSize(item.accountMoney)
				item.accountAmount = this.toFixedNumberSize(item.accountAmount)
				item.seeDiffAmount = this.toFixedNumberSize(item.seeDiffAmount)
				item.checkUnitAmount = this.toFixedNumberSize(item.checkUnitAmount)
				item.planUnitAmount = this.toFixedNumberSize(item.planUnitAmount)
				item.checkInOutMoney = this.toFixedNumberSize(item.checkInOutMoney)
				item.diffAmount = this.toFixedNumberSize(item.diffAmount)
				item.checkMoney = this.toFixedNumberSize(item.checkMoney)
				item.unit2Amount = this.toFixedNumberSize(item.unit2Amount)
			})
			return data
		},
		// }}}
		toFixedNumberSize (data) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysPointSize))
		},
		// }}}
		onItemFocus () {
			this.$refs.orderInfo.closeCollapse()
		},
		onMicClick () {
			this.itemMicEditPopShow = true
		},
		onMicAddItem (details) {
			details.forEach((item, index) => {
				const itemIndex = this.orderItemList.findIndex(orderItem => {
					return item.goodsDTO.id === orderItem.goodsDTO.id
				})
				if (~itemIndex) {
					item.id = this.orderItemList[itemIndex].id
					this.orderItemList.splice(itemIndex, 1)
				}
				item.changeType = item.id ? 'edit' : 'add'
			})
			this.orderItemList.push(...details)
		},
		// {{{ 搜索界面
		onSearchClick () {
			this.itemSearchPopShow = true
			this.searchItem = JSON.parse(JSON.stringify(this.orderItemList))
		},
		// }}}
		onSearchConfirm (searchItemData) {
			this.orderItemList = JSON.parse(JSON.stringify(searchItemData))
		},
		// {{{bom
		onSelectBomClick () {
			this.bomPopShow = true
		},
		// 查看已选bom
		onViewBomClick () {
			this.searchBom = JSON.parse(JSON.stringify(this.orderBomItemList))
			this.bomSearchPopShow = true
		},
		// 导入bom
		onBomConfirm (selectItems) {
			this.bomPopShow = false
			this.getBomItem(selectItems).then(res => {
				let resDetails = res.billBom[0].details
				resDetails.forEach(item => {
					let sameOrderItem = this.orderItemList.find(orderItem => {
						return orderItem.goodsDTO.id === item.goodsDTO.id
					})
					if (sameOrderItem) {
						if (sameOrderItem.changeType === 'del') {
							return
						} else if (sameOrderItem.changeType !== 'add') {
							this.$set(sameOrderItem, 'changeType', 'edit')
						}
						sameOrderItem.checkUnitAmount = item.checkUnitAmount
					} else {
						item.changeType = 'add'
						this.orderItemList.push(item)
					}
				})
				this.orderBomItemList = res.billBom[0].billBom
			})
		},
		getBomItem (selectItems) {
			return new Promise(resolve => {
				selectItems.forEach(item => {
					item.bomId = item.id
					item.bomName = item.name
					delete item.checked
				})
				let params = {
					houseId: this.orderInfoData.houseDTO.id,
					workDate: this.orderInfoData.businessDate,
					bom: selectItems,
					details: this.orderItemList,
					billBom: this.orderBomItemList
				}
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/accounts/${this.orderInfoData.shopDTO.id}/checkbills/${this.orderInfoData.id}/details`,
					data: params,
					query: {
						m: 'checkBillBom'
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
			padding: 0
		}
		.yellow-btn {
			background-color: $fxYellow
			border: 1px solid $fxYellow
		}
	}
}
</style>
