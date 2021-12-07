<template>
	<div class="order-item-block fx-shadow-block">
		<div class="item-title">
			<span class="title-name">单据明细</span>
			<span class="title-count">明细：</span>
			<span>{{detailsLength}}</span>
			<i class="title-search-icon fl-r" @click="onSearchClick"></i>
		</div>
		<div class="item-list" ref="details-content">
			<van-swipe-cell
				v-for="item in data"
				v-show="item.changeType !== 'del'"
				:ref="`details-row-${item.id}-${item.goodsDTO.id}`"
				:key="`${item.id}-${item.goodsDTO.id}`"
				:disabled="isDisabled || focusing"
				class="item-row"
			>
				<itemInfoCell
					v-bind="$attrs"
					:itemData="item"
					:isDisabled="isDisabled"
					:disabledEditBtn="focusing"
					v-on="$listeners"
					@on-item-focus="onItemFocus(arguments, `${item.id}-${item.goodsDTO.id}`)"
					@on-item-blur="onItemBlur"
				></itemInfoCell>
			</van-swipe-cell>
		</div>
	</div>
</template>

<script>
import itemInfoCell from '@/components/shopMoveIn/common/ItemInfoCell.vue'
export default {
	name: 'orderItem',
	components: {
		itemInfoCell
	},
	props: {
		data: {
			type: Array,
			default: () => {
				return []
			}
		},
		isDisabled: Boolean,
		itemInputFocusing: Boolean
	},
	inheritAttrs: false,
	data () {
		return {
			focusing: false
		}
	},
	computed: {
		storeShowComputed (storeItem) {
			return (storeItem) => {
				let hasDetails = storeItem.details.filter(item => {
					return item.changeType !== 'del'
				}).length
				return hasDetails > 0
			}
		},
		detailsLength (arg) {
			return this.data.reduce((pre, cur) => {
				return cur.changeType !== 'del' ? pre + 1 : pre
			}, 0)
		}
	},
	watch: {
		focusing (val) {
			this.$emit('update:itemInputFocusing', val)
		}
	},
	methods: {
		onSearchClick () {
			if (this.focusing) {
				return false
			}
			this.$emit('on-search-click')
		},
		onItemFocus (arg, uuid) {
			this.focusing = true
		},
		onItemBlur () {
			this.focusing = false
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
@import '~$assets/stylus/extend.styl'
.order-item-block {
	@extend .fx-order-item-block_extend
	.item-title {
		height:40px
		line-height:40px
		border-bottom:1px solid $fxBorder
		.title-name {
			font-size:12px
			margin-left:10px
		}
		.title-count {
			margin-left:20px
		}
		.title-search-icon {
			width:16px
			height:40px
			background-repeat:no-repeat
			background-position: center
			background-size: 100%
			display:inline-block
		}
		.title-search-icon {
			background-image:url('~images/icon/icon-search.png')
			margin-right:10px
		}
	}
	.item-list {
		flex:1
		overflow:scroll
		position: relative;
		.item-row {
			border-bottom:1px solid $fxBorder
		}
	}
}
</style>
