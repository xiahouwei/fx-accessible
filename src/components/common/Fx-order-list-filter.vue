<template>
	<w-app-page>
		<w-header :title="title" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<w-app-container class="filter-content">
			<slot></slot>
		</w-app-container>
		<w-bottom-btn-bar>
			<slot name='bottom-btn'></slot>
		</w-bottom-btn-bar>
	</w-app-page>
</template>

<script>
export default {
	name: 'fx-order-filter',
	props: {
		title: {
			type: String,
			default: '筛选条件'
		}
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
.filter-content {
	text-align:left
}
</style>
