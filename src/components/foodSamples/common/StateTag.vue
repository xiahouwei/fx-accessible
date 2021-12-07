<template>
	<van-tag class="state-class" :type="tagType" size="large" plain>{{billStateText}}</van-tag>
</template>

<script>
export default {
	name: 'stateTag',
	props: {
		billState: Number,
		reCheckState: Number
	},
	computed: {
		billStateText () {
			let stateText = ''
			switch (this.billState) {
			case 0 :
				stateText = '未处理'
				break
			case 1 :
				stateText = '已处理'
				break
			}
			return stateText
		},
		tagType () {
			let tagType = ''
			switch (this.billState) {
			case 0 :
				tagType = 'danger'
				break
			case 1 :
				tagType = 'success'
				break
			}
			return tagType
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
