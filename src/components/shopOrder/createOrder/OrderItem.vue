<template>
	<div class="order-item-block fx-shadow-block">
		<div class="item-title fx-title">
			<span class="title-name">单据明细</span>
			<span class="title-count">明细：</span>
			<span>{{detailsLength}}</span>
			<i v-show="!isDisabled" class="title-add-icon title-icon fl-r" @click="onEmitClick('on-add-click')"></i>
			<i class="title-search-icon title-icon fl-r" @click="onSearchClick"></i>
			<i v-show="autoType === 2 && $fxAuth('shopOrderBill.smartOrder')" class="intellect-basis-icon title-icon fl-r" @click="onIntellectbasisClick"></i>
			<i v-show="!isDisabled && $fxAuth('shopOrderBill.smartOrder')" class="intellect-order-icon title-icon fl-r" @click="onEmitClick('on-intellectorder-click')"></i>
		</div>
		<div class="item-list" ref="details-content">
			<van-collapse v-model="activeStoreNames" :border="false">
				<van-collapse-item :name="storeItem.id"
					v-for="storeItem in data"
					:key="storeItem.id"
					class="store-row"
					v-show="storeShowComputed(storeItem)"
				>
					<div slot="title" class="item-store-title fx-title fx-ellipsis">{{storeItem.name}}</div>
					<van-swipe-cell
						v-show="item.changeType !== 'del'"
						v-for="(item, index) in storeItem.details"
						:ref="`details-row-${storeItem.id}-${item.goodsDTO.id}`"
						:key="`${storeItem.id}-${item.goodsDTO.id}`"
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
							@on-item-focus="onItemFocus(arguments, `${storeItem.id}-${item.goodsDTO.id}`)"
							@on-item-blur="onItemBlur"
						></itemInfoCell>
						<div slot="right" class="fx-item-delete" @click="onDeleteClick(item, index, storeItem.details)">删除</div>
					</van-swipe-cell>
				</van-collapse-item>
			</van-collapse>
		</div>
	</div>
</template>

<script>
import itemInfoCell from '@/components/shopOrder/common/ItemInfoCell.vue'
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
		autoType: { // 生成方式 1手动
			type: Number,
			default: 1
		}
	},
	inheritAttrs: false,
	data () {
		return {
			focusing: false,
			activeStoreNames: []
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
			this.data.forEach(dataItem => {
				let hasDetails = dataItem.details.filter(item => {
					return item.changeType !== 'del'
				}).length
				if (hasDetails > 0) {
					this.activeStoreNames.push(dataItem.id)
				}
			})
		}
	},
	methods: {
		onEmitClick (type) {
			if (this.isDisabled || this.focusing) {
				return false
			}
			this.$emit(type)
		},
		onIntellectbasisClick () {
			this.$emit('on-intellectbasis-click')
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
			margin-left:10px
		}
		.title-count {
			margin-left:20px
		}
		.title-icon {
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
		.intellect-order-icon {
			background-image:url('~images/icon/icon-intellect-order.png')
			margin-right:10px
		}
		.intellect-basis-icon {
			background-image:url('~images/icon/icon-intellect-basis.png')
			margin-right:10px
		}
	}
	.item-list {
		flex:1
		overflow:scroll
		position: relative;
		.item-store-title {
			background-image:url('~images/icon/wind-ui/icon-house.svg')
			background-repeat: no-repeat
			background-position: 0 50%
			height:40px
			line-height:40px
			text-indent:24px
		}
		.item-row {
			border-bottom:1px solid $fxBorder
		}
	}
}
</style>
