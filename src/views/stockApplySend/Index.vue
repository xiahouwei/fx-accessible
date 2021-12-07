<template>
	<div class="inteledi-stockApplySend">
		<w-header title="采购申请分派" :border="true"></w-header>
		<div class="stockApplySend-content">
			<div class="stockApplySend-filter">
				<FilterInfo
					:filterParams="filterParams"
					@on-beginDate-click="onBeginDateClick"
					@on-endDate-click="endDateClick"
					@on-shop-click="onShopClick"
					@on-billtype-click="onBillTypeClick"
					@on-billtypeclear-click="onBillTypeClearClick"
				></FilterInfo>
			</div>
			<van-search v-model="searchWord" @search="changeSearchWord" @clear="changeSearchWord" shape="round" placeholder="请输入搜索关键词" />
			<van-cell>单据数量: {{orderList.length }}</van-cell>
			<van-pull-refresh v-model="pullRefreshLoading" v-show="orderList.length !== 0" class="stockApplySend-list" @refresh="onPullRefresh">
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
						:showCheckBox="true"
					></orderBlock>
				</van-list>
			</van-pull-refresh>
			<emptyBill v-show="orderList.length === 0"></emptyBill>
		</div>
		<div class="stockApplySend-bottom">
			<checkBox
				:visibleFlag="true"
				:checked="isSelectAll"
				class="order-checkbox"
				@on-checkbox-click="onSelectAllClick"
			>
			</checkBox>
			<span class="selectall-text">全选</span>
			<div class="send-btn">
				<van-button
					v-show="$fxAuth('stockApplySend.add')"
					type="primary"
					round
					size="small"
					@click="onSendClick"
				>分派</van-button>
			</div>
		</div>
		<van-popup v-model="datePickerShow" position="bottom">
			<w-date-picker
				:visibleFlag.sync="datePickerShow"
				:currentDate="currentDate"
				@confirm="dateConfirmhandle"
			></w-date-picker>
		</van-popup>
		<filterListPopup
			v-model="shopPopShow"
			title="申请机构检索"
			:rollingLoad="true"
			:getDataApi="getShopListData"
			@on-select="selectShop(arguments)"
		></filterListPopup>
		<van-popup v-model="billTypePopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="billTypePopShow"
				:data="billTypeList"
				:loadFinished="true"
				title="单据类型检索"
				@on-search="searchBillType"
				@on-select="selectBillType"
			></listComp>
		</van-popup>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import emptyBill from '@/components/common/EmptyBill.vue'
import orderBlock from '@/components/stockApplySend/orderList/OrderBlock.vue'
import FilterInfo from '@/components/stockApplySend/orderList/FilterInfo.vue'
import listComp from '@/components/common/ListComp.vue'
import checkBox from '@/components/common/CheckBox.vue'
import filterListPopup from '@/components/common/FilterListPopup.vue'
const LIST_SIZE = 50
export default {
	name: 'stockApplySend',
	components: {
		emptyBill,
		orderBlock,
		FilterInfo,
		listComp,
		checkBox,
		filterListPopup
	},
	data () {
		return {
			orderList: [],
			listStart: 0,
			pullRefreshLoading: false,
			listLoading: false,
			// 后端暂时不支持分页加载,此变量不因返回数据length更改
			loadFinished: true,
			listError: false,
			searchWord: '',
			currentDate: new Date(),
			filterParams: {
				beginDate: this.$fxCommon.orderFilterStartDate(),
				endDate: this.$fxCommon.orderFilterEndDate(),
				shop: '请选择',
				shopId: '',
				billType: '请选择',
				billTypeId: ''
			},
			datePickerShow: false,
			shopPopShow: false,
			billTypeList: [],
			billTypePopShow: false
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
		const refreshPath = ['/stockApplySendDetails']
		if (initPath.includes(from.path)) {
			next(vm => {
				vm.restFilterParams().then(() => {
					vm.refreshOrderList()
				})
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
			loginerShopName: state => state.loginer.loginerShopName,
			loginerId: state => state.loginer.loginerId,
			loginerOrganType: state => state.loginer.loginerOrganType
		}),
		isSelectAll () {
			let checkBillSelect = this.orderList.filter(item => {
				return !!item.checked
			})
			return checkBillSelect.length === this.orderList.length && this.orderList.length
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
					query: {
						m: 'pageList4StockSendLeft'
					},
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		changeFilterParams () { // 修改搜索条件触发重新查询
			this.refreshOrderList()
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
					keyword: this.searchWord
				}
				params = Object.assign(params, this.translateFilterParams(this.filterParams))
				this.orderListPostHandler(params).then(res => {
					this.orderList = res.stockApplyBills
					resolve(res)
				})
			})
		},
		translateFilterParams (filterParams) {
			return this.$fxUtils.isEmptyObjSHW(filterParams) ? {} : {
				businessDateStart: filterParams.beginDate,
				businessDateEnd: filterParams.endDate,
				shopId: filterParams.shopId === '' ? null : filterParams.shopId,
				businessType: filterParams.billTypeId === '' ? null : filterParams.billTypeId
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
		// {{{ 全选
		onSelectAllClick () {
			let flag = !this.isSelectAll
			this.orderList.forEach(item => {
				this.$set(item, 'checked', flag)
			})
		},
		// }}}
		// {{{ 日期
		onBeginDateClick () {
			this.dateType = 'begin'
			if (this.beginDate) this.currentDate = new Date(this.beginDate)
			this.datePickerShow = true
		},
		endDateClick () {
			this.dateType = 'end'
			if (this.endDate) this.currentDate = new Date(this.endDate)
			this.datePickerShow = true
		},
		dateConfirmhandle (date) {
			if (this.dateType === 'begin') {
				this.filterParams.beginDate = this.$fxUtils.setDateTime(date, '时分')
				if (!this.filterParams.endDate || !this.$fxUtils.compareDateRange(this.filterParams.beginDate, this.filterParams.endDate, 7)) {
					this.filterParams.endDate = this.$fxCommon.orderFilterDate(date)
				}
			} else {
				this.filterParams.endDate = this.$fxUtils.setDateTime(date, '时分')
				if (!this.filterParams.beginDate || !this.$fxUtils.compareDateRange(this.filterParams.beginDate, this.filterParams.endDate, 7)) {
					this.filterParams.beginDate = this.$fxCommon.orderFilterStartDate(date)
				}
			}
			this.datePickerShow = false
			this.changeFilterParams()
		},
		// }}}
		// {{{ 门店
		onShopClick () {
			this.shopPopShow = true
		},
		selectShop ([item]) {
			if (item.id === this.filterParams.shopId) {
				return true
			}
			this.filterParams.shop = item.name
			this.filterParams.shopId = item.id
			this.changeFilterParams()
		},
		getShopListData (keyword = null, start, size) {
			let params = {
				keyword: keyword,
				start: start,
				size: size
			}
			return this.$fxApi('z5common.getUserManageShop')({ data: params }).then(res => {
				return res.shops
			})
		},
		// }}}
		// 单据类型 {{{
		onBillTypeClick () {
			this.onBillTypeRefresh()
		},
		searchBillType (keyword) {
			this.onBillTypeRefresh(keyword)
		},
		selectBillType (item) {
			if (item.id === this.filterParams.billTypeId) {
				return true
			}
			this.filterParams.billType = item.name
			this.filterParams.billTypeId = item.id
			this.changeFilterParams()
		},
		onBillTypeRefresh (keyword = null) {
			this.getBillTypeListData(keyword).then(res => {
				this.billTypeList = res.businessTypes
				this.billTypePopShow = true
			})
		},
		getBillTypeListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					billType: '18_0',
					keyword: keyword
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/businessTypes`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		onBillTypeClearClick () {
			this.filterParams.billType = '请选择'
			this.filterParams.billTypeId = ''
			this.changeFilterParams()
		},
		// }}}
		// {{{ 修改搜索条件
		changeSearchWord (value) {
			this.changeFilterParams()
		},
		// }}}
		// {{{ 分派
		onSendClick () {
			let selectedArr = this.orderList.reduce((pre, cur) => {
				let arr = cur.checked ? pre.concat(cur.id) : pre
				return arr
			}, [])
			if (selectedArr.length === 0) {
				this.$fxToast.fail('请选择一条记录！')
				return false
			}
			this.$router.push({
				path: 'stockApplySendDetails',
				query: {
					orderIds: selectedArr
				}
			})
		},
		// }}}
		restFilterParams () {
			return new Promise(resolve => {
				this.searchWord = ''
				this.filterParams = {
					beginDate: this.$fxCommon.orderFilterStartDate(),
					endDate: this.$fxCommon.orderFilterEndDate(),
					shop: '请选择',
					shopId: '',
					billType: '请选择',
					billTypeId: ''
				}
				// 新增需要取得机构下默认仓库
				this.getDefaultShopListData().then(res => {
					if (res.shops && res.shops.length) {
						this.filterParams.shopId = res.shops[0].id
						this.filterParams.shop = res.shops[0].name
					}
					resolve()
				})
			})
		},
		// {{{获取默认机构
		getDefaultShopListData () {
			return new Promise(resolve => {
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/inshopDefault`
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
.inteledi-stockApplySend {
	height: 100%
	background: $fxWhite
	display: flex
	flex-direction: column
	.stockApplySend-content {
		flex: 1
		overflow: scroll
		.stockApplySend-filter {
			text-align: left
			padding: 3px 0px
			background: #eee
		}
		.stockApplySend-list {
			min-height: 526px
		}
	}
	.stockApplySend-bottom {
		display: flex
		flex-direction: row
		padding: 10px
		padding-left: 26px
       .selectall-text {
           padding: 6px 0 0 10px
       }
		.order-checkbox {
			padding-top: 4px
		}
		.send-btn {
			flex: 1
			text-align: right
		}
	}
}
</style>

