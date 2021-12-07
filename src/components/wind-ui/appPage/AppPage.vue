<template>
	<div class="wind-app-page">
		<slot></slot>
	</div>
</template>

<script type="text/babel">
/**
 * AppPage by shang 2020/2/25
 * @desc AppPage app页面顶层容器
 */
export default {
	name: 'w-app-page'
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.wind-app-page {
	background:$fxWhite
	display: flex
	flex-direction: column
	height:100%
	overflow-x: hidden
}
</style>
