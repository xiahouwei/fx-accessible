<template>
	<span class="stateTag">{{billStateText}}</span>
</template>

<script>
export default {
	name: 'stateText',
	props: {
		billState: Number
	},
	computed: {
		billStateText () {
			let stateText = ''
			switch (this.billState) {
			case 0 :
				stateText = '未审核'
				break
			case 1 :
				stateText = '已审核'
				break
			}
			return stateText
		}
	}
}
</script>
