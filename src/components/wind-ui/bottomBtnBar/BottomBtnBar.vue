<template>
	<div class="wind-bottom-btn-bar">
		<slot></slot>
	</div>
</template>

<script type="text/babel">
/**
 * BottomBtnBar by shang 2020/2/25
 * @desc BottomBtnBar app页面底部按钮容器
 */
export default {
	name: 'w-bottom-btn-bar'
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.wind-bottom-btn-bar {
	width:100%
	display: flex
	flex-direction: row
}
</style>
