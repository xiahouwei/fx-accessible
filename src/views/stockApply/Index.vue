<template>
	<div class="inteledi-shopOrder">
		<w-header title="采购申请单" :border="true">
			<headEditBtn
				v-show="$fxAuth('stockApplyBill.check')"
				slot="header-right"
				:active="orderEditFlag"
				@click="onOrderEditClick"
			></headEditBtn>
			<headSearchBtn v-show="!orderEditFlag" slot="header-right" @click="onSearchClick"></headSearchBtn>
			<headSelectAllBtn
				v-show="orderEditFlag"
				:active="isSelectAll"
				slot="header-right"
				@click="onSelectAllClick"
			></headSelectAllBtn>
		</w-header>
		<filterTab
			:state="computedState"
			:assignState="computedAssignState"
			@on-state-click="onStateClick"
			@on-assignState-click="onAssignStateClick"
		></filterTab>
		<div class="shopOrder-content">
			<van-pull-refresh v-model="pullRefreshLoading" v-show="orderList.length !== 0" class="shopOrder-list" @refresh="onPullRefresh">
				<van-list
					v-model="listLoading"
					:finished="loadFinished"
					finished-text="没有更多了"
					:error.sync="listError"
					error-text="请求失败，点击重新加载"
					@load="onLoadMore"
				>
					<orderBlock
						v-for="item in orderList"
						v-show="computedShowOrder(item.billState)"
						:key="item.id"
						:data="item"
						:showCheckBox="orderEditFlag"
						@on-click="onClickOrder(item)"
					></orderBlock>
				</van-list>
			</van-pull-refresh>
			<emptyBill v-show="orderList.length === 0"></emptyBill>
		</div>
		<div class="shopOrder-bottom">
			<van-button
				v-show="!orderEditFlag && $fxAuth('stockApplyBill.add')"
				class="add-btn fx-no-radius"
				type="primary"
				@click="onCreateClick"
			>添加单据</van-button>
			<van-button
				v-show="orderEditFlag && $fxAuth('stockApplyBill.check')"
				class="add-btn fx-no-radius"
				type="primary"
				@click="onExpressClick"
			>批量审核</van-button>
		</div>
		<van-actionsheet
			v-model="stateActionShow"
			:actions="stateActions"
			cancel-text="取消"
			@select="onStateSelect"
		/>
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
		<van-actionsheet
			v-model="assignStateActionShow"
			:actions="assignStateActions"
			cancel-text="取消"
			@select="onAssignStateSelect"
		/>
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
import headSearchBtn from '@/components/common/HeadSearchBtn.vue'
import headEditBtn from '@/components/common/HeadEditBtn.vue'
import headSelectAllBtn from '@/components/common/HeadSelectAllBtn.vue'
import emptyBill from '@/components/common/EmptyBill.vue'
import orderBlock from '@/components/stockApply/orderList/OrderBlock.vue'
import filterPop from '@/components/stockApply/orderList/FilterPop.vue'
import filterTab from '@/components/stockApply/orderList/FilterTab.vue'
const LIST_SIZE = 50
export default {
	name: 'stockApply',
	components: {
		headSearchBtn,
		headEditBtn,
		headSelectAllBtn,
		emptyBill,
		orderBlock,
		filterPop,
		filterTab
	},
	data () {
		return {
			orderList: [],
			filterPopShow: false,
			filterState: null,
			stateActionShow: false,
			stateActions: [
				{ id: null, name: '全部' },
				{ id: '0', name: '未审核' },
				{ id: '1', name: '已审核' }
			],
			filterAssignState: null,
			assignStateActionShow: false,
			assignStateActions: [
				{ id: null, name: '全部' },
				{ id: '0', name: '未完成' },
				{ id: '1', name: '进行中' },
				{ id: '2', name: '已完成' }
			],
			listStart: 0,
			pullRefreshLoading: false,
			listLoading: false,
			// 后端暂时不支持分页加载,此变量不因返回数据length更改
			loadFinished: true,
			listError: false,
			orderEditFlag: false,
			filterParams: {}
		}
	},
	beforeRouteLeave (to, from, next) {
		if (to.path === '/login') {
			next()
		} else if (this.filterPopShow) {
			this.filterPopShow = false
			this.$router.go(1)
			return false
		} else {
			next()
		}
	},
	beforeRouteEnter (to, from, next) {
		const initPath = ['/main/home', '/']
		const refreshPath = ['/stockApplyOrderDetails']
		if (initPath.includes(from.path)) {
			next(vm => {
				vm.restFilterParams()
				vm.restRouterParams(to.params)
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
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId
		}),
		computedState () {
			return this.stateActions.find(item => {
				return item.id === this.filterState
			}).name
		},
		computedAssignState () {
			return this.assignStateActions.find(item => {
				return item.id === this.filterAssignState
			}).name
		},
		computedShowOrder (billState) {
			return (billState) => {
				if (!this.orderEditFlag) {
					return true
				} else {
					return billState !== 1
				}
			}
		},
		isSelectAll () {
			let unCheckBill = this.orderList.filter(item => {
				return item.billState !== 1
			})
			if (unCheckBill.length === 0) return false
			let unCheckBillSelect = unCheckBill.filter(item => {
				return !!item.checked
			})
			return unCheckBillSelect.length === unCheckBill.length
		}
	},
	methods: {
		orderListPostHandler (params) {
			return new Promise(resolve => {
				this.$store.commit({
					type: 'SETSTATE',
					billListPostParams: params
				})
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/stockApplies/users/${this.loginerId}`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		refreshOrderList () {
			return new Promise(resolve => {
				this.listStart = 0
				let params = {
					start: this.listStart,
					size: LIST_SIZE,
					paged: true,
					businessDateStart: this.$fxCommon.orderFilterStartDate(),
					businessDateEnd: this.$fxCommon.orderFilterEndDate(),
					billState: this.filterState,
					assignState: this.filterAssignState
				}
				params = Object.assign(params, this.translateFilterParams(this.filterParams))
				this.orderListPostHandler(params).then(res => {
					this.orderList = res.stockApplyBills
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
				billState: this.filterState,
				assignState: this.filterAssignState,
				shopId: filterParams.shopId === '' ? null : filterParams.shopId,
				houseId: filterParams.storeId === '' ? null : filterParams.storeId,
				goodsId: filterParams.itemId === '' ? null : filterParams.itemId,
				businessType: filterParams.billTypeId === '' ? null : filterParams.billTypeId,
				sysBillCode: filterParams.billNo === '' ? null : filterParams.billNo
			}
			this.orderListPostHandler(params).then(res => {
				this.orderList = res.stockApplyBills
			})
		},
		translateFilterParams (filterParams) {
			return this.$fxUtils.isEmptyObjSHW(filterParams) ? {} : {
				businessDateStart: filterParams.beginDate,
				businessDateEnd: filterParams.endDate,
				shopId: filterParams.shopId === '' ? null : filterParams.shopId,
				houseId: filterParams.storeId === '' ? null : filterParams.storeId,
				goodsId: filterParams.itemId === '' ? null : filterParams.itemId,
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
				this.orderList.push(...res.stockApplyBills)
			})
		},
		onSearchClick () {
			this.filterPopShow = true
		},
		// {{{审核条件修改，查询单据
		onStateClick () {
			this.stateActionShow = true
		},
		onStateSelect (item) {
			this.filterState = item.id
			this.stateActionShow = false
			this.refreshOrderList()
		},
		// }}}
		// {{{分派条件修改，查询单据
		onAssignStateClick () {
			this.assignStateActionShow = true
		},
		onAssignStateSelect (item) {
			this.filterAssignState = item.id
			this.assignStateActionShow = false
			this.refreshOrderList()
		},
		// }}}

		onClickOrder (item) {
			this.$router.push({
				path: 'stockApplyOrderDetails',
				query: {
					orderId: item.id
				}
			})
		},
		onCreateClick () {
			this.$router.push('createStockApply')
		},
		onOrderEditClick () {
			this.orderEditFlag = !this.orderEditFlag
		},
		onExpressClick () {
			let selectedArr = this.orderList.reduce((pre, cur) => {
				let arr = cur.checked ? pre.concat(cur.id) : pre
				return arr
			}, [])
			if (selectedArr.length === 0) {
				return false
			}
			this.$dialog.confirm({
				title: '提示',
				message: '确定要审核所选单据?'
			}).then(() => {
				this.expressHandler(selectedArr).then(res => {
					this.orderEditFlag = !this.orderEditFlag
					this.refreshOrderList().then(() => {
						this.$fxToast.success(res.message)
					})
				})
			})
		},
		expressHandler (selectedArr) {
			return new Promise(resolve => {
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/stockApplies/users/${this.loginerId}`,
					data: selectedArr,
					query: {
						m: 'batchCheck'
					}
				}).then(res => {
					resolve(res)
				})
			})
		},
		onSelectAllClick () {
			let flag = !this.isSelectAll
			this.orderList.forEach(item => {
				if (item.billState !== 1) {
					this.$set(item, 'checked', flag)
				}
			})
		},
		restFilterParams () {
			this.filterParams = {}
			this.filterState = null
			this.filterAssignState = null
			this.orderEditFlag = false
		},
		restRouterParams (params) {
			if (!this.$fxUtils.isEmptyObjSHW(params)) {
				this.filterState = params.billState
			}
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.inteledi-shopOrder {
	height:100%
	background:$fxWhite
	display: flex
	flex-direction: column
	.shopOrder-content {
		flex:1
		overflow:scroll
		.shopOrder-list {
			min-height: 526px
		}
	}
	.shopOrder-bottom {
		width:100%
		display: flex
		flex-direction: row
		.add-btn {
			width:100%
		}
	}
}
</style>

