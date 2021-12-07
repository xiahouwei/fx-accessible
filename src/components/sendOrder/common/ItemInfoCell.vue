<template>
	<div class="item-info-cell">
		<div class="item-img">
			<img :src="comptedItemImgSrc(itemData.goodsDTO.imageUrls)" :onerror="$fxCommon.errorImg('item')">
		</div>
		<div class="item-details">
			<div class="item-name fx-ellipsis">{{itemData.goodsDTO.name}}</div>
			<div class="details-cell">
				<div v-show="$fxAuth('shopDirectInBill.seeWithTaxMoney')" class="item-taxprice fx-ellipsis">
					<span>含税金额：￥</span>
					<w-number-input
						v-if="!isDisabled && $fxAuth('shopDirectInBill.editWithTaxMoney')"
						v-model="itemData.inMoneyWithTax"
						class="item-taxprice-input"
						min="0"
						:max="maxAmount"
						:intLength="numberLength"
						:pointSize="sysPointSize"
						:disabled="busUnitInAmountIs0"
						@change="onPriceChange"
						@focus="onFocus"
						@blur="onBlur"
					></w-number-input>
					<span v-else>{{itemData.inMoneyWithTax}}</span>
				</div>
			</div>
			<div class="details-cell">
				<div class="item-spec fx-ellipsis">{{itemData.goodsDTO.spec}}</div>
				<div v-if="isDisabled || (itemData.isWeightSign && !sysDZCCanModifyAcount) || !$fxAuth('shopDirectInBill.modifyAmount')" class="item-amount">
					<span>{{itemData.busUnitInAmount}}</span>
					<span class="fx-ellipsis">{{itemData.unitDTO.name}}</span>
				</div>
				<div v-else class="item-amount-edit">
					<w-stepper
						ref="amountInput"
						v-model="itemData.busUnitInAmount"
						min="0"
						:max="maxAmount"
						class="amount-step"
						:stepperBtnShow="false"
						:intLength="numberLength"
						:pointSize="sysPointSize"
						inputWidth="28vw"
						@change="onChange"
						@focus="onFocus"
						@blur="onBlur"
					></w-stepper>
					<span class="fx-ellipsis cell-unit">{{itemData.unitDTO.name}}</span>
					<!-- <span class="fx-ellipsis cell-unit" @click.stop="onUnitClick">{{itemData.unitDTO.name}}</span> -->
					<!-- <van-icon v-show="!isDisabled" name="arrow-down" /> -->
				</div>
			</div>
		</div>
		<i v-show="!isDisabled && !disabledEditBtn" class="block-item-edit" @click="onItemEditClick"></i>
		<i v-show="isDisabled" class="block-item-watch" @click="onItemEditClick"></i>
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
		disabledEditBtn: Boolean,
		isDisabled: Boolean,
		blurSetFocusFlag: {
			type: Boolean,
			default: true
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize',
			numberLength: 'numberLength',
			maxAmount: 'maxAmount',
			taxes: 'taxes',
			sysDZCCanModifyAcount: state => state.systemParams.sysDZCCanModifyAcount,
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId
		}),
		comptedItemImgSrc (imageUrls) {
			return (imageUrls) => {
				if (!imageUrls) {
					return ''
				}
				return imageUrls.length === 0 ? '' : imageUrls[0]
			}
		},
		busUnitInAmountIs0 () {
			return this.itemData.busUnitInAmount === 0 || this.itemData.busUnitInAmount === '0'
		}
	},
	methods: {
		onPriceChange () {
			this.editItem()
			let { busUnitInAmount, taxPrice, inMoney, price, tax, inMoneyWithTax, taxInMoney } = this.itemData
			taxPrice = parseFloat(this.$fxUtils.toFixedSHW(inMoneyWithTax / busUnitInAmount, this.sysPointSize))
			inMoney = parseFloat(this.$fxUtils.toFixedSHW(inMoneyWithTax / (1 + tax), this.sysPointSize))
			price = parseFloat(this.$fxUtils.toFixedSHW(inMoney / busUnitInAmount, this.sysPointSize))
			taxInMoney = parseFloat(this.$fxUtils.toFixedSHW(inMoney * tax, this.sysPointSize))
			this.itemData.taxPrice = taxPrice
			this.itemData.inMoney = inMoney
			this.itemData.price = price
			this.itemData.taxInMoney = taxInMoney
		},
		onChange (arg) {
			this.onAmountChange(arg)
		},
		onAmountChange (busUnitInAmount) {
			this.editItem()
			let { inMoneyWithTax, taxPrice, inMoney, taxInMoney, price, tax } = this.itemData
			inMoneyWithTax = parseFloat(this.$fxUtils.toFixedSHW(taxPrice * busUnitInAmount, this.sysPointSize))
			inMoney = parseFloat(this.$fxUtils.toFixedSHW(price * busUnitInAmount, this.sysPointSize))
			taxInMoney = parseFloat(this.$fxUtils.toFixedSHW(inMoney * tax, this.sysPointSize))
			this.itemData.inMoneyWithTax = inMoneyWithTax
			this.itemData.inMoney = inMoney
			this.itemData.taxInMoney = taxInMoney
		},
		editItem () {
			this.$set(this.itemData, 'changeType', 'edit')
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
		onCheckAmount (tips = true) {
			return new Promise((resolve, reject) => {
				let goods = this.itemData.goodsDTO
				let { busUnitInAmount, rawAmount } = this.itemData
				let error = '数量不符合规则'
				/*
				* disOvercharge：开启收货超订货量限制
				* overchargePortion：比例
				*/
				if (rawAmount > 0 && goods.disOvercharge === '0' && (busUnitInAmount > (rawAmount + rawAmount * goods.overchargePortion / 100))) {
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
					this.$refs.amountInput.setFocus()
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
	position:relative
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
		display: flex
		flex-direction: column
		.details-cell {
			display: flex
			flex-direction: row
			overflow:hidden
		}
		.item-name {
			font-size:12px
			line-height:30px
			height:30px
			padding-right:30px
		}
		.item-taxprice {
			font-size:12px
			flex:1
			display: flex
			flex-direction: row
			align-items: center
			.item-taxprice-input {
				width:120px
				margin-left:5px
			}
		}
		.item-spec {
			flex:1
			font-size:10px
			line-height:30px
			height:30px
		}
		.item-amount {
			font-size: 12px
			width: 100px
			text-align: right
			line-height: 30px
			height: 30px
			overflow: hidden
			padding-right: 10px
		}
		.item-amount-edit {
			width:162px
			overflow:hidden
			text-align: right;
			.amount-step {
				display:inline-block
			}
			.cell-unit {
				width: 36px
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
