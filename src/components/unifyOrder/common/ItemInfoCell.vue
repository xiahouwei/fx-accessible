<template>
	<div class="item-info-cell">
		<div class="item-img">
			<img :src="comptedItemImgSrc(itemData.goodsDTO.imageUrls)" :onerror="$fxCommon.errorImg('item')">
		</div>
		<div class="item-details">
			<div class="item-name fx-ellipsis">{{itemData.goodsDTO.name}}</div>
			<div class="item-amount-block">
				<div v-show="$fxAuth('distributionInBill.seewithtaxmoney')" class="item-taxprice fx-ellipsis">
					<span>含税金额：￥</span>
					<span>{{itemData.inMoneyWithTax}}</span>
				</div>
				<div class="item-spec fx-ellipsis">{{itemData.goodsDTO.spec}}</div>
			</div>
			<div class="item-amount-block">
				<span class="item-amount-title fx-ellipsis">门店入库数：</span>
				<div class="item-amount">
					<span v-if="isDisabled || (itemData.isWeightSign && !sysDZCCanModifyAcount) || !$fxAuth('distributionInBill.modifyAmount') || itemData.checkFlag === '1'">{{itemData.busUnitInAmount}}</span>
					<w-stepper
						v-model="itemData.busUnitInAmount"
						v-else
						min="0"
						:max="maxAmount"
						:stepperBtnShow="false"
						class="amount-step"
						:intLength="numberLength"
						:pointSize="sysPointSize"
						inputWidth="28vw"
						@change="onChange"
						@focus="onFocus"
						@blur="onBlur"
					></w-stepper>
					<div class="unit-text">
						<span class="fx-ellipsis" @click.stop="onUnitClick">{{itemData.unitDTO.name}}</span>
						<van-icon v-show="$fxSysAuth('distributionInBill.modifyUnit')" name="arrow-down" />
					</div>
				</div>
			</div>
			<div v-if="$fxSysAuth('distributionInBill.SysOpenAcceptGroup')" class="item-amount-block">
				<span class="item-amount-title fx-ellipsis">验收数量：</span>
				<div class="item-amount">
					<span :style="{ 'color': completeColor(itemData) }">{{itemData.checkAmount}}</span>
					<div class="unit-text">
						<span class="fx-ellipsis" @click.stop="onUnitClick">{{itemData.unitDTO.name}}</span>
						<van-icon v-show="$fxSysAuth('distributionInBill.modifyUnit')" name="arrow-down" />
					</div>
				</div>
			</div>
		</div>
		<i v-if="$fxAuth('distributionInBill.checkAndAccept') && $fxSysAuth('distributionInBill.SysOpenAcceptGroup')"  class="block-item-complete" :class='{
			"block-item-uncomplete": itemData.checkFlag === "0",
			"block-item-completed": itemData.checkFlag === "1",
			}'
		/>
		<i v-show="!isDisabled && !disabledEditBtn" class="block-item-edit" @click="onItemEditClick('edit')"/>
		<i v-show="isDisabled" class="block-item-watch" @click="onItemEditClick('watch')"/>
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
	data () {
		return {
			isHasGoods: false
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
				if (!imageUrls) {
					return ''
				}
				return imageUrls.length === 0 ? '' : imageUrls[0]
			}
		},
		completeColor (itemData) {
			return (itemData) => {
				let color = ''
				if (itemData.checkAmount > itemData.rawAmount) {
					color = '#e4393c'
				} else if (itemData.checkAmount < itemData.rawAmount) {
					color = '#34c9ac'
				}
				return color
			}
		}
	},
	methods: {
		onChange (arg) {
			this.amountChange(arg)
		},
		amountChange (data) {
			this.editItem()
			let amount = this.toFixedNumberSize(data)
			if (parseFloat(data) > parseFloat(this.itemData.rawAmount)) {
				this.$fxToast.fail('不能大于中心出库数量!')
				this.$nextTick(() => {
					this.itemData.busUnitInAmount = 0
					this.itemData.inMoney = 0
					this.itemData.taxInMoney = 0
					this.itemData.inMoneyWithTax = 0
				})
				return true
			} else {
				if (data !== '') {
					this.itemData.busUnitInAmount = amount
				}
				this.itemData.inMoney = this.toFixedNumberSize(parseFloat(this.itemData.price) * parseFloat(amount))
				this.itemData.taxInMoney = this.toFixedNumberSize(parseFloat(this.itemData.inMoney) * parseFloat(this.itemData.tax))
				this.itemData.inMoneyWithTax = this.toFixedNumberSize(parseFloat(this.itemData.inMoney) + parseFloat(this.itemData.taxInMoney))
			}
			// 更新缺货状态
			this.hasGoodsChange(amount)
		},
		// {{{更新缺货状态
		/**
		 * 初始数据：缺货，修改数量，shortageFlag置为不缺货（false）,当数量继续修改为0时，重新置为缺货（true）
		 * 初始数据：不缺货，则无论怎么修改都不能改变shortageFlag
		 **/
		hasGoodsChange (amount) {
			if (parseFloat(amount) !== 0 && this.itemData.shortageFlag) {
				this.isHasGoods = this.itemData.shortageFlag
				this.itemData.shortageFlag = false
			} else if (amount === 0 && this.isHasGoods) {
				this.itemData.shortageFlag = true
			}
		},
		// }}}
		// {{{ 修改验收数量
		onCheckAmountChange (checkAmount) {
			this.editItem()
			if (checkAmount <= this.itemData.rawAmount) {
				this.itemData.busUnitInAmount = checkAmount
			} else {
				this.itemData.busUnitInAmount = this.itemData.rawAmount
			}
			this.itemData.inMoney = this.toFixedNumberSize(parseFloat(this.itemData.price) * parseFloat(this.itemData.busUnitInAmount))
			this.itemData.taxInMoney = this.toFixedNumberSize(parseFloat(this.itemData.inMoney) * parseFloat(this.itemData.tax))
			this.itemData.inMoneyWithTax = this.toFixedNumberSize(parseFloat(this.itemData.inMoney) + parseFloat(this.itemData.taxInMoney))
			if (checkAmount !== '') {
				this.itemData.checkAmount = checkAmount
			}
		},
		// }}}
		toFixedNumberSize (data) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysPointSize))
		},
		editItem () {
			if (this.itemData.id) {
				this.$set(this.itemData, 'changeType', 'edit')
			}
		},
		onItemEditClick (type) {
			if (type === 'edit') {
				this.editItem()
			}
			this.$emit('on-item-edit', this.itemData)
		},
		onUnitClick () {
			if (this.isDisabled || !this.$fxSysAuth('distributionInBill.modifyUnit')) {
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
	padding-bottom: 16px
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
		.item-name {
			font-size:12px
			line-height:30px
			height:30px
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
				text-align:right
				height:22px
				line-height:22px
			}
		}
		.item-amount-block {
			display: flex
			flex-direction: row
		}
		.item-spec {
			flex:1
			font-size:10px
			line-height:30px
			height:30px
			margin-left: 20px
		}
		.item-amount {
			width: 162px
			font-size:12px
			line-height:30px
			height:30px
			text-align:right
			display: flex
			flex-direction: row
		}
		.item-amount-title {
			width: 80px
			line-height:30px
			height:30px
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
	.block-item-edit, .block-item-watch {
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
	.block-item-complete {
		width:62px
		height:34px
		background-repeat:no-repeat
		background-position: center
		background-size: 100%
		position:absolute
		top:0
		right:27px
	}
	.block-item-completed {
		background-image:url('~images/icon/icon-item-completed.png')
	}
	.block-item-uncomplete {
		background-image:url('~images/icon/icon-item-uncomplete.png')
	}
}
</style>
