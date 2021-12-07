<template>
	<div class="item-info-cell">
		<div class="item-img">
			<img :src="comptedItemImgSrc(itemData.goodsDTO.imageUrls || [])" :onerror="$fxCommon.errorImg('item')">
		</div>
		<div class="item-details">
			<div class="item-name fx-title fx-ellipsis">{{itemData.goodsDTO.name}}</div>
			<div v-if="sysShowCode" class="details-cell fx-small-title">
				编号：{{itemData.goodsDTO.code}}
			</div>
			<div v-if="$fxAuth('shopOrderBill.showReferenceMoney')" class="details-cell">
				<div class="item-spec fx-small-title fx-ellipsis">
					参考非税单价：{{itemData.consultPrice}}
				</div>
			</div>
			<div v-if="$fxAuth('shopOrderBill.showReferenceMoney')" class="details-cell">
				<div class="item-spec fx-small-title fx-ellipsis">
					参考非税金额：{{itemData.consultMoney}}
				</div>
				<!-- 分派状态暂时隐藏,因为后台没有给每一条明细传分派状态 -->
				<!-- <div class="item-assign">{{computedAssignState}}</div> -->
			</div>
			<div class="details-cell fx-title">
				<div class="item-store fx-ellipsis">{{$fxAuth('shopOrderBill.goodsSize') ? itemData.goodsDTO.spec : ''}}</div>
				<div v-show="isDisabled" class="item-amount">
					<span>{{itemData.busUnitAmount}}</span>
					<span class="fx-ellipsis">{{itemData.unitDTO.name}}</span>
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
					<span class="unit-text fx-unit fx-ellipsis">{{itemData.unitDTO.name}}</span>
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
		shopId: String,
		orderPlanId: String,
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
			sysShowCode: state => state.systemParams.sysShowCode,
			loginerShopId: state => state.loginer.loginerShopId
		}),
		comptedItemImgSrc (imageUrls) {
			return (imageUrls) => {
				return imageUrls.length === 0 ? '' : imageUrls[0]
			}
		},
		computedAssignState () {
			let stateText = ''
			switch (this.itemData.reCheckState) {
			case 0 :
				stateText = '未发送'
				break
			case 1 :
				stateText = '已发送'
				break
			case 2 :
				stateText = '已同意'
				break
			case 3 :
				stateText = '已发货'
				break
			case 4 :
				stateText = '已收货'
				break
			case 9 :
				stateText = '被退回'
				break
			default :
				stateText = '未发送'
			}
			return stateText
		}
	},
	methods: {
		setFocus () {
			this.$refs.amountInput.setFocus()
		},
		editItem () {
			if (this.itemData.id) this.$set(this.itemData, 'changeType', 'edit')
		},
		onItemEditClick () {
			this.editItem()
			this.$emit('on-item-edit', this.itemData)
		},
		onChange (arg) {
			if (this.itemData.changeType === 'del') return false
			this.itemData.consultMoney = this.toFixedNumberSize(this.itemData.consultPrice * arg)
			this.itemData.consultMoneyWithTax = this.toFixedNumberSize(this.itemData.consultTaxPrice * arg)
			this.itemData.consultTaxMoney = this.toFixedNumberSize(this.itemData.consultMoneyWithTax - this.itemData.consultMoney)
			this.editItem()
			this.$emit('on-item-change', this.itemData)
		},
		toFixedNumberSize (data) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysPointSize))
		},
		onCheckAmount (tips = true) {
			return new Promise((resolve, reject) => {
				let { busUnitAmount, must, maxOrder, minOrder, rounding } = this.itemData
				let maxMessage = maxOrder ? `订货数量不能大于最大数量${maxOrder}\n` : ''
				let minMessage = minOrder ? `订货数量不能小于最小数量${minOrder}\n` : ''
				let roundMessage = rounding ? `订货数量必须是${rounding}的倍数` : ''
				let message = maxMessage + minMessage + roundMessage
				let error = '数量不符合规则'
				if (
					(maxOrder && busUnitAmount > maxOrder) ||
					(minOrder && busUnitAmount < minOrder) ||
					(rounding && busUnitAmount % rounding !== 0)
				) {
					if (tips) {
						this.$fxNotify.fail(message)
					}
					reject(error)
				} else if (busUnitAmount === 0 && !must) {
					if (tips) {
						this.$fxNotify.fail('非必订品项订货数量不能为0')
					}
					reject(error)
				} else {
					resolve()
				}
			})
		},
		onFocus () {
			this.$emit('on-item-focus')
			if (this.$fxUtils.isDef(this.shopId) && this.$fxUtils.isDef(this.orderPlanId)) {
				this.getCurrentItemRoundAndMin()
			}
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
		},
		getCurrentItemRoundAndMin () {
			this.$fxHttp.requestGet({
				url: `${this.$fxBaseApi.url}/accounts/${this.shopId}/shoporders/rondAndMin/${this.itemData.goodsDTO.id}/orderPlanId/${this.orderPlanId}`,
				loading: false,
				autoErrorMsg: false
			}).then(res => {
				this.itemData.maxOrder = parseFloat(res.rondAndMins[0].maxOrder)
				this.itemData.minOrder = parseFloat(res.rondAndMins[0].minOrder)
				this.itemData.must = res.rondAndMins[0].must
				this.itemData.rounding = parseFloat(res.rondAndMins[0].rounding)
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
		padding-bottom: 7px
		.item-name {
			line-height:30px
			height:30px
			padding-right:30px
		}
		.details-cell {
			display: flex
			flex-direction: row
			overflow:hidden
		}
		.item-spec {
			line-height:24px
			height:24px
			width: 100%
		}
		.item-assign {
			font-size:12px
			width:60px
			text-align:right
			line-height:24px
			padding-right: 10px;
		}
		.item-store {
			line-height:30px
			height:30px
			flex:1
		}
		.item-amount {
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
				width: 36px;
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
