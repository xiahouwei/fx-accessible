<template>
	<div class="wind-index-list">
		<ul class="wind-index-list-content" ref="content" :style="{ 'height': `${currentHeight}px`, 'margin-right': `${navWidth}px`}">
			<slot></slot>
		</ul>
		<div class="wind-index-list-nav" ref="nav" @touchstart="navTouchStart">
			<ul class="wind-index-list-nav-list" >
				<li class="wind-indexlist-nav-item" v-for="(item, index) in itemArr" :key="index">{{item.index}}</li>
			</ul>
		</div>
		<div class="wind-indexlist-toast" v-if="showIndexToast" v-show="indexShow">{{ currentIndex }}</div>
	</div>
</template>

<script type="text/babel">
/**
 * index-list by shang 2018/1/18
 * @desc index-list : cell group of index
 * @param {height} [Number] - custom height (cover bottom,haveTabbar)
 * @param {showIndexToast}  [Boolean] - show index toast
 * @param {haveTabbar}  [Boolean] - subtracted  value of tabbar(53) by height
 * @param {bottom}  [Number] - subtracted custom value by height (cover haveTabbar)
 *
 */
export default {
	name: 'w-index-list',
	props: {
		height: Number,
		showIndexToast: {
			type: Boolean,
			default: true
		},
		haveTabbar: {
			type: Boolean,
			default: false
		},
		bottom: Number
	},
	data () {
		return {
			itemArr: [],
			indexShow: false,
			currentIndex: '',
			navWidth: 0,
			currentHeight: this.height,
			toastTime: null,
			navOffsetX: 0,
			firstListItem: null
		}
	},
	mounted () {
		if (!this.currentHeight) {
			let bottom = this.haveTabbar ? 53 : 0
			bottom = typeof this.bottom === 'number' ? this.bottom : bottom
			this.currentHeight = document.documentElement.clientHeight - this.$refs.content.getBoundingClientRect().top - bottom
		}
		this.init()
	},
	methods: {
		setHref (val) {
			return '#list-item-' + val.index
		},
		init () {
			this.$nextTick(() => {
				this.navWidth = this.$refs.nav.clientWidth
			})
			// 存储第一个list-item用于scroll
			let listItems = this.$refs.content.getElementsByTagName('li')
			if (listItems.length > 0) {
				this.firstListItem = listItems[0]
			}
		},
		clickA (index) {
			console.log(index)
			this.currentIndex = index
			if (this.toastTime) {
				clearTimeout(this.toastTime)
			}
			this.indexShow = true
			this.toastTime = setTimeout(() => {
				this.indexShow = false
				this.currentIndex = ''
			}, 500)
		},
		navTouchStart (e) {
			// 如果不是从索引栏开始滑动，则直接return
			if (e.target.tagName !== 'LI') {
				return false
			}
			// 记录开始的clientX值，用于定位触发的navDom
			this.navOffsetX = e.changedTouches[0].clientX
			// 移动到对应的list
			this.scrollList(e.changedTouches[0].clientY)
			// 显示索引toast
			if (this.toastTime) {
				clearTimeout(this.toastTime)
			}
			this.indexShow = true
			// 扩大滑动面积
			window.addEventListener('touchmove', this.navTouchMove, {
				// 允许阻止浏览器默认事件
				passive: false
				// 目前没有浏览器支持,期待ing
				// once: true
			})
			window.addEventListener('touchend', this.navTouchEnd)
		},
		navTouchMove (e) {
			// 滑动事件触发时阻止click
			e.preventDefault()
			this.scrollList(e.changedTouches[0].clientY)
		},
		navTouchEnd (e) {
			this.toastTime = setTimeout(() => {
				this.indexShow = false
				this.currentIndex = ''
			}, 500)
			window.removeEventListener('touchmove', this.navTouchMove)
			window.removeEventListener('touchend', this.navTouchEnd)
		},
		scrollList (clientY) {
			// 根据坐标 获取对应的索引栏DOM
			let currentNavItem = document.elementFromPoint(this.navOffsetX, clientY)
			// currentNavItem.classList [DOMTokenList]
			if (!currentNavItem || !currentNavItem.classList.contains('wind-indexlist-nav-item')) {
				return false
			}
			this.currentIndex = currentNavItem.innerText
			// 根据索引栏DOM获取对应的index-item
			let targetVueComponent = this.itemArr.filter(itemArr => itemArr.index === currentNavItem.innerText)
			if (targetVueComponent.length > 0) {
				let targetDOM = targetVueComponent[0].$el
				// 通过对比要滑动到的list-item的top值与最开始的第一个list-item的top值,两者的差值即为要滚动的距离
				this.$refs.content.scrollTop = targetDOM.getBoundingClientRect().top - this.firstListItem.getBoundingClientRect().top
				// 这是一个实验中的功能
				// targetDOM.scrollIntoView(true)
			}
		}
	},
	watch: {
		itemArr () {
			this.init()
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.wind-index-list {
	display: flex;
	width: 100%;
	position: relative;
	overflow: hidden;
	line-height: 1.5;
	.wind-index-list-content {
		width: 100%;
		margin: 0;
		padding: 0;
		overflow: auto
	}
	.wind-index-list-nav {
		position: absolute;
		top: 0;
		bottom: 0;
		right: 0;
		background-color: #fff;
		border-left: 1px solid #ddd;
		text-align: center;
		-webkit-box-pack: center;
		-ms-flex-pack: center;
		justify-content: center;
		margin: 0;
		max-height: 100%;
		display: flex;
		-webkit-box-orient: vertical;
		-webkit-box-direction: normal;
		flex-direction: column;
		.wind-index-list-nav-list {
			padding: 0;
			list-style: none;
			margin: 0;
			max-height: 100%;
			display: flex;
			-webkit-box-orient: vertical;
			-webkit-box-direction: normal;
			flex-direction: column;
			&>li {
				margin:0;
				line-height:  20px;
				font-size: 14px;
				padding: 0 5px;
				color:black;
			}
		}
	}
	.wind-indexlist-toast {
		position: absolute;
		width: 50px;
		height: 50px;
		top: 50%;
		left: 50%;
		-webkit-transform: translate(-50%,-50%);
		transform: translate(-50%,-50%);
		text-align: center;
		line-height: 50px;
		background-color: rgba(0,0,0,.7);
		border-radius: 25px;
		color: #fff;
		font-size: 22px;
	}
}
</style>
