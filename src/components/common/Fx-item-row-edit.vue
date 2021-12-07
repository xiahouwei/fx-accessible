<template>
	<w-app-page>
		<w-header :title="title" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div class="fx-item-row-edit__content">
			<slot></slot>
		</div>
		<w-bottom-btn-bar>
			<slot name='bottom-btn'></slot>
		</w-bottom-btn-bar>
	</w-app-page>
</template>

<script>
export default {
	name: 'fx-item-row-edit',
	props: {
		title: String
	},
	data () {
		return {
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			}
		}
	},
	methods: {
		onCloseClick () {
			this.$emit('on-back')
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.fx-item-row-edit {
	&__content {
		flex:1
		overflow:scroll
		text-align:left
	}
}
</style>
