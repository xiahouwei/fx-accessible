<template>
	<div class="item-info-cell">
		<div class="item-img">
			<img :src="comptedItemImgSrc(itemData.goodsDTO.imageUrls)" :onerror="$fxCommon.errorImg('item')">
		</div>
		<div class="item-details">
			<div class="item-name fx-ellipsis">{{itemData.goodsDTO.name}}</div>
			<div class="details-cell">
				<div v-show="(isStockType([0]) && $fxAuth('shopReturnBill.seeWithTaxMoney')) || (isStockType([1]) && $fxAuth('shopReturnBill.seeWithTaxMoney')) || isStockType([2])" class="item-taxprice fx-ellipsis">
					<span>含税金额：￥</span>
					<!-- <w-number-input
						ref="moneyInput"
						v-if="!isDisabled && ((isStockType([0]) && $fxAuth('stockOrderBill.editzcinmoneywithtax')) || (isStockType([1]) && $fxAuth('stockOrderBill.editzpinmoneywithtax')) || isStockType([2])) && !itemData.giftFlag"
						v-model="itemData.outMoneyWithTax"
						class="item-taxprice-input"
						min="0"
						:max="maxAmount"
						:intLength="numberLength"
						:pointSize="sysPointSize"
						@change="onMoneyChange(itemData.outMoneyWithTax)"
						@focus="onFocus"
						@blur="onBlur"
					></w-number-input> -->
					<span>{{itemData.outMoneyWithTax}}</span>
				</div>
			</div>
			<div class="details-cell">
				<div class="item-spec fx-ellipsis">{{itemData.goodsDTO.spec}}</div>
				<div v-show="isDisabled" class="item-amount">
					<span>{{itemData.busUnitOutAmount}}</span>
					<span class="fx-ellipsis">{{itemData.unitDTO.name}}</span>
				</div>
				<div v-show="!isDisabled" class="item-amount-edit">
					<span v-if="isStockType([1])">{{itemData.busUnitOutAmount}}</span>
					<w-stepper
						ref="amountInput"
						v-else
						v-model="itemData.busUnitOutAmount"
						min="0"
						:max="maxAmount"
						:stepperBtnShow="false"
						class="amount-step"
						:intLength="numberLength"
						:pointSize="sysPointSize"
						@change="amountChange(itemData.busUnitOutAmount)"
						@focus="onFocus"
						@blur="onBlur"
					></w-stepper>
					<div class="unit-text">
						<span class="fx-ellipsis cell-unit" @click.stop="onUnitClick">{{itemData.unitDTO.name}}</span>
						<van-icon v-show="isStockType([0]) && !fatherId" name="arrow-down" />
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
		disabledWatchBtn: Boolean,
		stockType: {// 生成方式 0自采 1直配 2外销
			type: Number,
			default: 0
		},
		fatherId: {// 有上级单据的，不能新增明细，修改单位、品项、仓库（注意：生成的采购退货单是自采的，但是有上级单据）
			type: Boolean,
			default: false
		}
	},
	computed: {
		...mapState({
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
		},
		// 生成方式 0自采
		isStockType (state) {
			return state => {
				if (Object.prototype.toString.call(state) === '[object Array]') {
					return state.includes(this.stockType)
				} else {
					return this.stockType === state
				}
			}
		}
	},
	data () {
		return {
			isHasGoods: false
		}
	},
	methods: {
		editItem () {
			if (this.itemData.id) this.$set(this.itemData, 'changeType', 'edit')
		},
		amountChange (amount) {
			this.editItem()
			// 设置金额
			this.calcMoney('amount', amount, this.itemData)
		},
		onMoneyChange (money) {
			this.editItem()
			// 设置金额
			this.calcMoney('moneyWithTax', money, this.itemData)
		},
		// {{{计算税额并渲染
		calcMoney (target, amountOrMoney, itemData) {
			let { taxPrice, busUnitOutAmount, price, tax } = itemData
			let money = 0
			let moneyWithTax = 0
			let itemPrice = 0
			let itemTaxPrice = 0
			let amountOrMoneyFixedNum = this.toFixedNumberSize(amountOrMoney)
			if (itemData.giftFlag || (target === 'money' && amountOrMoneyFixedNum === 0)) {
				// 赠送、数量为0
				itemData.outMoney = 0
				itemData.outMoneyWithTax = 0
				itemData.taxOutMoney = 0
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
				itemTaxPrice = taxPrice
				money = this.toFixedNumberSize(price * amountOrMoneyFixedNum)
				moneyWithTax = this.toFixedNumberSize(taxPrice * amountOrMoneyFixedNum)
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
			if (amountOrMoney !== '') {
				itemData.outMoneyWithTax = moneyWithTax
			}
			itemData.taxOutMoney = this.toFixedNumberSize(this.toFixedNumberSize(moneyWithTax) - this.toFixedNumberSize(money))
			itemData.price = itemPrice
			itemData.taxPrice = itemTaxPrice
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
			if (this.isDisabled || this.isStockType([1, 2]) || this.fatherId) {
				return false
			}
			this.onCheckAmount(false).then(() => {
				this.editItem()
				this.$emit('on-unit-edit', this.itemData)
			})
		},
		onFocus () {
			this.$emit('on-item-focus')
		},
		onBlur () {
			this.onCheckAmount().then(() => {
				this.$emit('on-item-blur')
			}).catch(() => {
				this.$refs.amountInput.setFocus()
				this.$emit('on-item-focus')
			})
		},
		onCheckAmount (tips = true) {
			return new Promise((resolve, reject) => {
				let { busUnitOutAmount } = this.itemData
				let error = '数量不符合规则'
				if (busUnitOutAmount === 0) {
					this.$nextTick(() => {
						if (tips) {
							this.$fxNotify.fail('数量不能为0!')
						}
						reject(error)
					})
				} else {
					resolve()
				}
			})
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
			width: 30px;
			display: inline-block;
		}
		.item-spec {
			font-size:10px
			line-height:30px
			height:30px
			flex:1
			text-align:left
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
			width:100px
			text-align:right
			line-height:30px
			height:30px
			overflow:hidden
			padding-right: 10px;
		}
		.item-amount-edit {
			width:162px
			overflow:hidden
			text-align: right;
			.amount-step {
				display:inline-block
			}
			.unit-text {
				width: 50px;
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
