<template>
	<w-app-page class="item-search-block">
		<w-header title="搜索品项" :leftOptions="leftOptions" @on-click-back="onCloseClick">
		</w-header>
		<fx-search-bar
			v-model="searchKey"
			:isSelectAll="isSelectAll"
			:showSelectAllBtn="!isDisabled"
		></fx-search-bar>
		<div class="item-list" ref="details-content">
			<van-swipe-cell
				v-show="item.changeType !== 'del'"
				v-for="(item, index) in detailsComputed"
				ref="details-row"
				:key="`${item.goodsDTO.id}-${index}`"
				:right-width="80"
				disabled
				class="item-row"
			>
				<div class="item-cell">
					<itemInfoCell
						:itemData="item"
						:isDisabled="isDisabled"
						:disabledEditBtn="focusing"
						@on-item-edit="onSearchItemEdit"
						@on-item-focus="onItemFocus"
						@on-item-blur="onItemBlur"
						class="search-info"
					></itemInfoCell>
				</div>
			</van-swipe-cell>
		</div>
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
	</w-app-page>
</template>

<script>
import { mapState } from 'vuex'
import itemInfoCell from './ItemInfoCell.vue'
import itemRowEditPop from './ItemRowEditPop.vue'
const SEARCH_KEY_LOCAL = ['code', 'name', 'pinYin']
export default {
	name: 'itemSearchPop',
	components: {
		itemInfoCell,
		itemRowEditPop
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
			focusing: false,
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			searchKey: '',
			searchKeywords: SEARCH_KEY_LOCAL,
			itemRowEditPopShow: false,
			itemEditRowData: {}
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
			sysPointSize: 'sysPointSize'
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
			if (this.focusing) {
				return false
			}
			this.$emit('update:visibleFlag', false)
		},
		onItemFocus () {
			this.focusing = true
		},
		onItemBlur () {
			this.focusing = false
		},
		onSearchItemEdit (itemData) {
			this.itemEditRowData = itemData
			this.itemRowEditPopShow = true
		},
		onSearchConfirm () {
			this.$emit('update:visibleFlag', false)
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
</style>
