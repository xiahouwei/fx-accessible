<template>
	<DatetimePicker
		v-model="$attrs.currentDate"
		:type="type"
		:formatter="dataPickerFormatter"
		:min-date="mindate"
		:max-date="maxdate"
		@cancel="onCancelClick"
		v-on="$listeners"
	/>
</template>

<script>
import { DatetimePicker } from 'vant'
export default {
	name: 'w-date-picker',
	components: {
		DatetimePicker
	},
	props: {
		visibleFlag: Boolean,
		type: {
			type: String,
			default: 'datetime'
		},
		mindate: {
			type: Date,
			default: () => {
				return new Date((new Date()).getFullYear() - 10, 0, 1)
			}
		},
		maxdate: {
			type: Date,
			default: () => {
				return new Date((new Date()).getFullYear() + 10, 11, 31)
			}
		}
	},
	methods: {
		dataPickerFormatter (type, value) {
			if (type === 'year') {
				return `${value}年`
			} else if (type === 'month') {
				return `${value}月`
			} else if (type === 'day') {
				return `${value}日`
			} else if (type === 'hour') {
				return `${value}时`
			} else if (type === 'minute') {
				return `${value}分`
			}
		},
		onCancelClick () {
			this.$emit('update:visibleFlag', false)
		}
	}
}
</script>
