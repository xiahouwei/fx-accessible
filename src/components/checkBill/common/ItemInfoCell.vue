<template>
	<div class="item-info-cell">
		<div class="item-img">
			<img :src="comptedItemImgSrc(itemData.goodsDTO.imageUrls)" :onerror="$fxCommon.errorImg('item')">
		</div>
		<div class="item-details">
			<div class="item-name-money">
				<div class="item-name fx-ellipsis">{{itemData.goodsDTO.name}}</div>
				<div v-show="$fxAuth('shopCheckBill.seeCheckMoney')" class="item-taxprice fx-ellipsis">
					<span>实盘金额：￥</span>
					<span v-show="isDisabled">{{itemData.checkMoney}}</span>
				</div>
				<div class="item-more">
					<i v-show="!isDisabled && !disabledEditBtn" class="block-item-edit" @click="onItemEditClick"></i>
					<i v-show="isDisabled" class="block-item-watch" @click="onItemEditClick"></i>
				</div>
			</div>
			<div v-if="$fxSysAuth('shopCheckBill.showUnit2column') && isPlan">
				<div class="item-amount">
					<span>单位1</span>
					<div v-if="$fxAuth('shopCheckBill.seeAmount')">
						<span
							v-if="(isDisabled || (itemData.isWeightSign && !sysDZCCanModifyAcount)) || (itemData.checkUnitDTO && itemData.unit2DTO && itemData.checkUnitDTO.id === itemData.unit2DTO.id)"
							class="item-amout-text">
							{{itemData.checkUnitAmount }}
						</span>
						<w-stepper
							v-model="itemData.checkUnitAmount"
							v-else
							min="0"
							:max="maxAmount"
							:stepperBtnShow="false"
							input-width="16vw"
							class="amount-step"
							:intLength="numberLength"
							:pointSize="sysPointSize"
							@change="onAmountChange"
							@focus="onFocus"
							@blur="onBlur"
						></w-stepper>
					</div>
					<div class="item-unit">
						<span v-if="itemData.checkUnitDTO" class="item-unit-text">{{itemData.checkUnitDTO.name}}</span>
					</div>
				</div>
				<div v-show="itemData.unit2DTO" class="item-amount">
					<span>单位2</span>
					<div v-if="$fxAuth('shopCheckBill.seeAmount')">
						<span v-if="isDisabled || (itemData.isWeightSign && !sysDZCCanModifyAcount)" class="item-amout-text">{{itemData.unit2Amount}}</span>
						<w-stepper
							v-model="itemData.unit2Amount"
							v-else
							min="0"
							:max="maxAmount"
							:stepperBtnShow="false"
							input-width="16vw"
							class="amount-step"
							:intLength="numberLength"
							:pointSize="sysPointSize"
							:defaultValue="0"
							@change="onAmountChange"
							@blur="onBlur"
						></w-stepper>
					</div>
					<div class="item-unit">
						<span v-if="itemData.unit2DTO" class="item-unit-text">{{itemData.unit2DTO.name}}</span>
					</div>
				</div>
				<div class="item-spec fx-ellipsis">{{itemData.goodsDTO.spec}}</div>
			</div>
			<div v-else>
				<div class="item-amount">
					<span>盘点单位</span>
					<div v-if="$fxAuth('shopCheckBill.seeAmount')">
						<span v-if="isDisabled || (itemData.isWeightSign && !sysDZCCanModifyAcount)" class="item-amout-text">{{itemData.checkUnitAmount }}</span>
						<w-stepper
							v-model="itemData.checkUnitAmount"
							v-else
							min="0"
							:max="maxAmount"
							:stepperBtnShow="false"
							input-width="16vw"
							class="amount-step"
							:intLength="numberLength"
							:pointSize="sysPointSize"
							@change="onAmountChange"
							@focus="onFocus"
							@blur="onBlur"
						></w-stepper>
					</div>
					<div class="item-unit">
						<span v-if="itemData.checkUnitDTO" class="item-unit-text">{{itemData.checkUnitDTO.name}}</span>
					</div>
				</div>
				<div v-show="itemData.planUnitDTO" class="item-amount">
					<span v-if="isPlan">方案单位</span>
					<span v-else>核算单位</span>
					<div v-if="$fxAuth('shopCheckBill.seeAmount')">
						<span v-if="isDisabled || (itemData.isWeightSign && !sysDZCCanModifyAcount)" class="item-amout-text">{{itemData.planUnitAmount}}</span>
						<w-stepper
							v-model="itemData.planUnitAmount"
							v-else
							min="0"
							:max="maxAmount"
							:stepperBtnShow="false"
							input-width="16vw"
							class="amount-step"
							:intLength="numberLength"
							:pointSize="sysPointSize"
							:defaultValue="0"
							@change="onAmountChange"
							@blur="onBlur"
						></w-stepper>
					</div>
					<div class="item-unit">
						<span v-if="itemData.planUnitDTO" class="item-unit-text">{{itemData.planUnitDTO.name}}</span>
					</div>
				</div>
				<div class="item-spec fx-ellipsis">{{itemData.goodsDTO.spec}}</div>
			</div>
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
		disabledEditBtn: Boolean,
		isPlan: Boolean // 是否是由盘点单位生成的
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize',
			taxes: 'taxes',
			sysDZCCanModifyAcount: state => state.systemParams.sysDZCCanModifyAcount,
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId,
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
		onItemEditClick () {
			this.editItem()
			this.$emit('on-item-edit', this.itemData)
		},
		onAmountChange () {
			this.editItem()
		},
		editItem () {
			if (this.itemData.id) this.$set(this.itemData, 'changeType', 'edit')
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
			flex: 2
		}
		.item-taxprice {
			font-size:12px
			line-height:30px
			height:30px
			flex: 2
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
		.item-name-money {
			display: flex
		}
		.item-spec {
			flex:1
			font-size:10px
			line-height:30px
			height:30px
		}
		.item-amount {
			font-size:12px
			line-height:30px
			height:30px
			text-align:right
			display: flex
			flex-direction: row
		}
		.item-amout-text{
			margin-left:10px
		}
		.item-unit {
			margin-left:10px
			.item-unit-text {
				margin-right:5px
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
		background-image:url('~images/icon/icon-item-info.png')
		background-repeat:no-repeat
		background-position: center
		background-size: 100%
		position:absolute
		top:0
		right:0
	}
	.item-more {
		flex:0.2
	}
}
</style>
