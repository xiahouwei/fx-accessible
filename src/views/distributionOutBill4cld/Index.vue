<template>
	<w-app-page>
		<fx-order-list-header
			title="中心统配出库单"
			:showCheckBtn="$fxAuth('distributionOutBill4cld.check')"
			:checkBtnActive="orderEditFlag"
			:showSearchBtn="!orderEditFlag"
			:showSelectAllBtn="orderEditFlag"
			:selectAllBtnActive="isSelectAll"
			@on-check-click="onOrderEditClick"
			@on-search-click="onSearchClick"
			@on-selectAll-click="onSelectAllClick"
		>
		</fx-order-list-header>
		<fx-filter-tab
			:leftTabState="filterStateAndRestate"
			:rightTabState="filterSortingState"
			leftTabType="checkAndRecheckStateCld"
			rightTabType="sortingStateCld"
			@on-left-tab-select="onStateSelect"
			@on-right-tab-select="onSortingSelect"
		></fx-filter-tab>
		<fx-order-list-container
			v-model="pullRefreshLoading"
			:data="orderList"
			:loadFinished="loadFinished"
			@on-refresh="onPullRefresh"
			@on-loadMore="onLoadMore">
			<orderBlock
				v-for="item in orderList"
				v-show="computedShowOrder(item.billStateFlag)"
				:key="item.id"
				:data="item"
				:showCheckBox="orderEditFlag"
				@on-click="onClickOrder(item)"
			></orderBlock>
		</fx-order-list-container>
		<w-bottom-btn-bar>
			<w-button
				v-show="!orderEditFlag && $fxAuth('distributionOutBill4cld.add')"
				size="large"
				type="primary"
				@click="onCreateClick"
			>添加单据
			</w-button>
			<w-button
				v-show="orderEditFlag && $fxAuth('distributionOutBill4cld.check')"
				size="large"
				type="primary"
				@click="onExpressClick"
			>批量审核</w-button>
			<w-button
				v-show="orderEditFlag && $fxAuth('distributionOutBill4cld.sorting')"
				size="large"
				type="info"
				@click="onSortingClick"
			>批量分拣</w-button>
		</w-bottom-btn-bar>
		<van-popup
			v-model="filterPopShow"
			v-fx-history-back="filterPopShow"
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
		<w-action-sheet
			v-fx-history-back="checkActionSheetShow"
			ref="checkActionSheet"
			v-model="checkActionSheetShow"
			:actions="checkActions"
		></w-action-sheet>
		<w-action-sheet
			v-fx-history-back="sortingActionSheetShow"
			ref="sortingActionSheet"
			v-model="sortingActionSheetShow"
			:actions="sortingCheckActions"
		></w-action-sheet>
	</w-app-page>
</template>

<script>
import { mapState } from 'vuex'
import orderBlock from '@/components/distributionOutBill4cld/orderList/OrderBlock.vue'
import filterPop from '@/components/distributionOutBill4cld/orderList/FilterPop.vue'
const LIST_SIZE = 50
export default {
	name: 'distributionOutBill4cld',
	components: {
		orderBlock,
		filterPop
	},
	data () {
		return {
			routeParams: this.$route.params,
			orderList: [],
			filterPopShow: false,
			filterStateAndRestate: '0',
			filterState: '0',
			filterBillReState: null,
			filterSortingState: null,
			listStart: 0,
			pullRefreshLoading: false,
			// 后端暂时不支持分页加载,此变量不因返回数据length更改
			loadFinished: true,
			orderEditFlag: false,
			filterParams: {},
			checkActionSheetShow: false,
			checkActions: [],
			sortingActionSheetShow: false,
			sortingCheckActions: this.$fxStateMiddleware.getStateList('sortingState')
		}
	},
	beforeRouteEnter (to, from, next) {
		const initPath = ['/main/home', '/']
		const refreshPath = ['/distributionOutBill4cldDetails']
		if (initPath.includes(from.path)) {
			next(vm => {
				vm.restFilterParams()
				vm.refreshOrderList()
			})
		} else if (refreshPath.includes(from.path)) {
			next(vm => {
				vm.refreshOrderList()
			})
		} else {
			next()
		}
	},
	computed: {
		...mapState({
			billListPostParams: 'billListPostParams',
			businessDateStart: state => state.systemParamsCld.businessDateStart,
			businessDateEnd: state => state.systemParamsCld.businessDateEnd,
			disOut_setDate4Check: state => state.systemParamsCld.disOut_setDate4Check
		}),
		computedShowOrder (billStateFlag) {
			return (billStateFlag) => {
				return !this.orderEditFlag || !this.$fxStateMiddleware.stateIs('stateCld')('checked')(billStateFlag)
			}
		},
		isSelectAll () {
			return this.$fxCommon.orderListIsSelectAll(() => {
				return this.orderList.filter(item => {
					return !this.$fxStateMiddleware.stateIs('stateCld')('checked')(item.billStateFlag)
				})
			})
		}
	},
	methods: {
		orderListPostHandler (params) {
			this.$store.commit({
				type: 'SETSTATE',
				billListPostParams: params
			})
			return this.$fxApi('distributionOutBill4cld.getOrderListData')({ data: params })
		},
		refreshOrderList () {
			return new Promise(resolve => {
				this.listStart = 0
				let params = {
					start: this.listStart,
					size: LIST_SIZE,
					paged: true,
					businessDateStart: this.businessDateStart,
					businessDateEnd: this.businessDateEnd,
					billStateFlag: this.filterState,
					reCheckState: this.filterBillReState,
					sortingState: this.filterSortingState
				}
				params = Object.assign(params, this.translateFilterParams(this.filterParams))
				this.orderListPostHandler(params).then(res => {
					this.orderList = res.storeBills
					resolve(res)
				})
			})
		},
		onFilterConfirm (filterParams) {
			this.listStart = 0
			const params = {
				start: this.listStart,
				size: LIST_SIZE,
				paged: true,
				businessDateStart: filterParams.beginDate,
				businessDateEnd: filterParams.endDate,
				billStateFlag: this.filterState,
				reCheckState: this.filterBillReState,
				sortingState: this.filterSortingState,
				rdcId: filterParams.rdcId === '' ? null : filterParams.rdcId,
				inShopId: filterParams.inShopId === '' ? null : filterParams.inShopId,
				houseId: filterParams.houseId === '' ? null : filterParams.houseId,
				goodsId: filterParams.goodsId === '' ? null : filterParams.goodsId,
				businessType: filterParams.billTypeId === '' ? null : filterParams.billTypeId,
				sysBillCode: filterParams.billNo === '' ? null : filterParams.billNo
			}
			this.orderListPostHandler(params).then(res => {
				this.orderList = res.storeBills
			})
		},
		translateFilterParams (filterParams) {
			return this.$fxUtils.isEmptyObjSHW(filterParams) ? {} : {
				businessDateStart: filterParams.beginDate,
				businessDateEnd: filterParams.endDate,
				rdcId: filterParams.rdcId === '' ? null : filterParams.rdcId,
				inShopId: filterParams.inShopId === '' ? null : filterParams.inShopId,
				houseId: filterParams.houseId === '' ? null : filterParams.houseId,
				goodsId: filterParams.goodsId === '' ? null : filterParams.goodsId,
				businessType: filterParams.billTypeId === '' ? null : filterParams.billTypeId,
				sysBillCode: filterParams.billNo === '' ? null : filterParams.billNo
			}
		},
		onPullRefresh () {
			this.refreshOrderList().then(res => {
				this.pullRefreshLoading = false
			})
		},
		onLoadMore () {
			let params = Object.assign(this.billListPostParams, {
				start: this.listStart
			})
			this.orderListPostHandler(params).then(res => {
				this.orderList.push(...res.storeBills)
			})
		},
		onSearchClick () {
			this.filterPopShow = true
		},
		onStateSelect (item) {
			this.filterStateAndRestate = item.id
			this.filterState = item.state
			this.filterBillReState = item.rescheck
			this.refreshOrderList()
		},
		onSortingSelect (item) {
			this.filterSortingState = item.id
			this.refreshOrderList()
		},
		onClickOrder (item) {
			this.$router.push({
				path: 'distributionOutBill4cldDetails',
				query: {
					orderId: item.id
				}
			})
		},
		onCreateClick () {
			this.$router.push('createDistributionOutBill4cld')
		},
		onOrderEditClick (val) {
			this.orderEditFlag = !val
		},
		checkSorting () {
			return new Promise(resolve => {
				let message = ''
				const selectedArr = this.orderList.filter(item => {
					return item.checked && this.$fxStateMiddleware.stateIs('sortingState')(['sorting', 'unSorting'])(item.sortingState)
				})
				if (this.$fxAuth('distributionOutBill4cld.sorting') && selectedArr.length > 0) {
					message = '所选择单据中分拣状态含有待分拣或分拣中单据，若强制审核单据分拣状态自动更新为：“已分拣”，是否继续审核？'
				} else {
					message = '是否审核所选单据？审核后单据将不能修改，确定要审核吗？'
				}
				this.$dialog.confirm({ title: '提示', message }).then(resolve)
			})
		},
		onExpressClick () {
			let selectedArr = this.orderList.reduce((pre, cur) => {
				let arr = cur.checked ? pre.concat(cur.id) : pre
				return arr
			}, [])
			if (selectedArr.length === 0) {
				this.$fxToast.fail('请选择要审核的单据')
				return false
			}
			this.checkSorting().then(() => {
				this.checkExpressType({ data: selectedArr })
			})
		},
		checkExpressType (params) {
			if (this.disOut_setDate4Check === 0) {
				this.expressHandler(params)
			} else {
				if (this.disOut_setDate4Check === 1) {
					this.checkActions = [
						{ id: 1, name: '审核并重置业务日期' },
						{ id: 0, name: '审核但不重置业务日期' }
					]
				} else if (this.disOut_setDate4Check === 2) {
					this.checkActions = [
						{ id: 1, name: '审核并重置业务日期' }
					]
				}
				this.$refs.checkActionSheet.doSelect().then(res => {
					this.expressBusinessDateHandler(params, res.id)
				})
			}
		},
		expressHandler (params) {
			this.$fxApi('distributionOutBill4cld.checkMulity')(params)
				.then(res => {
					this.orderEditFlag = !this.orderEditFlag
					this.refreshOrderList().then(() => {
						this.$fxToast.success(res.message)
					})
				}).catch(() => {
					this.refreshOrderList()
				})
		},
		expressBusinessDateHandler (params, resetDateFlag) {
			this.$fxApi('distributionOutBill4cld.checkMulityByBusinessDate', resetDateFlag)(params)
				.then(res => {
					this.orderEditFlag = !this.orderEditFlag
					this.refreshOrderList().then(() => {
						this.$fxToast.success(res.message)
					})
				}).catch(() => {
					this.refreshOrderList()
				})
		},
		onSelectAllClick (val) {
			this.$fxCommon.orderListOnSelectAll(this.orderList, item => {
				return !this.$fxStateMiddleware.stateIs('stateCld')('checked')(item.billStateFlag)
			}, !val)
		},
		restFilterParams () {
			this.filterParams = {}
			this.filterStateAndRestate = this.$fxStateMiddleware.getStateVal('stateAndRecheckCld')('all')
			this.filterState = this.$fxStateMiddleware.getStateVal('stateCld')('all')
			this.filterBillReState = null
			this.filterSortingState = null
			this.orderEditFlag = false
		},
		onSortingClick () {
			let selectedArr = this.orderList.reduce((pre, cur) => {
				let arr = cur.checked ? pre.concat(cur.id) : pre
				return arr
			}, [])
			this.$fxCommon.orderFrontFunc('sortingMulity', selectedArr).then(params => {
				this.$refs.sortingActionSheet.doSelect().then(res => {
					this.sortingHandler(res.id, selectedArr).then(res => {
						this.refreshOrderList().then(() => {
							this.$fxToast.success(res.message)
						})
					})
				})
			})
		},
		sortingHandler (sortingState, billIds) {
			const params = {
				sortingState,
				billIds
			}
			return this.$fxApi('distributionOutBill4cld.sortingMulity')({ data: params })
		}
	}
}
</script>
