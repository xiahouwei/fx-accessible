<template>
	<i class="wind-icon" :style="iconStyle" @click="onIconClick"></i>
</template>
<script>
/**
 * Icon by shang 2020/2/25
 * @desc Icon 图标
 * @params [String] type 内置样式
 */
import ICON_URL from '../js/config/icon_url'
export default {
	name: 'w-icon',
	props: {
		imgUrl: String,
		width: String,
		height: String,
		type: String,
		stop: {
			type: Boolean,
			default: true
		}
	},
	computed: {
		iconStyle () {
			const imgUrl = this.$fxUtils.isDef(this.type) ? ICON_URL[this.type] : this.imgUrl
			return {
				width: this.width,
				height: this.height,
				backgroundImage: `url(${imgUrl})`
			}
		}
	},
	methods: {
		onIconClick (event) {
			if (this.stop) {
				event.stopPropagation()
			}
			this.$emit('click')
		}
	}
}
</script>
<style lang="stylus" scoped>
.wind-icon {
	display:inline-block;
	background-repeat: no-repeat;
	background-position: center;
	background-size: contain;
	width: 20px;
	height: 20px;
}
</style>
