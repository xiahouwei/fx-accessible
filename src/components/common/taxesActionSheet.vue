<template>
	<van-actionsheet
		v-model="taxesActionShow"
		:actions="currentTaxes"
		cancel-text="取消"
		@select="onTaxesSelect"
	/>
</template>

<script>
import mixinTaxes from '@/js/mixin/taxes'
export default {
	name: 'taxesActionSheet',
	mixins: [mixinTaxes],
	props: {
		value: Boolean,
		sync: Boolean,
		actions: {
			type: Array,
			default: () => {
				return []
			}
		}
	},
	data () {
		return {
			taxesActionShow: false,
			currentTaxes: []
		}
	},
	watch: {
		value: {
			async handler (val) {
				if (val) {
					this.currentTaxes = this.sync ? await this.syncTaxes() : this.actions
					this.taxesActionShow = true
				}
			},
			immediate: true
		},
		taxesActionShow (val) {
			if (!val) {
				this.$emit('input', false)
			}
		}
	},
	methods: {
		onTaxesSelect (item) {
			this.taxesActionShow = false
			this.$emit('input', false)
			this.$emit('on-taxes-select', item)
		}
	}
}
</script>
