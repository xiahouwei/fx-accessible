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
			<van-collapse v-model="activeStoreNames" :border="false">
				<van-collapse-item name="1"
					v-for="storeItem in data"
					:key="`${storeItem.id}`"
					class="store-row"
					v-show="storeShowComputed(storeItem)"
				>
					<div slot="title">
						<span class="item-store-title fx-ellipsis">{{storeItem.name}}</span>
					</div>
					<van-swipe-cell
						v-show="item.changeType !== 'del'"
						v-for="(item, index) in storeItem.details"
						:ref="`details-row-${item.goodsDTO.id}-${item.goodsUUid}`"
						:key="`${item.goodsDTO.id}-${item.goodsUUid}`"
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
							@on-item-focus="onItemFocus(arguments, `${item.goodsDTO.id}-${item.goodsUUid}`)"
							@on-item-blur="onItemBlur"
						></itemInfoCell>
						<div slot="right" class="item-row-delete" @click="onDeleteClick(item, index, storeItem.details)">删除</div>
					</van-swipe-cell>
				</van-collapse-item>
			</van-collapse>
		</div>
	</div>
</template>

<script>
import itemInfoCell from '@/components/salesOut/common/ItemInfoCell.vue'
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
			focusing: false,
			activeStoreNames: ['1']
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
				let arr = cur.details.filter(item => {
					return item.changeType !== 'del'
				})
				return pre + arr.length
			}, 0)
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
			data.forEach(dataItem => {
				dataItem.details.forEach(item => {
					item.goodsUUid = this.$fxUtils.createUUID()
				})
			})
		},
		// }}}
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
		onDeleteClick (item, index, details) {
			if (item.id) {
				this.$set(item, 'changeType', 'del')
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
