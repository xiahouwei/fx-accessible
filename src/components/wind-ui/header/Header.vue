<template>
	<header class="wind-header" :class="{'has-border-bottom': border}">
		<div class="wind-header-left">
			<transition :name="transition">
				<div class="left-arrow" @click="onClickBack" v-show="_leftOptions.showBackBtn"></div>
			</transition>
			<slot name="header-left"></slot>
		</div>
		<h1
			:style="{fontSize: titleFontSize}"
			class="wind-header-title"
			@click="$emit('on-click-title')"
			v-if="!showOverWriteTitle">
			<slot>
				<transition :name="transition">
					<span v-show="title">{{title}}</span>
				</transition>
			</slot>
		</h1>
		<div class="wind-header-title-area" v-if="showOverWriteTitle">
			<slot name="overwrite-title"></slot>
		</div>
		<div class="wind-header-right">
			<a class="wind-header-more" @click.prevent = "onClickMore" v-if="rightOptions.showMore"></a>
			<slot name="header-right"></slot>
		</div>
	</header>
</template>

<script type="text/babel">
/**
 * Header by shang 2017/12/30
 * @desc Header 顶部标题栏
 *
 * @param {title}  [String] - 标题文本
 * @param {transitionName}  [String] - 切换路由页面动画效果名称
 * @param {leftOptions}  [Object] - 左侧设置
 * @param {leftOptions.showBackBtn}  [Boolean] - 显示左侧后退按钮
 * @param {leftOptions.preventGoBack}  [Boolean] - 左侧后退按钮是否阻止返回
 * @param {rightOptions}  [Object] - 右侧设置
 * @param {rightOptions.showMore}  [Boolean] - 是否显示右侧更多按钮
 *
 * @event {on-click-back} 当阻止返回时 点击左侧后退按钮触发
 * @event {on-click-title} 点击标题触发
 * @event {on-click-more} 点击右侧更多按钮触发
 *
 * @example
 *  <w-header :leftOptions="leftOptions" :rightOptions="rightOptions">
		这是标题显示不开会显示...
		<span slot="header-right">更多</span>
	</w-header>
	leftOptions: {
		showBackBtn: true,
		preventGoBack: false
	},
	rightOptions: {
		showMore: true
	}
 *
 */
export default {
	name: 'w-header',
	props: {
		title: String,
		transition: String,
		leftOptions: Object,
		rightOptions: {
			type: Object,
			default () {
				return {
					showMore: false
				}
			}
		},
		border: {
			type: Boolean,
			default: false
		},
		titleFontSize: {
			type: String,
			default: ''
			// default: '4.267vw'
		}
	},
	data () {
		return {
			showOverWriteTitle: false
		}
	},
	beforeMount () {
		if (this.$slots['overwrite-title']) {
			this.showOverWriteTitle = true
		}
	},
	computed: {
		_leftOptions () {
			return Object.assign({
				showBackBtn: true,
				preventGoBack: false
			}, this.leftOptions || {})
		}
	},
	methods: {
		onClickBack () {
			if (this._leftOptions.preventGoBack) {
				this.$emit('on-click-back')
			} else {
				this.$router ? this.$router.back() : window.history.back()
			}
		},
		onClickMore () {
			this.$emit('on-click-more')
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.wind-header {
	position: relative;
	box-sizing: border-box;
	background-color: $fxWhite;
	align-items: center;
	display: flex;
	flex-direction: row
	justify-content: center
	width: 100%;
	height: header-height;
	line-height: header-height;
	text-align: center;
	white-space: nowrap;
	z-index: 100;
	$fx-dynamic-font-size(16px)
	font-weight:700
	.wind-header-title {
		text-align: center;
		$fx-dynamic-font-size(12px)
		font-weight:700
		&>span {
			display: inline-block;
			width: 264px
			height: 100%
			overflow: hidden
			text-overflow: ellipsis
		}
	}
	.wind-header-title-area,.wind-header-title {
		height: 100%;
		// width: 100%;
		// width:190px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.wind-header-left,.wind-header-right {
		$fx-dynamic-font-size(14px)
		height:100%
		position: absolute
	}
	.wind-header-left {
		top:0
		left:0
		.left-arrow {
			display:inline-block
			width:46px
			height:100%
			background-image:url('~images/icon/icon-left-arrow.png')
			background-repeat:no-repeat
			background-position: center
			background-size: 24px
		}
	}
	.wind-header-right {
		top:0
		right:0
		padding-right:10px
		.wind-header-more {
			&:after {
				content: "\2022\0020\2022\0020\2022\0020";
				$fx-dynamic-font-size(16px)
			}
		}
	}
}
.has-border-bottom {
	border-bottom:1px solid $fxBorder
}
</style>
