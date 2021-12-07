<template>
	<div class="item-info-wrap">
		<div class="item-info-cell">
			<div class="item-img">
				<img :src="comptedItemImgSrc(itemData.goodsDTO.imageUrls)" :onerror="$fxCommon.errorImg('item')">
			</div>
			<div class="item-details">
				<div class="item-name fx-ellipsis">{{itemData.goodsDTO.name}}</div>
				<div class="details-cell">
					<div class="item-taxprice fx-ellipsis">
						<span>金额：￥</span>
						<span>{{itemData.sumMoney}}</span>
					</div>
					<div class="item-spec fx-ellipsis">{{itemData.goodsDTO.spec}}</div>
				</div>
				<div class="details-cell">
					<div v-if="isDisabled" class="item-amount">
						<span class="item-amount-text">{{itemData.factCount}}</span>
						<span class="fx-ellipsis">{{itemData.unitDTO.name}}</span>
					</div>
					<div v-else class="item-amount-edit">
						<w-stepper
							ref="amountInput"
							v-model="itemData.factCount"
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
						<div class="unit-text">
							<span class="cell-unit fx-ellipsis" @click.stop="onUnitClick">{{itemData.unitDTO.name}}</span>
							<van-icon class="unit-icon" name="arrow-down" />
						</div>
					</div>
				</div>
			</div>
			<i v-show="!isDisabled && !disabledEditBtn" class="block-item-edit" @click="onItemEditClick"></i>
			<i v-show="isDisabled" class="block-item-watch" @click="onItemEditClick"></i>
		</div>
		<div class="item-bom" @click="onEditBomDetails">查看BOM明细></div>
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
	methods: {
		editItem () {
			if (this.itemData.id) this.$set(this.itemData, 'changeType', 'edit')
		},
		onItemEditClick () {
			this.editItem()
			this.$emit('on-item-edit', this.itemData)
		},
		onEditBomDetails () {
			this.$emit('on-bom-view', this.itemData)
		},
		onChange (arg) {
			if (this.itemData.changeType === 'del') return false
			this.editItem()
			this.onAmountChange(arg)
		},
		onAmountChange (factCount) {
			this.editItem()
			let { factMoney, taxInMoney, price, tax } = this.itemData
			factMoney = this.toFixedNumberSize(price * factCount, this.sysPointSize)
			taxInMoney = this.toFixedNumberSize(factMoney * tax, this.sysPointSize)
			this.itemData.bomDetail.forEach(bom => {
				let crude = bom.crude
				if (this.$fxSysAuth('carBill.sysCarBillChangeAmount')) {
					bom.factCount = this.toFixedNumberSize(factCount * crude)
				}
				bom.theoryCount = this.toFixedNumberSize(factCount * crude)
				if (bom.id) {
					bom.changeType = 'edit'
				}
			})
			this.itemData.factMoney = factMoney
			this.itemData.taxInMoney = taxInMoney
		},
		toFixedNumberSize (data) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysPointSize))
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
				let { factCount } = this.itemData
				let error = '数量不符合规则'
				if (factCount === 0) {
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
.item-info-wrap {
	.item-info-cell {
		display: flex
		flex-direction: row
		height: 80px
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
			.details-cell {
				display: flex
				flex-direction: row
				overflow:hidden
			}
			.item-spec {
				font-size:10px
				line-height:30px
				height:30px
				flex:1
				margin-left: 20px
				text-align:right
			}
			.item-taxprice {
				font-size:12px
				line-height:30px
				height:30px
			}
			.item-amount {
				font-size:12px
				width:100%
				text-align:right
				line-height:30px
				height:30px
				overflow:hidden
				padding-right: 10px
			}
			.item-amount-edit {
				width:100%
				overflow:hidden
				text-align: right
				.amount-step {
					display: inline-block;
				}
				.unit-text {
					width: 56px;
					display: inline-block;
					vertical-align: -webkit-baseline-middle;
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
	.item-bom {
		padding: 5px 0
		text-align: right
		color: $fxBlue
	}
}
</style>
