<template>
	<div v-show="value" ref="" class="item-number-keyboard fx-shadow-up">
		<div class="number-keyboard-title" @click="onAmountClick('busFactAmount1')">
			<div class="title-name fx-ellipsis">{{title}}</div>
			<div :class="{'is-active': active==='busFactAmount1'}" class="title-amount">
				<i v-if="active==='busFactAmount1'" class="active-icon"></i>{{itemDetails.busFactAmount1}}
			</div>
			<div class="title-unit">{{itemDetails.busUnit1}}</div>
		</div>
		<div v-show="hasBusUnit2" class="number-keyboard-title" @click="onAmountClick('busFactAmount2')">
			<div class="title-name fx-ellipsis"></div>
			<div :class="{'is-active': active==='busFactAmount2'}" class="title-amount">
				<i v-if="active==='busFactAmount2'" class="active-icon"></i>{{itemDetails.busFactAmount2}}
			</div>
			<div class="title-unit">{{itemDetails.busUnit2}}</div>
		</div>
		<div  v-show="itemDetails.assistUnit" class="number-keyboard-title" @click="onAmountClick('assistFactAmount')">
			<div class="title-name fx-ellipsis"></div>
			<div :class="{'is-active': active==='assistFactAmount'}" class="title-amount">
				<i v-if="active==='assistFactAmount'" class="active-icon"></i>{{itemDetails.assistFactAmount}}
			</div>
			<div class="title-unit">{{itemDetails.assistUnit}}</div>
		</div>
		<w-number-keyboard
			:value="amount"
			:pointSize="sysPointSize"
			:intLength="numberLength"
			@change="onAmountChange"
			@prev="onPrevClick"
			@next="onNextClick"
			@close="close"
		></w-number-keyboard>
		<div class="number-keyboard-masker"></div>
	</div>
</template>
<script>
import { mapState } from 'vuex'
export default {
	name: 'itemNumberKeyboard',
	props: {
		value: Boolean,
		busFactAmount1ChangeMethods: Function,
		busFactAmount2ChangeMethods: Function,
		assistFactAmountChangeMethods: Function
	},
	data () {
		return {
			active: '',
			itemDetails: {},
			itemIndex: -1,
			fxCalculation: this.$fxCalculation('centerCheckBill4cld')
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize',
			numberLength: 'numberLength'
		}),
		title () {
			return this.itemDetails.goodsDTO && this.itemDetails.goodsDTO.name
		},
		hasBusUnit2 () {
			return this.itemDetails.busUnit1 !== this.itemDetails.busUnit2 && !!this.itemDetails.busUnit1
		},
		amount () {
			if (this.active === 'busFactAmount1') {
				return this.itemDetails.busFactAmount1
			} else if (this.active === 'busFactAmount2') {
				return this.itemDetails.busFactAmount2
			} else {
				return this.itemDetails.assistFactAmount
			}
		}
	},
	methods: {
		open (type, itemDetails, itemIndex) {
			this.active = type
			this.itemDetails = itemDetails
			this.itemIndex = itemIndex
			this.$emit('input', true)
		},
		close () {
			this.$emit('input', false)
			this.$emit('close', false)
		},
		editItem () {
			if (this.itemDetails.id) {
				this.itemDetails.changeType = 'edit'
			}
		},
		onAmountChange (val) {
			if (this.active === 'busFactAmount1') {
				this.itemDetails.busFactAmount1 = val
				this.onBusFactAmount1Change(val, this.itemDetails)
			} else if (this.active === 'busFactAmount2') {
				this.itemDetails.busFactAmount2 = val
				this.onBusFactAmount2Change(val, this.itemDetails)
			} else {
				this.itemDetails.assistFactAmount = val
				this.onAssistFactAmountChange(val, this.itemDetails)
			}
		},
		onPrevClick () {
			this.$emit('prev', this.itemIndex)
		},
		onNextClick () {
			this.$emit('next', this.itemIndex)
		},
		onBusFactAmount1Change (val, row) {
			if (typeof this.busFactAmount1ChangeMethods === 'function') {
				this.busFactAmount1ChangeMethods(row)
				return false
			}
			this.fxCalculation.computeDiffAmount(row)
			this.editItem()
		},
		onBusFactAmount2Change (val, row) {
			if (typeof this.busFactAmount2ChangeMethods === 'function') {
				this.busFactAmount2ChangeMethods(row)
				return false
			}
			this.fxCalculation.computeDiffAmount2(row)
			this.editItem()
		},
		onAssistFactAmountChange (val, row) {
			if (typeof this.assistFactAmountChangeMethods === 'function') {
				this.assistFactAmountChangeMethods(row)
				return false
			}
			this.fxCalculation.computeDiffAssistAmount(row)
			this.editItem()
		},
		onAmountClick (type) {
			this.active = type
			this.$emit('on-edit-amount-type-change', type)
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
	.number-keyboard-title {
		height:30px
		line-height:30px
		text-align:center
		display: flex;
		flex-direction: row
		overflow:hidden
		.title-amount {
			width:140px
			font-size:16px
			position: relative
			&.is-active {
				color:$fxDefaultColor
			}
			.active-icon {
				background-image:url('~images/icon/wind-ui/icon-keyboard-arrow.png')
				background-repeat:no-repeat
				background-position: center
				background-size: 14px
				width: 14px
				height: 14px
				display: inline-block
				position: absolute
				left: 0
				top: 50%
				transition: 15ms all ease-out
				animation: 1s loading ease-in infinite
			}
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
			overflow:hidden
			font-size:12px
		}
	}
}
@keyframes loading {
  0%, 100% {
    transform: translate(0px, -50%);
  }
  60% {
    transform: translate(-5px, -50%);
  }
}
</style>
