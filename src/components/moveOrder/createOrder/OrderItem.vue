<template>
	<div class="order-item-block fx-shadow-block">
		<div class="item-title">
			<span class="title-name">单据明细</span>
			<span class="title-count">明细：</span>
			<span>{{detailsLength}}</span>
			<i v-show="!isDisabled" class="title-add-icon fl-r" @click="onAddClick"></i>
			<i class="title-search-icon fl-r" @click="onSearchClick"></i>
		</div>
		<div class="item-list" ref="details-content">
			<van-swipe-cell
				v-for="(item, index) in data"
				v-show="item.changeType !== 'del'"
				:ref="`details-row-${item.goodsDTO.id}`"
				:key="item.goodsDTO.id"
				class="item-row"
				:right-width="80"
				:disabled="isDisabled || focusing"
			>
				<itemInfoCell
					:itemData="item"
					:isDisabled="isDisabled"
					:disabledEditBtn="focusing"
					v-on="$listeners"
					@on-item-focus="onItemFocus(arguments, `${item.goodsDTO.id}`)"
					@on-item-blur="onItemBlur"
				></itemInfoCell>
				<div slot="right" class="item-row-delete" @click="onDeleteClick(item, index, data)">删除</div>
			</van-swipe-cell>
		</div>
	</div>
</template>

<script>
import itemInfoCell from '@/components/moveOrder/common/ItemInfoCell.vue'
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
	data () {
		return {
			focusing: false
		}
	},
	computed: {
		detailsLength () {
			return this.data.filter(item => {
				return item.changeType !== 'del'
			}).length
		}
	},
	watch: {
		focusing (val) {
			this.$emit('update:itemInputFocusing', val)
		}
	},
	methods: {
		onAddClick () {
			if (this.isDisabled || this.focusing) {
				return false
			}
			this.$emit('on-add-click')
		},
		onSearchClick () {
			if (this.focusing) {
				return false
			}
			this.$emit('on-search-click')
		},
		onDeleteClick (item, index, details) {
			if (item.id) {
				this.$set(item, 'changeType', 'del')
				this.$set(item, 'busUnitAmount', 0)
			} else {
				details.splice(index, 1)
			}
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
		.title-search-icon,.title-add-icon {
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
		.title-add-icon {
			background-image:url('~images/icon/icon-add-item.png')
			margin-right:10px
		}
	}
	.item-list {
		flex:1
		overflow:scroll
		position: relative;
		.item-store-title {
			height:40px
			line-height:40px
			font-size:12px
			text-indent:10px
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
	}
}
</style>
