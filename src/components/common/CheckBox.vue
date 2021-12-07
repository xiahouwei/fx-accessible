<template>
	<van-checkbox v-model="$attrs.checked" v-show="visibleFlag" class="order-checkbox" @click="onCheckboxClick">
		<img
			slot="icon"
			slot-scope="props"
			:src="props.checked ? checkedIcon.active : checkedIcon.normal"
			class="checked-box-icon"
		>
	</van-checkbox>
</template>

<script>
export default {
	name: 'checkBox',
	props: {
		visibleFlag: {
			type: Boolean,
			default: false
		}
	},
	data () {
		return {
			checkedIcon: {
				normal: require('@/assets/images/icon/icon-checked.png'),
				active: require('@/assets/images/icon/icon-checked-active.png')
			}
		}
	},
	methods: {
		onCheckboxClick () {
			this.$emit('on-checkbox-click')
		}
	}
}
</script>
<style lang="stylus" scoped>
	.order-checkbox {
		.checked-box-icon {
			width:20px
		}
	}
</style>
