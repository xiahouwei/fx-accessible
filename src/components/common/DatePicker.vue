<template>
	<van-datetime-picker
		v-model="$attrs.currentDate"
		type="date"
		:formatter="dataPickerFormatter"
		@cancel="onCancelClick"
		v-on="$listeners"
	/>
</template>

<script>
export default {
	name: 'datePicker',
	props: {
		visibleFlag: Boolean
	},
	methods: {
		dataPickerFormatter (type, value) {
			if (type === 'year') {
				return `${value}年`
			} else if (type === 'month') {
				return `${value}月`
			}
			return `${value}日`
		},
		onCancelClick () {
			this.$emit('update:visibleFlag', false)
		}
	}
}
</script>
