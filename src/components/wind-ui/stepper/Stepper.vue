<template>
	<div class="wind-stepper">
		<button
			v-show="stepperBtnShow"
			class="wind-stepper__minus"
			:class='{
				"wind-stepper__minus--disabled":minusDisabled,
			}'
			@click="onChange('minus')"
		/>
		<input
			ref="stepperInput"
			:style="{width:inputWidth, color: inputColor}"
			class="wind-stepper__input"
			type="number"
			:disabled="disabled || disableInput"
			:value="currentValue"
			@input="onInput"
			@blur="onBlur"
			@focus="onFocus"
		/>
		<button
			v-show="stepperBtnShow"
			class="wind-stepper__plus"
			:class='{
				"wind-stepper__plus--disabled":plusDisabled,
			}'
			@click="onChange('plus')"
		/>
	</div>
</template>

<script type="text/babel">
/**
 * Stepper by shang 2019/5/17
 * @desc Stepper 步进器
 *
 * @param {value}  [any] - 输入框值
 * @param {integer}  [Boolean] - 是否int
 * @param {disabled}  [Boolean] - 是否禁用
 * @param {asyncChange}  [Boolean] - 是否异步更新(手动)
 * @param {disableInput}  [Boolean] - 是否禁用stepper
 * @param {inputWidth}  [String] - 输入框宽度
 * @param {min}  [String, Number] - 最小值
 * @param {max}  [String, Number] - 最大值
 * @param {step}  [String, Number] - step
 * @param {defaultValue}  [String, Number] - 默认值
 * @param {pointSize}  [String, Number] - 小数位
 * @param {intLength}  [String, Number] - 整数位
 * @param {focusView}  [Boolean] - 当获取焦点后自动滚动到视图内
 * @param {focusViewTime}  [Number] - 自动滚动到视图内的时间
 *
 * @event {change} 当绑定值变化时触发的事件	当前组件的值
 * @event {overlimit} 点击不可用的按钮时触发
 * @event {blur} 输入框失焦时触发
 * @event {focus} 输入框聚焦时触发
 * @event {minus} 点击减少按钮时触发
 * @event {plus} 点击增加按钮时触发
 *
 */
export default {
	name: 'w-stepper',
	props: {
		value: null,
		integer: Boolean,
		disabled: Boolean,
		asyncChange: Boolean,
		disableInput: Boolean,
		inputWidth: String,
		stepperBtnShow: {
			type: [Boolean],
			default: true
		},
		min: {
			type: [String, Number],
			default: 1
		},
		max: {
			type: [String, Number],
			default: Infinity
		},
		step: {
			type: [String, Number],
			default: 1
		},
		defaultValue: {
			type: [String, Number],
			default: 1
		},
		pointSize: {
			type: [String, Number],
			default: 0
		},
		intLength: [String, Number],
		focusView: {
			type: Boolean,
			default: true
		},
		focusViewTime: {
			type: Number,
			default: 500
		},
		inputColor: {
			type: String,
			default: ''
		}
	},
	data () {
		const value = this.range(this.$fxUtils.isDef(this.value) ? this.value : this.defaultValue)
		if (value !== +this.value) {
			this.$emit('input', value)
		}
		return {
			currentValue: value
		}
	},
	watch: {
		value (val, oldVal) {
			if (val !== this.currentValue) {
				this.currentValue = this.format(val)
			}
		}
	},
	computed: {
		computedNumberReg () {
			return new RegExp(`^[0-9]+([.]{1}[0-9]{0,${this.pointSize}})$`)
		},
		minusDisabled () {
			return this.disabled || this.currentValue <= this.min
		},
		plusDisabled () {
			return this.disabled || this.currentValue >= this.max
		}
	},
	methods: {
		format (value) {
			value = String(value).replace(/[^0-9.-]/g, '')
			return value === '' ? 0 : this.integer ? Math.floor(value) : +value
		},
		formatString (value) {
			value = String(value).replace(/[^0-9.-]/g, '')
			return value === '' ? '0' : this.integer ? Math.floor(value) + '' : '' + value
		},
		range (value) {
			return Math.max(Math.min(this.max, this.format(value)), this.min)
		},
		onInput (event) {
			const { value } = event.target
			let formatted = ''
			if (value !== '') {
				formatted = this.format(value)
			}
			if (!this.asyncChange) {
				if (this.$fxUtils.isDef(this.pointSize)) {
					let amount = this.formatString(value)
					if (
						(amount.indexOf('.') === -1 && amount.length > this.intLength) ||
						(amount.indexOf('.') !== -1 && !this.computedNumberReg.test(amount))
					) {
						// event.target.value = this.$fxUtils.toFixedSHW(this.currentValue, 4)
						event.target.value = this.currentValue
						return false
					}
				}
				if (+value !== formatted) {
					event.target.value = formatted
				}
				this.currentValue = formatted
			} else {
				event.target.value = this.currentValue
			}
			this.$emit('input', formatted)
			this.$emit('change', formatted)
		},
		onChange (type) {
			if (this[`${type}Disabled`]) {
				this.$emit('overlimit', type)
				return
			}
			const diff = type === 'minus' ? -this.step : +this.step
			const value = Math.round((this.currentValue + diff) * Math.pow(10, this.pointSize)) / Math.pow(10, this.pointSize)
			if (!this.asyncChange) {
				this.currentValue = this.range(value)
			} else {
				this.$emit('input', value)
				this.$emit('change', value)
			}
			this.$emit(type)
		},
		onBlur (event) {
			this.currentValue = this.range(this.currentValue)
			if (!this.$fxUtils.isEqualNumberString(this.currentValue, event.target.value)) {
				event.target.value = this.currentValue
				this.$emit('input', this.currentValue)
				this.$emit('change', this.currentValue)
			}
			this.$emit('blur', event)
		},
		onFocus (event) {
			this.currentValue = this.$fxUtils.formatNumByPoint(this.currentValue, this.pointSize)
			this.$emit('focus', event)
			if (this.focusView) {
				setTimeout(_ => {
					event.target.scrollIntoView({
						behavior: 'auto',
						block: 'center',
						inline: 'nearest'
					})
				}, this.focusViewTime)
			}
		},
		setFocus () {
			this.$refs.stepperInput.focus()
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.wind-stepper {
	font-size: 0
	&__minus,
	&__plus {
		width: 28px;
		height: 28px;
		box-sizing: border-box;
		background-color: $fxLightGray;
		border: 1px solid $fxLightGray;
		margin: 1px;
		position: relative;
		padding: 5px;
		vertical-align: middle;
		&::before,
		&::after {
			content: '';
			position: absolute;
			margin: auto;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background-color: $fxTextColor;
		}
		&::before {
			width: 9px;
			height: 1px;
		}
		&::after {
			width: 1px;
			height: 9px;
		}
		&:active {
			background-color:$fxActiveColor;
		}
		&--disabled {
			background-color: btn-disabled
			&::before,
			&::after {
				background-color: btn-text-disabled
			}
		}
		&--disabled:active {
			background-color: btn-disabled
		}
	}
	&__minus {
		border-radius: 4px 0 0 4px;
		&::after {
			display: none;
		}
	}
	&__plus {
		border-radius: 0 4px 4px 0;
	}
	&__input {
		width: 62px;
		height: 28px;
		padding: 1px;
		border: 0
		border-width: 1px 0;
		border-radius: 0;
		box-sizing: border-box;
		color: $fxTextColor;
		background-color: $fxLightGray;
		margin:1px
		$fx-dynamic-font-size(14px)
		vertical-align: middle;
		text-align: center;
		-webkit-appearance: none;
		&[disabled] {
			color: $fxTextDisabledColor
			background-color: $fxInputDisabledColor
		}
	}
	input[type="number"]::-webkit-inner-spin-button,
	input[type="number"]::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
}
</style>
