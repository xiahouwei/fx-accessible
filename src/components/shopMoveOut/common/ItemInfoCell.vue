<template>
	<div class="item-info-cell">
		<div class="item-img">
			<img :src="comptedItemImgSrc(itemData.goodsDTO.imageUrls || [])" :onerror="$fxCommon.errorImg('item')">
		</div>
		<div class="item-details">
			<div class="item-name fx-ellipsis">{{itemData.goodsDTO.name}}</div>
			<div class="details-cell">
				<div class="item-taxprice fx-ellipsis">
					<span>含税金额：￥</span>
					<w-number-input
						v-if="!isDisabled && $fxAuth('shopMoveOutBill.editTaxMoney')"
						v-model="itemData.sendMoneyWithTax"
						class="item-taxprice-input"
						min="0"
						:max="maxAmount"
						:intLength="numberLength"
						:pointSize="sysPointSize"
						@change="onMoneyChange(itemData.sendMoneyWithTax)"
						@focus="onFocus"
						@blur="onBlur"
					></w-number-input>
					<span v-else>{{itemData.sendMoneyWithTax}}</span>
				</div>
				<div class="item-spec fx-ellipsis">{{itemData.goodsDTO.spec}}</div>
			</div>
			<div class="details-cell">
				<div v-if="isDisabled || (itemData.isWeightSign && !sysDZCCanModifyAcount) || !$fxAuth('shopMoveOutBill.editAmount')" class="item-amount">
					<span>{{itemData.busUnitOutAmount}}</span>
					<span class="fx-ellipsis">{{itemData.unitDTO.name}}</span>
				</div>
				<div v-else class="item-amount-edit">
					<w-stepper
						ref="amountInput"
						v-model="itemData.busUnitOutAmount"
						min="0"
						:max="maxAmount"
						class="amount-step"
						:stepperBtnShow="false"
						:intLength="numberLength"
						:pointSize="sysPointSize"
						inputWidth="28vw"
						@change="onChange(itemData.busUnitOutAmount)"
						@focus="onFocus"
						@blur="onBlur"
					></w-stepper>
					<div class="unit-text">
						<span class="fx-ellipsis cell-unit">{{itemData.unitDTO.name}}</span>
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
		shopId: String
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize',
			numberLength: 'numberLength',
			maxAmount: 'maxAmount',
			sysDZCCanModifyAcount: state => state.systemParams.sysDZCCanModifyAcount,
			loginerShopId: state => state.loginer.loginerShopId
		}),
		comptedItemImgSrc (imageUrls) {
			return (imageUrls) => {
				return imageUrls.length === 0 ? '' : imageUrls[0]
			}
		}
	},
	methods: {
		editItem () {
			if (this.itemData.id) this.$set(this.itemData, 'changeType', 'edit')
		},
		onItemEditClick () {
			this.editItem()
			this.$emit('on-item-edit', this.itemData)
		},
		onChange (amount) {
			if (this.itemData.changeType === 'del') return false
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
			let { taxPrice, busUnitOutAmount, price, sendTaxes } = itemData
			let money = 0
			let moneyWithTax = 0
			let itemPrice = 0
			let itemTaxPrice = 0
			amountOrMoney = this.toFixedNumberSize(amountOrMoney)
			if (itemData.giftFlag || (target === 'money' && amountOrMoney === 0)) {
				// 赠送、数量为0
				itemData.sendMoney = 0
				itemData.sendMoneyWithTax = 0
				itemData.sendTaxMoney = 0
				return true
			}
			if (target === 'money') {
				money = amountOrMoney
				itemPrice = this.toFixedNumberSize(money / busUnitOutAmount)
				moneyWithTax = this.toFixedNumberSize(money * (1 + sendTaxes))
				itemTaxPrice = this.toFixedNumberSize(moneyWithTax / busUnitOutAmount)
			} else if (target === 'amount') {
				itemData.busUnitOutAmount = amountOrMoney
				itemPrice = price
				itemTaxPrice = taxPrice
				money = this.toFixedNumberSize(price * amountOrMoney)
				moneyWithTax = this.toFixedNumberSize(taxPrice * amountOrMoney)
			} else if (target === 'moneyWithTax') {
				moneyWithTax = amountOrMoney
				itemTaxPrice = this.toFixedNumberSize(moneyWithTax / busUnitOutAmount)
				money = this.toFixedNumberSize(moneyWithTax / (1 + sendTaxes))
				itemPrice = this.toFixedNumberSize(money / busUnitOutAmount)
			} else if (target === 'taxPrice') {
				itemTaxPrice = amountOrMoney
				moneyWithTax = this.toFixedNumberSize(busUnitOutAmount * itemTaxPrice)
				itemPrice = this.toFixedNumberSize(itemTaxPrice / (1 + sendTaxes))
				money = this.toFixedNumberSize(itemPrice * busUnitOutAmount)
			} else if (target === 'price') {
				itemPrice = amountOrMoney
				money = this.toFixedNumberSize(itemPrice * busUnitOutAmount)
				itemTaxPrice = this.toFixedNumberSize(itemPrice * (1 + sendTaxes))
				moneyWithTax = this.toFixedNumberSize(busUnitOutAmount * itemTaxPrice)
			}
			itemData.sendMoney = money
			itemData.sendMoneyWithTax = moneyWithTax
			itemData.sendTaxMoney = this.toFixedNumberSize(this.toFixedNumberSize(moneyWithTax) - this.toFixedNumberSize(money))
			itemData.price = itemPrice
			itemData.taxPrice = itemTaxPrice
		},
		toFixedNumberSize (data) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysPointSize))
		},
		// }}}
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
		.item-taxprice {
			font-size:12px
			line-height:30px
			height:30px
		}
		.item-spec {
			font-size:10px
			line-height:30px
			height:30px
			flex:1
			text-align:right
			margin-left: 20px
		}
		.item-amount {
			font-size: 12px
			width: 100%
			text-align: right
			line-height: 30px
			height: 30px
			overflow: hidden
			padding-right: 10px
		}
		.item-amount-edit {
			width: 100%
			overflow:hidden
			text-align: right
			.amount-step {
				display: inline-block
			}
			.unit-text {
				width: 56px
				display: inline-block
				vertical-align: -webkit-baseline-middle
			}
		}
	}
	.block-item-edit, .block-item-watch {
		width:20px
		height:20px
		background-repeat:no-repeat
		background-position: center
		background-size: 100%
		position:absolute
		top:0
		right:0
	}
	.block-item-edit {
		background-image:url('~images/icon/icon-item-edit.png')
	}
	.block-item-watch {
		background-image:url('~images/icon/icon-item-info.png')
	}
}
</style>
