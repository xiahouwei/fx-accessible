<template>
	<div class="estimateEdit-item-block">
		<div class="item-head">
			<searchHead :initSearch="visibleFlag" :searchKey.sync="searchKey"></searchHead>
		</div>
		<div class="item-list" ref="details-content">
			<van-swipe-cell
				v-for="item in detailFilter(data, searchKey)"
				:ref="`details-row-${item.goods.id}`"
				:key="`${item.goods.id}-${item.unit.id}`"
				class="item-row"
			>
				<goodsInfoCell
					v-bind="$attrs"
					:itemData="item"
				></goodsInfoCell>
			</van-swipe-cell>
		</div>
	</div>
</template>

<script>
import goodsInfoCell from '@/components/shopOrder/intellectOrder/goodsInfoCell.vue'
import searchHead from '@/components/common/searchHead.vue'
export default {
	name: 'estimateGoodsItem',
	components: {
		goodsInfoCell,
		searchHead
	},
	props: {
		data: {
			type: Array,
			default: () => {
				return []
			}
		},
		visibleFlag: Boolean
	},
	inheritAttrs: false,
	data () {
		return {
			searchKey: ''
		}
	},
	watch: {
		visibleFlag: {
			handler (val) {
				if (val) {
					this.searchKey = ''
					this.data.forEach(item => {
						item.customCount = item.reckonCount >= 0 ? item.reckonCount : 0
					})
				}
			},
			immediate: true
		}
	},
	methods: {
		onCloseClick () {
			this.$emit('update:visibleFlag', false)
		},
		detailFilter (items, searchKey, searchKeywords = 'code,name,pinYin') {
			return items.filter(item => {
				return item.changeType !== 'del' && !!searchKeywords.split(',').find(itemKey => {
					if (item.goods[itemKey].toLowerCase().includes(searchKey.toLowerCase())) {
						return true
					}
				})
			})
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
@import '~$assets/stylus/extend.styl'
.estimateEdit-item-block {
	@extend .fx-order-item-block_extend
	.item-head {
		height:40px
		line-height:40px
		border-bottom:1px solid $fxBorder
		display: flex
	}
	.item-list {
		flex:1
		overflow:scroll
		position: relative
	}
}
</style>
