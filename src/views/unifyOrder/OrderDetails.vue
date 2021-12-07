<template>
	<div class="inteledi-unify-details">
		<w-header :title="billInfoData.sysbillCode" titleFontSize="3.733vw" :border="true"></w-header>
		<billInfo
			ref="billInfo"
			:data="billInfoData"
			:isDisabled="isAutoState(1) || isBillState(1) || isWeightState(1) || isWeightState(2) || !$fxAuth('distributionInBill.save')"
			:collapseDisabled="itemInputFocusing"
			:checkAllItemFlag="checkAllItemFlag"
			@on-arriveDate-click="onArriveDateClick"
			@on-businessDate-click="onBusinessDateClick"
		></billInfo>
		<billItem
			:data="billItemList"
			:isDisabled="isBillState(1) || isWeightState(1) || isWeightState(2) || !$fxAuth('distributionInBill.save') || isAutoState(1)"
			:itemInputFocusing.sync="itemInputFocusing"
			@on-complete-click="onCompleteClick"
			@on-search-click="onSearchClick"
			@on-unit-edit="onUnitEdit"
			@on-item-edit="onItemEdit"
			@on-item-focus="onItemFocus"
		></billItem>
		<div class="details-bottom">
			<!--<van-button
				v-show="$fxAuth('distributionInBill.createRtn') && isBillState(1)"
				class="bottom-btn fx-no-radius"
				type="primary"
			>生成退货单</van-button>-->
			<van-button
				v-show="$fxAuth('distributionInBill.check') && isBillState(0) && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius"
				type="info"
				@click="onExpressClick"
			>审核</van-button>
			<van-button
				v-show="$fxAuth('distributionInBill.unCheck') && isBillState(1) && !isAutoState(1) && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onUnExpressClick"
			>反审</van-button>
			<van-button
				v-show="$fxAuth('distributionInBill.save') && isBillState(0) && !isAutoState(1) && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius"
				type="primary"
				@click="onSaveClick"
			>保存</van-button>
			<van-button
				v-show="$fxAuth('distributionInBill.weighState') && isBillState(0) && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius yellow-btn"
				type="info"
				@click="onWeightClick"
			>下发称重</van-button>
			<van-button
				v-show="$fxAuth('distributionInBill.weighState') && isBillState(0) && (isWeightState(1) || isWeightState(2))"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onUnWeightClick"
			>取消称重</van-button>
			<van-button
				v-show="$fxAuth('distributionInBill.weighState') && isBillState(0) && isWeightState(2) && sysDZCManyLower"
				class="bottom-btn fx-no-radius"
				type="info"
				@click="onEndWeightClick"
			>结束称重</van-button>
			<van-button
				v-show="$fxAuth('distributionInBill.quickAccess') && isBillState(1)"
				class="bottom-btn fx-no-radius"
				type="info"
				@click="onQuickAccessClick"
			>快速领用</van-button>
		</div>
		<van-popup v-model="datePickerShow" position="bottom">
			<w-date-picker :visibleFlag.sync="datePickerShow" :currentDate="currentDate" @confirm="dateConfirmhandle"></w-date-picker>
		</van-popup>
		<van-popup v-model="billTypePopShow" position="right" class="fx-list-popup-300">
			<listComp
				:visibleFlag.sync="billTypePopShow"
				:data="billTypeList"
				title="单据类型检索"
				:loadFinished="true"
				@on-select="selectBillType"
				@on-search="searchBillType"
			></listComp>
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
				:isDisabled="isAutoState(1) || isBillState(1) || isWeightState(1) || isWeightState(2) || !$fxAuth('distributionInBill.save')"
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
				:isDisabled="isAutoState(1) || isBillState(1) || isWeightState(1) || isWeightState(2) || !$fxAuth('distributionInBill.save')"
				@on-search-confirm="onSearchConfirm"
			></itemSearchPop>
		</van-popup>
		<van-popup
			v-model="itemCompletePopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<itemCompletePop
				:billId="billInfoData.id"
				:visibleFlag.sync="itemCompletePopShow"
				:title="billInfoData.sysbillCode"
				:data="completeItem"
				:searchKeywords="'code,name,pinYin'"
				:getCheckList="getCheckList"
				:completeHandle="completeHandle"
				:isDisabled="isAutoState([1, 9]) || isBillState(1) || isWeightState(1) || isWeightState(2) || !$fxAuth('distributionInBill.save')"
				@on-complete-change="createBillDetails"
			></itemCompletePop>
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
				:shopId="billInfoData.shopDTO && billInfoData.shopDTO.id"
				:isDisabled="isAutoState(1) || isBillState(1) || isWeightState(1) || isWeightState(2) || !$fxAuth('distributionInBill.save')"
				:billId="billInfoData.id"
			></quickAccessPop>
		</van-popup>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import billInfo from '@/components/unifyOrder/createBill/BillInfo.vue'
import billItem from '@/components/unifyOrder/createBill/BillItem.vue'
import listComp from '@/components/common/ListComp.vue'
import itemRowEditPop from '@/components/unifyOrder/common/itemRowEditPop.vue'
import itemSearchPop from '@/components/unifyOrder/common/itemSearchPop.vue'
import quickAccessPop from '@/components/unifyOrder/common/quickAccessPop.vue'
import itemCompletePop from '@/components/unifyOrder/common/itemCompletePop.vue'
export default {
	name: 'unifyOrderDetails',
	components: {
		billInfo,
		billItem,
		listComp,
		itemRowEditPop,
		itemSearchPop,
		quickAccessPop,
		itemCompletePop
	},
	data () {
		return {
			query: this.$route.query,
			billInfoData: {},
			currentDate: new Date(),
			datePickerShow: false,
			datePickerType: '',
			billTypeList: [],
			billTypePopShow: false,
			billItemList: [],
			itemRowEditPopShow: false,
			itemEditRowData: {},
			unitActionShow: false,
			unitActions: [],
			itemInputFocusing: false,
			itemSearchPopShow: false,
			itemCompletePopShow: false,
			searchItem: [],
			completeItem: [],
			quickAccessPopShow: false,
			checkAllItemFlag: false
		}
	},
	created () {
		this.createBillDetails()
	},
	beforeRouteLeave (to, from, next) {
		if (this.itemInputFocusing) {
			this.$router.go(1)
			return false
		}
		if (to.path === '/unifyOrder' && this.billInfoData.billState === 0) {
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
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId,
			sysDZCManyLower: state => state.systemParams.sysDZCManyLower,
			sysPointSize: 'sysPointSize'
		}),
		// {{{能否编辑
		/**
		 * 按钮可显示的前提是拥有权限
		 * 0：未审核； 1：已审核
		 * 0：未称重； 1：待称重； 2：称重中； 3：已称重
		 * 审核：未称重或已称重并且未审核
		 * 保存：未称重或已称重并且未审核
		 * 反审：未称重或已称重并且已审核
		 * 生成退货单：已审核（未称重或已称重）
		 * 编辑主单据信息与明细：未称重或已称重并且未审核
		 **/
		isBillState (state) {
			return (state) => {
				if (Object.prototype.toString.call(state) === '[object Array]') {
					return state.includes(this.billInfoData.billState)
				} else {
					return this.billInfoData.billState === state
				}
			}
		},
		isWeightState (state) {
			return (state) => {
				if (Object.prototype.toString.call(state) === '[object Array]') {
					return state.includes(this.billInfoData.weightState)
				} else {
					return this.billInfoData.weightState === state
				}
			}
		},
		isAutoState (state) {
			return (state) => {
				if (Array.isArray(state)) {
					return state.includes(this.billInfoData.autoType)
				} else {
					return this.billInfoData.autoType === state
				}
			}
		}
	},
	methods: {
		createBillDetails () {
			return new Promise(resolve => {
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/distributioninbills/${this.query.billId}`
				}).then(res => {
					this.billInfoData = res.storeBills[0]
					this.billItemList = this.filterStoreItem(res.storeBills[0].details)
					let checkLength = this.billItemList.reduce((pre, cur) => {
						let arr = cur.details.filter(item => {
							return item.checkFlag === '1'
						})
						return pre + arr.length
					}, 0)
					if (checkLength === res.storeBills[0].details.length) {
						this.checkAllItemFlag = true
					}
					resolve(res)
				})
			})
		},
		filterStoreItem (data) {
			data.forEach(dataItem => {
				let amount = parseFloat(dataItem.busUnitInAmount)
				if (amount) {
					// 数量不为0，反算单价，便于后期计算
					dataItem.price = this.toFixedNumberSize(dataItem.inMoney / dataItem.busUnitInAmount)
					dataItem.busUnitInAmount = this.toFixedNumberSize(amount)
				} else {
					// 数量为0，反算单价，便于后期计算
					dataItem.price = this.toFixedNumberSize(dataItem.price)
				}
				dataItem.inMoney = this.toFixedNumberSize(dataItem.inMoney)
				dataItem.rawAmount = this.toFixedNumberSize(dataItem.rawAmount)
				dataItem.taxInMoney = this.toFixedNumberSize(dataItem.taxInMoney)
				dataItem.inMoneyWithTax = this.toFixedNumberSize(dataItem.inMoneyWithTax)
			})
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
		onArriveDateClick () {
			this.datePickerShow = true
			this.datePickerType = 'arrive'
		},
		onBusinessDateClick () {
			this.datePickerShow = true
			this.datePickerType = 'business'
		},
		dateConfirmhandle (date) {
			let time = date.getTime()
			if (this.datePickerType === 'arrive') {
				this.billInfoData.arriveDate = time
			} else {
				this.billInfoData.businessDate = time
			}
			this.datePickerShow = false
		},
		selectBillType (item) {
			this.billInfoData.businessTypeDTO = item
		},
		searchBillType (keyword) {
			this.getBillTypeListData(keyword).then(res => {
				this.billTypeList = res.businessTypes
			})
		},
		getBillTypeListData (keyword) {
			return new Promise(resolve => {
				let params = {
					m: 'list4DistributionInBill',
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
		onItemEdit (itemData) {
			this.itemEditRowData = itemData
			this.itemRowEditPopShow = true
		},
		onEditRowConfirm (item) {
			this.billItemList.forEach(storeItem => {
				let index = storeItem.details.findIndex(detailsItem => {
					return detailsItem.id === item.id
				})
				if (~index) {
					storeItem.details[index] = item
				}
			})
		},
		onSaveClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要保存该单据吗?'
			}).then(() => {
				let params = this.getSaveParams()
				if (!params) {
					return false
				}
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/distributioninbills/${this.query.billId}`,
					data: params,
					query: {
						userId: this.loginerId,
						m: 'modify'
					}
				}).then(res => {
					this.createBillDetails().then(() => {
						this.$fxToast.success('保存成功')
					})
				})
			}).catch(() => {
			})
		},
		onExpressClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要审核该单据吗?'
			}).then(() => {
				let params = this.getSaveParams()
				if (!params) {
					return false
				}
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/distributioninbills/${this.query.billId}`,
					data: params,
					query: {
						userId: this.loginerId,
						m: 'editAndCheck'
					}
				}).then(res => {
					this.createBillDetails().then(() => {
						this.$fxToast.success('审核成功')
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
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/distributioninbills/${this.query.billId}`,
					data: params,
					query: {
						userId: this.loginerId,
						m: 'unCheck'
					}
				}).then(res => {
					this.createBillDetails().then(() => {
						this.$fxToast.success('反审成功')
					})
				})
			}).catch(() => {
			})
		},
		// {{{称重
		onWeightClick () {
			if (this.isAutoState(1)) {
				this.$fxToast.success('单据是差异反库生成的入库单，不允许称重')
			} else {
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
							url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/distributioninbills/${this.query.billId}/users/${this.loginerId}`,
							data: params,
							query: {
								userId: this.loginerId,
								m: 'weighBill'
							}
						}).then(res => {
							this.createBillDetails().then(() => {
								this.$fxToast.success('下发称重成功')
							})
						})
					}).catch(() => {
					})
				})
			}
		},
		onUnWeightClick () {
			this.checkHasDetails().then(() => {
				let msg = '确定要取消称重吗?'
				if (this.billInfoData.weighState === 2) {
					msg = '称重中的单据，取消称重后电子秤可以继续称重并传回数据！确定要取消称重吗'
				}
				this.$dialog.confirm({
					title: '提示',
					message: msg
				}).then(() => {
					this.$fxHttp.requestPut({
						url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/distributioninbills/${this.query.billId}/users/${this.loginerId}`,
						query: {
							userId: this.loginerId,
							m: 'unWeighBill'
						}
					}).then(res => {
						this.createBillDetails().then(() => {
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
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/distributioninbills/${this.query.billId}/users/${this.loginerId}`,
					query: {
						userId: this.loginerId,
						m: 'endWeighBill'
					}
				}).then(res => {
					this.createBillDetails().then(() => {
						this.$fxToast.success('结束称重成功')
					})
				})
			}).catch(() => {
			})
		},
		// }}}
		checkHasDetails () {
			return new Promise(resolve => {
				let itemDetails = []
				this.billItemList.forEach(item => {
					itemDetails.push(...item.details)
				})
				let items = itemDetails.filter(item => {
					return item.changeType !== 'del'
				})
				if (items.length === 0) {
					this.$fxToast.fail('单据明细不能为空')
				} else {
					resolve()
				}
			})
		},
		getSaveParams () {
			let itemDetails = []
			this.billItemList.forEach(item => {
				itemDetails.push(...item.details)
			})
			let delItems = itemDetails.filter(item => {
				return item.changeType === 'del'
			})
			if (delItems.length === itemDetails.length) {
				this.$fxToast.fail('单据明细不能为空！')
				return false
			}
			let editItems = itemDetails.filter(item => {
				return item.changeType === 'edit'
			})
			let params = Object.assign(this.billInfoData, {
				detailDel: delItems.length > 0 ? delItems : null,
				detailMdf: editItems.length > 0 ? editItems : null,
				details: []
			})
			return params
		},
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
			let oldUnitRate = item.unitDTO.value // 新增的品项明细获取之前单位换算值方式
			let newUnit = unit // 新增的品项明细获取之后单位换算值方式
			// 订货数量
			item.outOrderAmount = parseFloat(this.$fxUtils.toFixedSHW(item.outOrderAmount * oldUnitRate / newUnit.value, this.sysPointSize))
			item.rawAmount = parseFloat(this.$fxUtils.toFixedSHW(item.rawAmount * oldUnitRate / newUnit.value, this.sysPointSize))
			item.busUnitInAmount = parseFloat(this.$fxUtils.toFixedSHW(item.busUnitInAmount * oldUnitRate / newUnit.value, this.sysPointSize))
			item.checkAmount = parseFloat(this.$fxUtils.toFixedSHW(item.checkAmount * oldUnitRate / newUnit.value, this.sysPointSize))

			// 数量为 0 时不反算单价
			if (item.busUnitInAmount === 0) {
				item.price = parseFloat(this.$fxUtils.toFixedSHW(item.price * newUnit.value / oldUnitRate, this.sysPointSize))
			} else {
				item.price = parseFloat(this.$fxUtils.toFixedSHW(item.inMoney / item.busUnitInAmount, this.sysPointSize))
			}
			// 设置单位
			item.unitDTO = unit
		},
		getItemUnit (goodsId) {
			return new Promise(resolve => {
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/shopId/users/userId/goods/${goodsId}/units`
				}).then(res => {
					resolve(res.units)
				})
			})
		},
		onItemFocus () {
			this.$refs.billInfo.closeCollapse()
		},
		// {{{ 验收
		onCompleteClick () {
			this.getCheckList().then(res => {
				if (!res.billDetailGroup.length) {
					this.$fxToast.fail('该单据没有分组!')
					return false
				}
				this.itemCompletePopShow = true
				this.completeItem = JSON.parse(JSON.stringify(res.billDetailGroup))
			})
		},
		getCheckList () {
			return new Promise(resolve => {
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/distributioninbills/${this.query.billId}/groups`
				}).then(res => {
					resolve(res)
				})
			})
		},
		completeHandle (itemData, groupParam, billId) {
			return new Promise(resolve => {
				let url = ''
				let params = [{
					id: itemData.id,
					checkAmount: groupParam.groupAmount,
					inMoney: groupParam.data.inMoney,
					taxInMoney: groupParam.data.taxInMoney,
					inMoneyWithTax: groupParam.data.inMoneyWithTax,
					bill: {
						id: itemData.billId
					}
				}]
				if (groupParam.checkFlag === '1') {
					url = `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/distributionindetails?m=updateCheckAmount`
				} else {
					url = `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/distributioninbills/${billId}?m=accept&groupId=${groupParam.groupId}`
				}
				this.$fxHttp.requestPut({
					url,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		// }}}
		// {{{ 搜索
		onSearchClick () {
			this.itemSearchPopShow = true
			this.searchItem = JSON.parse(JSON.stringify(this.billItemList))
		},
		onSearchConfirm (searchItemData) {
			this.billItemList = searchItemData
		},
		// }}}
		/// {{{
		onQuickAccessClick () {
			this.quickAccessPopShow = true
			this.searchItem = JSON.parse(JSON.stringify(this.billItemList))
		}
		// }}}
	}
}
</script>

<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.inteledi-unify-details {
	height:100%
	background:$fxWhite
	display: flex
	flex-direction: column
	.details-bottom {
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
