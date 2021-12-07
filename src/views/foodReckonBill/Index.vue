<template>
	<div class="inteledi-foodReckon">
		<w-header title="菜品预估单" :border="true">
			<headEditBtn
				v-show="$fxAuth('foodReckonBill.check')"
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
			:hasOrder="computedHasOrder"
			@on-state-click="onStateClick"
			@on-hasOrder-click="onHasOrderClick"
		></filterTab>
		<div class="foodReckon-content">
			<van-pull-refresh v-model="pullRefreshLoading" v-show="orderList.length !== 0" class="foodReckon-list" @refresh="onPullRefresh">
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
		<div class="foodReckon-bottom">
			<van-button
				v-show="!orderEditFlag && $fxAuth('foodReckonBill.add')"
				class="add-btn fx-no-radius"
				type="primary"
				@click="onCreateClick"
			>添加单据</van-button>
			<van-button
				v-show="orderEditFlag && $fxAuth('foodReckonBill.check')"
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
			v-model="hasOrderActionShow"
			:actions="hasOrderActions"
			cancel-text="取消"
			@select="onHasOrderSelect"
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
import orderBlock from '@/components/foodReckonBill/orderList/OrderBlock.vue'
import filterPop from '@/components/foodReckonBill/orderList/FilterPop.vue'
import filterTab from '@/components/foodReckonBill/orderList/FilterTab.vue'
const LIST_SIZE = 50
export default {
	name: 'foodReckonBill',
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
			filterHasOrder: null,
			hasOrderActionShow: false,
			hasOrderActions: [
				{ id: null, name: '全部' },
				{ id: '1', name: '是' },
				{ id: '0', name: '否' }
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
		const refreshPath = ['/foodReckonBillDetails']
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
		computedHasOrder () {
			return this.hasOrderActions.find(item => {
				return item.id === this.filterHasOrder
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
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/foodReckonBill/users/${this.loginerId}`,
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
					createDateStart: this.$fxCommon.orderFilterStartDate(),
					createateEnd: this.$fxCommon.orderFilterEndDate(),
					reckonDateStart: this.$fxCommon.orderFilterStartDate(),
					reckonDateEnd: this.$fxCommon.orderFilterEndDate(),
					billState: this.filterState,
					hasOrder: this.filterHasOrder
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
				createDateStart: filterParams.beginDate,
				createateEnd: filterParams.endDate,
				reckonDateStart: filterParams.beginReckonDate,
				reckonDateEnd: filterParams.endReckonDate,
				sysBillCode: filterParams.billNo === '' ? null : filterParams.billNo,
				billState: this.filterState,
				hasOrder: this.filterHasOrder,
				shopId: filterParams.shopId === '' ? null : filterParams.shopId
			}
			this.orderListPostHandler(params).then(res => {
				this.orderList = res.storeBills
			})
		},
		translateFilterParams (filterParams) {
			return this.$fxUtils.isEmptyObjSHW(filterParams) ? {} : {
				createDateStart: filterParams.beginDate,
				createateEnd: filterParams.endDate,
				reckonDateStart: filterParams.beginReckonDate,
				reckonDateEnd: filterParams.endReckonDate,
				sysBillCode: filterParams.billNo === '' ? null : filterParams.billNo,
				shopId: filterParams.shopId === '' ? null : filterParams.shopId
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
		onHasOrderClick () {
			this.hasOrderActionShow = true
		},
		onHasOrderSelect (item) {
			this.filterHasOrder = item.id
			this.hasOrderActionShow = false
			this.refreshOrderList()
		},
		onClickOrder (item) {
			this.$router.push({
				path: 'foodReckonBillDetails',
				query: {
					orderId: item.id
				}
			})
		},
		onCreateClick () {
			this.$router.push('createFoodReckonBill')
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
				this.expressBillList()
			})
		},
		expressBillList () {
			let selectedArr = this.orderList.reduce((pre, cur) => {
				let arr = cur.checked ? pre.concat(cur.id) : pre
				return arr
			}, [])
			if (selectedArr.length === 0) {
				return false
			}
			this.expressHandler(selectedArr).then(res => {
				this.orderEditFlag = !this.orderEditFlag
				this.refreshOrderList().then(() => {
					this.$fxToast.success(res.message)
				})
			}).catch(() => {
				this.refreshOrderList()
			})
		},
		expressHandler (selectedArr) {
			return new Promise((resolve, reject) => {
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/foodReckonBill/users/${this.loginerId}`,
					data: selectedArr,
					query: {
						m: 'batchCheck'
					}
				}).then(res => {
					resolve(res)
				}).catch(res => {
					reject(res)
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
			this.filterHasOrder = null
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
.inteledi-foodReckon {
	height:100%
	background:$fxWhite
	display: flex
	flex-direction: column
	.foodReckon-content {
		flex:1
		overflow:scroll
		.foodReckon-list {
			min-height: 526px
		}
	}
	.foodReckon-bottom {
		width:100%
		display: flex
		flex-direction: row
		.add-btn {
			width:100%
		}
	}
}
</style>

