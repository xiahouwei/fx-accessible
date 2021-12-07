<template>
	<div class="order-item-block">
		<div class="item-head">
			<searchHead :initSearch="isInit" :searchKey.sync="searchKey"></searchHead>
		</div>
		<div class="item-list" ref="details-content">
			<van-swipe-cell
				v-show="item.changeType !== 'del'"
				v-for="item in $fxCommon.detailFilter(data, searchKey)"
				:ref="`details-row-${item.id}`"
				:key="`${item.id}`"
				class="item-row"
			>
				<itemInfoCell
					v-bind="$attrs"
					:itemData="item"
					v-on="$listeners"
					@on-item-focus="onItemFocus(arguments, `${item.id}`)"
					@on-item-blur="onItemBlur"
				></itemInfoCell>
			</van-swipe-cell>
		</div>
	</div>
</template>

<script>
import itemInfoCell from '@/components/stockApply/minusBill/ItemInfoCell.vue'
import searchHead from '@/components/common/searchHead.vue'
export default {
	name: 'orderItem',
	components: {
		itemInfoCell,
		searchHead
	},
	props: {
		data: {
			type: Array,
			default: () => {
				return []
			}
		},
		isInit: Boolean,
		itemInputFocusing: Boolean
	},
	inheritAttrs: false,
	data () {
		return {
			focusing: false,
			searchKey: ''
		}
	},
	watch: {
		focusing (val) {
			this.$emit('update:itemInputFocusing', val)
		},
		isInit: {
			handler (val) {
				if (val) {
					this.searchKey = ''
				}
			},
			immediate: true
		}
	},
	methods: {
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
.order-item-block {
	padding: 5px
	text-align: left
	flex: 1
	display: flex
	flex-direction: column
	min-height: 1px
	.item-head {
		height:40px
		line-height:40px
		border-bottom:1px solid $fxBorder
		display: flex
	}
	.item-list {
		flex:1
		overflow: scroll
		position: relative
		padding: 0px 11px
	}
}
</style>
