<template>
	<div class="order-item-block fx-shadow-block">
		<div class="item-title">
			<span class="title-name">单据明细</span>
			<span class="title-count">明细：</span>
			<span>{{detailsLength}}</span>
			<span class="title-count">总金额：</span>
			<span>{{sumMoney}}</span>
			<i v-show="!isDisabled && showAddItemBtn" class="title-add-icon fl-r" @click="onEmitClick('on-add-click')"></i>
			<i class="title-search-icon fl-r" @click="onSearchClick"></i>
		</div>
		<div class="item-list" ref="details-content">
			<van-swipe-cell
				v-show="item.changeType !== 'del'"
				v-for="(item) in data"
				:key="item.uuid"
				:right-width="80"
				:disabled="isDisabled || focusing || !$fxAuth('centerCheckBill4cld.delDetail')"
				class="item-row"
			>
				<itemInfoCell
					v-bind="$attrs"
					:itemData="item"
					:isDisabled="isDisabled"
					:disabledEditBtn="focusing"
					v-on="$listeners"
					@on-item-focus="onItemFocus"
					@on-item-blur="onItemBlur"
				></itemInfoCell>
			</van-swipe-cell>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import itemInfoCell from '@/components/centerCheckIn4cld/common/ItemInfoCell.vue'
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
		showAddItemBtn: Boolean
	},
	inheritAttrs: false,
	data () {
		return {
			focusing: false
		}
	},
	computed: {
		...mapState({
			sysMoneyPointSize: 'sysMoneyPointSize'
		}),
		visiableData () {
			return this.data.filter(item => {
				return item.changeType !== 'del'
			})
		},
		detailsLength () {
			return this.visiableData.length
		},
		sumMoney () {
			const sum = this.visiableData.reduce((pre, cur) => {
				return pre + cur.inMoney
			}, 0)
			return this.$fxUtils.toFixedSHW(sum, this.sysMoneyPointSize)
		}
	},
	watch: {
		focusing (val) {
			this.$emit('update:itemInputFocusing', val)
		}
	},
	methods: {
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
		onItemFocus () {
			this.focusing = true
		},
		onItemBlur () {
			this.focusing = false
			this.$emit('on-input-blur')
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
