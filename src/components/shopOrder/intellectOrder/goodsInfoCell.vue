<template>
	<div class="order-block">
		<div class="block-content">
			<div class="block-title">
				<span class="title-text fx-ellipsis">{{itemData.goods.name}}</span>
			</div>
			<div class="block-value">
				<div class="order-No fx-ellipsis">原料编号：</div>
				<div class="order-date">
					{{itemData.goods.code}}
				</div>
			</div>
			<div class="block-value">
				<div class="order-No fx-ellipsis">单位：</div>
				<div class="order-date">
					{{itemData.unit.name}}
				</div>
			</div>
			<div class="block-value">
				<div class="order-No fx-ellipsis">上期参考预估值：</div>
				<div class="order-date">
					{{itemData.previousReckonCount}}
				</div>
			</div>
			<div class="block-value">
				<div class="order-No fx-ellipsis">预估用量：</div>
				<div class="order-date">
					{{itemData.reckonCount}}
				</div>
			</div>
			<div class="block-value">
				<div class="order-No fx-ellipsis">自定义用量：</div>
				<div class="order-date">
					<span class="block-amount">
						<w-stepper
							ref="amountInput"
							v-model="itemData.customCount"
							min="0"
							:max="maxAmount"
							class="amount-step"
							:stepperBtnShow="false"
							:intLength="numberLength"
							inputWidth="28vw"
						></w-stepper>
					</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
export default {
	name: 'foodsInfoCell',
	components: {
	},
	props: {
		itemData: {
			type: Object,
			default: () => {
				return {}
			}
		}
	},
	computed: {
		...mapState({
			numberLength: 'numberLength',
			maxAmount: 'maxAmount'
		})
	},
	methods: {
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.order-block {
	margin: 10px auto
	padding: 9px
	text-align: left
	position: relative
	box-sizing: border-box;
	display: flex
	flex-direction: row
	align-items: baseline
	border-bottom: 1px solid $fxGray
	.order-checkbox {
		margin-right: 10px
        min-width: 19px
	}
	.block-content {
		flex: 1
		.block-title {
			height: 30px
			line-height: 30px
			$fx-dynamic-font-size(14px)
			font-weight: 700
			margin-bottom: 10px
			display: flex
			flex-direction: row
			overflow: hidden
			align-items: center
			.title-text {
				display: inline-block
				overflow: hidden;
				height: 30px;
				line-height: 30px;
				margin-right: 5px
				flex: 1
				width: 190px
			}
			.block-urgency {
				width: 30px
				height: 30px
				background-image: url('~images/icon/icon-urgency.png')
				background-repeat: no-repeat
				background-position: center
				background-size: 100%
				margin-left: 10px;
			}
		}
		.block-value {
			display: flex
			flex-direction: row
			margin-bottom: 15px
			.order-No {
				flex: 1
			}
			.order-date {
				flex: 1
				text-align: right
				.order-date-arrow {
					position: relative
					top: 1px
				}
			}
		}
		.block-last {
			margin-bottom: 0px
		}
	}
}
</style>
