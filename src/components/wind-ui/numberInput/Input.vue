<template>
	<input
		ref="numberInput"
		:style="{width:inputWidth}"
		class="wind-number-input"
		:type="type"
		:disabled="disabled"
		:value="currentValue"
		@input="onInput"
		@blur="onBlur"
		@focus="onFocus"
	/>
</template>

<script type="text/babel">
/**
 * numberInput by shang 2019/5/28
 * @desc Input 文本框
 *
 * @param {value}  [any] - 输入框值
 * @param {integer}  [Boolean] - 是否int
 * @param {disabled}  [Boolean] - 是否禁用
 * @param {asyncChange}  [Boolean] - 是否异步更新(手动)
 * @param {inputWidth}  [String] - 输入框宽度
 * @param {min}  [String, Number] - 最小值
 * @param {max}  [String, Number] - 最大值
 * @param {defaultValue}  [String, Number] - 默认值
 * @param {pointSize}  [String, Number] - 小数位
 * @param {intLength}  [String, Number] - 整数位
 * @param {focusView}  [Boolean] - 当获取焦点后自动滚动到视图内
 * @param {focusViewTime}  [Number] - 自动滚动到视图内的时间
 * @param {isEmptyValue}  [Boolean] - 可否在输入框填‘空’
 * @param {type}  [String] - 输入框属性（setSelectionRange报错，ios的bug）
 * @event {change} 当绑定值变化时触发的事件	当前组件的值
 * @event {blur} 输入框失焦时触发
 * @event {focus} 输入框聚焦时触发
 *
 */
export default {
	name: 'w-number-input',
	props: {
		value: null,
		integer: Boolean,
		disabled: Boolean,
		asyncChange: Boolean,
		inputWidth: String,
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
		intLength: [String, Number],
		focusView: {
			type: Boolean,
			default: true
		},
		focusViewTime: {
			type: Number,
			default: 500
		},
		isEmptyValue: {
			type: Boolean,
			default: false
		},
		type: {
			type: String,
			default: 'number'
		}
	},
	data () {
		let value
		if (this.isEmptyValue) {
			value = ''
		} else {
			value = this.range(this.$fxUtils.isDef(this.value) ? this.value : this.defaultValue)
		}
		if (value !== +this.value) {
			this.$emit('input', value)
		}
		return {
			currentValue: value
		}
	},
	watch: {
		value (val) {
			if (val !== this.currentValue) {
				if (this.isEmptyValue) {
					this.currentValue = val
				} else {
					this.currentValue = this.format(val)
				}
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
		onBlur (event) {
			if (!this.isEmptyValue) {
				this.currentValue = this.range(this.currentValue)
			}
			if (this.currentValue !== event.target.value) {
				event.target.value = this.currentValue
				this.$emit('input', this.currentValue)
				this.$emit('change', this.currentValue)
			}
			this.$emit('blur', event)
		},
		onFocus (event) {
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
			this.$refs.numberInput.focus()
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.wind-number-input {
	width: 62px;
	height:22px
	line-height:22px
	padding: 1px;
	margin:1px
	background:none;
	outline:none;
	border:1px solid $fxGray
	border-radius:5px
	box-sizing: border-box;
	color: $fxTextColor;
	font-size: 14px;
	vertical-align: middle;
	text-align: center;
	-webkit-appearance: none;
	&[disabled] {
		color: $fxTextDisabledColor
		background-color: $fxInputDisabledColor
	}
	&[type="number"]::-webkit-inner-spin-button.,
	[type="number"]::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
}
</style>
