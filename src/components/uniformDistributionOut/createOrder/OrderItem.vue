<template>
	<div class="order-item-block fx-shadow-block">
		<div class="item-title">
			<span class="title-name">单据明细</span>
			<span class="title-count">明细：</span>
			<span>{{detailsLength}}</span>
			<i v-show="!isDisabled && isAutoType([1, 6])" class="title-add-icon fl-r" @click="onEmitClick('on-add-click')"></i>
			<i class="title-search-icon fl-r" @click="onSearchClick"></i>
			<!--i v-show="billId !== '' && !isDisabled && $fxSysAuth('distributionOutBill.noEnoughAmount')" class="title-send-icon fl-r" @click="onSendOutClick"></-->
		</div>
		<div class="item-list" ref="details-content">
			<van-collapse v-model="activeStoreNames" :border="false">
				<van-collapse-item :name="`${storeItem.id}-${storeItem.shopHouseDTO.id}`"
					v-for="storeItem in data"
					:key="`${storeItem.id}-${storeItem.shopHouseDTO.id}`"
					class="store-row"
					v-show="storeShowComputed(storeItem)"
				>
					<div slot="title">
						<span class="item-store-title fx-ellipsis">出库仓库：{{storeItem.name}}</span>
						<span class="store-right-name fx-ellipsis">入库仓库：{{storeItem.shopHouseDTO.name}}</span>
					</div>
					<van-swipe-cell
						v-show="item.changeType !== 'del'"
						v-for="(item, index) in storeItem.details"
						:ref="`details-row-${storeItem.shopHouseDTO.id}-${item.goodsDTO.id}`"
						:key="`${storeItem.shopHouseDTO.id}-${item.goodsDTO.id}-${item.goodsUUid}`"
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
							@on-item-focus="onItemFocus(arguments, `${storeItem.shopHouseDTO.id}-${item.goodsDTO.id}`)"
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
import itemInfoCell from '@/components/uniformDistributionOut/common/ItemInfoCell.vue'
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
		billId: {
			type: String,
			default: ''
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
		},
		// 生成方式 0自动 1手动 6快速生成 9超收补单
		isAutoType (state) {
			return state => {
				if (Object.prototype.toString.call(state) === '[object Array]') {
					return state.includes(this.autoType)
				} else {
					return this.autoType === state
				}
			}
		}
	},
	watch: {
		focusing (val) {
			this.$emit('update:itemInputFocusing', val)
		},
		data () {
			this.setDetailGoodsUUid(this.data)
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
		// {{{统配出库单分批之后可以生成相同仓库下相同品项，故设置uuid，唯一标示key值
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
		onSendOutClick () {
			if (this.focusing) {
				return false
			}
			this.$emit('on-send-click')
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
		.title-search-icon,.title-send-icon,.title-add-icon {
			width:16px
			height:40px
			background-repeat:no-repeat
			background-position: center
			background-size: 100%
			display:inline-block
		}
		.title-send-icon {
			background-image:url('~images/icon/icon-send.png')
			margin-right:10px
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
			font-size:12px
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
