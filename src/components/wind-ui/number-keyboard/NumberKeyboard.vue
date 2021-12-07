<template>
	<div class="number-keyboard">
		<div class="keyboard-number-row">
			<i class="keyboard-btn-1 fx-Pseudo-btn" @click="numberBtnClick('1')">1</i>
			<i class="keyboard-btn-1 fx-Pseudo-btn" @click="numberBtnClick('2')">2</i>
			<i class="keyboard-btn-1 fx-Pseudo-btn" @click="numberBtnClick('3')">3</i>
			<i class="keyboard-btn-1 keyboard-btn-hide fx-Pseudo-btn" @click="close"></i>
		</div>
		<div class="keyboard-number-row">
			<i class="keyboard-btn-1 fx-Pseudo-btn" @click="numberBtnClick('4')">4</i>
			<i class="keyboard-btn-1 fx-Pseudo-btn" @click="numberBtnClick('5')">5</i>
			<i class="keyboard-btn-1 fx-Pseudo-btn" @click="numberBtnClick('6')">6</i>
			<i class="keyboard-btn-1 keyboard-btn-del fx-Pseudo-btn" @click="delBtnClick"></i>
		</div>
		<div class="keyboard-number-row">
			<i class="keyboard-btn-1 fx-Pseudo-btn" @click="numberBtnClick('7')">7</i>
			<i class="keyboard-btn-1 fx-Pseudo-btn" @click="numberBtnClick('8')">8</i>
			<i class="keyboard-btn-1 fx-Pseudo-btn" @click="numberBtnClick('9')">9</i>
			<i class="keyboard-btn-1 keyboard-btn-pre fx-Pseudo-btn" @click="preBtnClick">上一个</i>
		</div>
		<div class="keyboard-number-row">
			<i class="keyboard-btn-2 keyboard-btn-zero fx-Pseudo-btn" @click="numberBtnClick('0')">0</i>
			<i class="keyboard-btn-1 keyboard-btn-dot fx-Pseudo-btn" @click="numberBtnClick('.')">.</i>
			<i class="keyboard-btn-1 keyboard-btn-next fx-Pseudo-btn" @click="nextBtnClick">下一个</i>
		</div>
	</div>
</template>

<script>
/* numberKeyboard by shw 2021/5/26
 * @desc 数字键盘
 *
 * @param {title} [str] - 标题
 * @param {value}  [str]
 *
 * @event {on-click} 选择时触发
 * @event {on-clear} 点击clear按钮时触发
 */
export default {
	name: 'w-number-keyboard',
	props: {
		value: null,
		integer: Boolean,
		pointSize: {
			type: [String, Number],
			default: 4
		},
		intLength: {
			type: [String, Number],
			default: 8
		}
	},
	computed: {
		computedNumberReg () {
			return new RegExp(`^\\d+(\\.|\\.\\d{1,${this.pointSize - 1}})?$`)
		}
	},
	methods: {
		numberBtnClick (keyValue) {
			const val = this.getAddValue(keyValue)
			if (val !== this.value) {
				this.$emit('input', val)
				this.$emit('change', val)
			}
		},
		delBtnClick (keyValue) {
			const val = this.getDelValue(keyValue)
			if (val !== this.value) {
				this.$emit('input', val)
				this.$emit('change', val)
			}
		},
		close () {
			this.$emit('close')
		},
		preBtnClick () {
			this.$emit('prev')
		},
		nextBtnClick () {
			this.$emit('next')
		},
		getAddValue (val) {
			let amount = this.value + ''
			if (
				(amount.indexOf('.') === -1 && amount.length >= this.intLength && val !== '.') ||
				(amount.indexOf('.') !== -1 && (val === '.' || !this.computedNumberReg.test(amount))) ||
				(val === '.' && !!this.integer)
			) {
				return amount
			}
			if (amount === '0' && val !== '.') {
				amount = val
			} else {
				amount += val
			}
			return amount
		},
		getDelValue (val) {
			let amount = this.value + ''
			if (amount === '0') {
				return amount
			}
			if (amount.length === 1) {
				amount = '0'
			} else {
				amount = amount.substr(0, amount.length - 1)
			}
			return amount
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.number-keyboard {
	display: flex;
	flex-direction: column;
	flex:1
	width:100%
	.keyboard-number-row {
		flex:1
		display: flex;
		flex-direction: row;
	}
	i {
		background-color:#c3d4ff63
		border:2px solid #fff
		border-radius:5px
		line-height:50px
		font-size:20px
		position:relative
	}
	.keyboard-btn-1 {
		flex:1
	}
	.keyboard-btn-2 {
		flex:2
	}
	.keyboard-btn-3 {
		flex:3
	}
	.keyboard-btn-pre, .keyboard-btn-next {
		background-color:$fxDefaultColor
		color:#FFF
	}
	.keyboard-btn-del {
		background-image:url('~images/icon/icon-keyboard-delete.png')
		background-repeat:no-repeat
		background-position: center
		background-size: 20px
	}
	.keyboard-btn-hide {
		background-image:url('~images/icon/icon-keyboard-hide.png')
		background-repeat:no-repeat
		background-position: center
		background-size: 20px
	}
}
</style>
