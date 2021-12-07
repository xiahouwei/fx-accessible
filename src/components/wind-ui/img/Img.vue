<template>
	<div class="wind-img">
		<img :src="imgSrc" :onerror="$fxCommon.errorImg(type)">
	</div>
</template>

<script type="text/babel">
/**
 * Img by shang 2020/2/25
 * @desc Img 图片容器 主要用于显示网络图片, 注意此项目网络图片存储于青云服务器
 *
 * @params src [String] img路径
 * @params type [String] 类型, 用于区分不同的默认图片 默认'item'
 */
export default {
	name: 'w-img',
	props: {
		src: [String, Array, null],
		type: {
			type: String,
			default: 'item'
		},
		qingStorDefault: {
			type: Boolean,
			default: true
		}
	},
	computed: {
		imgSrc () {
			if (Array.isArray(this.src)) {
				return this.src[0] || this.$fxCommon.getDefaultImg(this.type)
			} else {
				return this.src || this.$fxCommon.getDefaultImg(this.type)
			}
		}
	}
}
</script>
<style lang="stylus" scoped>
.wind-img {
	width: 80px;
	height: 80px;
	padding: 10px;
	box-sizing: border-box;
	&>img {
		width: 100%;
		height: 100%;
	}
}
</style>
