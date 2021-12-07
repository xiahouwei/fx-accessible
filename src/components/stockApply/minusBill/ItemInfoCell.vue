<template>
	<div class="order-block">
		<div class="block-content">
			<div class="block-title">
				<span class="title-text fx-ellipsis">{{itemData.goodsDTO.name}}</span>
			</div>
			<div class="block-value">
				<div class="order-No fx-ellipsis">品项规格：</div>
				<div class="order-date">
					{{itemData.goodsDTO.spec}}
				</div>
			</div>
			<div class="block-value">
				<div class="order-No fx-ellipsis">分派状态：</div>
				<div class="order-date">
					{{computedAssignState}}
				</div>
			</div>
			<div class="block-value">
				<div class="order-No fx-ellipsis">原申购数量：</div>
				<div class="order-date">
					{{itemData.originalAmount}}
				</div>
			</div>
			<div class="block-value">
				<div class="order-No fx-ellipsis">申购数量：</div>
				<div class="order-date">
					{{itemData.busUnitAmount}}
				</div>
			</div>
			<div class="block-value">
				<div class="order-No fx-ellipsis">已减单数量：</div>
				<div class="order-date">
					{{OMBAmount}}
				</div>
			</div>
			<div class="block-value block-last">
				<div class="order-No fx-ellipsis">减单数量：</div>
				<div class="order-date">
					<span>
						<w-stepper
							ref="amountInput"
							v-model="itemData.reduceAmount"
							min="0"
							:max="maxAmount"
							class="amount-step"
							:stepperBtnShow="false"
							:intLength="numberLength"
							:pointSize="sysPointSize"
							:defaultValue="0"
							inputWidth="28vw"
							@focus="onFocus"
							@blur="onBlur"
						></w-stepper>
					</span>
				</div>
			</div>
			<div class="block-value">
				<div class="order-No fx-ellipsis">最终申购数量：</div>
				<div class="order-date">
					{{OMOMRAmount}}
				</div>
			</div>
			<div class="block-value block-last">
				<div class="order-No fx-ellipsis">备注：</div>
				<div class="order-date">
					{{itemData.memo}}
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
export default {
	name: 'itemInfoCell',
	components: {
	},
	props: {
		itemData: {
			type: Object,
			default: () => {
				return {}
			}
		},
		blurSetFocusFlag: {
			type: Boolean,
			default: true
		}
	},
	data () {
		return {
			assignStateActions: [
				{ id: null, name: '' },
				{ id: '0', name: '未分派' },
				{ id: '1', name: '已分派' },
				{ id: '2', name: '不分派' },
				{ id: '3', name: '进行中' }
			]
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize',
			numberLength: 'numberLength',
			maxAmount: 'maxAmount'
		}),
		computedAssignState () {
			return this.assignStateActions.find(item => {
				return item.id === this.itemData.assignFlag
			}).name
		},
		OMBAmount () {
			return this.itemData.originalAmount - this.itemData.busUnitAmount
		},
		OMOMRAmount () {
			return this.itemData.originalAmount - this.OMBAmount - this.toFixedNumberSize(this.itemData.reduceAmount)
		}
	},
	methods: {
		toFixedNumberSize (data) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysPointSize))
		},
		onCheckAmount (tips = true) {
			return new Promise((resolve, reject) => {
				let { reduceAmount, originalAmount } = this.itemData
				let error = '数量不符合规则'
				if (
					(reduceAmount < 0 ||
					reduceAmount > (originalAmount - this.OMBAmount)) && reduceAmount !== 0
				) {
					if (tips) {
						this.$fxNotify.fail('减单数量只能输入小于"原申购数量-已减单数量"的正值')
					}
					reject(error)
				} else {
					resolve()
				}
			})
		},
		onFocus () {
			this.$emit('on-item-focus')
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
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.order-block {
	width: 350px
	margin: 10px auto
	padding: 9px
	text-align: left
	position: relative
	box-sizing: border-box;
	display: flex
	flex-direction: row
	align-items: baseline
	border-bottom: 1px solid $fxGray
	.block-content {
		flex: 1
		.block-title {
			height: 30px
			line-height: 30px
			font-size: 14px
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
			}
		}
		.block-last {
			margin-bottom: 0px
		}
	}
}
</style>
