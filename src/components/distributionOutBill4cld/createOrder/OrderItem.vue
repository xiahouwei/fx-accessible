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
			<van-collapse v-model="activeStoreNames" :border="false">
				<van-collapse-item :name="`${storeItem.id}-${storeItem.shopHouseDTO.id}`"
					v-for="storeItem in data"
					:key="storeItem.uuid"
					class="store-row"
					v-show="storeShowComputed(storeItem)"
				>
					<div slot="title" class="item-store-title-container">
						<span class="item-out-store-title fx-ellipsis">出库仓库：{{storeItem.name}}</span>
						<span class="item-in-store-title fx-ellipsis">入库仓库：{{storeItem.shopHouseDTO.name}}</span>
					</div>
					<van-swipe-cell
						v-show="item.changeType !== 'del'"
						v-for="(item, index) in storeItem.details"
						:key="item.uuid"
						:right-width="80"
						:disabled="isDisabled || focusing || !$fxAuth('distributionOutBill4cld.delDetail')"
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
							@on-unit-edit="onUnitEdit"
						></itemInfoCell>
						<div slot="right" class="item-row-delete" @click="onDeleteClick(item, index, storeItem.details)">删除</div>
					</van-swipe-cell>
				</van-collapse-item>
			</van-collapse>
		</div>
		<w-action-sheet
			v-fx-history-back="unitActionShow"
			ref="unitActionSheet"
			v-model="unitActionShow"
			:actions="unitActions"
		></w-action-sheet>
	</div>
</template>

<script>
import itemInfoCell from '@/components/distributionOutBill4cld/common/ItemInfoCell.vue'
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
			focusing: false,
			activeStoreNames: [],
			unitActions: [],
			unitActionShow: false
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
					this.activeStoreNames.push(`${dataItem.id}-${dataItem.shopHouseDTO.id}`)
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
		onItemFocus () {
			this.focusing = true
		},
		onItemBlur () {
			this.focusing = false
		},
		onUnitEdit (item) {
			this.$fxApi('common.getItemUnit', item.goodsDTO.id).then(res => {
				this.unitActions = res.units
				this.$refs.unitActionSheet.doSelect(item.unitDTO.id).then(unitItem => {
					this.$fxCalculation('distributionOutBill4cld').changeUnit(item, unitItem)
				})
			})
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
