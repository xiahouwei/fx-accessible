<template>
	<div class="inteledi-sendOrder">
		<w-header title="盘点单" :border="true">
			<i slot="header-right" class="title-icon-search" @click="onSearchClick"></i>
		</w-header>
		<filterTab
			:state="computedState"
			:reCheckState="computedReCheckState"
			@on-state-click="onStateClick"
			@on-reCheckState-click="onReCheckStateClick"
		></filterTab>
		<div class="sendOrder-content">
			<van-pull-refresh v-model="pullRefreshLoading" v-show="orderList.length !== 0" class="sendOrder-list" @refresh="onPullRefresh">
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
						:key="item.id"
						:data="item"
						@on-click="onClickOrder(item)"
					></orderBlock>
				</van-list>
			</van-pull-refresh>
			<emptyBill v-show="orderList.length === 0"></emptyBill>
		</div>
		<div class="sendOrder-bottom">
			<van-button
				v-if="!orderEditFlag && $fxAuth('shopCheckBill.add')"
				class="add-btn fx-no-radius"
				type="primary"
				@click="onCreateClick"
			>添加单据</van-button>
		</div>
		<van-actionsheet
			v-model="stateActionShow"
			:actions="stateActions"
			cancel-text="取消"
			@select="onStateSelect"
		/>
		<van-actionsheet
			v-model="reCheckStateShow"
			:actions="reCheckStateActions"
			cancel-text="取消"
			@select="onReCheckStateSelect"
		/>
		<van-popup v-model="filterPopShow" position="right" class="fx-list-popup-full" :close-on-click-overlay="false" :lock-scroll="false">
			<filterPop :visibleFlag.sync="filterPopShow" :filterParams.sync="filterParams" @on-confirm="onFilterConfirm"></filterPop>
		</van-popup>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import emptyBill from '@/components/common/EmptyBill.vue'
import orderBlock from '@/components/checkBill/orderList/OrderBlock.vue'
import filterPop from '@/components/checkBill/orderList/FilterPop.vue'
import filterTab from '@/components/checkBill/orderList/FilterTab.vue'
const LIST_SIZE = 50
export default {
	name: 'checkBill',
	components: {
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
			filterReCheckState: null,
			reCheckStateShow: false,
			reCheckStateActions: [
				{ id: null, name: '全部' },
				{ id: '0', name: '未复审' },
				{ id: '1', name: '已复审' }
			],
			listStart: 0,
			pullRefreshLoading: false,
			listLoading: false,
			loadFinished: false,
			listError: false,
			orderEditFlag: false,
			filterParams: {}
		}
	},
	beforeRouteEnter (to, from, next) {
		const initPath = ['/main/home', '/']
		const refreshPath = ['/checkBillDetails']
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
		computedReCheckState () {
			return this.reCheckStateActions.find(item => {
				return item.id === this.filterReCheckState
			}).name
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
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/checkbills/users/${this.loginerId}`,
					data: params
				}).then(res => {
					this.listStart += LIST_SIZE
					this.listLoading = false
					if (res.checkBills.length < LIST_SIZE) {
						this.loadFinished = true
					}
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
					reCheckState: this.filterReCheckState
				}
				params = Object.assign(params, this.translateFilterParams(this.filterParams))
				this.orderListPostHandler(params).then(res => {
					this.orderList = res.checkBills
					resolve(res)
				})
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
				supplierId: filterParams.supplierId === '' ? null : filterParams.supplierId,
				sysBillCode: filterParams.billNo === '' ? null : filterParams.billNo
			}
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
				reCheckState: this.filterReCheckState,
				shopId: filterParams.shopId === '' ? null : filterParams.shopId,
				houseId: filterParams.storeId === '' ? null : filterParams.storeId,
				goodsId: filterParams.itemId === '' ? null : filterParams.itemId,
				businessType: filterParams.billTypeId === '' ? null : filterParams.billTypeId,
				supplierId: filterParams.supplierId === '' ? null : filterParams.supplierId,
				sysBillCode: filterParams.billNo === '' ? null : filterParams.billNo
			}
			this.orderListPostHandler(params).then(res => {
				this.orderList = res.checkBills
			})
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
				this.orderList.push(...res.checkBills)
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
		onReCheckStateClick () {
			this.reCheckStateShow = true
		},
		onReCheckStateSelect (item) {
			this.filterReCheckState = item.id
			this.reCheckStateShow = false
			this.refreshOrderList()
		},
		onClickOrder (item) {
			this.$router.push({
				path: 'checkBillDetails',
				query: {
					orderId: item.id
				}
			})
		},
		onCreateClick () {
			this.$router.push({
				path: 'creatCheckBill'
			})
		},
		restFilterParams () {
			this.filterParams = {}
			this.filterState = null
			this.filterReCheckState = null
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
.inteledi-sendOrder {
	height:100%
	background:$fxWhite
	display: flex
	flex-direction: column
	.title-icon-search,.title-icon-express,.title-icon-express-active {
		width:50px
		height:100%
		background-repeat:no-repeat
		background-position: center
		background-size: 16px
		display:inline-block
	}
	.title-icon-search {
		background-image:url('~images/icon/icon-search.png')
	}
	.title-icon-express {
		background-image:url('~images/icon/icon-express.png')
	}
	.title-icon-express-active {
		background-image:url('~images/icon/icon-express-ative.png')
	}
	.sendOrder-content {
		flex:1
		overflow:scroll
		.sendOrder-list {
			min-height: 526px
		}
	}
	.sendOrder-bottom {
		width:100%
		display: flex
		flex-direction: row
		.add-btn {
			width:100%
		}
	}
}
</style>

