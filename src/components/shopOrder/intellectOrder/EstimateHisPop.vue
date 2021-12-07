<template>
	<div class="inteledi-estimateHis-details">
		<w-header title="查看历史营业额" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div class="estimateHis-content">
			<div class="table-wrap">
				<div class="row-wrap row-head">
					<span class="cell-style col-cell-1">序号</span>
					<span class="cell-style col-cell-2">日期</span>
					<span class="cell-style col-cell-3">营业额</span>
				</div>
				<div class="row-wrap" v-for="(item, index) in dataList" :key="index">
					<span class="cell-style col-cell-1">{{index + 1}}</span>
					<span class="cell-style col-cell-2">{{item.rq}}</span>
					<span class="cell-style col-cell-3">{{item.money}}</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
export default {
	name: 'EstimateHisPop',
	components: {
	},
	props: {
		visibleFlag: Boolean,
		checkDate: {
			type: [String, Number],
			default: ''
		},
		referenceCycle: Number,
		hisDayList: {
			type: Array,
			default: () => {
				return []
			}
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
					this.setData()
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
				return pre + cur.money
			}, 0)
		},
		dayMoney () {
			let days = this.dataList.filter(item => {
				return item.money > 0
			}).length
			return days ? this.sumMoney / days : 0
		}
	},
	methods: {
		onCloseClick () {
			this.$emit('update:visibleFlag', false)
		},
		setData () {
			this.dataList = []
			for (let i = 0; i < this.referenceCycle; i++) {
				let item = {}
				item.rq = this.$fxUtils.setDate(this.$fxUtils.getCustomAssignDate(this.$fxUtils.setDate(new Date(this.checkDate)), -(i + 1)))
				item.money = 0
				let hisItem = this.hisDayList.find(dataItme => {
					return dataItme.rq === item.rq
				})
				if (hisItem) {
					item.money = this.toFixedNumberSize(hisItem.money)
				} else {
					item.money = '--'
				}
				this.dataList.push(item)
			}
		},
		toFixedNumberSize (data) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysPointSize))
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.inteledi-estimateHis-details {
	height:100%
	background:$fxWhite
	display: flex
	flex-direction: column
	.estimateHis-content {
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
	.estimateHis-bottom {
		display: flex
		flex-direction: column
		padding: 10px
	}
}
</style>
