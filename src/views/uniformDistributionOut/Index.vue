<template>
	<div class="inteledi-uniformDistributionOut">
		<w-header title="统配出库单" :border="true">
			<headEditBtn
				v-show="$fxAuth('distributionOutBill.check')"
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
			:billReState="computedBillReState"
			@on-state-click="onStateClick"
			@on-billReState-click="onBillReStateClick"
		></filterTab>
		<div class="uniformDistributionOut-content">
			<van-pull-refresh v-model="pullRefreshLoading" v-show="orderList.length !== 0" class="uniformDistributionOut-list" @refresh="onPullRefresh">
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
		<div class="uniformDistributionOut-bottom">
			<van-button
				v-show="!orderEditFlag && $fxAuth('distributionOutBill.add')"
				class="add-btn fx-no-radius"
				type="primary"
				@click="onCreateClick"
			>添加单据</van-button>
			<van-button
				v-show="orderEditFlag && $fxAuth('distributionOutBill.check')"
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
			v-model="billReStateActionShow"
			:actions="billReStateActions"
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
	</div>
</template>

<script>
import { mapState } from 'vuex'
import headSearchBtn from '@/components/common/HeadSearchBtn.vue'
import headEditBtn from '@/components/common/HeadEditBtn.vue'
import headSelectAllBtn from '@/components/common/HeadSelectAllBtn.vue'
import emptyBill from '@/components/common/EmptyBill.vue'
import orderBlock from '@/components/uniformDistributionOut/orderList/OrderBlock.vue'
import filterPop from '@/components/uniformDistributionOut/orderList/FilterPop.vue'
import filterTab from '@/components/uniformDistributionOut/orderList/FilterTab.vue'
const LIST_SIZE = 50
export default {
	name: 'uniformDistributionOut',
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
			filterBillReState: null,
			billReStateActionShow: false,
			billReStateActions: [
				{ id: null, name: '全部' },
				{ id: '0', name: '未复审' },
				{ id: '1', name: '已复审' }
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
		const refreshPath = ['/uniformDistributionOutDetails']
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
		computedBillReState () {
			return this.billReStateActions.find(item => {
				return item.id === this.filterBillReState
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
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/distributionOutBills/users/${this.loginerId}`,
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
					reCheckState: this.filterBillReState
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
				arriveDateStart: filterParams.arriveBeginDate,
				arriveDateEnd: filterParams.arriveEndDate,
				billState: this.filterState,
				reCheckState: this.filterBillReState,
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
				arriveDateStart: filterParams.arriveBeginDate,
				arriveDateEnd: filterParams.arriveEndDate,
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
		onStateClick () {
			this.stateActionShow = true
		},
		onStateSelect (item) {
			this.filterState = item.id
			this.stateActionShow = false
			this.refreshOrderList()
		},
		onBillReStateClick () {
			this.billReStateActionShow = true
		},
		onUrgencySelect (item) {
			this.filterBillReState = item.id
			this.billReStateActionShow = false
			this.refreshOrderList()
		},
		onClickOrder (item) {
			this.$router.push({
				path: 'uniformDistributionOutDetails',
				query: {
					orderId: item.id
				}
			})
		},
		onCreateClick () {
			this.$router.push('createUniformDistributionOut')
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
			this.expressHandler(selectedArr)
		},
		expressHandler (selectedArr) {
			let params = {
				billIds: selectedArr
			}
			params.otherCheck = 1
			this.expressRequest(params).then(res => {
				this.refreshOrderList().then(() => {
					this.$fxToast.success('审核成功')
				})
			}).catch(error => {
				if (error.errorCode === '1') {
					this.$dialog.alert({
						title: '提示',
						message: error.message
					})
					this.refreshOrderList()
				} else if (error.errorCode === 'otherCheck') {
					this.$dialog.confirm({
						title: '提示',
						message: error.message + '，继续审核吗？'
					}).then(() => {
						params.otherCheck = 0
						this.expressRequest(params).then(res => {
							this.refreshOrderList().then(() => {
								this.$fxToast.success('审核成功')
							})
						}).catch(error => {
							this.$dialog.alert({
								title: '提示',
								message: error.message
							})
							this.refreshOrderList()
						})
					})
				} else {
					this.$dialog.alert({
						title: '提示',
						message: error.message
					})
				}
			})
		},
		expressRequest (params) {
			return new Promise((resolve, reject) => {
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/distributionOutBills/users/${this.loginerId}`,
					data: params,
					query: {
						m: 'batchCheck'
					},
					autoErrorMsg: false
				}).then(res => {
					resolve(res)
				}).catch(error => {
					reject(error)
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
			this.filterBillReState = null
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
.inteledi-uniformDistributionOut {
	height:100%
	background:$fxWhite
	display: flex
	flex-direction: column
	.uniformDistributionOut-content {
		flex:1
		overflow:scroll
		.uniformDistributionOut-list {
			min-height: 526px
		}
	}
	.uniformDistributionOut-bottom {
		width:100%
		display: flex
		flex-direction: row
		.add-btn {
			width:100%
		}
	}
}
</style>

