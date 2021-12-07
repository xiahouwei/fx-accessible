<template>
	<div class="inteledi-estimateDay-details">
		<w-header :title="isDisabled ? '查看录入的日额' : '日额预估' " :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div class="estimateDay-content">
			<div class="table-wrap">
				<div class="row-wrap row-head">
					<span class="cell-style col-cell-1">序号</span>
					<span class="cell-style col-cell-2">日期</span>
					<span class="cell-style col-cell-3">营业额</span>
				</div>
				<div class="row-wrap" v-for="(item, index) in dataList" :key="index">
					<span class="cell-style col-cell-1">{{index + 1}}</span>
					<span class="cell-style col-cell-2">{{item.rq}}</span>
					<span class="cell-style col-cell-3">
						<w-stepper
							v-if="!isDisabled"
							v-model="item.money"
							min="0"
							:max="maxAmount"
							class="amount-step"
							:stepperBtnShow="false"
							:intLength="numberLength"
							inputWidth="28vw"
						></w-stepper>
						<span v-else>{{item.money}}</span>
					</span>
				</div>
				<div class="row-wrap">
					<span class="cell-style col-cell-1">{{dataList.length + 1}}</span>
					<span class="cell-style col-cell-2">合计</span>
					<span class="cell-style col-cell-3">
						<w-stepper
							v-if="!isDisabled"
							v-model="sumMoney"
							min="0"
							:max="maxAmount"
							class="amount-step"
							:stepperBtnShow="false"
							:intLength="numberLength"
							:pointSize="sysPointSize"
							:disabled="true"
							inputWidth="28vw"
						></w-stepper>
						<span v-else>{{sumMoney}}</span>
					</span>
				</div>
				<div class="row-wrap">
					<span class="cell-style col-cell-1">{{dataList.length + 2}}</span>
					<span class="cell-style col-cell-2">日均</span>
					<span class="cell-style col-cell-3">
						<w-stepper
							v-if="!isDisabled"
							v-model="dayMoney"
							min="0"
							:max="maxAmount"
							class="amount-step"
							:stepperBtnShow="false"
							:intLength="numberLength"
							:pointSize="sysPointSize"
							:disabled="true"
							inputWidth="28vw"
						></w-stepper>
						<span v-else>{{dayMoney}}</span>
					</span>
				</div>
			</div>
		</div>
		<div v-if="!isDisabled" class="estimateDay-bottom">
			<van-button type="primary fx-btn" round size="small" @click="onSaveDayMoney">保存至预估营业额</van-button>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
export default {
	name: 'EstimateDayPop',
	components: {
	},
	props: {
		visibleFlag: Boolean,
		checkDate: {
			type: [String, Number],
			default: ''
		},
		forecastAvailable: {
			type: Number,
			default: 0
		},
		estimateDayList: {
			type: Array,
			default: () => {
				return []
			}
		},
		isDisabled: {
			type: Boolean,
			default: false
		}
	},
	data () {
		return {
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			money: 0,
			dataList: []
		}
	},
	watch: {
		visibleFlag: {
			handler (val) {
				if (val) {
					if (this.estimateDayList.length) {
						this.dataList = this.estimateDayList
					} else {
						this.setData()
					}
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
		sumMoney () {
			return this.dataList.reduce((pre, cur) => {
				return pre + this.toFixedNumberSize(cur.money)
			}, 0)
		},
		dayMoney () {
			let days = this.dataList.filter(item => {
				return this.toFixedNumberSize(item.money) > 0 && item.id !== 'fullMoney' && item.rq !== '安全额'
			}).length
			return days ? parseFloat(this.$fxUtils.toFixedSHW(this.sumMoney / days)) : 0
		}
	},
	methods: {
		onCloseClick () {
			this.$emit('update:visibleFlag', false)
		},
		toFixedNumberSize (data) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysPointSize))
		},
		setData () {
			this.dataList = []
			for (let i = 0; i < this.forecastAvailable; i++) {
				let item = {}
				item.rq = this.$fxUtils.setDate(this.$fxUtils.getCustomAssignDate(this.$fxUtils.setDate(new Date(this.checkDate)), i))
				item.money = 0
				this.dataList.push(item)
			}
			let otherMoney = { id: 'fullMoney', rq: '安全额', money: 0 }
			this.dataList.push(otherMoney)
		},
		// {{{保存
		onSaveDayMoney () {
			let allMoney = [
				{ id: 'dayMoneyTotal', rq: '合计', money: this.sumMoney },
				{ id: 'dayMoneyAvg', rq: '日均', money: this.dayMoney }
			]
			this.$emit('update:visibleFlag', false)
			this.$emit('on-saveDayMoney-click', { dayList: this.dataList, allMoney: allMoney })
		}
		// }}}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.inteledi-estimateDay-details {
	height:100%
	background:$fxWhite
	display: flex
	flex-direction: column
	.estimateDay-content {
		flex: 1
		overflow-y: auto
		.row-wrap {
			display: flex
			flex-direction: row
		}
		.table-wrap {
			margin: 10px 20px
			border-top: 1px solid $fxGraylight
            border-left: 1px solid $fxGraylight
			.row-head {
				background: $fxGraySimple
			}
			.cell-style {
				border-right: 1px solid $fxGraylight
				border-bottom: 1px solid $fxGraylight
				display: flex
				align-items: center
				justify-content: center
				padding: 4px 0px
			}
			.col-cell-1 {
				flex-basis: 20%
			}
			.col-cell-2 {
				flex-basis: 35%
			}
			.col-cell-3 {
				flex-basis: 45%
			}
		}
	}
	.estimateDay-bottom {
		display: flex
		flex-direction: column
		padding: 10px
	}
}
</style>
