<template>
	<div class="item-info-cell">
		<div class="item-img">
			<img :src="comptedItemImgSrc(itemData.goodsDTO.imageUrls)" :onerror="$fxCommon.errorImg('item')">
		</div>
		<div class="item-details">
			<div class="item-name fx-ellipsis">{{itemData.goodsDTO.name}}</div>
			<div class="details-cell">
				<div v-show="$fxAuth('shopStockInBill.seeWithTaxMoney')" class="item-taxprice fx-ellipsis">
					<span>含税金额：￥</span>
					<w-number-input
						ref="moneyInput"
						v-if="!isDisabled && $fxAuth('shopStockInBill.editWithTaxMoney') && !itemData.giftFlag && itemData.busUnitInAmount !== 0"
						v-model="itemData.inMoneyWithTax"
						class="item-taxprice-input"
						min="0"
						:max="maxAmount"
						:intLength="numberLength"
						:pointSize="sysPointSize"
						@change="onMoneyChange(itemData.inMoneyWithTax)"
						@focus="onFocus"
						@blur="onBlur"
					></w-number-input>
					<span v-else>{{itemData.inMoneyWithTax}}</span>
				</div>
			</div>
			<div class="details-cell">
				<div class="item-spec fx-ellipsis">{{itemData.goodsDTO.spec}}</div>
				<div v-if="isDisabled || (itemData.isWeightSign && !sysDZCCanModifyAcount) || !$fxAuth('shopStockInBill.editAmount')" class="item-amount">
					<span>{{itemData.busUnitInAmount}}</span>
				</div>
				<div v-else class="item-amount-edit">
					<w-stepper
						ref="amountInput"
						v-model="itemData.busUnitInAmount"
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
				</div>
				<div class="unit-text">
					<span class="fx-ellipsis cell-unit" @click.stop="onUnitClick">{{itemData.unitDTO.name}}</span>
					<van-icon class="unit-icon" v-show="!isDisabled && sysStockInChangeUnit" name="arrow-down" />
				</div>
			</div>
		</div>
		<i v-show="!isDisabled && !disabledEditBtn" class="block-item-edit" @click="onItemEditClick"></i>
		<i v-show="isDisabled && showEditBtn" class="block-item-watch" @click="onItemEditClick"></i>
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
		sysStockInChangeUnit: {
			type: Boolean,
			default: () => {
				return true
			}
		},
		disabledEditBtn: Boolean,
		showEditBtn: {
			type: Boolean,
			default: () => {
				return true
			}
		},
		blurSetFocusFlag: {
			type: Boolean,
			default: true
		}
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
				return imageUrls === null ? '' : imageUrls[0]
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
			// 设置称重状态为未称重
			this.itemData.weightState = 0
			// 更新缺货状态
			this.hasGoodsChange(amount)
		},
		onMoneyChange (money) {
			this.editItem()
			// 设置金额
			this.calcMoney('moneyWithTax', money, this.itemData)
		},
		// {{{计算税额并渲染
		calcMoney (target, amountOrMoney, itemData) {
			let { taxPrice, busUnitInAmount, price, tax } = itemData
			let money = 0
			let moneyWithTax = 0
			let itemPrice = 0
			let itemTaxPrice = 0
			let amountOrMoneyFixedNum = this.toFixedNumberSize(amountOrMoney)
			if (itemData.giftFlag || (target === 'money' && amountOrMoneyFixedNum === 0)) {
				// 赠送、数量为0
				itemData.inMoney = 0
				itemData.inMoneyWithTax = 0
				itemData.taxInMoney = 0
				return true
			}
			if (target === 'money') {
				money = amountOrMoneyFixedNum
				itemPrice = this.toFixedNumberSize(money / busUnitInAmount)
				moneyWithTax = money * (1 + tax)
				itemTaxPrice = this.toFixedNumberSize(moneyWithTax / busUnitInAmount)
			} else if (target === 'amount') {
				if (amountOrMoney !== '') {
					itemData.busUnitInAmount = amountOrMoneyFixedNum
				}
				itemPrice = price
				itemTaxPrice = taxPrice
				money = this.toFixedNumberSize(price * amountOrMoneyFixedNum)
				moneyWithTax = this.toFixedNumberSize(taxPrice * amountOrMoneyFixedNum)
			} else if (target === 'moneyWithTax') {
				moneyWithTax = amountOrMoneyFixedNum
				itemTaxPrice = this.toFixedNumberSize(moneyWithTax / busUnitInAmount)
				money = this.toFixedNumberSize(moneyWithTax / (1 + tax))
				itemPrice = this.toFixedNumberSize(money / busUnitInAmount)
			} else if (target === 'taxPrice') {
				itemTaxPrice = amountOrMoneyFixedNum
				moneyWithTax = this.toFixedNumberSize(busUnitInAmount * itemTaxPrice)
				itemPrice = this.toFixedNumberSize(itemTaxPrice / (1 + tax))
				money = this.toFixedNumberSize(itemPrice * busUnitInAmount)
			} else if (target === 'price') {
				itemPrice = amountOrMoneyFixedNum
				money = this.toFixedNumberSize(itemPrice * busUnitInAmount)
				itemTaxPrice = this.toFixedNumberSize(itemPrice * (1 + tax))
				moneyWithTax = this.toFixedNumberSize(busUnitInAmount * itemTaxPrice)
			}
			itemData.inMoney = money
			if (amountOrMoney !== '') {
				itemData.inMoneyWithTax = moneyWithTax
			}
			itemData.taxInMoney = this.toFixedNumberSize(this.toFixedNumberSize(moneyWithTax) - this.toFixedNumberSize(money))
			itemData.price = itemPrice
			itemData.taxPrice = itemTaxPrice
		},
		// }}}
		toFixedNumberSize (data) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysPointSize))
		},
		// {{{更新缺货状态
		/**
		 * 初始数据：缺货，修改数量，shortageFlag置为不缺货（false）,当数量继续修改为0时，重新置为缺货（true）
		 * 初始数据：不缺货，则无论怎么修改都不能改变shortageFlag
		 **/
		hasGoodsChange: function (amount) {
			if (parseFloat(amount) !== 0 && this.itemData.shortageFlag) {
				this.isHasGoods = this.itemData.shortageFlag
				this.itemData.shortageFlag = false
			} else if (amount === 0 && this.isHasGoods) {
				this.itemData.shortageFlag = true
			}
		},
		// }}}
		onItemEditClick () {
			this.editItem()
			this.$emit('on-item-edit', this.itemData)
		},
		onUnitClick () {
			if (this.isDisabled || !this.sysStockInChangeUnit) {
				return false
			}
			this.editItem()
			this.$emit('on-unit-edit', this.itemData)
		},
		onCheckAmount (tips = true) {
			return new Promise((resolve, reject) => {
				let data = this.itemData
				let goods = data.goodsDTO
				let { busUnitInAmount, outOrderAmount } = this.itemData
				let error = '数量不符合规则'
				let getPriceWay = data.getPriceWay
				let pricePlan = this.itemData.pricePlanDTO
				if (!data.giftFlag && getPriceWay === '1' && pricePlan.priced) {
					let taxPrice = data.taxPrice
					let floatRate = this.toFixedNumberSize(pricePlan.floatRate)
					let downFloatRate = this.toFixedNumberSize(pricePlan.downFloatRate)
					let planTaxPrice = pricePlan.priceWithTax / pricePlan.unit.value * data.unitDTO.value
					let minTaxPrice = this.toFixedNumberSize(planTaxPrice * (1 - downFloatRate / 100))
					let maxTaxPrice = this.toFixedNumberSize(planTaxPrice * (1 + floatRate / 100))

					// let price = pricePlan.price / pricePlan.unit.value * data.unitDTO.value
					// let minPrice = this.toFixedNumberSize(price * (1 - floatRate / 100))
					// let maxPrice = this.toFixedNumberSize(price * (1 + floatRate / 100))

					if (taxPrice < minTaxPrice || taxPrice > maxTaxPrice) {
						this.$nextTick(() => {
							if (tips) {
								let message = '含税单价：请填写 ' + minTaxPrice + ' 到 ' + maxTaxPrice + ' 范围内的数值！'
								this.$fxNotify.fail(message)
							}
						})
						reject(error)
						return false
					}
				}
				/*
				* disOvercharge：开启收货超订货量限制
				* overchargePortion：比例
				*/
				if (outOrderAmount > 0 && goods.disOvercharge === '0' && (busUnitInAmount > (outOrderAmount + outOrderAmount * goods.overchargePortion / 100))) {
					if (tips) {
						this.$fxNotify.fail('入库数量不能超出订货数量' + goods.overchargePortion + '%')
					}
					reject(error)
				} else {
					resolve()
				}
			})
		},
		onFocus () {
			this.$emit('on-item-focus')
		},
		onBlur () {
			let checkTips = true
			if (!this.blurSetFocusFlag) {
				checkTips = false
			}
			this.onCheckAmount(checkTips).then(() => {
				this.$emit('on-item-blur')
			}).catch(() => {
				if (this.blurSetFocusFlag) {
					// 强制金额获得焦点，不必数量获得焦点，修改数量，单价不变，不能够获得符合规则的单价，所以只能修改金额
					this.$refs.moneyInput.setFocus()
					this.$emit('on-item-focus')
				} else {
					this.$emit('on-item-blur-fail')
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
			text-align: left
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
			width:90px
			overflow:hidden
			text-align: right;
			.amount-step {
				display:inline-block
			}
		}
		.cell-unit {
			width: 35px;
			display: inline-block;
		}
		.unit-text {
			line-height:30px
			height:30px
			width: 56px
			text-align: right
			.unit-icon {
				height: 100%
				vertical-align: bottom
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
