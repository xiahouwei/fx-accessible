<template>
	<div class="item-info-cell">
		<div class="item-img">
			<img :src="comptedItemImgSrc(itemData.goodsDTO.imageUrls)" :onerror="$fxCommon.errorImg('item')">
		</div>
		<div class="item-details">
			<div class="item-name fx-ellipsis">{{itemData.goodsDTO.name}}</div>
			<div class="details-cell">
				<!--
					0自采 1直配有权限角色，是否可查看、编辑，外销没有权限默认可以修改
					没有被审核、有保存权限、供货商可以修改价格、0自采，1直配有权限角色、外销可以修改
					不是赠送可以修改
				-->
				<div v-show="(isStockType([0]) && $fxAuth('stockOrderBill.zcinmoneywithtax')) || (isStockType([1]) && $fxAuth('stockOrderBill.zpinmoneywithtax')) || isStockType([2])" class="item-taxprice fx-ellipsis">
					<span>含税金额：￥</span>
					<w-number-input
						ref="moneyInput"
						v-if="couldChangePrice !== '1' && !isDisabled && ((isStockType([0]) && $fxAuth('stockOrderBill.editzcinmoneywithtax')) || (isStockType([1]) && $fxAuth('stockOrderBill.editzpinmoneywithtax')) || isStockType([2])) && !itemData.giftFlag"
						v-model="itemData.moneyWithTax"
						class="item-taxprice-input"
						min="0"
						:max="maxAmount"
						:intLength="numberLength"
						:pointSize="sysPointSize"
						@change="onMoneyChange(itemData.moneyWithTax)"
						@focus="onFocus"
						@blur="onBlur"
					></w-number-input>
					<span v-else>{{itemData.moneyWithTax}}</span>
				</div>
			</div>
			<div class="details-cell">
				<div class="item-spec fx-ellipsis">{{itemData.goodsDTO.spec}}</div>
				<div v-show="isDisabled" class="item-amount">
					<span>{{itemData.busUnitAmount}}</span>
					<span class="fx-ellipsis">{{itemData.unitDTO.name}}</span>
				</div>
				<div v-show="!isDisabled" class="item-amount-edit">
					<span v-if="isStockType([1]) && !$fxAuth('stockOrderBill.editzpcount')">{{itemData.busUnitAmount}}</span>
					<w-stepper
						ref="amountInput"
						v-else
						v-model="itemData.busUnitAmount"
						min="0"
						:max="maxAmount"
						:stepperBtnShow="false"
						class="amount-step"
						:intLength="numberLength"
						:pointSize="sysPointSize"
						@change="amountChange(itemData.busUnitAmount)"
						@focus="onFocus"
						@blur="onBlur"
					></w-stepper>
					<div class="unit-text">
						<span class="fx-ellipsis cell-unit" @click.stop="onUnitClick">{{itemData.unitDTO.name}}</span>
						<van-icon v-show="!isDisabled && isStockType([0]) && !fatherId && $fxSysAuth('stockOrderBill.sysstockordermodifyunit')" name="arrow-down" />
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
		couldChangePrice: {// 供货商价格是否可以修改 0：是，1：否
			type: String,
			default: '0'
		},
		fatherId: {// 有上级单据的，不能新增明细，修改单位、品项、仓库（注意：采购申请单生成的采购订货单是自采的，但是有上级单据）
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
		// 生成方式 0自采 1直配 2外销 0可编辑
		// 直配、外销把仓库、单位置为不可用
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
			let { taxPrice, busUnitAmount, price, tax } = itemData
			let money = 0
			let moneyWithTax = 0
			let itemPrice = 0
			let itemTaxPrice = 0
			let amountOrMoneyFixedNum = this.toFixedNumberSize(amountOrMoney)
			if (itemData.giftFlag || (target === 'money' && amountOrMoneyFixedNum === 0)) {
				// 赠送、数量为0
				itemData.money = 0
				itemData.moneyWithTax = 0
				itemData.taxMoney = 0
				return true
			}
			if (target === 'money') {
				money = amountOrMoneyFixedNum
				itemPrice = this.toFixedNumberSize(money / busUnitAmount)
				moneyWithTax = money * (1 + tax)
				itemTaxPrice = this.toFixedNumberSize(moneyWithTax / busUnitAmount)
			} else if (target === 'amount') {
				if (amountOrMoney !== '') {
					itemData.busUnitAmount = amountOrMoneyFixedNum
				}
				itemPrice = price
				itemTaxPrice = taxPrice
				money = this.toFixedNumberSize(price * amountOrMoneyFixedNum)
				moneyWithTax = this.toFixedNumberSize(taxPrice * amountOrMoneyFixedNum)
			} else if (target === 'moneyWithTax') {
				moneyWithTax = amountOrMoneyFixedNum
				itemTaxPrice = this.toFixedNumberSize(moneyWithTax / busUnitAmount)
				money = this.toFixedNumberSize(moneyWithTax / (1 + tax))
				itemPrice = this.toFixedNumberSize(money / busUnitAmount)
			} else if (target === 'taxPrice') {
				itemTaxPrice = amountOrMoneyFixedNum
				moneyWithTax = this.toFixedNumberSize(busUnitAmount * itemTaxPrice)
				itemPrice = this.toFixedNumberSize(itemTaxPrice / (1 + tax))
				money = this.toFixedNumberSize(itemPrice * busUnitAmount)
			} else if (target === 'price') {
				itemPrice = amountOrMoneyFixedNum
				money = this.toFixedNumberSize(itemPrice * busUnitAmount)
				itemTaxPrice = this.toFixedNumberSize(itemPrice * (1 + tax))
				moneyWithTax = this.toFixedNumberSize(busUnitAmount * itemTaxPrice)
			}
			itemData.money = money
			if (amountOrMoney !== '') {
				itemData.moneyWithTax = moneyWithTax
			}
			itemData.taxMoney = this.toFixedNumberSize(this.toFixedNumberSize(moneyWithTax) - this.toFixedNumberSize(money))
			itemData.price = itemPrice
			itemData.taxPrice = itemTaxPrice
		},
		// }}}
		toFixedNumberSize (data) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysPointSize))
		},
		onItemEditClick () {
			this.onCheckMoneyOrAmount(false).then(() => {
				this.editItem()
				this.$emit('on-item-edit', this.itemData)
			})
		},
		onUnitClick () {
			if (this.isDisabled || this.isStockType([1, 2]) || this.fatherId || !this.$fxSysAuth('stockOrderBill.sysstockordermodifyunit')) {
				return false
			}
			this.editItem()
			this.$emit('on-unit-edit', this.itemData)
		},
		onFocus () {
			this.$emit('on-item-focus')
		},
		onBlur () {
			this.onCheckMoneyOrAmount().then(() => {
				this.$emit('on-item-blur')
			}).catch(() => {
				// 强制金额获得焦点，不必数量获得焦点，修改数量，单价不变，不能够获得符合规则的单价，所以只能修改金额
				this.$refs.moneyInput.setFocus()
				this.$emit('on-item-focus')
			})
		},
		onCheckMoneyOrAmount (tips = true) {
			return new Promise((resolve, reject) => {
				let error = '不符合规则'
				let data = this.itemData
				let busUnitAmount = data.busUnitAmount
				let pricePlan = this.itemData.pricePlanDTO
				let getPriceWay = data.getPriceWay
				if (busUnitAmount === 0) {
					this.$nextTick(() => {
						if (tips) {
							this.$fxNotify.fail('数量不能为0!')
						}
						reject(error)
					})
					return false
				}
				if (!this.$fxUtils.isDef(pricePlan)) {
					resolve()
					return false
				}
				// 数量大于0
				// priced 定价标志 0不定价 1定价
				// getPriceWay取价方式 0:采购价格,1:固定价格,2:比例加价,3:定额加价
				// floatRate价格浮动比例
				if (getPriceWay === '1' && pricePlan.priced) {
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
							reject(error)
						})
					} else {
						resolve()
					}
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
