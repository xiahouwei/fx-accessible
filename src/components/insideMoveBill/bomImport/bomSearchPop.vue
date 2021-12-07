<template>
	<div class="item-search-block">
		<w-header title="已导入BOM" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div class="item-search clearfix">
			<van-search
				v-model="searchKey"
				placeholder="请输入搜索关键词"
				shape="round"
				/>
		</div>
		<div class="item-list bom-search-list" ref="details-content">
			<van-swipe-cell
				v-show="item.changeType !== 'del'"
				v-for="item in detailFilter(data)"
				:ref="`details-row-${item.goods.id}`"
				:key="`${item.goods.id}-${item.goodsUUid}`"
				class="item-row"
			>
				<div class="item-cell">
					<bomInfoCell
						:itemData="item"
						class="search-info"
					></bomInfoCell>
				</div>
			</van-swipe-cell>
		</div>
	</div>
</template>

<script>
import bomInfoCell from '@/components/insideMoveBill/bomImport/bomInfoCell.vue'
export default {
	name: 'bomSearchPop',
	components: {
		bomInfoCell
	},
	props: {
		data: {
			type: Array,
			default: () => {
				return []
			}
		},
		visibleFlag: Boolean,
		searchKeywords: String
	},
	data () {
		return {
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			searchKey: ''
		}
	},
	watch: {
		visibleFlag: {
			handler (val) {
				if (val) {
					this.searchKey = ''
					this.setDetailGoodsUUid(this.data)
				}
			},
			immediate: true
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
		storeShowComputed (store) {
			return this.detailFilter(store.details).length > 0
		},
		detailFilter (items) {
			return items.filter(item => {
				return !!this.searchKeywords.split(',').find(itemKey => {
					if (item.goods[itemKey].includes(this.searchKey)) {
						return true
					}
				})
			})
		},
		onCloseClick () {
			this.$emit('update:visibleFlag', false)
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
		.item-row {
			border-bottom:1px solid $fxBorder
		}
	}
}
</style>
