<template>
	<div class="inteledi-foodSamples">
		<w-header title="菜品留样" :border="true">
			<headSearchBtn
				slot="header-right"
				@click="onSearchClick"
			></headSearchBtn>
		</w-header>
		<filterTab
			:state="computedState"
			@on-state-click="onStateClick"
		></filterTab>
		<div class="foodSamples-content">
			<van-pull-refresh v-model="pullRefreshLoading" v-show="orderList.length !== 0" class="foodSamples-list" @refresh="onPullRefresh">
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
		<div class="foodSamples-bottom">
			<van-button
				v-show="$fxAuth('foodSamplBill.save')"
				class="add-btn fx-no-radius"
				type="primary"
				@click="onCreateClick"
			>添加留样</van-button>
		</div>
		<van-actionsheet
			v-model="stateActionShow"
			:actions="stateActions"
			cancel-text="取消"
			@select="onStateSelect"
		/>
		<van-popup v-model="filterPopShow" position="right" class="fx-list-popup-full" :close-on-click-overlay="false" :lock-scroll="false">
			<filterPop :visibleFlag.sync="filterPopShow" :filterParams.sync="filterParams" @on-confirm="onFilterConfirm"></filterPop>
		</van-popup>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import headSearchBtn from '@/components/common/HeadSearchBtn.vue'
import emptyBill from '@/components/common/EmptyBill.vue'
import orderBlock from '@/components/foodSamples/orderList/OrderBlock.vue'
import filterPop from '@/components/foodSamples/orderList/FilterPop.vue'
import filterTab from '@/components/foodSamples/orderList/FilterTab.vue'
const LIST_SIZE = 50
export default {
	name: 'foodSamples',
	components: {
		headSearchBtn,
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
				{ id: '0', name: '未处理' },
				{ id: '1', name: '已处理' }
			],
			listStart: 0,
			pullRefreshLoading: false,
			listLoading: false,
			loadFinished: true,
			listError: false,
			filterParams: {}
		}
	},
	beforeRouteEnter (to, from, next) {
		const initPath = ['/main/home', '/']
		const refreshPath = ['/foodSamplesDetails']
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
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId
		}),
		computedState () {
			return this.stateActions.find(item => {
				return item.id === this.filterState
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
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/foodsampls/users/${this.loginerId}`,
					data: params
				}).then(res => {
					this.listLoading = false
					/* this.listStart += LIST_SIZE
					if (res.foodSamples.length < LIST_SIZE) {
						this.loadFinished = true
					} */
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
					billState: this.filterState
				}
				params = Object.assign(params, this.translateFilterParams(this.filterParams))
				this.orderListPostHandler(params).then(res => {
					this.orderList = res.foodSamples
					resolve(res)
				})
			})
		},
		translateFilterParams (filterParams) {
			return this.$fxUtils.isEmptyObjSHW(filterParams) ? {} : {
				businessDateStart: filterParams.beginDate,
				businessDateEnd: filterParams.endDate,
				cookId: filterParams.chefId === '' ? null : filterParams.chefId,
				goodsMealsId: filterParams.mealsId === '' ? null : filterParams.mealsId,
				foodsId: filterParams.foodId === '' ? null : filterParams.foodId
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
				cookId: filterParams.chefId === '' ? null : filterParams.chefId,
				goodsMealsId: filterParams.mealsId === '' ? null : filterParams.mealsId,
				foodsId: filterParams.foodId === '' ? null : filterParams.foodId
			}
			this.orderListPostHandler(params).then(res => {
				this.orderList = res.foodSamples
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
				this.orderList.push(...res.foodSamples)
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
		onClickOrder (item) {
			this.$router.push({
				path: 'foodSamplesDetails',
				query: {
					orderId: item.id
				}
			})
		},
		onCreateClick () {
			this.$router.push('createFoodSamples')
		},
		restFilterParams () {
			this.filterParams = {}
			this.filterState = null
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.inteledi-foodSamples {
	height:100%
	background:$fxWhite
	display: flex
	flex-direction: column
	.foodSamples-content {
		flex:1
		overflow:scroll
		.foodSamples-list {
			min-height: 526px
		}
	}
	.foodSamples-bottom {
		width:100%
		display: flex
		flex-direction: row
		.add-btn {
			width:100%
		}
	}
}
</style>

