<template>
	<span :class="computedClass" class="moveStateTag">{{moveStateText}}</span>
</template>

<script>
export default {
	name: 'moveStateTag',
	props: {
		moveState: Number
	},
	computed: {
		moveStateText () {
			let stateText = ''
			switch (this.moveState) {
			case 0 :
				stateText = '未处理'
				break
			case 1 :
				stateText = '同意'
				break
			case 2 :
				stateText = '拒绝'
				break
			case 3 :
				stateText = '等待处理'
				break
			}
			return stateText
		},
		computedClass () {
			let textclass = ''
			switch (this.moveState) {
			case 0 :
				textclass = ''
				break
			case 1 :
				textclass = 'fx-green-font'
				break
			case 2 :
				textclass = 'fx-warn-font'
				break
			case 3 :
				textclass = ''
				break
			}
			return textclass
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.moveStateTag {
	font-size:12px
	font-weight:400
}
</style>
