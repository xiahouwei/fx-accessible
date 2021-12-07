<template>
	<div class="item-search-block">
		<w-header title="原料用量预估" :leftOptions="leftOptions" @on-click-back="onCloseClick">
			<headEditBtn
				slot="header-right"
				:active="orderEditFlag"
				@click="onOrderEditClick"
			></headEditBtn>
			<headSelectAllBtn
				v-show="orderEditFlag"
				:active="isSelectAll"
				slot="header-right"
				@click="onSelectAllClick"
			></headSelectAllBtn>
		</w-header>
		<searchHead :initSearch="visibleFlag" :searchKey.sync="searchKey" @on-confirm-key="onConfirmKey"></searchHead>
		<div class="item-list" ref="details-content">
			<div
				v-for="item in detailFilter(data)"
				:ref="`details-row-${item.goodsUUid}`"
				:key="`${item.goodsUUid}`"
				class="item-row"
			>
				<checkBox
					v-show="orderEditFlag"
					:checked="item.checked"
					class="search-checkbox"
					@on-checkbox-click="onCheckBoxClick(item)"
				></checkBox>
				<itemInfoCell
					v-bind="$attrs"
					:itemData="item"
					v-on="$listeners"
					@on-customizeCount-click="oncustomizeCountClick"
					@on-house-click="onHouseClick"
				></itemInfoCell>
			</div>
		</div>
		<div class="search-bottom">
			<van-button
				v-show="!orderEditFlag"
				class="bottom-btn fx-no-radius"
				type="primary"
				@click="onSave"
			>保存</van-button>
			<van-button
				v-show="orderEditFlag"
				class="bottom-btn fx-no-radius"
				type="primary"
				@click="onBatchHouse"
			>批量设置</van-button>
		</div>
		<van-popup
			v-model="itemRowEditPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<itemRowEditPop
				:visibleFlag.sync="itemRowEditPopShow"
				:itemData="itemEditRowData"
				@on-Confirm="onEditRowConfirm"
			></itemRowEditPop>
		</van-popup>
		<filterListPopup
			v-model="housePopShow"
			title="仓库检索"
			:rollingLoad="true"
			:getDataApi="getHouseListData"
			@on-select="selectHouse(arguments)"
		></filterListPopup>
		<filterListPopup
			v-model="batchHousePopShow"
			title="批量仓库检索"
			:rollingLoad="true"
			:getDataApi="getBatchHouseListData"
			@on-select="selectBatchHouse(arguments)"
		></filterListPopup>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import headEditBtn from '@/components/common/HeadEditBtn.vue'
import headSelectAllBtn from '@/components/common/HeadSelectAllBtn.vue'
import itemInfoCell from '@/components/foodReckonBill/goodsReckon/goodsInfoCell.vue'
import itemRowEditPop from '@/components/foodReckonBill/goodsReckon/goodsRowEditPop.vue'
import searchHead from '@/components/common/searchHead.vue'
import checkBox from '@/components/common/CheckBox.vue'
import filterListPopup from '@/components/common/FilterListPopup.vue'
export default {
	name: 'goodsListPop',
	components: {
		headEditBtn,
		headSelectAllBtn,
		itemInfoCell,
		itemRowEditPop,
		searchHead,
		checkBox,
		filterListPopup
	},
	props: {
		data: {
			type: Array,
			default: () => {
				return []
			}
		},
		shopId: {
			type: String,
			default: ''
		},
		billId: {
			type: String,
			default: ''
		},
		visibleFlag: Boolean
	},
	data () {
		return {
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			searchKey: '',
			itemRowEditPopShow: false,
			itemEditRowData: {},
			scanActionShow: false,
			scanActions: [
				{ name: '累加数量' },
				{ name: '覆盖数量' }
			],
			scanStoreItem: {},
			orderEditFlag: false,
			housePopShow: false,
			batchHousePopShow: false
			// redCode: ''
		}
	},
	watch: {
		visibleFlag: {
			handler (val) {
				if (val) {
					this.searchKey = ''
					this.setDetailGoodsUUid(this.data)
					this.data.forEach(dataItem => {
						dataItem.totalCustomizeCount = this.$fxUtils.toFixedParseNumber(dataItem.details.reduce((pre, cur) => {
							return pre + this.$fxUtils.toFixedParseNumber(cur.customizeCount, this.sysPointSize)
						}, 0), this.sysPointSize)
						dataItem.totalGoodsCount = this.$fxUtils.toFixedParseNumber(dataItem.details.reduce((pre, cur) => {
							return pre + this.$fxUtils.toFixedParseNumber(cur.goodsCount, this.sysPointSize)
						}, 0), this.sysPointSize)
					})
				}
			},
			immediate: true
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize',
			sysMoneyPointSize: 'sysMoneyPointSize',
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId
		}),
		isSelectAll () {
			let dataL = this.detailFilter(this.data).length
			let selectItemL = this.detailFilter(this.data).filter(item => {
				return item.checked
			}).length
			if (selectItemL === 0) {
				return false
			} else if (selectItemL === dataL) {
				return true
			} else {
				return false
			}
		}
	},
	methods: {
		// {{{设置uuid，唯一标示key值
		setDetailGoodsUUid (data) {
			data.forEach(dataItem => {
				dataItem.goodsUUid = this.$fxUtils.createUUID()
			})
		},
		// }}}
		detailFilter (items, searchKeywords = 'code,name,pinYin') {
			return items.filter(item => {
				return !!searchKeywords.split(',').find(itemKey => {
					if (item.goods[itemKey].toLowerCase().includes(this.searchKey.toLowerCase())) {
						return true
					}
				})
			})
		},
		onCloseClick () {
			this.$emit('update:visibleFlag', false)
		},
		onSearchConfirm () {
			this.$emit('on-search-confirm', this.data)
			this.$emit('update:visibleFlag', false)
		},
		// }}}
		oncustomizeCountClick (itemData) {
			this.itemEditRowData = itemData
			this.itemRowEditPopShow = true
		},
		onEditRowConfirm (item) {
			// 算合计
			item.totalCustomizeCount = item.details.reduce((pre, cur) => {
				return pre + this.$fxUtils.toFixedParseNumber(cur.customizeCount, this.sysPointSize)
			}, 0)
			// 赋值
			let detailsIndex = this.data.findIndex(detailsItem => {
				return detailsItem.goods.id === item.goods.id
			})
			if (~detailsIndex) {
				this.data[detailsIndex] = item
			}
		},
		// {{{ 仓库
		onHouseClick (itemData) {
			this.itemEditRowData = itemData
			this.housePopShow = true
		},
		selectHouse ([item]) {
			let detailsIndex = this.data.findIndex(detailsItem => {
				return detailsItem.goods.id === this.itemEditRowData.goods.id
			})
			if (~detailsIndex) {
				this.data[detailsIndex].details.forEach(detailsItem => {
					detailsItem.house = item
					detailsItem.changeType = 'edit'
				})
				this.data[detailsIndex].house = item
				this.data[detailsIndex].changeType = 'edit'
			}
		},
		getHouseListData (keyword = null, start, size) {
			let params = {
				keyword: keyword,
				start: start,
				size: size,
				shopId: this.shopId,
				goodsId: this.itemEditRowData.goods.id
			}
			return this.$fxApi('z5common.selListGoodsByHouse4Food')({ data: params }).then(res => {
				return res.shops
			})
		},
		// }}}
		onConfirmKey () {
			this.searchKey = ''
		},
		onSave () {
			this.getSaveParams().then(res => {
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/foodReckonBill/${this.billId}`,
					data: res,
					query: {
						m: 'modifyBillAndDetail',
						userId: this.loginerId
					}
				}).then(res => {
					this.$fxToast.success('修改成功').then(() => {
						this.$emit('update:visibleFlag', false)
					})
				})
			}).catch(() => {
				this.$emit('update:visibleFlag', false)
			})
		},
		getSaveParams () {
			return new Promise((resolve, reject) => {
				let itemDetails = []
				this.data.forEach(item => {
					itemDetails.push(...item.details)
				})
				let editItems = itemDetails.filter(item => {
					return item.changeType === 'edit'
				})
				if (!editItems.length) {
					let error = '没有发生改变'
					reject(error)
					return false
				}
				let params = Object.assign({}, this.orderInfoData, {
					goodsDetailMdf: editItems,
					accountDTO: {
						id: this.loginerId
					}
				})
				resolve(params)
			})
		},
		// {{{批量设置仓库
		onOrderEditClick () {
			this.orderEditFlag = !this.orderEditFlag
		},
		onSelectAllClick () {
			let flag = !this.isSelectAll
			this.detailFilter(this.data).forEach(item => {
				this.$set(item, 'checked', flag)
			})
		},
		onCheckBoxClick (item) {
			this.$set(item, 'checked', !item.checked)
		},
		onBatchHouse () {
			let data = this.data.filter(detailsItem => {
				return detailsItem.checked
			})
			if (data.length) {
				this.batchHousePopShow = true
			} else {
				this.$fxToast.fail('请选择品项！')
				return true
			}
		},
		selectBatchHouse ([item]) {
			const indexs = this.$fxUtils.appointedMap(this.data, (detailsItem, index) => {
				if (detailsItem.checked) {
					return index
				}
			})
			if (indexs.length) {
				indexs.forEach(itemIndex => {
					this.data[itemIndex].details.forEach(detailsItem => {
						detailsItem.house = item
						detailsItem.changeType = 'edit'
					})
					this.data[itemIndex].house = item
					this.data[itemIndex].changeType = 'edit'
				})
			}
			this.orderEditFlag = !this.orderEditFlag
		},
		getBatchHouseListData (keyword = null, start, size) {
			let data = this.data.filter(detailsItem => {
				return detailsItem.checked
			})
			if (data.length) {
				let ids = data.map(item => {
					return item.goods.id
				})
				let params = {
					keyword: keyword,
					start: start,
					size: size,
					shopId: this.shopId,
					goodsId: ids.join(',')
				}
				return this.$fxApi('z5common.selJoinListGoodsByHouse4Food')({ data: params }).then(res => {
					return res.shops
				})
			}
		}
		// }}}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.item-search-block {
	height: 100%;
	background:$fxWhite
	display: flex
	flex-direction: column
	overflow-x: hidden
	.item-list {
		flex:1
		overflow:scroll
		position: relative
		text-align: left
		padding: 0 13px
		width: 350px
		.item-store-title-container {
			display:flex
			flex-direction: row
			align-items: center
			font-size: 12px
			height: 40px
			.item-store-title {
				display: flex
				flex-direction: row
				justify-content: space-between
				align-items: center
				flex: 1
				margin-left: 10px
			}
		}
		.store-right-name{
			display:inline-block
			height:40px
			line-height:40px
			width: 141px
			text-align: right
			text-align: right
			float: right
		}
		.item-row {
			border-bottom:1px solid $fxBorder
			align-items: center
			display: flex
			.item-row-delete {
				background-color:$fxRed
				color:$fxWhite
				font-size: 15px
				width: 80px;
				height: 100%
				line-height: 80px;
				display: inline-block;
				text-align: center;
			}
		}
		.search-checkbox {
			width: 25px
		}
		.item-cell {
			display: flex
			flex-flow: row
			align-items: center
		}
		.search-info{
			flex: 1
			overflow: hidden
		}
	}
	.search-bottom {
		width:100%
		display: flex
		flex-direction: row
		.bottom-btn {
			flex:1
			padding:0
			overflow:hidden
		}
	}
}
</style>
