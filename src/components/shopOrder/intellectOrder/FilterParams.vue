<template>
	<div class="filter-info-popup fx-shadow-block">
		<div class="block-content">
			<div class="block-wrap">
				<h3 class="block-name fx-ellipsis fx-block-title">参数设置：</h3>
			</div>
			<div class="block-wrap">
				<div class="block-name fx-ellipsis">订货仓库：</div>
				<div class="block-right" @click="onEmitClick('on-house-click')">
					<span>{{filterParams.house}}</span>
					<van-icon name="arrow"/>
				</div>
			</div>
			<div class="block-wrap">
				<div class="block-name fx-ellipsis">智能订货方案：</div>
				<div class="block-right" @click="onEmitClick('on-intellectplan-click')">
					<span>{{filterParams.intellectPlan}}</span>
					<van-icon name="arrow"/>
				</div>
			</div>
			<div class="block-wrap">
				<div class="block-name fx-ellipsis">订货日期：</div>
				<div class="block-right" @click="onEmitClick('on-checkdate-click')">
					<span>{{formatterDate(filterParams.checkDate)}}</span>
					<van-icon name="arrow"/>
				</div>
			</div>
			<div class="block-wrap">
				<div class="block-name fx-ellipsis">到货日期：</div>
				<div class="block-right" @click="onEmitClick('on-arrivedate-click')">
					<span>{{formatterDate(filterParams.arriveDate)}}</span>
					<van-icon name="arrow"/>
				</div>
			</div>
			<div class="block-wrap">
				<div class="block-name fx-ellipsis">参考周期：</div>
				<div class="block-right">
					<span class="block-amount">
						<w-stepper
							ref="amountInput"
							v-model="filterParams.referenceCycle"
							min="1"
							:max="maxAmount"
							class="amount-step"
							:stepperBtnShow="false"
							:intLength="6"
							inputWidth="28vw"
							@change="onEmitClick('on-refCycle-change')"
						></w-stepper>
					</span>
					<span class="block-right-text">天</span>
				</div>
			</div>
			<div class="block-wrap">
				<div class="block-name fx-ellipsis">预计可用（采购周期）：</div>
				<div class="block-right">
					<span class="block-amount">
						<w-stepper
							ref="amountInput"
							v-model="availableDays"
							min="1"
							:max="30"
							class="amount-step"
							:stepperBtnShow="false"
							:intLength="numberLength"
							inputWidth="28vw"
							@change="changeDays()"
						></w-stepper>
					</span>
					<span class="block-right-text">天</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
export default {
	name: 'filterParams',
	props: {
		filterParams: {
			type: Object,
			default: () => {
				return {}
			}
		},
		forecastAvailable: Number,
		isDisabled: Boolean
	},
	watch: {
		forecastAvailable: {
			handler (val) {
				if (val) {
					this.availableDays = this.forecastAvailable
				}
			},
			immediate: true
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize',
			numberLength: 'numberLength',
			maxAmount: 'maxAmount'
		}),
		formatterDate (date) {
			return (date) => {
				if (typeof date === 'number') {
					return this.$fxUtils.setDateTime(new Date(date), '时分')
				} else {
					return ''
				}
			}
		}
	},
	data () {
		return {
			availableDays: 0
		}
	},
	methods: {
		onEmitClick (type, data) {
			this.$emit(type, data)
		},
		changeDays () {
			this.clearItemConfim().then(() => {
				this.$emit('on-forecastAvailable-change', this.availableDays)
			})
		},
		clearItemConfim () {
			return new Promise(resolve => {
				if (!this.isDisabled) {
					resolve()
				} else {
					this.$dialog.confirm({
						title: '提示',
						message: '修改预计可用，将会清空日额预估数据，是否确认修改?'
					}).then(() => {
						resolve()
					}).catch(() => {
						this.availableDays = this.forecastAvailable
					})
				}
			})
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
			padding: 12px 0px
			margin-bottom: 0px
			.block-name {
				flex: 1
			}
			.block-right {
				flex: 1
				text-align: right
			}
		}
		.block-amount {
			display: inline-block
		}
		.block-right-text {
			vertical-align: -webkit-baseline-middle
		}
	}
}
</style>
