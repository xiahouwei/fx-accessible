<template>
	<div class="filter-info-popup fx-shadow-block">
		<div class="block-content">
			<div class="block-wrap">
				<div class="block-name">
					<span>日额合计：</span>
					<span @click="onEmitClick('on-dayEstimate-click')">
						<van-icon class="block-middle" size="15px" name="edit" color="#538FFD" />
						<span class="icon-text fx-ellipsis">日额预估</span>
					</span>
				</div>
				<div class="block-right">
					<span class="block-amount block-middle">
						<w-stepper
							ref="amountInput"
							v-model="filterSale.dayMoneyTotal"
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
				<div class="block-name fx-ellipsis">日额日均：</div>
				<div class="block-right">
					<span class="block-amount block-middle">
						<w-stepper
							ref="amountInput"
							v-model="filterSale.dayMoneyAvg"
							min="0"
							class="amount-step"
							:stepperBtnShow="false"
							:intLength="12"
							:disabled="true"
							inputWidth="28vw"
						></w-stepper>
					</span>
					<span class="block-right-text">元</span>
				</div>
			</div>
			<div class="block-wrap">
				<div class="block-name">
					<span>历史营业额合计：</span>
					<span @click="onEmitClick('on-hisEstimate-click')">
						<van-icon class="block-middle" size="15px" name="orders-o" color="#538FFD" />
						<span class="icon-text fx-ellipsis">查看历史营业额</span>
					</span>
				</div>
				<div class="block-right">
					<span class="block-amount block-middle">
						<w-stepper
							ref="amountInput"
							v-model="filterSale.hisMoneyTotal"
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
				<div class="block-name fx-ellipsis">历史营业额日均：</div>
				<div class="block-right">
					<span class="block-amount block-middle">
						<w-stepper
							ref="amountInput"
							v-model="filterSale.hisMoneyAvg"
							min="0"
							class="amount-step"
							:stepperBtnShow="false"
							:intLength="12"
							:disabled="true"
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
export default {
	name: 'filterSaleData',
	components: {
	},
	props: {
		filterSale: {
			type: Object,
			default: () => {
				return {}
			}
		}
	},
	computed: {
		...mapState({
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
				padding-left: 1px
				color: $fxBlue
				text-decoration: underline
				width: 90px
				display: inline-block
				vertical-align: middle
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
