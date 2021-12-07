<template>
	<div class="item-info-cell">
		<div class="item-img">
			<w-img :src="itemData.goodsDTO.imageUrls"></w-img>
		</div>
		<div class="item-details">
			<div class="item-details-cell">
				<div class="item-name fx-ellipsis">{{itemData.goodsDTO.name}}</div>
				<w-icon
					v-show="!isDisabled && !disabledEditBtn"
					type="item-edit"
					class="block-item-edit"
					@click="onItemEditClick"
				></w-icon>
				<w-icon
					v-show="isDisabled && showEditBtn"
					type="item-info"
					class="block-item-edit"
					@click="onItemEditClick"
				></w-icon>
			</div>
			<div v-show="itemData.goodsDTO.spec" class="item-details-cell">
				<span>规格：</span>
				<div class="item-spec fx-ellipsis">{{itemData.goodsDTO.spec}}</div>
			</div>
			<div v-show="!isDisabled" class="item-details-cell">
				<div class='item-amount'>
					<span>数量：</span>
					<w-stepper
						v-model="itemData.busUnitInAmount"
						min="0"
						:max="maxAmount"
						:stepperBtnShow="false"
						:intLength="numberLength"
						:pointSize="sysPointSize"
						inputWidth="26vw"
						@change="onChange"
						@focus="onFocus"
						@blur="onBlur"
					></w-stepper>
				</div>
				<div class="unit-text" @click.stop="onUnitClick">
					<span class="fx-ellipsis">{{itemData.unitDTO.name}}</span>
					<van-icon name="arrow-down" />
				</div>
			</div>
			<div v-show="isDisabled" class="item-details-cell">
				<div class='item-amount'>
					<span>数量：</span>
					<span>{{itemData.busUnitInAmount}}</span>
				</div>
				<div class="unit-text">
					<span class="fx-ellipsis">{{itemData.unitDTO.name}}</span>
				</div>
			</div>
			<div v-show="itemData.assistUnit" class="item-details-cell">
				<div class='item-amount'>
					<span>辅助数量：</span>
					<w-stepper
						v-show="!isDisabled"
						v-model="itemData.inAssistAmount"
						min="0"
						:max="maxAmount"
						:stepperBtnShow="false"
						:intLength="numberLength"
						:pointSize="sysPointSize"
						inputWidth="26vw"
						@change="onChange"
						@focus="onFocus"
						@blur="onBlur"
					></w-stepper>
					<span v-show="isDisabled">{{itemData.inAssistAmount}}</span>
				</div>
				<div class="unit-text">
					<span class="fx-ellipsis">{{itemData.assistUnit}}</span>
				</div>
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
		showEditBtn: {
			type: Boolean,
			default: () => {
				return true
			}
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize',
			sysMoneyPointSize: 'sysMoneyPointSize',
			numberLength: 'numberLength',
			maxAmount: 'maxAmount'
		})
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
		onFocus () {
			this.$emit('on-item-focus')
		},
		onBlur () {
			if (this.itemData.busUnitInAmount === 0) {
				this.$fxToast.fail('数量不能为0!')
				this.itemData.busUnitInAmount = 1
			}
			if (this.itemData.goodsDTO.assistUnitFlag && this.itemData.inAssistAmount === 0) {
				this.$fxToast.fail('辅助数量不能为0!')
				this.itemData.inAssistAmount = 1
			}
			this.$fxCalculation('stockInBill4cld').changeAmount(this.itemData)
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
	position: relative
	font-size:12px
	.item-img {
		display: flex
		align-items: center
		width:80px
	}
	.item-details {
		flex:1
		overflow:hidden
		.item-details-cell {
			display: flex
			flex-direction: row
			align-items: center
			overflow:hidden
			height:30px
			.block-item-edit {
				width: 24px
				height: 24px
			}
			.item-name {
				flex: 1
			}
			.item-taxprice {
				flex: 1
			}
			// .item-spec {
			// 	width: 50px
			// 	overflow:hidden
			// 	text-align:right
			// }
			.item-amount {
				display: flex
				flex-direction: row
				align-items: center
				justify-content: space-between
				flex: 1
			}
			.unit-text {
				display: flex;
				flex-direction: row;
				align-items: center;
				justify-content: flex-end;
				width: 80px;
			}
		}
	}
}
</style>
