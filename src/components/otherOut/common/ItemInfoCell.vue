<template>
	<div class="item-info-cell">
		<div class="item-img">
			<img :src="comptedItemImgSrc(itemData.goodsDTO.imageUrls)" :onerror="$fxCommon.errorImg('item')">
		</div>
		<div class="item-details">
			<div class="item-name fx-ellipsis">{{itemData.goodsDTO.name}}</div>
			<div class="details-cell">
				<div class="item-taxprice fx-ellipsis">
					<span>含税金额：￥</span>
					<span>{{itemData.outMoney}}</span>
				</div>
				<div class="item-spec fx-ellipsis">{{itemData.goodsDTO.spec}}</div>
			</div>
			<div class="details-cell">
				<div v-if="isDisabled || (itemData.isWeightSign && !sysDZCCanModifyAcount)" class="item-amount">
					<span>{{itemData.busUnitOutAmount}}</span>
					<span class="fx-ellipsis">{{itemData.unitDTO.name}}</span>
				</div>
				<div v-else class="item-amount-edit">
					<w-stepper
						v-model="itemData.busUnitOutAmount"
						min="0"
						:max="maxAmount"
						:stepperBtnShow="false"
						class="amount-step"
						:intLength="numberLength"
						:pointSize="sysPointSize"
						@change="onChange"
						@focus="onFocus"
						@blur="onBlur"
					></w-stepper>
					<div class="unit-text">
						<span class="fx-ellipsis cell-unit" @click.stop="onUnitClick">{{itemData.unitDTO.name}}</span>
						<van-icon class="unit-icon" v-show="!isDisabled" name="arrow-down" />
					</div>
				</div>
			</div>
		</div>
		<i v-show="!isDisabled && !disabledEditBtn" class="block-item-edit" @click="onItemEditClick"></i>
		<i v-show="isDisabled && !disabledWatchBtn" class="block-item-watch" @click="onItemEditClick"></i>
	</div>
</template>

<script>
import { mapState } from 'vuex'
export default {
	name: 'itemInfoCell',
	props: {
		itemData: {
			type: Object,
			default: () => {
				return {}
			}
		},
		isDisabled: Boolean,
		disabledEditBtn: Boolean,
		disabledWatchBtn: Boolean
	},
	computed: {
		...mapState({
			sysDZCCanModifyAcount: state => state.systemParams.sysDZCCanModifyAcount,
			sysPointSize: 'sysPointSize',
			numberLength: 'numberLength',
			maxAmount: 'maxAmount'
		}),
		comptedItemImgSrc (imageUrls) {
			return (imageUrls) => {
				if (!imageUrls) {
					return ''
				}
				return imageUrls.length === 0 ? '' : imageUrls[0]
			}
		}
	},
	data () {
		return {
			isHasGoods: false
		}
	},
	methods: {
		onChange (arg) {
			this.amountChange(arg)
		},
		editItem () {
			if (this.itemData.id) this.$set(this.itemData, 'changeType', 'edit')
		},
		amountChange (amount) {
			this.editItem()
			// 设置金额
			this.calcMoney('amount', amount, this.itemData)
		},
		// {{{计算税额并渲染
		calcMoney (target, amountOrMoney, itemData) {
			let { busUnitOutAmount, price, tax } = itemData
			let money = 0
			let moneyWithTax = 0
			let itemPrice = 0
			let itemTaxPrice = 0
			let amountOrMoneyFixedNum = this.toFixedNumberSize(amountOrMoney)
			if (itemData.giftFlag || (target === 'money' && amountOrMoneyFixedNum === 0)) {
				// 赠送、数量为0
				itemData.outMoney = 0
				return true
			}
			if (target === 'money') {
				money = amountOrMoneyFixedNum
				itemPrice = this.toFixedNumberSize(money / busUnitOutAmount)
				moneyWithTax = money * (1 + tax)
				itemTaxPrice = this.toFixedNumberSize(moneyWithTax / busUnitOutAmount)
			} else if (target === 'amount') {
				if (amountOrMoney !== '') {
					itemData.busUnitOutAmount = amountOrMoneyFixedNum
				}
				itemPrice = price
				// itemTaxPrice = taxPrice
				money = this.toFixedNumberSize(price * amountOrMoneyFixedNum)
				// moneyWithTax = this.toFixedNumberSize(taxPrice * amountOrMoneyFixedNum)
			} else if (target === 'moneyWithTax') {
				moneyWithTax = amountOrMoneyFixedNum
				itemTaxPrice = this.toFixedNumberSize(moneyWithTax / busUnitOutAmount)
				money = this.toFixedNumberSize(moneyWithTax / (1 + tax))
				itemPrice = this.toFixedNumberSize(money / busUnitOutAmount)
			} else if (target === 'taxPrice') {
				itemTaxPrice = amountOrMoneyFixedNum
				moneyWithTax = this.toFixedNumberSize(busUnitOutAmount * itemTaxPrice)
				itemPrice = this.toFixedNumberSize(itemTaxPrice / (1 + tax))
				money = this.toFixedNumberSize(itemPrice * busUnitOutAmount)
			} else if (target === 'price') {
				itemPrice = amountOrMoneyFixedNum
				money = this.toFixedNumberSize(itemPrice * busUnitOutAmount)
				itemTaxPrice = this.toFixedNumberSize(itemPrice * (1 + tax))
				moneyWithTax = this.toFixedNumberSize(busUnitOutAmount * itemTaxPrice)
			}
			itemData.outMoney = money
			itemData.price = itemPrice
		},
		// }}}
		toFixedNumberSize (data) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysPointSize))
		},
		onItemEditClick () {
			this.editItem()
			this.$emit('on-item-edit', this.itemData)
		},
		onUnitClick () {
			if (this.isDisabled) {
				return false
			}
			this.editItem()
			this.$emit('on-unit-edit', this.itemData)
		},
		onFocus () {
			this.$emit('on-item-focus')
		},
		onBlur () {
			this.$emit('on-item-blur')
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.item-info-cell {
	display: flex
	flex-direction: row
	height:90px
	position: relative
	.item-img {
		width:80px
		height:90px
		padding:15px 10px
		box-sizing:border-box
		&>img {
			width:100%
			height:100%
		}
	}
	.item-details {
		flex:1
		overflow:hidden
		.item-name {
			font-size:12px
			line-height:30px
			height:30px
			padding-right:30px
		}
		.details-cell {
			display: flex
			flex-direction: row
			overflow:hidden
		}
		.cell-unit {
			width: 35px;
			display: inline-block;
		}
		.item-spec {
			font-size:10px
			line-height:30px
			height:30px
			flex:1
			margin-left: 20px
			text-align: right
		}
		.item-taxprice {
			font-size:12px
			line-height:30px
			height:30px
			.item-taxprice-input {
				width:100px
				background:none;
				outline:none;
				border:1px solid $fxGray
				border-radius:5px
				text-align:center;
				height:22px
				line-height:22px
			}
		}
		.item-store {
			font-size:10px
			line-height:30px
			height:30px
			flex:1
		}
		.item-amount {
			font-size:12px
			width: 100%
			text-align:right
			line-height:30px
			height:30px
			overflow:hidden
			padding-right: 10px;
		}
		.item-amount-edit {
			width: 100%
			overflow:hidden
			text-align: right;
			.amount-step {
				display:inline-block
			}
			.unit-text {
				width: 56px;
				display: inline-block;
				vertical-align: -webkit-baseline-middle;
			}
		}
	}
	.block-item-edit {
		width:20px
		height:20px
		background-image:url('~images/icon/icon-item-edit.png')
		background-repeat:no-repeat
		background-position: center
		background-size: 100%
		position:absolute
		top:0
		right:0
	}
	.block-item-watch {
		width:20px
		height:20px
		background-repeat:no-repeat
		background-position: center
		background-size: 100%
		position:absolute
		top:0
		right:0
		background-image:url('~images/icon/icon-item-info.png')
	}
}
</style>
