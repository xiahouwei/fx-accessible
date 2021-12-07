<template>
	<i class="title-icon-search" @click="onSearchClick"></i>
</template>

<script>
export default {
	name: 'headSearchBtn',
	methods: {
		onSearchClick () {
			this.$emit('click')
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.title-icon-search {
	width:50px
	height:100%
	background-repeat:no-repeat
	background-position: center
	background-size: 16px
	display:inline-block
}
.title-icon-search {
	background-image:url('~images/icon/icon-search.png')
}
</style>
