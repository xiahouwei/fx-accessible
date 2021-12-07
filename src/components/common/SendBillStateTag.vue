<template>
	<span :class="computedClass" class="sendBill-stateTag">{{sendBillStateText}}</span>
</template>

<script>
export default {
	name: 'moveStateTag',
	props: {
		sendBillState: Number
	},
	computed: {
		sendBillStateText () {
			let stateText = ''
			switch (this.sendBillState) {
			case 0 :
				stateText = '未发送'
				break
			case 1 :
				stateText = '已发送'
				break
			case 2 :
				stateText = '已同意'
				break
			case 3 :
				stateText = '已发货'
				break
			case 4 :
				stateText = '已收货'
				break
			case 9 :
				stateText = '被退回'
				break
			default :
				stateText = '未发送'
			}
			return stateText
		},
		computedClass () {
			let textclass = ''
			switch (this.sendBillState) {
			case 0 :
				textclass = ''
				break
			case 1 :
				textclass = 'fx-green-font'
				break
			case 2 :
				textclass = 'fx-green-font'
				break
			case 3 :
				textclass = 'fx-green-font'
				break
			case 4 :
				textclass = 'fx-green-font'
				break
			case 9 :
				textclass = 'fx-warn-font'
				break
			default :
				textclass = ''
			}
			return textclass
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.sendBill-stateTag {
	font-size:12px
	font-weight:400
}
</style>
