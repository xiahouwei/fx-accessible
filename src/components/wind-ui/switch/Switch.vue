<template>
	<van-Switch
		v-model="currentValue"
		:disabled="disabled"
		:size="size"
		:activeValue="activeValue"
		:inactiveValue="inactiveValue"
		class="wind-switch"
		:class="classes"
		@click="onClick"
		@change="onChange"
	></van-Switch>
</template>

<script>
/* switch by shw 2020/5/26
 * @desc 切换开关
 */
import { Switch } from 'vant'
export default {
	name: 'w-switch',
	components: {
		'van-Switch': Switch
	},
	props: {
		value: null,
		loading: Boolean,
		disabled: Boolean,
		size: {
			type: [String, Boolean],
			default: '30px'
		},
		type: String,
		activeValue: {
			type: null,
			default: true
		},
		inactiveValue: {
			type: null,
			default: false
		}
	},
	data () {
		return {
			currentValue: null
		}
	},
	computed: {
		classes () {
			return this.type ? [`wind-switch__type-${this.type}`] : ''
		}
	},
	watch: {
		value: {
			immediate: true,
			handler (val) {
				this.currentValue = val
			}
		}
	},
	methods: {
		onClick () {
			this.$emit('click')
		},
		onChange () {
			this.$emit('input', this.currentValue)
			this.$emit('change', this.currentValue)
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.wind-switch {
	&__type-normal {
		font-size:24px !important
	}
	&__type-mini {
		font-size:16px !important
	}
	&__type-large {
		font-size:30px !important
	}
}
</style>
