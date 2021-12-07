<template>
	<Actionsheet
		v-model="visibleFlag"
		:actions="actions"
		:cancel-text="cancelText"
		@select="onSelect"
	></Actionsheet>
</template>

<script type="text/babel">
/**
 * ActionSheet by shang 2020/2/25
 * @desc ActionSheet 弹出选择框
 */
import { Actionsheet } from 'vant'
export default {
	name: 'w-action-sheet',
	components: {
		Actionsheet
	},
	props: {
		value: Boolean,
		actions: {
			type: Array,
			default: () => {
				return []
			}
		},
		cancelText: {
			type: String,
			default: '取消'
		},
		activeId: {
			type: String,
			default: ''
		}
	},
	data () {
		return {
			visibleFlag: false,
			resolve: null,
			currentActiveId: null
		}
	},
	watch: {
		value: {
			immediate: true,
			handler (val) {
				this.visibleFlag = val
			}
		},
		visibleFlag (val) {
			if (!val) {
				this.resolve = null
				this.$emit('input', false)
			}
		}
	},
	methods: {
		onSelect (item) {
			this.$emit('input', false)
			if (this.resolve) {
				if (item.id !== this.currentActiveId || !this.$fxUtils.isDef(this.currentActiveId)) {
					this.currentActiveId = null
					this.resolve(item)
				}
			} else {
				this.$emit('select', item)
			}
		},
		doSelect (currentActiveId) {
			return new Promise(resolve => {
				this.currentActiveId = currentActiveId
				this.$emit('input', true)
				this.resolve = resolve
			})
		}
	}
}
</script>
