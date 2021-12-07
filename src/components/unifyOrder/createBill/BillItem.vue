<template>
	<div class="order-item-block fx-shadow-block">
		<div class="item-title">
			<span class="title-name">单据明细</span>
			<span class="title-count">明细：</span>
			<span>{{detailsLength}}</span>
			<i v-show="$fxAuth('distributionInBill.checkAndAccept') && !isDisabled && $fxSysAuth('distributionInBill.SysOpenAcceptGroup')" class="complete title-complete-icon fl-r" @click="onCompleteClick"></i>
			<i class="complete title-search-icon  fl-r" @click="onSearchClick"></i>
		</div>
		<div class="item-list" ref="details-content">
			<van-collapse v-model="activeStoreNames" :border="false">
				<van-collapse-item :name="storeItem.id"
					v-show="storeShowComputed(storeItem)"
					v-for="storeItem in data"
					:key="storeItem.id"
					class="store-row"
				>
					<div slot="title" class="item-store-title fx-ellipsis">{{storeItem.name}}</div>
					<van-swipe-cell
						v-for="(item, index) in storeItem.details"
						v-show="item.changeType !== 'del'"
						:ref="`details-row-${storeItem.id}-${item.goodsDTO.id}`"
						:key="`${item.id}`"
						:right-width="80"
						:disabled="isDisabled || !$fxAuth('distributionInBill.delDetail') || focusing"
						class="item-row"
					>
						<itemInfoCell
							:itemData="item"
							:isDisabled="isDisabled"
							:disabledEditBtn="focusing"
							v-on="$listeners"
							@on-item-focus="onItemFocus(arguments, `${storeItem.id}-${item.goodsDTO.id}`)"
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
import itemInfoCell from '@/components/unifyOrder/common/ItemInfoCell.vue'
export default {
	name: 'billItem',
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
			focusing: false,
			activeStoreNames: []
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
	computed: {
		detailsLength () {
			return this.data.reduce((pre, cur) => {
				let arr = cur.details.filter(item => {
					return item.changeType !== 'del'
				})
				return pre + arr.length
			}, 0)
		},
		storeShowComputed (storeItem) {
			return (storeItem) => {
				let hasDetails = storeItem.details.filter(item => {
					return item.changeType !== 'del'
				}).length
				return hasDetails > 0
			}
		}
	},
	methods: {
		onCompleteClick () {
			if (this.focusing) {
				return false
			}
			this.$emit('on-complete-click')
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
	.complete{
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
	.title-complete-icon {
		background-image:url('~images/icon/icon-complete.png')
		margin-right:10px
	}
}
</style>
