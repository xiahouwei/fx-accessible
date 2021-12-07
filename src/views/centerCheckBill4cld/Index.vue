<template>
	<w-app-page>
		<fx-order-list-header
			title="中心盘点单"
			:showCheckBtn="$fxAuth('centerCheckBill4cld.check')"
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
			leftTabType="checkAndRecheckStateSingle"
			rightTabType="weightStateCld"
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
				v-show="!orderEditFlag && $fxAuth('centerCheckBill4cld.add')"
				size="large"
				type="primary"
				@click="onCreateClick"
			>添加单据
			</w-button>
			<w-button
				v-show="orderEditFlag && $fxAuth('centerCheckBill4cld.check')"
				size="large"
				type="primary"
				@click="onExpressClick"
			>批量审核</w-button>
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
import orderBlock from '@/components/centerCheckBill4cld/orderList/OrderBlock.vue'
import filterPop from '@/components/centerCheckBill4cld/orderList/FilterPop.vue'
const LIST_SIZE = 50
export default {
	name: 'centerCheckBill4cld',
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
		const refreshPath = ['/centerCheckBill4cldDetails']
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
			return this.$fxApi('centerCheckBill4cld.getOrderListData')({ data: params })
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
					billStateFlag: this.filterStateAndRestate,
					weightState: this.filterSortingState
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
				billStateFlag: this.filterStateAndRestate,
				weightState: this.filterSortingState,
				rdcId: filterParams.rdcId === '' ? null : filterParams.rdcId,
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
			this.refreshOrderList()
		},
		onSortingSelect (item) {
			this.filterSortingState = item.id
			this.refreshOrderList()
		},
		onClickOrder (item) {
			this.$router.push({
				path: 'centerCheckBill4cldDetails',
				query: {
					orderId: item.id
				}
			})
		},
		onCreateClick () {
			this.$router.push('createCenterCheckBill4cld')
		},
		onOrderEditClick (val) {
			this.orderEditFlag = !val
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
			const params = {
				ids: selectedArr.join(',')
			}
			this.$dialog.confirm({ title: '提示', message: '确定要审核已选择单据吗?' }).then(() => {
				this.expressHandler(params)
			})
		},
		expressHandler (params) {
			this.$fxApi('centerCheckBill4cld.checkMulity')({ data: params })
				.then(res => {
					this.orderEditFlag = !this.orderEditFlag
					this.refreshOrderList().then(() => {
						this.$fxToast.success(res.message)
					})
				})
		},
		onSelectAllClick (val) {
			this.$fxCommon.orderListOnSelectAll(this.orderList, item => {
				return !this.$fxStateMiddleware.stateIs('stateCld')('checked')(item.billStateFlag)
			}, !val)
		},
		restFilterParams () {
			this.filterParams = {}
			this.filterStateAndRestate = this.$fxStateMiddleware.getStateVal('stateAndRecheckSingleCld')('all')
			this.filterSortingState = null
			this.orderEditFlag = false
		}
	}
}
</script>
