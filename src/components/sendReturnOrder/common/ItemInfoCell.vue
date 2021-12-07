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
					<span>{{itemData.outMoneyWithTax}}</span>
				</div>
				<div class="item-spec fx-ellipsis">{{itemData.goodsDTO.spec}}</div>
			</div>
			<div class="details-cell">
				<div v-show="isDisabled" class="item-amount">
					<span class="item-amount-text">{{itemData.busUnitOutAmount}}</span>
					<span>{{itemData.unitDTO.name}}</span>
				</div>
				<div v-show="!isDisabled" class="item-amount-edit">
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
						@change="onChange"
						@focus="onFocus"
						@blur="onBlur"
					></w-stepper>
					<div class="unit-text fx-ellipsis">{{itemData.unitDTO.name}}</div>
				</div>
			</div>
			<i v-show="!isDisabled && !disabledEditBtn" class="block-item-edit" @click="onItemEditClick"></i>
			<i v-show="isDisabled" class="block-item-watch" @click="onItemEditClick"></i>
		</div>
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
			this.editItem()
			this.$emit('on-item-edit', this.itemData)
		},
		onChange (arg) {
			if (this.itemData.changeType === 'del') return false
			this.editItem()
			this.onAmountChange(arg)
		},
		onAmountChange (busUnitOutAmount) {
			this.editItem()
			let { taxPrice, price } = this.itemData
			let outMoney = parseFloat(this.$fxUtils.toFixedSHW(price * busUnitOutAmount, this.sysPointSize))
			let outMoneyWithTax = parseFloat(this.$fxUtils.toFixedSHW(taxPrice * busUnitOutAmount, this.sysPointSize))
			let taxOutMoney = parseFloat(this.$fxUtils.toFixedSHW((outMoneyWithTax - outMoney), this.sysPointSize))
			this.itemData.outMoney = outMoney
			this.itemData.outMoneyWithTax = outMoneyWithTax
			this.itemData.taxOutMoney = taxOutMoney
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
							this.$fxNotify.fail('退货数量不能为0!')
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
	align-items: center
	.item-img {
		width:60px
		height:60px
		padding:0px 10px
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
			overflow: hidden
			.item-spec {
				font-size:10px
				line-height:30px
				height:30px
				flex:1
				margin-left: 20px
				text-align: right
			}
		}
		.item-name {
			font-size:12px
			line-height:30px
			height:30px
			padding-right:30px
		}
		.item-taxprice {
			font-size:12px
			line-height:30px
			height:30px
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
			width:100%
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
