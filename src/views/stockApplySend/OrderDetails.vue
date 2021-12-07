<template>
	<div class="inteledi-stockApplySend-details">
		<w-header title="分派明细编辑" titleFontSize="3.733vw" :border="true">
			<span slot="header-right" v-show="$fxAuth('stockApplySend.save')" class="save-btn" @click="onSaveClick">保存</span>
		</w-header>
		<orderItem
			ref="orderItem"
			:data="orderItemList"
			:itemInputFocusing.sync="itemInputFocusing"
			:searchKey.sync="searchWord"
			@on-supplier-click="onSupplierClick"
			@on-packing-click="onPackingClick"
			@on-search-change="onSearchChange"
			@on-filter-click="onFilterClick"
			@on-batch-click="onBatchSetClick"
		></orderItem>
		<div class="stockApplySend-bottom">
			<checkBox
				:visibleFlag="true"
				:checked="isSelectAll"
				class="order-checkbox"
				@on-checkbox-click="onSelectAllClick"
			>
			</checkBox>
			<span class="selectall-text">全选</span>
			<div class="send-btn-wrap">
				<van-button class="collect-btn" v-show="$fxAuth('stockApplySend.del')" type="default" round size="small" @click="onCollectSendClick">不分派</van-button>
				<van-button v-show="$fxAuth('stockApplySend.add')" type="primary" round size="small" @click="onSendClick">分派</van-button>
			</div>
		</div>
		<!--<van-popup v-model="packingPopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="packingPopShow"
				:data="packingList"
				:loadFinished="packingListLoadFinished"
				:loading.sync="onPackingLoading"
				title="包装信息检索"
				@on-search="searchPacking"
				@on-select="selectPacking"
				@on-load="onPackingLoad"
			></listComp>
		</van-popup>-->
		<van-popup v-model="supplierPopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="supplierPopShow"
				:data="supplierList"
				:loadFinished="true"
				title="供货商检索"
				@on-search="searchSupplier"
				@on-select="selectSupplier"
			></listComp>
		</van-popup>
		<van-popup
			v-model="filterPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<filterPop
				:visibleFlag.sync="filterPopShow"
				:filterParams.sync="filterParams"
				@on-confirm="onFilterConfirm"
			></filterPop>
		</van-popup>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import orderItem from '@/components/stockApplySend/createOrder/OrderItem.vue'
import listComp from '@/components/common/ListComp.vue'
import checkBox from '@/components/common/CheckBox.vue'
import filterPop from '@/components/stockApplySend/common/FilterPop.vue'
const ITEM_SIZE = 50
export default {
	name: 'stockApplySendDetails',
	components: {
		orderItem,
		listComp,
		checkBox,
		filterPop
	},
	data () {
		return {
			query: this.$route.query,
			orderItemList: [],
			formatterSysPointKey: ['waitAmount', 'busUnitAmount'],
			itemInputFocusing: false,
			itemSearchPopShow: false,
			searchWord: null,
			searchItem: [],
			supplier: '请选择',
			supplierId: '',
			supplierPopShow: false,
			supplierList: [],
			currentEditData: [],
			filterPopShow: false,
			filterParams: {},
			batchSetFlag: false
			/* packingPopShow: false,
			packingList: [],
			packingListStart: 0,
			onPackingLoading: false,
			packingListLoadFinished: false */
		}
	},
	created () {
		this.refreshOrderList()
	},
	beforeRouteLeave (to, from, next) {
		if (this.itemInputFocusing) {
			this.$router.go(1)
			return false
		}
		if (to.path === '/stockApplySend') {
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
			// sysShowPacking: state => state.systemParams.sysShowPacking,
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId
		}),
		isSelectAll () {
			let checkBillSelect = this.orderItemList.filter(item => {
				return !!item.checked
			})
			return checkBillSelect.length === this.orderItemList.length && this.orderItemList.length
		}
	},
	methods: {
		orderListPostHandler (filterParams = null) {
			return new Promise(resolve => {
				let params = {
					billId: this.query.orderIds.join(','),
					keyword: this.searchWord
				}
				params = Object.assign(params, filterParams)
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/stockApplies/users/${this.loginerId}`,
					query: {
						m: 'pageList4StockSendRight'
					},
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		refreshOrderList () {
			return new Promise(resolve => {
				this.orderListPostHandler().then(res => {
					let orderDetailsData = res.stockApplyBillDetails
					this.formatterSysPoint(orderDetailsData)
					this.orderItemList = orderDetailsData
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
		translateFilterParams (filterParams) {
			return this.$fxUtils.isEmptyObjSHW(filterParams) ? {} : {
				houseId: filterParams.storeId === '' ? null : filterParams.storeId,
				goodsId: filterParams.itemId === '' ? null : filterParams.itemId,
				supplierId: filterParams.supplierId === '' ? null : filterParams.supplierId,
				goodsSmallTypeId: filterParams.itemSmallTypeId === '' ? null : filterParams.itemSmallTypeId,
				goodsBigTypeId: filterParams.itemBigTypeId === '' ? null : filterParams.itemBigTypeId,
				goodsStyleId: filterParams.itemTypeId === '' ? null : filterParams.itemTypeId
			}
		},
		// {{{ 过滤
		onFilterClick () {
			this.filterPopShow = true
		},
		onFilterConfirm (filterParams) {
			const params = {
				houseId: filterParams.storeId === '' ? null : filterParams.storeId,
				goodsId: filterParams.itemId === '' ? null : filterParams.itemId,
				supplierId: filterParams.supplierId === '' ? null : filterParams.supplierId,
				goodsSmallTypeId: filterParams.itemSmallTypeId === '' ? null : filterParams.itemSmallTypeId,
				goodsBigTypeId: filterParams.itemBigTypeId === '' ? null : filterParams.itemBigTypeId,
				goodsStyleId: filterParams.itemTypeId === '' ? null : filterParams.itemTypeId
			}
			this.orderListPostHandler(params).then(res => {
				this.orderItemList = res.stockApplyBillDetails
			})
		},
		// }}}
		// {{{ 搜索
		onSearchChange () {
			this.itemSearchPopShow = true
			this.refreshOrderList()
		},
		onSearchConfirm (searchItemData) {
			this.orderItemList = searchItemData
		},
		// }}}
		// {{{包装信息
		onPackingClick (data) {
			this.currentEditData = [data]
			this.onPackingRefresh()
		},
		searchPacking (keyword) {
			this.onPackingRefresh(keyword)
		},
		selectPacking (item) {
			this.currentEditData.forEach(cur => {
				let orderItem = this.orderItemList.find(item => {
					return cur.id === item.id
				})
				orderItem.packingDTO = {
					id: item.id,
					name: item.name
				}
				this.$set(orderItem, 'changeType', 'edit')
			})
		},
		onPackingRefresh (keyword = null) {
			this.packingListStart = 0
			this.getPackingListData(keyword).then(res => {
				this.packingPopShow = true
				this.packingList = res.packing
			})
		},
		onPackingLoad (keyword = null) {
			this.getPackingListData(keyword).then(res => {
				this.packingList.push(...res.packing)
			})
		},
		getPackingListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					m: 'getGoodsPackingList',
					start: this.packingListStart,
					size: ITEM_SIZE,
					paged: true,
					keyword: keyword,
					goodsId: this.currentEditData[0].goodsDTO.id
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/goods`,
					data: params
				}).then(res => {
					this.onPackingLoading = false
					this.packingListStart += ITEM_SIZE
					if (res.packing.length < ITEM_SIZE) {
						this.packingListLoadFinished = true
					} else {
						this.packingListLoadFinished = false
					}
					resolve(res)
				})
			})
		},
		// }}}
		// }}}
		// {{{ 批量选择供货商
		onBatchSetClick () {
			let checkBillSelect = this.orderItemList.filter(item => {
				return !!item.checked
			})
			if (!checkBillSelect.length) {
				this.$fxToast.fail('请选择明细！')
				return false
			}
			this.currentEditData = checkBillSelect
			this.onSupplierRefresh()
			this.batchSetFlag = true
		},
		// }}}
		// {{{ 供货商
		onSupplierClick (data) {
			this.currentEditData = [data]
			this.onSupplierRefresh()
		},
		searchSupplier (keyword) {
			this.onSupplierRefresh(keyword)
		},
		selectSupplier (item) {
			this.currentEditData.forEach(cur => {
				let orderItem = this.orderItemList.find(item => {
					return cur.id === item.id
				})
				orderItem.supplierDTO = {
					id: item.id,
					name: item.name
				}
				orderItem.priceWithTax = item.priceWithTax
				this.$set(orderItem, 'changeType', 'edit')
			})
			if (this.batchSetFlag) {
				this.batchSetFlag = false
				this.onSaveClick()
			}
		},
		onSupplierRefresh (keyword = '') {
			this.getSupplierListData(keyword).then(res => {
				this.supplierList = res.suppliers
				this.supplierPopShow = true
			})
		},
		getSupplierListData (keyword = '') {
			return new Promise(resolve => {
				let selectedArr = this.currentEditData.reduce((pre, cur) => {
					return pre.concat(cur.goodsDTO.id)
				}, [])
				if (selectedArr.length === 0) {
					this.$fxToast.fail('请选择品项！')
					return false
				}
				let params = {
					m: 'getGoodsSupplier',
					sendGoodsId: selectedArr.join(','),
					shopId: this.currentEditData[0].shopDTO.id,
					detailId: this.currentEditData[0].id,
					keyword: keyword
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/stockApplies/${this.loginerId}`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		// }}}
		// {{{ 全选
		onSelectAllClick () {
			let flag = !this.isSelectAll
			this.orderItemList.forEach(item => {
				this.$set(item, 'checked', flag)
			})
		},
		// }}}
		// {{{保存、分派与放弃分派前验证包装信息
		validatePacking: function (dataArr, message1) {
			return new Promise(resolve => {
				if (!this.sysShowPacking) {
					resolve()
					return
				}
				let noPackingAry = dataArr.filter(item => {
					if ((item.shopDTO.organType === 1 || item.shopDTO.organType === 2) && !item.packingDTO) {
						return item
					}
				})
				if (noPackingAry.length) {
					let message = ''
					noPackingAry.forEach(noPackingItem => {
						message += '品项:' + noPackingItem.goodsDTO.name + '与仓库:' + noPackingItem.houseDTO.name + '，'
					})
					this.$dialog.alert({
						title: '提示',
						message: message + ' 无有效包装信息, ' + message1 + '失败！'
					})
					return false
				} else {
					resolve()
				}
			})
		},
		// }}}
		// {{{保存、分派与放弃分派前验证供货商
		validateSupplier: function (dataArr, message1) {
			return new Promise(resolve => {
				let noSupplierAry = dataArr.filter(item => {
					if (!item.supplierDTO) {
						return item
					}
				})
				if (noSupplierAry.length) {
					let message = ''
					noSupplierAry.forEach(noSupplierItem => {
						message += '品项:' + noSupplierItem.goodsDTO.name + '与仓库:' + noSupplierItem.houseDTO.name + '，'
					})
					this.$dialog.alert({
						title: '提示',
						message: message + ' 无有效供货商, ' + message1 + '失败！'
					})
					return false
				} else {
					resolve()
				}
			})
		},
		// }}}
		// {{{保存、分派与放弃分派前验证供货商 无supplierid的先走保存逻辑
		validateSaveSupplier: function (dataArr) {
			return new Promise(resolve => {
				/* let noSupplierAry = dataArr.filter(item => {
					if (!item.supplierDTO.code) {
						return item
					}
				}) */
				if (dataArr.length) {
					let params = {
						details: dataArr
					}
					this.saveHandler(params).then(() => {
						resolve()
					})
				} else {
					resolve()
				}
			})
		},
		// }}}
		// {{{保存
		onSaveClick () {
			let changeArr = this.orderItemList.filter(item => {
				return item.changeType === 'edit'
			})
			if (changeArr.length === 0) {
				this.$fxToast.fail('请修改品项！')
				return false
			}
			// Promise.all([this.validateSupplier(changeArr, '保存'), this.validatePacking(changeArr, '保存')]).then(() => {
			this.validateSupplier(changeArr, '保存').then(() => {
				this.$dialog.confirm({
					title: '提示',
					message: '确定要保存吗?'
				}).then(() => {
					let params = this.getSaveParams()
					this.saveHandler(params).then(res => {
						this.refreshOrderList().then(() => {
							this.$dialog.alert({
								title: '提示',
								message: res.message
							})
						})
					})
				})
			})
		},
		saveHandler (selectedArr) {
			return new Promise(resolve => {
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/stockApplies/users/${this.loginerId}`,
					data: selectedArr,
					query: {
						m: 'saveRigthSend'
					}
				}).then(res => {
					resolve(res)
				})
			})
		},
		// }}}
		// {{{分派
		// 未被保存过的supplierid在明细表中是没保存的，supplier是查出来的，所以必须先保存未被保存过的明细才可分派与放弃分派
		onSendClick () {
			let selectedArr = this.orderItemList.filter(item => {
				return item.checked
			})
			if (selectedArr.length === 0) {
				this.$fxToast.fail('请选择品项！')
				return false
			}
			// Promise.all([this.validateSupplier(selectedArr, '分派'), this.validatePacking(selectedArr, '分派')]).then(() => {
			this.validateSupplier(selectedArr, '分派').then(() => {
				this.validateSaveSupplier(selectedArr).then(() => {
					this.$dialog.confirm({
						title: '提示',
						message: '确定要分派吗?'
					}).then(() => {
						let param = {
							details: selectedArr
						}
						this.sendHandler(param).then(res => {
							this.refreshOrderList().then(() => {
								this.$dialog.alert({
									title: '提示',
									message: res.message
								})
							})
						})
					})
				})
			})
		},
		sendHandler (selectedArr) {
			return new Promise(resolve => {
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/stockApplies/users/${this.loginerId}`,
					data: selectedArr,
					query: {
						m: 'assignRight'
					}
				}).then(res => {
					resolve(res)
				})
			})
		},
		// }}}
		// {{{ 不分派
		onCollectSendClick () {
			let selectedArr = this.orderItemList.filter(item => {
				return item.checked
			})
			if (selectedArr.length === 0) {
				this.$fxToast.fail('请选择品项！')
				return false
			}
			// Promise.all([this.validateSupplier(selectedArr, '放弃分派'), this.validatePacking(selectedArr, '放弃分派')]).then(() => {
			this.validateSupplier(selectedArr, '放弃分派').then(() => {
				this.validateSaveSupplier(selectedArr).then(() => {
					this.$dialog.confirm({
						title: '提示',
						message: '确定要放弃分派吗?'
					}).then(() => {
						let param = {
							details: selectedArr
						}
						this.collectSendHandler(param).then(res => {
							this.refreshOrderList().then(() => {
								this.$dialog.alert({
									title: '提示',
									message: res.message
								})
							})
						})
					})
				})
			})
		},
		collectSendHandler (selectedArr) {
			return new Promise(resolve => {
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/stockApplies/users/${this.loginerId}`,
					data: selectedArr,
					query: {
						m: 'noAssignRight'
					}
				}).then(res => {
					resolve(res)
				})
			})
		},
		// }}}
		getSaveParams () {
			let itemDetails = []
			this.orderItemList.forEach(item => {
				itemDetails.push(item)
			})
			let editItems = itemDetails.filter(item => {
				return item.changeType === 'edit'
			})
			let params = {
				details: editItems.length > 0 ? editItems : null
			}
			return params
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.inteledi-stockApplySend-details {
	height:100%
	background:$fxWhite
	display: flex
	flex-direction: column
	.save-btn {
		color: $fxBlue
		padding-right: 15px
	}
	.stockApplySend-bottom {
		display: flex
		flex-direction: row
		padding: 10px
		padding-left: 26px
		.order-checkbox {
			padding-top: 4px
		}
		.selectall-text {
			padding: 6px 0 0 10px
		}
		.send-btn-wrap {
			flex: 1
			text-align: right
			.collect-btn {
				margin-right: 10px
			}
		}
	}
}
</style>
