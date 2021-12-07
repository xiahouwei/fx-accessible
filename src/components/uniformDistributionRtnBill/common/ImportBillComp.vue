<template>
	<div class="import-bill">
		<w-header title="选择导入单据" :border="true" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<inStoreDateComp
			:beginDate="beginDate"
			:endDate="endDate"
			@on-beginDate-click="onBeginDateClick"
			@on-endDate-click="onEndDateClick"
			@on-search-click="onSearchClick"
		></inStoreDateComp>
		<div class="import-bill-content">
			<van-pull-refresh v-model="pullRefreshLoading" v-show="orderList.length !== 0" class="import-bill-list" @refresh="onPullRefresh">
				<van-list
					v-model="listLoading"
					:finished="loadFinished"
					finished-text="没有更多了"
					:error.sync="listError"
					error-text="请求失败，点击重新加载"
					@load="onLoadMore"
				>
					<importBillBlock
						v-for="item in orderList"
						:key="item.id"
						:data="item"
						@on-click="onClickOrder(item)"
					>
					</importBillBlock>
				</van-list>
			</van-pull-refresh>
			<emptyBill v-show="orderList.length === 0" message="暂无可导入单据"></emptyBill>
		</div>
		<van-popup v-model="datePickerShow" position="bottom">
			<w-date-picker
				:visibleFlag.sync="datePickerShow"
				:currentDate="currentDate"
				@confirm="dateConfirmhandle"
			></w-date-picker>
		</van-popup>
		<van-popup v-model="importItemPopShow" position="right" class="fx-list-popup-full" :close-on-click-overlay="false" :lock-scroll="false">
			<importItemComp
				:visibleFlag.sync="importItemPopShow"
				:storeItemData="importItemData"
				@on-item-import-confirm="onImportConfirm"
			></importItemComp>
		</van-popup>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import emptyBill from '@/components/common/EmptyBill.vue'
import inStoreDateComp from '@/components/uniformDistributionRtnBill/common/InStoreDateComp.vue'
import importBillBlock from '@/components/uniformDistributionRtnBill/common/ImportBillBlock.vue'
import importItemComp from '@/components/uniformDistributionRtnBill/common/ImportItemComp.vue'
const LIST_SIZE = 50
export default {
	name: 'impportBill',
	components: {
		emptyBill,
		inStoreDateComp,
		importBillBlock,
		importItemComp
	},
	props: {
		visibleFlag: Boolean,
		orderInfo: {
			type: Object,
			default: () => {
				return {}
			}
		}
	},
	data () {
		return {
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			dateType: '',
			currentDate: new Date(),
			beginDate: this.$fxCommon.orderFilterStartDate(),
			endDate: this.$fxCommon.orderFilterEndDate(),
			datePickerShow: false,
			billListParams: {},
			orderList: [],
			listStart: 0,
			pullRefreshLoading: false,
			listLoading: false,
			loadFinished: false,
			listError: false,
			importItemPopShow: false,
			importItemData: [],
			formatterSysPointKey: ['price', 'inMoney', 'taxInMoney', 'inMoneyWithTax', 'busUnitInAmount']
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize',
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId
		})
	},
	watch: {
		visibleFlag: {
			handler (val) {
				if (val) {
					this.initImportBill()
				}
			},
			immediate: true
		}
	},
	methods: {
		initImportBill () {
			this.beginDate = this.$fxCommon.orderFilterStartDate()
			this.endDate = this.$fxCommon.orderFilterEndDate()
			this.refreshOrderList()
		},
		onCloseClick () {
			this.$emit('update:visibleFlag', false)
		},
		onBeginDateClick () {
			this.dateType = 'begin'
			if (this.beginDate) this.currentDate = new Date(this.beginDate)
			this.datePickerShow = true
		},
		onEndDateClick () {
			this.dateType = 'end'
			if (this.endDate) this.currentDate = new Date(this.endDate)
			this.datePickerShow = true
		},
		dateConfirmhandle (date) {
			let setDate = this.$fxUtils.setDateTime(date, '时分')
			if (this.dateType === 'begin') {
				this.beginDate = setDate
			} else {
				this.endDate = setDate
			}
			this.datePickerShow = false
		},
		onSearchClick () {
			this.refreshOrderList()
		},
		orderListPostHandler (params) {
			return new Promise(resolve => {
				this.billListParams = params
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/distributionRtn/users/${this.loginerId}`,
					data: params,
					query: {
						m: 'importBill'
					}
				}).then(res => {
					this.listStart += LIST_SIZE
					this.listLoading = false
					if (res.storeBills.length < LIST_SIZE) {
						this.loadFinished = true
					}
					resolve(res)
				})
			})
		},
		refreshOrderList () {
			return new Promise(resolve => {
				this.listStart = 0
				const params = {
					start: this.listStart,
					size: LIST_SIZE,
					paged: true,
					businessDateStart: this.beginDate,
					businessDateEnd: this.endDate,
					billId: this.orderInfo.id,
					billState: 1,
					shopId: this.orderInfo.shopDTO.id,
					rdcId: this.orderInfo.rdcDTO.id
				}
				this.orderListPostHandler(params).then(res => {
					this.orderList = res.storeBills
					resolve(res)
				})
			})
		},
		onPullRefresh () {
			this.refreshOrderList().then(res => {
				this.pullRefreshLoading = false
			})
		},
		onLoadMore () {
			let params = Object.assign(this.billListParams, {
				start: this.listStart
			})
			this.orderListPostHandler(params).then(res => {
				this.orderList.push(...res.storeBills)
			})
		},
		onClickOrder (item) {
			this.importItemPopShow = true
			this.formatterSysPoint(item.details)
			this.importItemData = this.filterStoreItem(item.details)
		},
		formatterSysPoint (data) {
			let toFixedNumberSize = (data) => {
				return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysPointSize))
			}
			data.forEach(item => {
				this.formatterSysPointKey.forEach(pointItem => {
					item[pointItem] = toFixedNumberSize(item[pointItem])
				})
			})
		},
		filterStoreItem (data) {
			let stores = Array.from(new Set(data.map(item => {
				return item.inHouseDTO.id
			})))
			let StoreItem = stores.map(item => {
				let storeObj = data.find(dataItem => {
					return dataItem.inHouseDTO.id === item
				}).inHouseDTO
				storeObj = JSON.parse(JSON.stringify(storeObj))
				storeObj.details = data.filter(dataItem => {
					return dataItem.inHouseDTO.id === item
				})
				return storeObj
			})
			return StoreItem
		},
		onImportConfirm (items) {
			this.importItemPopShow = false
			this.$emit('update:visibleFlag', false)
			this.$emit('on-item-import-confirm', items)
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.import-bill {
	height:100%
	background:$fxWhite
	display: flex
	flex-direction: column
	.import-bill-content {
		flex:1
		overflow:scroll
		.import-bill-list {
			min-height: 526px
		}
	}
}
</style>

