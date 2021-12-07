<template>
	<Button
		:type="type"
		:size="buttonSize"
		:class="classes"
		:disabled="disabled"
		class="wind-button"
		@click="$emit('click')"
	>
		<slot></slot>
	</Button>
</template>

<script>
import { Button } from 'vant'
export default {
	name: 'w-empty',
	components: {
		Button
	},
	props: {
		type: String,
		size: String,
		noRadius: {
			type: Boolean,
			default: true
		},
		disabled: Boolean
	},
	computed: {
		classes () {
			return [{
				'no-radius': this.noRadius,
				'wind-button__large': this.size === 'large'
			}]
		},
		buttonSize () {
			return this.size === 'large' ? 'normal' : this.size
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.wind-button {
	overflow:hidden
	&.no-radius {
		border-radius:0 !important
	}
	&__large {
		width:100%
	}
}
</style>
