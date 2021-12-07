<template>
	<div class="order-item-block">
		<div class="item-head">
			<van-search v-model="searchWord" class="head-search" @search="changeSearchWord" @clear="changeSearchWord" @input="inputSearchKey" shape="round" placeholder="请输入搜索关键词" />
			<i class="filter-icon fl-r" @click="onFilterClick"></i>
			<div class="head-text" @click="onBatchSetClick"><i class="batch-ser-icon fl-l"></i>批量设置</div>
		</div>
		<div class="item-list" ref="details-content">
			<van-swipe-cell
				v-show="item.changeType !== 'del'"
				v-for="item in data"
				:ref="`details-row-${item.id}`"
				:key="`${item.id}`"
				class="item-row"
			>
				<itemInfoCell
					v-bind="$attrs"
					:itemData="item"
					:showCheckBox="true"
					v-on="$listeners"
					@on-item-focus="onItemFocus(arguments, `${item.houseDTO.id}-${item.goodsDTO.id}`)"
					@on-item-blur="onItemBlur"
				></itemInfoCell>
			</van-swipe-cell>
		</div>
	</div>
</template>

<script>
import itemInfoCell from '@/components/stockApplySend/common/ItemInfoCell.vue'
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
		searchKey: String,
		itemInputFocusing: Boolean
	},
	inheritAttrs: false,
	data () {
		return {
			focusing: false,
			searchWord: ''
		}
	},
	computed: {},
	watch: {
		focusing (val) {
			this.$emit('update:itemInputFocusing', val)
		}
	},
	methods: {
		changeSearchWord () {
			this.$emit('on-search-change', this.searchWord)
		},
		inputSearchKey () {
			this.$emit('update:searchKey', this.searchWord)
		},
		onFilterClick () {
			if (this.focusing) {
				return false
			}
			this.$emit('on-filter-click')
		},
		onBatchSetClick () {
			if (this.focusing) {
				return false
			}
			this.$emit('on-batch-click')
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
	.item-head {
		height:40px
		line-height:40px
		border-bottom:1px solid $fxBorder
		display: flex
		.head-search {
			flex: 1
		}
		.head-text {
			color: $fxBlue
		}
		.title-name {
			font-size:12px
			margin-left:10px
		}
		.title-count {
			margin-left:20px
		}
		.batch-ser-icon,.filter-icon {
			width:16px
			height:40px
			background-repeat:no-repeat
			background-position: center
			background-size: 100%
			display:inline-block
		}
		.batch-ser-icon {
			background-image:url('~images/icon/icon-batch-set.png')
			margin-right:4px
		}
		.filter-icon {
			background-image:url('~images/icon/icon-filter.png')
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
