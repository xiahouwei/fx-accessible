<template>
	<w-app-page class="inteledi-shopOrder">
		<w-header title="门店订货单" :border="true">
			<headEditBtn
				v-show="$fxAuth('shopOrderBill.batch')"
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
			:urgency="computedUrgency"
			@on-state-click="onStateClick"
			@on-urgency-click="onUrgencyClick"
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
		<w-bottom-btn-bar class="shopOrder-bottom">
			<van-button
				v-show="!orderEditFlag && $fxAuth('shopOrderBill.add')"
				class="add-btn fx-no-radius fx-btn"
				type="primary"
				@click="onCreateClick"
			>添加单据</van-button>
			<van-button
				v-show="orderEditFlag && $fxAuth('shopOrderBill.batch')"
				class="add-btn fx-no-radius fx-btn"
				type="primary"
				@click="onExpressClick"
			>批量审核</van-button>
		</w-bottom-btn-bar>
		<van-actionsheet
			v-model="stateActionShow"
			:actions="stateActions"
			cancel-text="取消"
			@select="onStateSelect"
		/>
		<van-actionsheet
			v-model="urgencyActionShow"
			:actions="urgencyActions"
			cancel-text="取消"
			@select="onUrgencySelect"
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
		<van-popup
			v-model="attachListPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<attachListPop
				:attachPopTitle="'附属列表'"
				:data="attachList"
				:visibleFlag.sync="attachListPopShow"
				@on-continue-check="expressBillList"
			></attachListPop>
		</van-popup>
	</w-app-page>
</template>

<script>
import { mapState } from 'vuex'
import headSearchBtn from '@/components/common/HeadSearchBtn.vue'
import headEditBtn from '@/components/common/HeadEditBtn.vue'
import headSelectAllBtn from '@/components/common/HeadSelectAllBtn.vue'
import emptyBill from '@/components/common/EmptyBill.vue'
import orderBlock from '@/components/shopOrder/orderList/OrderBlock.vue'
import filterPop from '@/components/shopOrder/orderList/FilterPop.vue'
import filterTab from '@/components/shopOrder/orderList/FilterTab.vue'
import attachListPop from '@/components/shopOrder/common/attachList.vue'
const LIST_SIZE = 50
export default {
	name: 'shopOrder',
	components: {
		headSearchBtn,
		headEditBtn,
		headSelectAllBtn,
		emptyBill,
		orderBlock,
		filterPop,
		filterTab,
		attachListPop
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
			filterUrgency: null,
			urgencyActionShow: false,
			urgencyActions: [
				{ id: null, name: '全部' },
				{ id: true, name: '加急' },
				{ id: false, name: '不加急' }
			],
			listStart: 0,
			pullRefreshLoading: false,
			listLoading: false,
			// 后端暂时不支持分页加载,此变量不因返回数据length更改
			loadFinished: true,
			listError: false,
			orderEditFlag: false,
			filterParams: {},
			attachList: [],
			attachListPopShow: false
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
		const refreshPath = ['/shopOrderDetails']
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
		computedUrgency () {
			return this.urgencyActions.find(item => {
				return item.id === this.filterUrgency
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
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/shoporders/users/${this.loginerId}`,
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
					urgentFlag: this.filterUrgency
				}
				params = Object.assign(params, this.translateFilterParams(this.filterParams))
				this.orderListPostHandler(params).then(res => {
					this.orderList = res.shopOrderBills
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
				arriveDateStart: filterParams.arriveBeginDate,
				arriveDateEnd: filterParams.arriveEndDate,
				billState: this.filterState,
				urgentFlag: this.filterUrgency,
				shopId: filterParams.shopId === '' ? null : filterParams.shopId,
				houseId: filterParams.storeId === '' ? null : filterParams.storeId,
				goodsId: filterParams.itemId === '' ? null : filterParams.itemId,
				businessType: filterParams.billTypeId === '' ? null : filterParams.billTypeId,
				sysBillCode: filterParams.billNo === '' ? null : filterParams.billNo
			}
			this.orderListPostHandler(params).then(res => {
				this.orderList = res.shopOrderBills
			})
		},
		translateFilterParams (filterParams) {
			return this.$fxUtils.isEmptyObjSHW(filterParams) ? {} : {
				businessDateStart: filterParams.beginDate,
				businessDateEnd: filterParams.endDate,
				arriveDateStart: filterParams.arriveBeginDate,
				arriveDateEnd: filterParams.arriveEndDate,
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
				this.orderList.push(...res.shopOrderBills)
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
		onUrgencyClick () {
			this.urgencyActionShow = true
		},
		onUrgencySelect (item) {
			this.filterUrgency = item.id
			this.urgencyActionShow = false
			this.refreshOrderList()
		},
		onClickOrder (item) {
			this.$router.push({
				path: 'shopOrderDetails',
				query: {
					orderId: item.id
				}
			})
		},
		onCreateClick () {
			this.$router.push('createShopOrder')
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
			if (this.$fxAuth('shopOrderBill.attachFlag') && this.$fxSysAuth('shopOrderBill.sysOrderGoodsAttachPlan')) {
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/shoporders/assistantGoods`,
					data: selectedArr
				}).then(res => {
					if (res.shopOrderBills.length) {
						this.attachListPopShow = true
						this.attachList = res.shopOrderBills
					} else {
						this.$dialog.confirm({
							title: '提示',
							message: '无可导入的附属明细，确定要审核单据吗？'
						}).then(() => {
							this.expressBillList()
						})
					}
				})
			} else {
				this.$dialog.confirm({
					title: '提示',
					message: '确定要审核所选单据?'
				}).then(() => {
					this.expressBillList()
				})
			}
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
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/shoporders/users/${this.loginerId}`,
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
			this.filterUrgency = null
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
	.shopOrder-content {
		flex:1
		overflow:scroll
		.shopOrder-list {
			min-height: 526px
		}
	}
	.shopOrder-bottom {
		.add-btn {
			width:100%
		}
	}
}
</style>

