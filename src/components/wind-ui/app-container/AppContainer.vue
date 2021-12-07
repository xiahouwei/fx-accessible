<template>
	<div class="wind-app-container">
		<slot></slot>
	</div>
</template>

<script type="text/babel">
/**
 * AppContaner by shang 2020/2/25
 * @desc AppContaner app页面内容容器
 */
export default {
	name: 'w-app-container'
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.wind-app-container {
	display: flex
	flex-direction: column
	flex: 1
	overflow:scroll
	-webkit-overflow-scrolling: touch
	position:relative
}
</style>
