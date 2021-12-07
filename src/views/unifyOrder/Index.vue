<template>
	<div class="inteledi-unifyOrder">
		<w-header title="统配入库单" :border="true">
			<headEditBtn v-show="$fxAuth('distributionInBill.check')" slot="header-right" :active="billEditFlag" @click="onBillEditClick"></headEditBtn>
			<headSearchBtn v-show="!billEditFlag" slot="header-right" @click="onSearchClick"></headSearchBtn>
			<headSelectAllBtn
				v-show="billEditFlag"
				:active="isSelectAll"
				slot="header-right"
				@click="onSelectAllClick"
			></headSelectAllBtn>
		</w-header>
		<filterTab
			:state="filterState"
			:differenceFlag="filterDifference"
			@on-state-click="billStateClick"
			@on-differenceFlag-click="differenceFlagClick"
		></filterTab>
		<div v-if="$fxAuth('distributionInBill.checkAndAccept') && $fxSysAuth('distributionInBill.SysOpenAcceptGroup')" class="bill-btn">
			<van-button
				class="add-btn fx-no-radius"
				type="primary"
				plain
				size="small"
				@click="onCompleteClick"
			>验收</van-button>
		</div>
		<div class="bill-content">
			<van-pull-refresh v-model="pullRefreshLoading" v-show="billList.length !== 0" class="billList-list" @refresh="onPullRefresh">
				<van-list
					v-model="listLoading"
					:finished="loadFinished"
					finished-text="没有更多了"
					:error.sync="listError"
					error-text="请求失败，点击重新加载"
					@load="onLoadMore"
				>
					<billBlock
						v-for="item in billList"
						v-show="computedShowOrder(item.billState, item.weightState)"
						:key="item.id"
						:data="item"
						:showCheckBox="billEditFlag"
						@on-click="onClickList(item)"
					></billBlock>
				</van-list>
			</van-pull-refresh>
			<emptyBill v-show="billList.length === 0"></emptyBill>
		</div>
		<div class="bill-bottom">
			<van-button
				v-show="billEditFlag"
				class="add-btn fx-no-radius"
				type="primary"
				@click="onExpressClick"
			>批量审核</van-button>
		</div>
		<van-actionsheet
			v-model="billStateActionShow"
			:actions="billStateActions"
			cancel-text="取消"
			@select="onBillStateAction"
		/>
		<van-actionsheet
			v-model="differenceFlagActionShow"
			:actions="differenceFlagActions"
			cancel-text="取消"
			@select="onDifferenceFlagAction"
		/>
		<van-popup v-model="filterPopShow" position="right" class="fx-list-popup-full" :lock-scroll="false" :close-on-click-overlay="false">
			<filterPop :visibleFlag.sync="filterPopShow" :filterParams.sync="filterParams" @on-confirm="onFilterConfirm"></filterPop>
		</van-popup>
		<van-popup
			v-model="itemCompletePopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<itemCompletePop
				:visibleFlag.sync="itemCompletePopShow"
				:data="completeItem"
				:title="'统配入库单验收'"
				:searchKeywords="'code,name,pinYin'"
				:getCheckList="getCheckList"
				:completeHandle="completeHandle"
				:isDisabled="!$fxAuth('distributionInBill.save')"
			></itemCompletePop>
		</van-popup>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import headSearchBtn from '@/components/common/HeadSearchBtn.vue'
import headEditBtn from '@/components/common/HeadEditBtn.vue'
import headSelectAllBtn from '@/components/common/HeadSelectAllBtn.vue'
import emptyBill from '@/components/common/EmptyBill.vue'
import billBlock from '@/components/unifyOrder/billList/BillBlock.vue'
import filterPop from '@/components/unifyOrder/billList/FilterPop.vue'
import filterTab from '@/components/unifyOrder/billList/FilterTab.vue'
import itemCompletePop from '@/components/unifyOrder/common/itemCompletePop.vue'
const LIST_SIZE = 50
export default {
	name: 'unifyOrder',
	components: {
		headSearchBtn,
		headEditBtn,
		headSelectAllBtn,
		emptyBill,
		billBlock,
		filterPop,
		filterTab,
		itemCompletePop
	},
	data () {
		return {
			filterPopShow: false,
			listStart: 0,
			billList: [],
			listLoading: false,
			loadFinished: true,
			listError: false,
			pullRefreshLoading: false,
			billState: null,
			differenceFlag: null,
			billStateActionShow: false,
			billStateActions: [
				{ id: null, name: '全部' },
				{ id: '0', name: '未审核' },
				{ id: '1', name: '已审核' }
			],
			differenceFlagActionShow: false,
			differenceFlagActions: [
				{ id: null, name: '全部' },
				{ id: '0', name: '无差异' },
				{ id: '1', name: '有差异' }
			],
			billEditFlag: false,
			filterParams: {},
			itemCompletePopShow: false,
			completeItem: []
		}
	},
	created () {
		this.refreshBillList()
	},
	beforeRouteEnter (to, from, next) {
		const initPath = ['/main/home', '/']
		const refreshPath = ['/unifyOrderDetails']
		if (initPath.includes(from.path)) {
			next(vm => {
				vm.restFilterParams()
				vm.restRouterParams(to.params)
				vm.refreshBillList()
			})
		} else if (refreshPath.includes(from.path)) {
			next(vm => {
				vm.refreshBillList()
			})
		} else {
			next()
		}
	},
	computed: {
		...mapState({
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId
		}),
		filterState () {
			return this.billStateActions.find(item => {
				return item.id === this.billState
			}).name
		},
		filterDifference () {
			return this.differenceFlagActions.find(item => {
				return item.id === this.differenceFlag
			}).name
		},
		computedShowOrder (billState, weightState) {
			return (billState, weightState) => {
				if (!this.billEditFlag) {
					return true
				} else {
					if (billState !== 1 && (weightState === 0 || weightState === 3)) {
						return true
					} else {
						return false
					}
				}
			}
		},
		isSelectAll () {
			let unCheckBill = this.billList.filter(item => {
				return item.billState !== 1 && (item.weightState === 0 || item.weightState === 3)
			})
			if (unCheckBill.length === 0) return false
			let unCheckBillSelect = unCheckBill.filter(item => {
				return !!item.checked
			})
			return unCheckBillSelect.length === unCheckBill.length
		}
	},
	methods: {
		billListPostHandler (params) {
			return new Promise(resolve => {
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/distributioninbills/users/${this.loginerId}`,
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
		onSearchClick () {
			this.filterPopShow = true
		},
		onFilterConfirm (filterParams) {
			this.listStart = 0
			const params = {
				start: this.listStart,
				size: LIST_SIZE,
				paged: true,
				businessDateStart: filterParams.beginDate,
				businessDateEnd: filterParams.endDate,
				billState: this.billState,
				differenceFlag: this.differenceFlag,
				rdcId: filterParams.rdc.id === '' ? null : filterParams.rdc.id,
				shopId: filterParams.shop.id === '' ? null : filterParams.shop.id,
				houseId: filterParams.house.id === '' ? null : filterParams.house.id,
				goodsId: filterParams.goods.id === '' ? null : filterParams.goods.id,
				businessType: filterParams.billType.id === '' ? null : filterParams.billType.id,
				sysBillCode: filterParams.billNo === '' ? null : filterParams.billNo
			}
			this.billListPostHandler(params).then(res => {
				this.billList = res.storeBills
			})
		},
		onLoadMore () {
			let params = Object.assign(this.$fxUtils.isEmptyObjSHW(this.filterParams) ? {} : this.filterParams, {
				start: this.listStart,
				size: LIST_SIZE,
				paged: true
			})
			this.billListPostHandler(params).then(res => {
				this.orderList.push(...res.shopOrderBills)
			})
		},
		onPullRefresh () {
			this.refreshBillList().then(res => {
				this.pullRefreshLoading = false
			})
		},
		refreshBillList () {
			return new Promise(resolve => {
				let params = {
					start: this.listStart,
					size: LIST_SIZE,
					paged: true,
					businessDateStart: this.$fxCommon.orderFilterStartDate(),
					businessDateEnd: this.$fxCommon.orderFilterEndDate(),
					billState: this.billState,
					differenceFlag: this.differenceFlag
				}
				params = Object.assign(params, this.translateFilterParams(this.filterParams))
				this.billListPostHandler(params).then(res => {
					this.billList = res.storeBills
					resolve(res)
				})
			})
		},
		translateFilterParams (filterParams) {
			return this.$fxUtils.isEmptyObjSHW(filterParams) ? {} : {
				businessDateStart: filterParams.beginDate,
				businessDateEnd: filterParams.endDate,
				rdcId: filterParams.rdc.id === '' ? null : filterParams.rdc.id,
				shopId: filterParams.shop.id === '' ? null : filterParams.shop.id,
				houseId: filterParams.house.id === '' ? null : filterParams.house.id,
				goodsId: filterParams.goods.id === '' ? null : filterParams.goods.id,
				businessType: filterParams.billType.id === '' ? null : filterParams.billType.id,
				sysBillCode: filterParams.billNo === '' ? null : filterParams.billNo
			}
		},
		billStateClick () {
			this.billStateActionShow = true
		},
		differenceFlagClick () {
			this.differenceFlagActionShow = true
		},
		onBillStateAction (item) {
			this.billStateActionShow = false
			this.billState = item.id
			this.refreshBillList()
		},
		onDifferenceFlagAction (item) {
			this.differenceFlagActionShow = false
			this.differenceFlag = item.id
			this.refreshBillList()
		},
		onClickList (item) {
			this.$router.push({
				path: 'unifyOrderDetails',
				query: {
					billId: item.id
				}
			})
		},
		onBillEditClick () {
			this.billEditFlag = !this.billEditFlag
		},
		onExpressClick () {
			let selectedArr = this.billList.reduce((pre, cur) => {
				let arr = cur.checked && cur.billState === 0 ? pre.concat(cur.id) : pre
				return arr
			}, [])
			if (selectedArr.length === 0) {
				this.$fxToast.fail('请选择未审核单据！')
				return false
			}
			this.$dialog.confirm({
				title: '提示',
				message: '确定要审核所选单据?'
			}).then(() => {
				this.expressHandler(selectedArr).then(res => {
					this.billEditFlag = !this.billEditFlag
					this.refreshBillList().then(() => {
						this.$fxToast.success(res.message)
					})
				})
			})
		},
		expressHandler (selectedArr) {
			return new Promise(resolve => {
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/distributioninbills/users/${this.loginerId}`,
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
			this.billList.forEach(item => {
				if (item.billState !== 1 && (item.weightState === 0 || item.weightState === 3)) {
					this.$set(item, 'checked', flag)
				}
			})
		},
		restFilterParams () {
			this.filterParams = {}
			this.billState = null
			this.differenceFlag = null
			this.billEditFlag = false
		},
		restRouterParams (params) {
			if (!this.$fxUtils.isEmptyObjSHW(params)) {
				this.billState = params.billState
			}
		},
		// {{{ 验收
		onCompleteClick () {
			this.getCheckList().then(res => {
				if (!res.billDetailGroup) {
					this.$fxToast.fail('没有分组!')
					return false
				}
				if (!res.billDetailGroup.length) {
					this.$fxToast.fail('没有可验收数据!')
					return false
				}
				this.itemCompletePopShow = true
				this.completeItem = JSON.parse(JSON.stringify(res.billDetailGroup))
			})
		},
		getCheckList (goodsId) {
			return new Promise(resolve => {
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/distributioninbills/-1/groups`
				}).then(res => {
					resolve(res)
				})
			})
		},
		completeHandle (itemData, groupParam) {
			return new Promise(resolve => {
				let url = ''
				let params = [{
					id: itemData.id,
					checkAmount: groupParam.groupAmount,
					inMoney: groupParam.data.inMoney,
					taxInMoney: groupParam.data.taxInMoney,
					inMoneyWithTax: groupParam.data.inMoneyWithTax,
					bill: {
						id: itemData.billId
					}
				}]
				// 已验收和未验收修改数据接口有区别
				if (groupParam.checkFlag === '1') {
					url = `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/distributionindetails?m=updateCheckAmount`
				} else {
					url = `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/distributioninbills/${itemData.billId}?m=accept&groupId=${groupParam.groupId}`
				}
				this.$fxHttp.requestPut({
					url,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		}
		// }}}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.inteledi-unifyOrder {
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
	.bill-btn {
		text-align: right
		padding: 7px 16px 0px
	}
	.bill-content {
		flex:1
		overflow:scroll
		.shopOrder-list {
			min-height: 526px
		}
	}
	.bill-bottom {
		width:100%
		display: flex
		flex-direction: row
		.add-btn {
			width:100%
		}
	}
}
</style>
