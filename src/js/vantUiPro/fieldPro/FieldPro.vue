<template>
	<Field
		v-model="fieldValue"
		:type="type"
		:label="label"
		:input-align="inputAlign"
		:size="size"
		:maxlength="maxlength"
		:placeholder="placeholder"
		:border="border"
		:disabled="disabled"
		:readonly="readonly"
		:clearable="clearable"
		:required="required"
		:label-class="labelClass"
		:label-width="labelWidth"
		:label-align="labelAlign"
		:left-icon="leftIcon"
		:right-icon="rightIcon"
		value-class="wind-cell-value"
		@input="onInput"
		@blur="onBlur"
		@focus="onFocus"
	>
		<slot name="label" slot="label"></slot>
		<slot name="input" slot="input"></slot>
		<slot name="left-icon" slot="left-icon"></slot>
		<slot name="right-icon" slot="right-icon"></slot>
		<slot name="button" slot="button"></slot>
	</Field>
</template>

<script type="text/babel">
/**
 * FieldPro by SHW 2019/9/20
 * @desc vant-field增強 自动过滤掉 emoji
 *
 * @param {value}  [any] - 输入框值
 * @param {type}  [String] - field 类型
 * @param {disabled}  [Boolean] - 是否禁用
 *
 * @event {change} 当绑定值变化时触发的事件	当前组件的值
 * @event {blur} 输入框失焦时触发
 * @event {focus} 输入框聚焦时触发
 *
 */
import { Field } from 'vant'
export default {
	name: 'van-pro-field',
	components: {
		Field: Field
	},
	props: {
		value: null,
		type: {
			type: String,
			default: 'text'
		},
		label: String,
		inputAlign: {
			type: String,
			default: 'center'
		},
		size: String,
		maxlength: [String, Number],
		placeholder: String,
		border: {
			type: Boolean,
			default: true
		},
		disabled: Boolean,
		readonly: Boolean,
		clearable: Boolean,
		required: Boolean,
		labelClass: null,
		labelWidth: [String, Number],
		labelAlign: String,
		leftIcon: String,
		rightIcon: String
	},
	data () {
		const value = this.value
		return {
			currentValue: value,
			fieldValue: value
		}
	},
	watch: {
		value (val) {
			if (val !== this.currentValue) {
				this.currentValue = val
				this.fieldValue = val
			}
		}
	},
	computed: {
		emojiReg () {
			return this.$fxUtils.emojiPattern()
		}
	},
	methods: {
		onInput (value) {
			if (this.emojiReg.test(value)) {
				this.fieldValue = this.currentValue
				return false
			}
			this.currentValue = this.fieldValue
			this.$emit('input', this.currentValue)
			this.$emit('change', this.currentValue)
		},
		onBlur (event) {
			if (this.currentValue !== this.value) {
				this.fieldValue = this.currentValue
				this.$emit('input', this.currentValue)
				this.$emit('change', this.currentValue)
			}
			this.$emit('blur', event)
		},
		onFocus (event) {
			this.$emit('focus', event)
		}
	}
}
</script>
<style lang="stylus" scoped>
.wind-cell-value {
	text-overflow: ellipsis;
	white-space: nowrap;
}
</style>
