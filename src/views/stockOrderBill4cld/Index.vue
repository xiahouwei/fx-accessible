<template>
	<w-app-page>
		<fx-order-list-header
			title="中心采购订货单"
			:showCheckBtn="$fxAuth('stockOrderBill4cld.check')"
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
			:leftTabState="filterState"
			:rightTabState="filterEdiSendState"
			leftTabType="checkStateCld"
			rightTabType="ediSendStateCld"
			@on-left-tab-select="onStateSelect"
			@on-right-tab-select="onSendStateSelect"
		>
		</fx-filter-tab>
		<fx-order-list-container
			v-model="pullRefreshLoading"
			:data="orderList"
			:loadFinished="loadFinished"
			@on-refresh="onPullRefresh"
			@on-loadMore="onLoadMore"
		>
			<orderBlock
				v-for="item in orderList"
				v-show="computedShowOrder(item.billStateFlag)"
				:key="item.id"
				:data="item"
				:showCheckBox="orderEditFlag"
				@on-click="onClickOrder(item)"
			>
			</orderBlock>
		</fx-order-list-container>
		<w-bottom-btn-bar>
			<w-button
				v-show="!orderEditFlag && $fxAuth('stockOrderBill4cld.add')"
				size="large"
				type="primary"
				@click="onCreateClick"
			>
				添加单据
			</w-button>
			<w-button
				v-show="orderEditFlag && $fxAuth('stockOrderBill4cld.check')"
				size="large"
				type="primary"
				@click="onExpressClick"
			>
				批量审核
			</w-button>
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
	</w-app-page>
</template>

<script>
import { mapState } from 'vuex'
import orderBlock from '@/components/stockOrderBill4cld/orderList/OrderBlock'
import filterPop from '@/components/stockOrderBill4cld/orderList/FilterPop'
const LIST_SIZE = 50

export default {
	name: 'stockOrderBill4cld',
	components: {
		orderBlock,
		filterPop
	},
	data () {
		return {
			routeParams: this.$route.params,
			orderList: [],
			filterPopShow: false,
			filterState: '0',
			filterEdiSendState: '0',
			listStart: 0,
			pullRefreshLoading: false,
			loadFinished: true,
			orderEditFlag: false,
			filterParams: {},
			checkActionSheetShow: false,
			checkActions: []
		}
	},
	beforeRouteEnter (to, from, next) {
		const initPath = ['/main/home', '/']
		const refreshPath = ['/stockOrderBill4cldDetails']
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
			businessDateStart: state => state.systemParams.businessDateStart,
			businessDateEnd: state => state.systemParams.businessDateEnd
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
			return this.$fxApi('stockOrderBill4cld.getOrderListData')({ data: params })
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
					billSendState: this.filterEdiSendState
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
				billSendState: this.filterEdiSendState,
				sourceId: filterParams.sourceId === '' ? null : filterParams.sourceId,
				rdcId: filterParams.rdcId === '' ? null : filterParams.rdcId,
				inHouseId: filterParams.inHouseId === '' ? null : filterParams.inHouseId,
				supplierId: filterParams.supplierId === '' ? null : filterParams.supplierId,
				shopId: filterParams.shopId === '' ? null : filterParams.shopId,
				goodsId: filterParams.goodsId === '' ? null : filterParams.goodsId,
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
				supplierId: filterParams.supplierId === '' ? null : filterParams.supplierId,
				shopId: filterParams.shopId === '' ? null : filterParams.shopId,
				inHouseId: filterParams.inHouseId === '' ? null : filterParams.inHouseId,
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
			this.filterState = item.id
			this.refreshOrderList()
		},
		onSendStateSelect (item) {
			this.filterEdiSendState = item.id
			this.refreshOrderList()
		},
		onClickOrder (item) {
			this.$router.push({
				path: 'stockOrderBill4cldDetails',
				query: {
					orderId: item.id
				}
			})
		},
		onCreateClick () {
			this.$router.push('createStockOrderBill4cld')
		},
		onOrderEditClick (val) {
			this.orderEditFlag = !val
		},
		onExpressClick () {
			let selectedArr = this.orderList.reduce((pre, cur) => {
				let arr = cur.checked ? pre.concat(cur.id) : pre
				return arr
			}, [])
			this.$fxCommon.orderFrontFunc('checkMulity', selectedArr)
				.then(this.expressBillList)
				.then(this.$fxApi('stockOrderBill4cld.checkMulity'))
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
			this.filterState = this.$fxStateMiddleware.getStateVal('stateCld')('all')
			this.filterEdiSendState = '0'
			this.orderEditFlag = false
		}
	}
}
</script>
