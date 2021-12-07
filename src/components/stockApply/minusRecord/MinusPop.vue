<template>
	<div class="inteledi-stockApplySend-details">
		<w-header title="减单记录" :leftOptions="leftOptions" titleFontSize="3.733vw" :border="true" @on-click-back="onCloseClick">
		</w-header>
		<orderItem
			ref="orderItem"
			:data="orderItemList"
			:isInit="initItemCom"
		></orderItem>
	</div>
</template>

<script>
import orderItem from '@/components/stockApply/minusRecord/OrderItem.vue'
export default {
	name: 'minusRecordPop',
	components: {
		orderItem
	},
	props: {
		visibleFlag: Boolean,
		minusData: {
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
			orderItemList: [],
			initItemCom: false
		}
	},
	watch: {
		visibleFlag: {
			handler (val) {
				this.orderItemList = JSON.parse(JSON.stringify(this.minusData))
				this.initItemCom = val
			},
			immediate: true
		}
	},
	methods: {
		onCloseClick () {
			this.$emit('update:visibleFlag', false)
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.inteledi-stockApplySend-details {
	height:100%
	background:$fxWhite
	display: flex
	flex-direction: column
	.stockApplySend-bottom {
		display: flex
		flex-direction: row
		.send-btn-wrap {
			width:100%
			display: flex
			flex-direction: row
			.bottom-btn {
				flex:1
				padding:0
				overflow:hidden
			}
			.minus-btn {
				background-color: $fxBlueBtn
			}
			.minus-records {
				background-color: $fxRedBtn
			}
		}
	}
}
</style>
