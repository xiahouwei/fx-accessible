<template>
	<w-app-page class="item-search-block">
		<w-app-container>
			<w-header title="搜索品项" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
			<fx-search-bar
				v-model="searchKey"
				:isSelectAll="isSelectAll"
				:showSelectAllBtn="!isDisabled"
				@on-select-click="onSelectAllClick"
			></fx-search-bar>
			<div class="item-list" ref="details-content">
				<template v-for="(item, index) in detailsComputed">
					<van-swipe-cell
						v-show="item.changeType !== 'del'"
						ref="details-row"
						:key="`${item.goodsDTO.id}-${index}`"
						:right-width="80"
						:disabled="isDisabled || !$fxAuth('centerCheckBill4cld.delDetail')"
						:class="`item-row item-row-${index}`"
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
								:itemIndex="index"
								:editAmountType="editAmountType"
								:isEdit="index===editIndex"
								:isDisabled="isDisabled"
								:showPackInfo="centerCheck_enableItemPack==='1'"
								class="search-info"
								@on-item-edit="onSearchItemEdit"
								@on-amount-edit="onAmountEdit"
							></itemInfoCell>
						</div>
						<div slot="right" class="item-row-delete" @click="onDeleteClick(item, index, storeItem.details)">删除</div>
					</van-swipe-cell>
				</template>
			</div>
			<div v-show="showKeyboard" class="keyboard-masker" @click="onKeyboardClose"></div>
		</w-app-container>
		<w-bottom-btn-bar v-show="!showKeyboard">
			<w-button
				v-show="!isDisabled"
				size="large"
				type="primary"
				@click="onSearchConfirm"
			>保存</w-button>
			<w-button
				v-show="!isDisabled"
				size="large"
				type="danger"
				@click="onSelectConfirm"
			>删除</w-button>
		</w-bottom-btn-bar>
		<van-popup
			v-fx-history-back="itemRowEditPopShow"
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
			></itemRowEditPop>
		</van-popup>
		<itemNumberKeyboard
			ref="itemNumberKeyboard"
			v-model="showKeyboard"
			@prev="prev"
			@next="next"
			@close="onKeyboardClose"
			@on-edit-amount-type-change="onEditAmountTypeChange"
		></itemNumberKeyboard>
	</w-app-page>
</template>

<script>
import { mapState } from 'vuex'
import itemInfoCell from './ItemInfoCell.vue'
import itemRowEditPop from './ItemRowEditPop.vue'
import checkBox from '@/components/common/CheckBox.vue'
import itemNumberKeyboard from '@/components/centerCheckBill4cld/common/ItemNumberKeyboard.vue'
const SEARCH_KEY_LOCAL = ['code', 'name', 'pinYin']
export default {
	name: 'itemSearchPop',
	components: {
		itemInfoCell,
		itemRowEditPop,
		checkBox,
		itemNumberKeyboard
	},
	props: {
		data: {
			type: Array,
			default: () => {
				return []
			}
		},
		isDisabled: Boolean,
		visibleFlag: Boolean,
		inShopId: {
			type: String,
			default: ''
		},
		rdcId: {
			type: String,
			default: ''
		},
		businessDate: {
			type: [String, Number],
			default: ''
		},
		showScanCode: Boolean
	},
	data () {
		return {
			query: this.$route.query,
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			searchKey: '',
			searchKeywords: SEARCH_KEY_LOCAL,
			itemRowEditPopShow: false,
			itemEditRowData: {},
			showKeyboard: false,
			editIndex: -1,
			editAmountType: ''
		}
	},
	watch: {
		visibleFlag: {
			handler (val) {
				if (val) {
					this.searchKey = ''
				} else {
					this.$dialog.close()
				}
			},
			immediate: true
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize',
			centerCheck_enableItemPack: state => state.systemParamsCld.centerCheck_enableItemPack
		}),
		isSelectAll () {
			return this.data.every(item => {
				return item.changeType !== 'del' && !!item.checked
			})
		},
		detailsComputed () {
			return this.data.filter(item => {
				return item.changeType !== 'del' && !!this.searchKeywords.find(itemKey => {
					return this.$fxUtils.fuzzyQueryString(item.goodsDTO[itemKey], this.searchKey)
				})
			})
		}
	},
	methods: {
		detailFilter (items) {
			return items.filter(item => {
				return item.changeType !== 'del' && !!this.searchKeywords.find(itemKey => {
					return this.$fxUtils.fuzzyQueryString(item.goodsDTO[itemKey], this.searchKey)
				})
			})
		},
		onCloseClick () {
			this.$emit('update:visibleFlag', false)
		},
		onDeleteClick (item, index, details) {
			if (item.id) {
				this.$set(item, 'changeType', 'del')
			} else {
				details.splice(index, 1)
			}
		},
		onSearchItemEdit (itemData) {
			this.itemEditRowData = itemData
			this.itemRowEditPopShow = true
		},
		onSearchConfirm () {
			this.data.forEach(item => {
				delete item.checked
			})
			this.$emit('on-search-confirm', this.data)
			this.$emit('update:visibleFlag', false)
		},
		onCheckBoxClick (item) {
			this.$set(item, 'checked', !item.checked)
		},
		onSelectAllClick () {
			let flag = !this.isSelectAll
			this.data.forEach(item => {
				if (item.changeType !== 'del') {
					this.$set(item, 'checked', flag)
				}
			})
		},
		onSelectConfirm () {
			let checkedItem = this.data.some(item => {
				return item.checked && item.changeType !== 'del'
			})
			if (!checkedItem) {
				this.$fxToast.top('请先选择品项!')
				return false
			}
			this.$dialog.confirm({
				title: '提示',
				message: '是否删除？'
			}).then(() => {
				for (let i = this.data.length - 1; i >= 0; i--) {
					let item = this.data[i]
					if (item.checked) {
						if (item.id) {
							this.$set(item, 'changeType', 'del')
						} else {
							item.splice(i, 1)
						}
					}
				}
			})
		},
		onAmountEdit (type, itemData, itemIndex) {
			this.editAmountType = type
			this.editIndex = itemIndex
			this.$refs.itemNumberKeyboard.open(type, itemData, itemIndex)
			this.scrollTop(itemIndex)
		},
		prev (itemIndex) {
			if (itemIndex === 0) {
				return false
			}
			const index = itemIndex - 1
			this.editIndex = index
			const itemData = this.detailsComputed[index]
			this.$refs.itemNumberKeyboard.open('busFactAmount1', itemData, index)
			this.scrollTop(index)
		},
		next (itemIndex) {
			if (itemIndex === this.detailsComputed.length - 1) {
				return false
			}
			const index = itemIndex + 1
			this.editIndex = index
			const itemData = this.detailsComputed[index]
			this.$refs.itemNumberKeyboard.open('busFactAmount1', itemData, index)
			this.scrollTop(index)
		},
		scrollTop (index) {
			const el = this.$refs['details-content'].querySelector(`.item-row-${index}`)
			this.$fxUtils.doScrollTop(el)
		},
		onKeyboardClose () {
			this.editAmountType = ''
			this.editIndex = -1
			this.showKeyboard = false
		},
		onEditAmountTypeChange (type) {
			this.editAmountType = type
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.item-search-block {
	.item-list {
		flex:1
		overflow:scroll
		position: relative
		text-align: left
		padding: 0 13px
		width: 350px
		.item-store-title-container {
			display:flex
			flex-direction: row;
			align-items: center;
			font-size:12px
			height:40px
			.item-store-title {
				display:flex
				flex-direction: row;
				justify-content: space-between;
				align-items: center;
				flex:1
				margin-left: 10px;
			}
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
}
.keyboard-masker {
	position: absolute
	top: 0
	left: 0
	right: 0
	bottom: 0
	z-index: 500
}
</style>
