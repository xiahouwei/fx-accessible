<template>
	<i slot="header-right" :class='{
		"is-active": active,
	}' class="title-icon-selectAll" @click="onSelectAllClick"></i>
</template>

<script>
export default {
	name: 'headSelectAllBtn',
	props: {
		active: Boolean
	},
	methods: {
		onSelectAllClick () {
			this.$emit('click')
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.title-icon-selectAll {
	width:50px
	height:100%
	background-repeat:no-repeat
	background-position: center
	background-size: 16px
	display:inline-block
	background-image:url('~images/icon/icon-select-all.png')
}
.title-icon-selectAll.is-active {
	background-image:url('~images/icon/icon-select-all-active.png')
}
</style>
