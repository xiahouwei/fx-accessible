<template>
	<div class="item-info-cell">
		<div class="item-img">
			<img :src="comptedItemImgSrc(itemData.goodsDTO.imageUrls)" :onerror="$fxCommon.errorImg('item')">
		</div>
		<div class="item-details">
			<div class="item-name fx-ellipsis">{{itemData.goodsDTO.name}}</div>
			<div class="details-cell">
				<div class="item-spec fx-ellipsis">
					{{itemData.goodsDTO.spec}}
				</div>
			</div>
			<div v-show="isDisabled" class="item-amount">
				<span class="item-amount-text">{{itemData.busUnitAmount}}</span>
				<span>{{itemData.unitDTO.name}}</span>
			</div>
			<div v-show="!isDisabled" class="item-amount-edit">
				<w-stepper
					ref="amountInput"
					v-model="itemData.busUnitAmount"
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
				<div class="item-unit">
					<span class="item-unit-text" @click.stop="onUnitClick">{{itemData.unitDTO.name}}</span>
					<van-icon name="arrow-down" />
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
		isDisabled: Boolean,
		disabledEditBtn: Boolean
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize',
			numberLength: 'numberLength',
			maxAmount: 'maxAmount'
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
			this.onCheckAmount(false).then(() => {
				this.editItem()
				this.$emit('on-item-edit', this.itemData)
			})
		},
		onChange (arg) {
			if (this.itemData.changeType === 'del') return false
			this.editItem()
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
		onUnitClick () {
			if (this.isDisabled) {
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
				let { busUnitAmount } = this.itemData
				let error = '数量不符合规则'
				if (busUnitAmount === 0) {
					this.$nextTick(() => {
						if (tips) {
							this.$fxNotify.fail('调拨数量不能为0!')
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
	height:80px
	.item-img {
		width:80px
		height:80px
		padding:10px
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
		.item-name {
			font-size:12px
			line-height:30px
			height:30px
			padding-right:30px
		}
		.item-amount {
			font-size:12px
			line-height:40px
			height:40px
			text-align:right
			padding-right:20px
			.item-amount-text {
				margin-right:10px
			}
		}
		.item-amount-edit {
			height: 36px
			font-size:12px
			text-align:right
			.amount-step {
				display: inline-block;
			}
			.item-unit {
				margin-left:10px
				margin-right:10px
				display: inline-block;
				vertical-align: -webkit-baseline-middle;
				.item-unit-text {
					margin-right:5px
				}
			}
		}
		.item-empty {
			flex:1
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
