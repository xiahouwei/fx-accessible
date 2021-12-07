<template>
	<div class="fx-item-number-keyboard">
		<div class="item-number-keyboard fx-shadow-up">
			<div class="number-keyboard-title">
				<div class="title-name fx-ellipsis">{{computedTitle}}</div>
				<div class="title-amount">{{amount}}</div>
				<div class="title-unit" @click="onUnitClick">
					<span class="title-unit-text fx-ellipsis">{{computedUnit}}</span>
					<i v-show="unitEdit" class="title-unit-select"></i>
				</div>
			</div>
			<div class="number-keyboard-content">
				<div class="keyboard-number">
					<div class="keyboard-number-row">
						<i class="keyboard-btn-1 fx-Pseudo-btn" @click="numberBtnClick('1')">1</i>
						<i class="keyboard-btn-1 fx-Pseudo-btn" @click="numberBtnClick('2')">2</i>
						<i class="keyboard-btn-1 fx-Pseudo-btn" @click="numberBtnClick('3')">3</i>
						<i class="keyboard-btn-1 keyboard-btn-hide fx-Pseudo-btn" @click="hideKeyboardBtnClick"></i>
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
			</div>
		</div>
		<w-action-sheet
			ref="unitActionSheet"
			v-model="unitActionShow"
			:actions="unitActions"
		></w-action-sheet>
	</div>
</template>

<script>
export default {
	name: 'itemNumberKeyboard',
	props: {
		data: {
			type: Object,
			default: () => {
				return {}
			}
		},
		title: String,
		unit: String,
		amountKey: String,
		unitEdit: {
			type: Boolean,
			default: false
		},
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
	data () {
		return {
			unitActionShow: false,
			unitActions: []
		}
	},
	computed: {
		computedNumberReg () {
			return new RegExp(`^\\d+(\\.|\\.\\d{1,${this.pointSize - 1}})?$`)
		},
		computedTitle () {
			return this.data.goodsDTO && this.data.goodsDTO.name
		},
		computedUnit () {
			return this.data.unitDTO && this.data.unitDTO.name
		},
		amount () {
			return this.data[this.amountKey]
		}
	},
	methods: {
		numberBtnClick (keyValue) {
			this.$emit('input', keyValue)
			this.$emit('change', this.getAddValue(keyValue))
		},
		delBtnClick (keyValue) {
			this.$emit('delete')
			this.$emit('change', this.getDelValue(keyValue))
		},
		preBtnClick () {
			this.$emit('pre')
		},
		nextBtnClick () {
			this.$emit('next')
		},
		hideKeyboardBtnClick () {
			this.$emit('hide')
		},
		onUnitClick () {
			this.$fxApi('common.getItemUnit', this.data.goodsDTO.id).then(res => {
				this.unitActions = res.units
				this.unitActionShow = true
				this.$refs.unitActionSheet.doSelect().then(unitItem => {
					this.$emit('on-unit-select', unitItem, this.data)
				})
			})
		},
		getAddValue (val) {
			let amount = this.amount + ''
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
			let amount = this.amount + ''
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
.item-number-keyboard {
	text-align:center
	width:100%
	background:#fff
	display: flex;
	flex-direction: column
	z-index:20
	.number-keyboard-title {
		height:40px
		line-height:40px
		text-align:center
		display: flex;
		flex-direction: row
		overflow:hidden
		.title-amount {
			width:140px
			font-size:18px
			color:$fxDefaultColor
		}
		.title-name {
			flex:1
			font-size:14px
			overflow:hidden
			text-overflow : ellipsis
			white-space:nowrap
		}
		.title-unit {
			width:80px
			display: flex;
			flex-direction: row
			overflow:hidden
			.title-unit-text {
				flex:1
				font-size:12px
			}
			.title-unit-select {
				width:20px
				background-repeat:no-repeat
				background-position: center
				background-size: 16px
				background-image:url('~images/icon/icon-unit-select.png')
			}
		}
	}
	.number-keyboard-content {
		display: flex;
		flex-direction: row;
		flex:1
		width:100%
		.keyboard-number {
			display: flex;
			flex-direction: column;
			flex:1
			.keyboard-number-row {
				flex:1
				display: flex;
				flex-direction: row;
			}
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
			background-size: 30px
		}
		.keyboard-btn-hide {
			background-image:url('~images/icon/icon-keyboard-hide.png')
			background-repeat:no-repeat
			background-position: center
			background-size: 30px
		}
	}
}
</style>
