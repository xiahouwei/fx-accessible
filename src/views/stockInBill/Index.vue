<template>
	<div class="inteledi-shopOrder">
		<w-header title="采购入库单" :border="true">
			<headEditBtn
				v-show="$fxAuth('shopStockInBill.check')"
				slot="header-right"
				:active="orderEditFlag"
				@click="onOrderEditClick"
			></headEditBtn>
			<headSearchBtn
				v-show="!orderEditFlag"
				slot="header-right"
				@click="onSearchClick"
			></headSearchBtn>
			<headSelectAllBtn
				v-show="orderEditFlag"
				:active="isSelectAll"
				slot="header-right"
				@click="onSelectAllClick"
			></headSelectAllBtn>
		</w-header>
		<filterTab
			:state="computedState"
			:reCheckState="computedReCheckState"
			@on-state-click="onStateClick"
			@on-recheckstate-click="reCheckStateClick"
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
				v-show="!orderEditFlag && $fxAuth('shopStockInBill.add')"
				class="add-btn fx-no-radius"
				type="primary"
				@click="onCreateClick"
			>添加单据</van-button>
			<van-button
				v-show="orderEditFlag && $fxAuth('shopStockInBill.check')"
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
			v-model="reCheckStateActionShow"
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
import headSearchBtn from '@/components/common/HeadSearchBtn.vue'
import headEditBtn from '@/components/common/HeadEditBtn.vue'
import headSelectAllBtn from '@/components/common/HeadSelectAllBtn.vue'
import emptyBill from '@/components/common/EmptyBill.vue'
import orderBlock from '@/components/stockInBill/orderList/OrderBlock.vue'
import filterPop from '@/components/stockInBill/orderList/FilterPop.vue'
import filterTab from '@/components/stockInBill/orderList/FilterTab.vue'
const LIST_SIZE = 50
export default {
	name: 'stockInBill',
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
			filterReCheckState: null,
			reCheckStateActionShow: false,
			reCheckStateActions: [
				{ id: null, name: '全部' },
				{ id: '1', name: '已复审' },
				{ id: '0', name: '未复审' }
			],
			listStart: 0,
			pullRefreshLoading: false,
			listLoading: false,
			loadFinished: true,
			listError: false,
			orderEditFlag: false,
			filterParams: {}
		}
	},
	beforeRouteEnter (to, from, next) {
		const initPath = ['/main/home', '/']
		const refreshPath = ['/stockInBillDetails']
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
			sysStockInPriceIsZeroPrompt: state => state.systemParams.sysStockInPriceIsZeroPrompt,
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
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/stockinbills/users/${this.loginerId}`,
					data: params
				}).then(res => {
					this.listLoading = false
					/* this.listStart += LIST_SIZE
					if (res.storeBills.length < LIST_SIZE) {
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
					billState: this.filterState,
					reCheckState: this.filterReCheckState
				}
				params = Object.assign(params, this.translateFilterParams(this.filterParams))
				this.orderListPostHandler(params).then(res => {
					this.orderList = res.storeBills
					resolve(res)
				})
			})
		},
		translateFilterParams (filterParams) {
			return this.$fxUtils.isEmptyObjSHW(filterParams) ? {} : {
				businessDateStart: filterParams.beginDate,
				businessDateEnd: filterParams.endDate,
				sysBillCode: filterParams.billNo === '' ? null : filterParams.billNo,
				shopId: filterParams.shopId === '' ? null : filterParams.shopId,
				supplierId: filterParams.supplierId === '' ? null : filterParams.supplierId,
				houseId: filterParams.storeId === '' ? null : filterParams.storeId,
				goodsId: filterParams.itemId === '' ? null : filterParams.itemId,
				businessType: filterParams.billTypeId === '' ? null : filterParams.billTypeId
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
				sysBillCode: filterParams.billNo === '' ? null : filterParams.billNo,
				shopId: filterParams.shopId === '' ? null : filterParams.shopId,
				supplierId: filterParams.supplierId === '' ? null : filterParams.supplierId,
				houseId: filterParams.storeId === '' ? null : filterParams.storeId,
				goodsId: filterParams.itemId === '' ? null : filterParams.itemId,
				businessType: filterParams.billTypeId === '' ? null : filterParams.billTypeId
			}
			this.orderListPostHandler(params).then(res => {
				this.orderList = res.storeBills
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
		reCheckStateClick () {
			this.reCheckStateActionShow = true
		},
		onReCheckStateSelect (item) {
			this.filterReCheckState = item.id
			this.reCheckStateActionShow = false
			this.refreshOrderList()
		},
		onClickOrder (item) {
			this.$router.push({
				path: 'stockInBillDetails',
				query: {
					orderId: item.id
				}
			})
		},
		onCreateClick () {
			this.$router.push('createStockInBill')
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
			let msg = '确定要审核所选单据?'
			this.checkZeroBill(selectedArr).then(res => {
				if (res.length) {
					msg = '存在非赠品价格为0的单据，是否继续审核?' + res
				}
				this.$dialog.confirm({
					title: '提示',
					message: msg
				}).then(() => {
					this.expressBillList()
				})
			})
		},
		checkZeroBill (selectedArr) {
			return new Promise((resolve, reject) => {
				if (!this.sysStockInPriceIsZeroPrompt) {
					resolve('')
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/stockinbills`,
					data: {
						billIds: selectedArr.join(','),
						m: 'getBill4MoneyIsZero'
					}
				}).then(res => {
					resolve(res)
				}).catch(res => {
					reject(res)
				})
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
					this.$dialog.confirm({
						title: '提示',
						message: res.message
					})
				})
			}).catch(() => {
				this.refreshOrderList()
			})
		},
		expressHandler (selectedArr) {
			return new Promise(resolve => {
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/stockinbills/users/${this.loginerId}`,
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

