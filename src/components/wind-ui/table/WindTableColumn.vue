<template>
	<div class="wind-table-column" :style="columnStyle">
		<div class="wind-table-th">{{label}}</div>
	</div>
</template>

<script>
export default {
	name: 'windTableColumn',
	props: {
		prop: String,
		label: String,
		width: String || Number,
		align: {
			type: String,
			default: 'center'
		},
		formatter: Function
	},
	mounted () {
		this.$parent.columnArr.push(this)
	},
	computed: {
		columnStyle () {
			let width = ''
			if (this.width === null || this.width === undefined) {
				return { 'flex': 1 }
			}
			if (typeof this.width === 'string') {
				width = this.width
			} else if (typeof this.width === 'number') {
				width = `${this.width}px`
			}
			return { 'width': width }
		}
	}
}
</script>
<style lang="stylus" scoped>
.wind-table-column {
	height:40px
	line-height:40px
	overflow:hidden
	.wind-table-th {
		width:100%
		height:40px
		line-height:40px
		overflow:hidden
	}
	&:not(:last-child) {
		border-right: 1px solid #eee
	}
}
</style>
