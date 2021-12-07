<template>
	<van-tag class="state-class" :type="currentBillState.type" size="large" plain>{{currentBillState.name}}</van-tag>
</template>

<script>
import FILTER_CONFIG from '@/config/state_filter_config'
export default {
	name: 'stateTag',
	props: {
		type: String,
		billState: [Number, String],
		reCheckState: [Number, String],
		sortingState: [Number, String],
		ediSendState: [Number, String],
		weightState: [Number, String]
	},
	computed: {
		currentBillState () {
			if (this.type === 'sortingStateCld') {
				return this.initSortingState()
			} else if (this.type === 'ediSendStateCld') {
				return this.initEdiSendState()
			} else if (this.type === 'weightStateCld') {
				return this.initWeightState()
			} else if (this.type === 'checkAndRecheckStateSingleCld') {
				return this.initStateAndRecheckCld()
			} else {
				return this.initState()
			}
		}
	},
	methods: {
		initState () {
			const reStateArr = FILTER_CONFIG.recheckState.actions
			let stateArr
			if (this.type === 'stateCld') {
				stateArr = FILTER_CONFIG.checkStateCld.actions
			} else {
				stateArr = FILTER_CONFIG.checkState.actions
			}
			if (`${this.reCheckState}` === '1') {
				return reStateArr.find(item => {
					return item.id === `${this.reCheckState}`
				})
			}
			return stateArr.find(item => {
				return item.id === `${this.billState}`
			})
		},
		initSortingState () {
			const stateArr = FILTER_CONFIG.sortingStateCld.actions
			return stateArr.find(item => {
				return item.id === `${this.sortingState}`
			})
		},
		initEdiSendState () {
			const stateArr = FILTER_CONFIG.ediSendStateCld.actions
			return stateArr.find(item => {
				return item.id === `${this.ediSendState}`
			})
		},
		initWeightState () {
			const stateArr = FILTER_CONFIG.weightStateCld.actions
			return stateArr.find(item => {
				return item.id === `${this.weightState}`
			})
		},
		initStateAndRecheckCld () {
			const stateArr = FILTER_CONFIG.checkAndRecheckStateSingle.actions
			return stateArr.find(item => {
				return item.id === `${this.billState}`
			})
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.state-class {
	height:20px
	line-height:20px
	font-size:14px
	font-weight:700
}
</style>
