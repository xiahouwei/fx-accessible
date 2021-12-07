<template>
	<div class="item-search-block">
		<w-header title="搜索品项" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<searchHead :initSearch="visibleFlag" :searchKey.sync="searchKey" :selectActive="isSelectAll" @on-select-click="onSelectAllClick" @on-confirm-key="onConfirmKey"></searchHead>
		<div class="item-list" ref="details-content">
			<van-swipe-cell
				v-show="itemDetailsLength(item)"
				v-for="item in detailFilter(searchData)"
				:ref="`details-row-${item.goodsUUid}`"
				:key="`${item.goodsUUid}`"
				:right-width="80"
				:disabled="isDisabled || focusing"
				class="item-row"
			>
				<div class="item-cell">
					<checkBox
						:visibleFlag="!isDisabled"
						:checked="item.checked"
						class="search-checkbox"
						@on-checkbox-click="onCheckBoxClick(item)"
					></checkBox>
					<itemInfoCell
						:itemData="item"
						:isDisabled="isDisabled"
						:disabledEditBtn="focusing"
						@on-item-edit="onSearchItemEdit"
						class="search-info"
					></itemInfoCell>
				</div>
				<div slot="right" class="item-row-delete" @click="onDeleteClick(item)">删除</div>
			</van-swipe-cell>
		</div>
		<div class="search-bottom">
			<van-button
				v-show="!isDisabled"
				class="bottom-btn fx-no-radius"
				type="primary"
				@click="onSearchConfirm"
			>保存</van-button>
			<van-button
				v-show="!isDisabled"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onDelSelect"
			>删除</van-button>
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
				:isDisabled="isDisabled"
				@on-Confirm="onEditRowConfirm"
			></itemRowEditPop>
		</van-popup>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import itemInfoCell from '@/components/foodReckonBill/common/ItemInfoCell.vue'
import itemRowEditPop from '@/components/foodReckonBill/common/ItemRowEditPop.vue'
import searchHead from '@/components/common/searchHead.vue'
import checkBox from '@/components/common/CheckBox.vue'
export default {
	name: 'itemSearchPop',
	components: {
		itemInfoCell,
		itemRowEditPop,
		searchHead,
		checkBox
	},
	props: {
		data: {
			type: Array,
			default: () => {
				return []
			}
		},
		isDisabled: Boolean,
		visibleFlag: Boolean
	},
	data () {
		return {
			focusing: false,
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			searchKey: '',
			itemRowEditPopShow: false,
			itemEditRowData: {},
			searchData: [],
			searchKeywords: 'foodCode,foodName'
		}
	},
	watch: {
		visibleFlag: {
			handler (val) {
				if (val) {
					this.searchKey = ''
					this.setDetailGoodsUUid(this.data)
					this.searchData = JSON.parse(JSON.stringify(this.data))
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
			// 单据下发称重或者单据审核全选按钮隐藏
			if (this.isDisabled) {
				return ''
			}
			let searchItems = this.detailFilter(this.searchData)
			let selectItemL = searchItems.filter(item => {
				return this.itemDetailsLength(item) && item.checked
			}).length
			let dataL = searchItems.filter(item => {
				return this.itemDetailsLength(item)
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
		// {{{外销出库单分批之后可以生成相同仓库下相同品项，故设置uuid，唯一标示key值
		setDetailGoodsUUid (data) {
			data.forEach(item => {
				item.goodsUUid = this.$fxUtils.createUUID()
			})
		},
		// }}}
		itemDetailsLength (data) {
			return data.details && data.details.filter(item => {
				return item.changeType !== 'del'
			}).length > 0
		},
		detailFilter (items) {
			return items.filter(item => {
				return !!this.searchKeywords.split(',').find(itemKey => {
					if (item[itemKey].toLowerCase().includes(this.searchKey.toLowerCase())) {
						return true
					}
				})
			})
		},
		onCloseClick () {
			if (this.focusing) { // input不符合验证规则
				return false
			}
			this.$emit('update:visibleFlag', false)
		},
		onDeleteClick (item) {
			item.details.forEach((detailsItem, index) => {
				if (detailsItem.id) {
					detailsItem.changeType = 'del'
				} else {
					item.details.splice(index, 1)
				}
			})
			let itemIndex = this.searchData.findIndex(dataItem => {
				return dataItem.foodUnitId === item.foodUnitId
			})
			this.searchData.splice(itemIndex, 1, item)
		},
		// {{{ 编辑行其他数据
		onSearchItemEdit (itemData) {
			this.itemEditRowData = itemData
			this.itemRowEditPopShow = true
		},
		onEditRowConfirm (item) {
			// 算合计
			item.totalFoodCount = this.toFixedNumberSize(item.details.reduce((pre, cur) => {
				return pre + this.toFixedNumberSize(cur.foodCount)
			}, 0))
			// 赋值
			let detailsIndex = this.searchData.findIndex(detailsItem => {
				return detailsItem.foodUnitId === item.foodUnitId
			})
			if (~detailsIndex) {
				this.searchData[detailsIndex] = item
			}
		},
		// }}}
		toFixedNumberSize (data, pointSize = this.sysMoneyPointSize) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, pointSize))
		},
		onSearchConfirm () {
			if (this.focusing) { // input不符合验证规则
				return false
			}
			// 去除被选状态
			this.searchData.forEach(item => {
				delete item.checked
			})
			this.$emit('on-search-confirm', this.searchData)
			this.$emit('update:visibleFlag', false)
		},
		// {{{ 删除
		onCheckBoxClick (item) {
			if (this.focusing) { // input不符合验证规则
				return false
			}
			this.$set(item, 'checked', !item.checked)
		},
		onSelectAllClick () {
			let flag = !this.isSelectAll
			let searchItem = this.detailFilter(this.searchData)
			searchItem.forEach(item => {
				if (this.itemDetailsLength(item)) {
					this.$set(item, 'checked', flag)
				}
			})
		},
		onDelSelect () {
			let checkedItem = this.searchData.filter(item => {
				return item.checked && this.itemDetailsLength(item)
			})
			if (!checkedItem.length) {
				this.$fxToast.top('请先选择品项!')
				return true
			}
			this.$dialog.confirm({
				title: '提示',
				message: '是否删除？'
			}).then(() => {
				checkedItem.forEach(item => {
					item.details.forEach((detailsItem, index) => {
						if (detailsItem.id) {
							detailsItem.changeType = 'del'
						} else {
							item.details.splice(index, 1)
						}
					})
					let itemIndex = this.searchData.findIndex(dataItem => {
						return dataItem.foodUnitId === item.foodUnitId
					})
					this.searchData.splice(itemIndex, 1, item)
				})
			})
		},
		// }}}
		onConfirmKey () {
			if (this.searchKey !== '') {
				return true
			}
		}
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
