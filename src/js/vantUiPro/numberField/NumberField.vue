<template>
	<Field
		ref="fieldInput"
		v-model="fieldValue"
		type="number"
		:label="label"
		:input-align="inputAlign"
		:size="size"
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
		@input="onInput"
		@blur="onBlur"
		@focus="onFocus"
	></Field>
</template>

<script type="text/babel">
/**
 * NuberField by shang 2019/5/28
 * @desc vant-field增強 支持 大小区间,最大整数,保留小数,取整
 *
 * @param {value}  [any] - 输入框值
 * @param {integer}  [Boolean] - 是否int
 * @param {disabled}  [Boolean] - 是否禁用
 * @param {asyncChange}  [Boolean] - 是否异步更新(手动)
 * @param {inputWidth}  [String] - 输入框宽度
 * @param {min}  [String, Number] - 最小值
 * @param {max}  [String, Number] - 最大值
 * @param {defaultValue}  [String, Number] - 默认值(默认为1)
 * @param {pointSize}  [String, Number] - 小数位
 * @param {intLength}  [String, Number] - 整数位
 *
 * @event {change} 当绑定值变化时触发的事件	当前组件的值
 * @event {blur} 输入框失焦时触发
 * @event {focus} 输入框聚焦时触发
 *
 */
import { Field } from 'vant'
export default {
	name: 'van-pro-number-field',
	components: {
		Field: Field
	},
	props: {
		value: null,
		label: String,
		inputAlign: {
			type: String,
			default: 'center'
		},
		size: String,
		border: Boolean,
		disabled: Boolean,
		readonly: Boolean,
		clearable: Boolean,
		required: Boolean,
		labelClass: null,
		labelWidth: [String, Number],
		labelAlign: String,
		leftIcon: String,
		rightIcon: String,
		integer: Boolean,
		asyncChange: Boolean,
		min: {
			type: [String, Number],
			default: 0
		},
		max: {
			type: [String, Number],
			default: Infinity
		},
		defaultValue: {
			type: [String, Number],
			default: 1
		},
		pointSize: {
			type: [String, Number],
			default: 0
		},
		intLength: [String, Number]
	},
	data () {
		const value = this.range(this.$fxUtils.isDef(this.value) ? this.value : this.defaultValue)
		if (value !== +this.value) {
			this.$emit('input', value)
		}
		return {
			currentValue: value,
			fieldValue: value
		}
	},
	watch: {
		value (val) {
			if (val !== this.currentValue) {
				this.currentValue = this.format(val)
				this.fieldValue = this.format(val)
			}
		}
	},
	computed: {
		computedNumberReg () {
			return new RegExp(`^[0-9]+([.]{1}[0-9]{0,${this.pointSize}})$`)
		}
	},
	methods: {
		format (value) {
			value = String(value).replace(/[^0-9.-]/g, '')
			return value === '' ? 0 : this.integer ? Math.floor(value) : +value
		},
		formatString (value) {
			value = String(value).replace(/[^0-9.-]/g, '')
			if (~value.indexOf('.')) {
				let values = value.split('.')
				value = +(values[0]) + '.' + values[1]
			} else {
				value = +value
			}
			return value === '' ? '0' : this.integer ? Math.floor(value) + '' : '' + value
		},
		range (value) {
			return Math.max(Math.min(this.max, this.format(value)), this.min)
		},
		onInput (value) {
			const formatted = this.formatString(value)
			// const formatted = this.format(value)
			if (!this.asyncChange) {
				if (this.$fxUtils.isDef(this.pointSize)) {
					let amount = this.formatString(value)
					if (
						(amount.indexOf('.') === -1 && amount.length > this.intLength) ||
						(amount.indexOf('.') !== -1 && !this.computedNumberReg.test(amount))
					) {
						this.fieldValue = this.currentValue
						return false
					}
				}
				if (value !== formatted) {
					this.fieldValue = formatted
				}
				this.currentValue = formatted
			} else {
				this.fieldValue = this.currentValue
			}
			this.$emit('input', formatted)
			this.$emit('change', formatted)
		},
		onBlur (event) {
			this.currentValue = this.range(this.currentValue)
			if (this.currentValue !== this.value) {
				this.fieldValue = this.currentValue
				this.$emit('input', this.currentValue)
				this.$emit('change', this.currentValue)
			}
			this.$emit('blur', event)
		},
		onFocus (event) {
			this.$emit('focus', event)
		},
		setFocus () {
			this.$refs.fieldInput.focus()
		}
	}
}
</script>
