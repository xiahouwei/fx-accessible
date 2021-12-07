<template>
	<i slot="header-right" :class='{
		"title-icon-express": !active,
		"title-icon-express-active": active,
	}' @click="onOrderEditClick"></i>
</template>

<script>
export default {
	name: 'headEditBtn',
	props: {
		active: Boolean
	},
	methods: {
		onOrderEditClick () {
			this.$emit('click')
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.title-icon-express,.title-icon-express-active {
	width:50px
	height:100%
	background-repeat:no-repeat
	background-position: center
	background-size: 16px
	display:inline-block
}
.title-icon-express {
	background-image:url('~images/icon/icon-express.png')
}
.title-icon-express-active {
	background-image:url('~images/icon/icon-express-ative.png')
}
</style>
