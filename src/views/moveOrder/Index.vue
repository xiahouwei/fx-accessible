<template>
	<div class="inteledi-shopOrder">
		<w-header title="调拨申请单" :border="true">
			<headEditBtn
				v-show="$fxAuth('shopMoveApplyBill.check')"
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
			:moveState="computedMoveState"
			@on-state-click="onStateClick"
			@on-moveState-click="onMoveStateClick"
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
				v-show="!orderEditFlag && $fxAuth('shopMoveApplyBill.add')"
				class="add-btn fx-no-radius"
				type="primary"
				@click="onCreateClick"
			>添加单据</van-button>
			<van-button
				v-show="orderEditFlag && $fxAuth('shopMoveApplyBill.check')"
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
		<van-actionsheet
			v-model="moveStateActionShow"
			:actions="moveStateActions"
			cancel-text="取消"
			@select="onMoveSateSelect"
		/>
		<van-popup v-model="filterPopShow" position="right" class="fx-list-popup-full" :close-on-click-overlay="false" :lock-scroll="false">
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
import orderBlock from '@/components/moveOrder/orderList/OrderBlock.vue'
import filterPop from '@/components/moveOrder/orderList/FilterPop.vue'
import filterTab from '@/components/moveOrder/orderList/FilterTab.vue'
const LIST_SIZE = 50
export default {
	name: 'moveOrder',
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
			filterMoveState: null,
			moveStateActionShow: false,
			moveStateActions: [
				{ id: null, name: '全部' },
				{ id: '0', name: '未处理' },
				{ id: '1', name: '同意' },
				{ id: '2', name: '拒绝' },
				{ id: '3', name: '等待处理' }
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
	beforeRouteEnter (to, from, next) {
		const initPath = ['/main/home', '/']
		const refreshPath = ['/moveOrderDetails']
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
		computedMoveState () {
			return this.moveStateActions.find(item => {
				return item.id === this.filterMoveState
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
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/shopmoveapplybills/users/${this.loginerId}`,
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
					moveState: this.filterMoveState
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
				billState: this.filterState,
				moveState: this.filterMoveState,
				outShopId: filterParams.outShopId === '' ? null : filterParams.outShopId,
				inShopId: filterParams.inShopId === '' ? null : filterParams.inShopId,
				houseId: filterParams.storeId === '' ? null : filterParams.storeId,
				goodsId: filterParams.itemId === '' ? null : filterParams.itemId
			}
			this.orderListPostHandler(params).then(res => {
				this.orderList = res.storeBills
			})
		},
		translateFilterParams (filterParams) {
			return this.$fxUtils.isEmptyObjSHW(filterParams) ? {} : {
				businessDateStart: filterParams.beginDate,
				businessDateEnd: filterParams.endDate,
				outShopId: filterParams.outShopId === '' ? null : filterParams.outShopId,
				inShopId: filterParams.inShopId === '' ? null : filterParams.inShopId,
				houseId: filterParams.storeId === '' ? null : filterParams.storeId,
				goodsId: filterParams.itemId === '' ? null : filterParams.itemId
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
		onStateClick () {
			this.stateActionShow = true
		},
		onStateSelect (item) {
			this.filterState = item.id
			this.stateActionShow = false
			this.refreshOrderList()
		},
		onMoveStateClick () {
			this.moveStateActionShow = true
		},
		onMoveSateSelect (item) {
			this.filterMoveState = item.id
			this.moveStateActionShow = false
			this.refreshOrderList()
		},
		onClickOrder (item) {
			this.$router.push({
				path: 'moveOrderDetails',
				query: {
					orderId: item.id
				}
			})
		},
		onCreateClick () {
			this.$router.push('createMoveOrder')
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
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/shopmoveapplybills/users/${this.loginerId}`,
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
			this.filterMoveState = null
			this.orderEditFlag = false
		},
		restRouterParams (params) {
			if (!this.$fxUtils.isEmptyObjSHW(params)) {
				this.filterState = params.billState
				this.filterMoveState = params.moveState ? params.moveState : null
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

