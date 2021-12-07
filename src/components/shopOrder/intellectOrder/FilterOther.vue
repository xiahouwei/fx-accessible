<template>
	<div class="filter-info-popup fx-shadow-block">
		<div class="block-content">
			<div class="block-wrap" v-if="sysSmartOrderRefShop">
				<checkBox
					:visibleFlag="true"
					:checked="filterOther.checkOtherShop"
					class="filter-checkbox"
					@on-checkbox-click="onCheckBoxClick"
				></checkBox>
				<div class="block-name fx-ellipsis">参考其他门店：</div>
				<div class="block-right" @click="onOtherShopClick">
					<span class="block-right-name fx-ellipsis">{{filterOther.otherShop}}</span>
					<van-icon name="arrow"/>
				</div>
			</div>
			<div class="block-wrap">
				<div class="block-name">
					<span>参考营业额：</span>
					<span @click="onEmitClick('on-instructions-click')">
						<van-icon class="block-middle" size="15px" name="info-o" color="#538FFD" />
						<span class="icon-text fx-ellipsis">计算解释</span>
					</span>
					<span class="block-btn">
						<van-button class="block-calculate" type="primary" plain  round size="mini" @click="onEmitClick('on-calculate-click')">点击计算</van-button>
					</span>
				</div>
				<div class="block-right">
					<span class="block-amount block-middle">
						<w-stepper
							ref="amountInput"
							v-model="filterOther.reference"
							min="0"
							:max="maxAmount"
							class="amount-step"
							:stepperBtnShow="false"
							:intLength="numberLength"
							:pointSize="sysPointSize"
							:disabled="true"
							inputWidth="28vw"
						></w-stepper>
					</span>
					<span class="block-right-text">元</span>
				</div>
			</div>
			<div class="block-wrap">
				<div class="block-name fx-ellipsis">预估营业额：</div>
				<div class="block-right">
					<span class="block-amount block-middle">
						<w-stepper
							ref="amountInput"
							v-model="filterOther.estimate"
							min="0"
							class="amount-step"
							:stepperBtnShow="false"
							:intLength="12"
							:disabled="isDisabled"
							inputWidth="28vw"
						></w-stepper>
					</span>
					<span class="block-right-text">元</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import checkBox from '@/components/common/CheckBox.vue'
export default {
	name: 'filterOther',
	components: {
		checkBox
	},
	props: {
		filterOther: {
			type: Object,
			default: () => {
				return {}
			}
		},
		isDisabled: Boolean
	},
	computed: {
		...mapState({
			sysSmartOrderRefShop: state => state.systemParams.sysSmartOrderRefShop,
			sysPointSize: 'sysPointSize',
			numberLength: 'numberLength',
			maxAmount: 'maxAmount'
		})
	},
	methods: {
		onCheckBoxClick () {
			this.$set(this.filterOther, 'checkOtherShop', !this.filterOther.checkOtherShop)
			if (!this.filterOther.checkOtherShop) {
				this.filterOther.otherShop = '请选择'
				this.filterOther.otherShopId = ''
			}
		},
		onOtherShopClick () {
			if (!this.filterOther.checkOtherShop) {
				return false
			}
			this.$emit('on-othershop-click')
		},
		onEmitClick (type) {
			this.$emit(type)
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.filter-info-popup {
	text-align:left
	display: flex
	flex-direction: column
	background-color: #fff
	padding: 9px 12px
	.block-content {
		flex: 1
		.block-wrap {
			display: flex
			flex-direction: row
			padding: 8px 0px
			height: 30px
			line-height: 30px
			vertical-align: middle
			margin-bottom: 0px
			.block-name {
				flex: 1
			}
			.block-right {
				text-align: right
				.block-right-text {
					margin-right: 11px
				}
				.block-amount {
					display: inline-block
				}
				.block-right-name {
					display: inline-block
					width: 140px
					vertical-align: bottom
				}
			}
			.block-middle {
				vertical-align: middle
			}
			.icon-text {
				padding-left: 5px
				color: $fxBlue
				text-decoration: underline
				width: 41px
				display: inline-block
			}
			.block-btn {
				margin-left: 2px
			}
			.filter-checkbox {
				padding-right: 10px
			}
			.block-calculate {
				padding: 0px 10px
			}
		}
	}
}
</style>
