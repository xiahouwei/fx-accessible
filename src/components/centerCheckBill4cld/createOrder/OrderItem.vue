<template>
	<div class="order-item-block fx-shadow-block">
		<div class="item-title">
			<span class="title-name">单据明细</span>
			<span class="title-count">明细：</span>
			<span>{{detailsLength}}</span>
			<i v-show="!isDisabled && showAddItemBtn" class="title-add-icon fl-r" @click="onEmitClick('on-add-click')"></i>
			<i class="title-search-icon fl-r" @click="onSearchClick"></i>
		</div>
		<div class="item-list" ref="details-content">
			<template v-for="(item, index) in visiableData">
				<van-swipe-cell
					:key="item.uuid"
					:right-width="80"
					:disabled="isDisabled || !$fxAuth('centerCheckBill4cld.delDetail')"
					:class="`item-row item-row-${index}`"
				>
					<itemInfoCell
						ref="itemInfoCell"
						v-bind="$attrs"
						:itemData="item"
						:isDisabled="isDisabled"
						:itemIndex="index"
						:isEdit="index===editIndex"
						v-on="$listeners"
					></itemInfoCell>
					<div slot="right" class="item-row-delete" @click="onDeleteClick(item, index)">删除</div>
				</van-swipe-cell>
			</template>
		</div>
	</div>
</template>

<script>
import itemInfoCell from '@/components/centerCheckBill4cld/common/ItemInfoCell.vue'
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
		showAddItemBtn: Boolean,
		editIndex: Number
	},
	inheritAttrs: false,
	computed: {
		visiableData () {
			return this.data.filter(item => {
				return item.changeType !== 'del'
			})
		},
		detailsLength () {
			return this.visiableData.length
		}
	},
	methods: {
		onEmitClick (type) {
			if (this.isDisabled) {
				return false
			}
			this.$emit(type)
		},
		onSearchClick () {
			this.$emit('on-search-click')
		},
		onDeleteClick (item) {
			if (item.id) {
				this.$set(item, 'changeType', 'del')
			} else {
				const index = this.data.findIndex(_item => {
					return _item.goodsDTO.id === item.goodsDTO.id
				})
				if (~index) {
					this.data.splice(index, 1)
				}
			}
		},
		prev (itemIndex) {
			if (itemIndex === 0) {
				return false
			}
			const index = itemIndex - 1
			const el = document.querySelector(`.item-row-${index}`)
			this.$fxUtils.doScrollTop(el)
			const itemData = this.visiableData[index]
			this.$emit('on-amount-edit', 'busFactAmount1', itemData, index)
		},
		next (itemIndex) {
			if (itemIndex === this.visiableData.length - 1) {
				return false
			}
			const index = itemIndex + 1
			const el = document.querySelector(`.item-row-${index}`)
			this.$fxUtils.doScrollTop(el)
			const itemData = this.visiableData[index]
			this.$emit('on-amount-edit', 'busFactAmount1', itemData, index)
		},
		scrollTop (index) {
			const el = this.$refs['details-content'].querySelector(`.item-row-${index}`)
			this.$fxUtils.doScrollTop(el)
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
		.item-store-title-container {
			display:flex
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
			font-size:12px
			height:40px
			padding-left: 10px;
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
