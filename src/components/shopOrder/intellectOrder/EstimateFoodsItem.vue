<template>
	<div class="estimateEdit-item-block">
		<div class="item-head">
			<searchHead :initSearch="visibleFlag" :searchKey.sync="searchKey"></searchHead>
			<div class="head-checkbox">
				<checkBox
					:visibleFlag="true"
					:checked="checkFlag"
					class="filter-checkbox"
					@on-checkbox-click="onCheckClick()"
				></checkBox>
				<span class="checkbox-name">考虑盘盈盘亏</span>
				<checkBox
					:visibleFlag="true"
					:checked="breakFlag"
					class="filter-checkbox"
					@on-checkbox-click="onBreakClick()"
				></checkBox>
				<span class="checkbox-name">考虑预估报损</span>
			</div>
		</div>
		<div class="item-list" ref="details-content">
			<van-swipe-cell
				v-for="item in detailFilter(data, searchKey)"
				:ref="`details-row-${item.foodCode}`"
				:key="`${item.foodCode}-${item.foodUnitId}`"
				class="item-row"
			>
				<foodsInfoCell
					:itemData="item"
					:attrsParams="$attrs"
				></foodsInfoCell>
			</van-swipe-cell>
		</div>
	</div>
</template>

<script>
import foodsInfoCell from '@/components/shopOrder/intellectOrder/foodsInfoCell.vue'
import searchHead from '@/components/common/searchHead.vue'
import checkBox from '@/components/common/CheckBox.vue'
export default {
	name: 'estimateFoodsItem',
	components: {
		foodsInfoCell,
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
		visibleFlag: Boolean,
		checkFlag: Boolean,
		breakFlag: Boolean
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
						item.foodCustomCount = item.foodReckonCount
						item.customFoodThousandCount = item.foodThousandCount
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
		onCheckClick () {
			this.$emit('update:checkFlag', !this.checkFlag)
		},
		onBreakClick () {
			this.$emit('update:breakFlag', !this.breakFlag)
		},
		detailFilter (items, searchKey, searchKeywords = 'foodCode,foodName,foodPy') {
			return items.filter(item => {
				return item.changeType !== 'del' && !!searchKeywords.split(',').find(itemKey => {
					if (item[itemKey].toLowerCase().includes(searchKey.toLowerCase())) {
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
		border-bottom:1px solid $fxBorder
		display: flex
		flex-direction: column
		.head-checkbox {
			display: flex
			padding: 7px 0
		}
		.checkbox-name {
			flex: 1
			margin-left: 5px
		}
	}
	.item-list {
		flex:1
		overflow:scroll
		position: relative
	}
}
</style>
