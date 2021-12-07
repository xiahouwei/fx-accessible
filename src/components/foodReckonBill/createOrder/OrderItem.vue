<template>
	<div class="order-item-block fx-shadow-block">
		<div class="item-title">
			<span class="title-name">单据明细</span>
			<span class="title-count">明细：</span>
			<span>{{detailsLength}}</span>
			<i v-show="!isDisabled && autoType === 1" class="title-add-icon fl-r" @click="onEmitClick('on-add-click')"></i>
			<i class="title-search-icon fl-r" @click="onSearchClick"></i>
		</div>
		<div class="item-list" ref="details-content">
			<van-swipe-cell
				v-show="itemDetailsLength(item)"
				v-for="item in data"
				:ref="`details-row-${item.goodsUUid}`"
				:key="`${item.goodsUUid}`"
				:right-width="80"
				:disabled="isDisabled || focusing"
				class="item-row"
			>
				<itemInfoCell
					v-bind="$attrs"
					:itemData="item"
					:isDisabled="isDisabled"
					:disabledEditBtn="focusing"
					v-on="$listeners"
				></itemInfoCell>
				<div slot="right" class="item-row-delete" @click="onDeleteClick(item)">删除</div>
			</van-swipe-cell>
		</div>
	</div>
</template>

<script>
import itemInfoCell from '@/components/foodReckonBill/common/ItemInfoCell.vue'
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
		itemInputFocusing: Boolean,
		autoType: {
			type: Number,
			default: 1
		}
	},
	inheritAttrs: false,
	data () {
		return {
			focusing: false
		}
	},
	computed: {
		detailsLength () {
			return this.data.filter(item => {
				return this.itemDetailsLength(item)
			}).length
		}
	},
	watch: {
		focusing (val) {
			this.$emit('update:itemInputFocusing', val)
		},
		data () {
			this.setDetailGoodsUUid(this.data)
		}
	},
	methods: {
		// {{{设置uuid，唯一标示key值
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
		onEmitClick (type) {
			if (this.isDisabled || this.focusing) {
				return false
			}
			this.$emit(type)
		},
		onSearchClick () {
			if (this.focusing) {
				return false
			}
			this.$emit('on-search-click')
		},
		onDeleteClick (item) {
			item.details.forEach((detailsItem, index) => {
				if (detailsItem.id) {
					detailsItem.changeType = 'del'
				} else {
					item.details.splice(index, 1)
				}
			})
			let itemIndex = this.data.findIndex(dataItem => {
				return dataItem.foodUnitId === item.foodUnitId
			})
			this.data.splice(itemIndex, 1, item)
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
			max-width: 155px
			display:inline-block
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
	}
}
</style>
