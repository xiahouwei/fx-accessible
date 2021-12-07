<template>
	<div class="order-item-block fx-shadow-block">
		<div class="item-title">
			<span class="title-name">单据明细</span>
			<span class="title-count">明细：</span>
			<span>{{detailsLength}}</span>
			<i v-show="showAddBtn() && $fxAuth('shopCheckBill.bomCheck') && hasSumBatch" class="title-selectbom-icon title-icon fl-r" @click="onSelectBomClick"></i>
			<i v-show="$fxAuth('shopCheckBill.bomCheck') && hasSumBatch" class="title-viewbom-icon title-icon fl-r" @click="onViewBomClick"></i>
			<i v-show="showAddBtn() && hasSumBatch" class="title-add-icon title-icon fl-r" @click="onAddClick"></i>
			<i class="title-search-icon title-icon fl-r" @click="onSearchClick"></i>
			<i v-show="!isDisabled" class="title-mic-icon title-icon fl-r" @click="onMicClick"></i>
		</div>
		<div class="item-list" ref="details-content">
			<van-swipe-cell
				v-for="item in filteScroll(data)"
				v-show="item.changeType !== 'del'"
				:ref="`details-row-${item.goodsUUid}`"
				:key="item.goodsUUid"
				:right-width="80"
				:disabled="!showAddBtn() || focusing"
				class="item-row"
			>
				<itemInfoCell
					:itemData="item"
					:isDisabled="isDisabled"
					:disabledEditBtn="focusing"
					:isPlan="planId ? true : false"
					v-on="$listeners"
					@on-item-focus="onItemFocus(arguments, `${item.goodsUUid}`)"
					@on-item-blur="onItemBlur"
				></itemInfoCell>
				<div slot="right" class="item-row-delete" @click="onDeleteClick(item,data)">删除</div>
			</van-swipe-cell>
			<div class="item-row-load" v-if="scrollDataEnd !== data.length">加载中...</div>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import itemInfoCell from '@/components/checkBill/common/ItemInfoCell.vue'
const SCROLL_SIZE = 10 // 加载的数量
const SHOW_ITEM_SIZE = 20 // 缓存的数量
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
		planId: String,
		hasSumBatch: Boolean,
		itemInputFocusing: Boolean
	},
	data () {
		return {
			focusing: false,
			dataLength: -1,
			scrollDataEnd: 0,
			scrollThrottle: this.$fxUtils.throttle()
		}
	},
	mounted () {
		document.querySelector('.item-list').addEventListener('scroll', this.scrollHandle, true)
	},
	destroyed () {
		document.querySelector('.item-list').removeEventListener('scroll', this.scrollHandle)
	},
	computed: {
		...mapState({
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId
		}),
		detailsLength () {
			return this.data.reduce((pre, cur) => {
				return cur.changeType !== 'del' ? pre + 1 : pre
			}, 0)
		},
		showAddBtn () {
			return () => {
				if ((!this.isDisabled && this.planId) || this.isDisabled) {
					return false
				}
				return true
			}
		}
	},
	watch: {
		focusing (val) {
			this.$emit('update:itemInputFocusing', val)
		},
		data () {
			let data = this.data
			if (this.dataLength !== data.length) {
				let dataEnd
				if (data.length > this.scrollDataEnd + SHOW_ITEM_SIZE) {
					dataEnd = this.scrollDataEnd + SHOW_ITEM_SIZE
				} else {
					dataEnd = data.length
				}
				if (dataEnd !== this.scrollDataEnd) {
					this.scrollDataEnd = dataEnd
				}
				this.dataLength = data.length
			}
			this.setGoodsUUid(this.data)
		}
	},
	methods: {
		// {{{分批下存在相同品项，故设置uuid，唯一标示key值
		setGoodsUUid (data) {
			data.forEach(dataItem => {
				dataItem.goodsUUid = this.$fxUtils.createUUID()
			})
		},
		// }}}
		filteScroll (data) {
			return data.filter((item, index) => {
				if (index < this.scrollDataEnd) {
					if (this.scrollDataEnd > SHOW_ITEM_SIZE) {
						if (this.scrollDataEnd - SHOW_ITEM_SIZE - 1 < index) {
							return true
						}
					} else {
						return true
					}
				}
			})
		},
		onAddClick () {
			if (this.isDisabled || this.focusing) {
				return false
			}
			this.$emit('on-add-click')
		},
		onSearchClick () {
			if (this.focusing) {
				return false
			}
			this.$emit('on-search-click')
		},
		onDeleteClick (item, details) {
			if (item.id) {
				this.$set(item, 'changeType', 'del')
			} else {
				let index = this.data.indexOf(item)
				details.splice(index, 1)
			}
		},
		onItemFocus (arg, uuid) {
			this.focusing = true
		},
		onItemBlur () {
			this.focusing = false
		},
		onMicClick () {
			this.$emit('on-mic-click')
		},
		// {{{ 滚动事件
		scrollHandle () {
			if (this.data.length <= SHOW_ITEM_SIZE) {
				return
			}
			this.scrollThrottle(10).then(() => {
				this.setScrollHandle()
			})
		},
		setScrollHandle () {
			let endLoadIndex = 2 // 向下渲染的临界数
			let startLoadIndex = 3 // 向上渲染的临界数
			let scrollObj = document.getElementsByClassName('item-list')[0]// 滚动区域
			let clientHeight = scrollObj.clientHeight// 监听的元素的高度
			let scrollTop = scrollObj.scrollTop// div 到头部的距离
			// let scrollHeight = scrollObj.scrollHeight// 滚动区域的总高度
			let loadStartGoodsIdFlag = this.data[this.scrollDataEnd - endLoadIndex].goodsUUid // 渲染数据向下滚动临界值id
			let startIndex = this.scrollDataEnd - SHOW_ITEM_SIZE + startLoadIndex
			let loadStartHigth = this.$refs[`details-row-${loadStartGoodsIdFlag}`][0].$el.offsetTop // 渲染数据向下滚动临界值
			let loadLastGoodsIdFlag = this.filteScroll(this.data)[endLoadIndex].goodsUUid // 渲染数据向上滚动临界值id
			let loadLastHigth = this.$refs[`details-row-${loadLastGoodsIdFlag}`][0].$el.offsetTop // 渲染数据向上滚动临界值id
			if (scrollTop + clientHeight >= loadStartHigth && this.scrollDataEnd !== this.data.length) {
				// 向下滚动：div 到头部的距离 + 屏幕高度 = 可滚动的总高度
				if (this.data.length > this.scrollDataEnd + SCROLL_SIZE) {
					this.scrollDataEnd = this.scrollDataEnd + SCROLL_SIZE
				} else {
					this.scrollDataEnd = this.data.length
				}
				// 滚动条位置(通过goodsid)回到之前位置
				this.$nextTick(() => {
					scrollObj.scrollTop = this.$refs[`details-row-${loadStartGoodsIdFlag}`][0].$el.offsetTop - (loadStartHigth - scrollTop)
				})
			} else if (scrollTop <= loadLastHigth && startIndex > startLoadIndex) { // 前3个数据不需向上或向下加载
				// 向上滚动
				this.scrollDataEnd = this.scrollDataEnd - SCROLL_SIZE
				// 滚动条位置(通过goodsid)回到之前位置
				this.$nextTick(() => {
					scrollObj.scrollTop = this.$refs[`details-row-${loadLastGoodsIdFlag}`][0].$el.offsetTop - (loadLastHigth - scrollTop)
				})
			}
		},
		// }}}
		// {{{盘点bom
		onSelectBomClick () {
			if (this.isDisabled || this.focusing) {
				return false
			}
			this.$emit('on-selectbom-click')
		},
		onViewBomClick () {
			if (this.focusing) {
				return false
			}
			this.$emit('on-viewbom-click')
		}
		// }}}
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
		.title-icon {
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
		.title-mic-icon {
			background-image:url('~images/icon/icon-mic.png')
			margin-right:10px
		}
		.title-selectbom-icon {
			background-image:url('~images/icon/icon-bom.png')
			margin-right:10px
		}
		.title-viewbom-icon {
			background-image:url('~images/icon/icon-selectbom.png')
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
		.item-row-load {
			text-align: center
		}
	}
}
</style>
