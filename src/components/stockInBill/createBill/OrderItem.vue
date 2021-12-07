<template>
	<div class="order-item-block fx-shadow-block">
		<div class="item-title">
			<span class="title-name">单据明细</span>
			<span class="title-count">明细：</span>
			<span>{{detailsLength}}</span>
			<w-icon v-show="!isDisabled && (!hasFatherBillFlag||$fxSysAuth('shopStockInBill.SysEnableAutoShopInAddDetail')) && $fxAuth('shopStockInBill.add') && $fxAuth('shopStockInBill.editAmount')" class="title-add-icon fl-r" type='camera' @click="onScanClick"></w-icon>
			<i v-show="!isDisabled && (!hasFatherBillFlag||$fxSysAuth('shopStockInBill.SysEnableAutoShopInAddDetail')) && $fxAuth('shopStockInBill.add') && $fxAuth('shopStockInBill.editAmount')" class="title-add-icon fl-r" @click="onAddClick"/>
			<i class="title-search-icon fl-r" @click="onSearchClick"/>
		</div>
		<div class="item-list" ref="details-content">
			<van-collapse v-model="activeStoreNames" :border="false">
				<van-collapse-item :name="storeItem.id"
					v-for="storeItem in data"
					:key="storeItem.id"
					class="store-row"
					v-show="storeShowComputed(storeItem)"
				>
					<div slot="title" class="item-store-title">{{storeItem.name}}</div>
					<van-swipe-cell
						v-for="(item, index) in storeItem.details"
						:key="`${storeItem.id}-${item.goodsDTO.id}-${index}`"
						class="item-row"
						:right-width="80"
						v-show="item.changeType !== 'del'"
						:ref="`details-row-${storeItem.id}-${item.goodsDTO.id}`"
						:disabled="isDisabled || focusing"
					>
						<itemInfoCell
							:itemData="item"
							:isDisabled="isDisabled"
							:sysStockInChangeUnit="sysStockInChangeUnit"
							:disabledEditBtn="focusing"
							@on-item-focus="onItemFocus(arguments, `${storeItem.id}-${item.goodsDTO.id}`)"
							@on-item-blur="onItemBlur"
							v-on="$listeners"></itemInfoCell>
						<div slot="right" class="item-row-delete" @click="onDeleteClick(item, index, storeItem.details)">删除</div>
					</van-swipe-cell>
				</van-collapse-item>
			</van-collapse>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import itemInfoCell from '@/components/stockInBill/common/ItemInfoCell.vue'
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
		sysStockInChangeUnit: Boolean,
		itemInputFocusing: Boolean,
		hasFatherBillFlag: Boolean
	},
	data () {
		return {
			focusing: false,
			activeStoreNames: []
		}
	},
	computed: {
		...mapState({
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId
		}),
		storeShowComputed (storeItem) {
			return (storeItem) => {
				let hasDetails = storeItem.details.filter(item => {
					return item.changeType !== 'del'
				}).length
				return hasDetails > 0
			}
		},
		detailsLength () {
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
		onAddClick () {
			if (this.isDisabled || this.focusing) {
				return false
			}
			this.$emit('on-add-click')
		},
		onScanClick () {
			if (this.isDisabled || this.focusing) {
				return false
			}
			this.$emit('on-scan-click')
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
				this.$set(item, 'busUnitInAmount', 0)
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
		.title-add-icon {
			background-image:url('~images/icon/icon-add-item.png')
			margin-right:10px
		}
		.title-search-icon {
			background-image:url('~images/icon/icon-search.png')
			margin-right:10px
		}
	}
	.item-list {
		flex:1
		overflow:scroll
		position: relative
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
