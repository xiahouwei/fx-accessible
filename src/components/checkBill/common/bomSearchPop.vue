<template>
	<div class="item-search-block">
		<w-header title="搜索品项" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div class="item-search clearfix">
			<van-search
				v-model="searchKey"
				placeholder="请输入搜索关键词"
				shape="round"
				/>
		</div>
		<div class="item-list bom-search-list" ref="details-content">
			<div
				v-for="item in filteScroll(detailFilter(data))"
				v-show="item.changeType !== 'del'"
				:ref="`details-row-${item.goods.id}`"
				:key="item.id"
				class="item-row"
			>
				<bomInfoCell
					:itemData="item"
				></bomInfoCell>
			</div>
		</div>
	</div>
</template>

<script>
import bomInfoCell from '@/components/checkBill/common/bomInfoCell.vue'
const SCROLL_SIZE = 10 // 加载的数量
const SHOW_ITEM_SIZE = 20 // 缓存的数量
export default {
	name: 'bomSearchPop',
	components: {
		bomInfoCell
	},
	props: {
		data: {
			type: Array,
			default: () => {
				return []
			}
		},
		visibleFlag: Boolean,
		searchKeywords: String
	},
	data () {
		return {
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			searchKey: '',
			scrollDataEnd: 0,
			scrollThrottle: this.$fxUtils.throttle()
		}
	},
	mounted () {
		document.querySelector('.bom-search-list').addEventListener('scroll', this.scrollHandle, true)
	},
	destroyed () {
		document.querySelector('.bom-search-list').removeEventListener('scroll', this.scrollHandle)
	},
	watch: {
		visibleFlag: {
			handler (val) {
				if (val) {
					let data = this.detailFilter(this.data)
					if (data.length > this.scrollDataEnd + SHOW_ITEM_SIZE) {
						this.scrollDataEnd = this.scrollDataEnd + SHOW_ITEM_SIZE
					} else {
						this.scrollDataEnd = data.length
					}
					this.searchKey = ''
				}
			},
			immediate: true
		}
	},
	methods: {
		detailFilter (items) {
			return items.filter(item => {
				return !!this.searchKeywords.split(',').find(itemKey => {
					if (item.goods[itemKey].toLowerCase().includes(this.searchKey.toLowerCase())) {
						return true
					}
				})
			})
		},
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
		onCloseClick () {
			this.$emit('update:visibleFlag', false)
		},
		// }}}
		scrollHandle () {
			if (this.detailFilter(this.data).length <= SHOW_ITEM_SIZE) {
				return
			}
			this.scrollThrottle(10).then(() => {
				this.setScrollHandle()
			})
		},
		setScrollHandle () {
			let endLoadIndex = 2 // 向下渲染的临界数
			let startLoadIndex = 3 // 向上渲染的临界数
			let scrollObj = document.getElementsByClassName('bom-search-list')[0]// 滚动区域
			let clientHeight = scrollObj.clientHeight// 监听的元素的高度
			let scrollTop = scrollObj.scrollTop// div 到头部的距离
			// let scrollHeight = scrollObj.scrollHeight// 滚动区域的总高度
			let loadStartGoodsIdFlag = this.detailFilter(this.data)[this.scrollDataEnd - endLoadIndex].goods.id // 渲染数据向下滚动临界值id
			let startIndex = this.scrollDataEnd - SHOW_ITEM_SIZE + startLoadIndex
			let loadStartHigth = this.$refs[`details-row-${loadStartGoodsIdFlag}`][0].$el.offsetTop // 渲染数据向下滚动临界值
			let loadLastGoodsIdFlag = this.filteScroll(this.detailFilter(this.data))[endLoadIndex].goods.id // 渲染数据向上滚动临界值id
			let loadLastHigth = this.$refs[`details-row-${loadLastGoodsIdFlag}`][0].$el.offsetTop // 渲染数据向上滚动临界值id
			if (scrollTop + clientHeight >= loadStartHigth && this.scrollDataEnd !== this.detailFilter(this.data).length) {
				// 向下滚动：div 到头部的距离 + 屏幕高度 = 可滚动的总高度
				if (this.detailFilter(this.data).length > this.scrollDataEnd + SCROLL_SIZE) {
					this.scrollDataEnd = this.scrollDataEnd + SCROLL_SIZE
				} else {
					this.scrollDataEnd = this.detailFilter(this.data).length
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
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.item-search-block {
	height: 100%;
	background:$fxWhite
	display: flex
	flex-direction: column
	overflow-x: hidden
	.item-list {
		flex:1
		overflow:scroll
		position: relative
		text-align: left
		padding: 0 13px
		width: 350px
		.item-row {
			border-bottom:1px solid $fxBorder
		}
	}
}
</style>
