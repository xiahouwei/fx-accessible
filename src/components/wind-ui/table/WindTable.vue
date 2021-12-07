<template>
	<div class="wind-table">
		<div class="wind-table-title">
			<slot></slot>
		</div>
		<div class="wind-table-body">
			<div v-for="(item, index) in tableData" :key="index" class="wind-table-tr" @click="rowClick(item, index)">
				<div
					v-for="(colItem, colindex) in columnArr"
					:key="colindex"
					class="wind-table-td"
					:style="columnStyle(colItem)"
					@click="cellClick(item, index)">
						<span v-if="typeof colItem.formatter === 'function'">{{colItem.formatter(item, colItem, item[colItem.prop], index)}}</span>
						<span v-else>{{item[colItem.prop]}}</span>
				</div>
			</div>
		</div>
		<div v-show="showSummary" class="wind-table-sumTr">
			<div
				v-for="(sumItem, sumIndex) in columnArr"
				:key="sumIndex"
				class="wind-table-sumTd"
				:style="sumColumnStyle(sumItem, sumIndex)"
			>{{sumComputed(sumItem.prop, sumIndex)}}</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'itemGrid',
	props: {
		tableData: {
			type: Array,
			default: () => []
		},
		showSummary: Boolean,
		summaryMethod: Function
	},
	data () {
		return {
			columnArr: []
		}
	},
	computed: {
		columnStyle (colItem) {
			return (colItem) => {
				let colStyle = this.createdCellStyleObj(colItem)
				colStyle['text-align'] = colItem.align || 'center'
				return colStyle
			}
		},
		sumColumnStyle (colItem, colIndex) {
			return (colItem, colIndex) => {
				let colStyle = this.createdCellStyleObj(colItem)
				colStyle['text-align'] = colIndex === 0 ? 'left' : colItem.align || 'center'
				return colStyle
			}
		},
		sumComputed (prop, index) {
			return (prop, index) => {
				if (typeof this.summaryMethod === 'function') {
					let columns = this.columnArr.map(item => {
						return {
							property: item.prop,
							label: item.label
						}
					})
					let sumArr = this.summaryMethod({
						columns,
						data: this.tableData
					})
					return sumArr[index]
				} else {
					if (index === 0) {
						return '合计'
					}
					let sum = this.tableData.reduce((pre, cur) => {
						return pre + (cur[prop] - 0)
					}, 0)
					return sum
				}
			}
		}
	},
	methods: {
		createdCellStyleObj (colItem) {
			let colStyle = {}
			if (typeof colItem.width === 'string') {
				colStyle.width = colItem.width
			} else if (typeof colItem.width === 'number') {
				colStyle.width = `${colItem.width}px`
			} else {
				colStyle.flex = 1
			}
			return colStyle
		},
		rowClick (item, index) {
			this.$emit('rowClick', [item, index])
		},
		cellClick (item, index) {
			this.$emit('cellClick', [item, index])
		}
	}
}
</script>
<style lang="stylus" scoped>
.wind-table {
	display: flex
	flex-direction: column
	.wind-table-title {
		display:flex
		background-color:#C3D4FF
		flex-shrink: 0
		border-bottom: 1px solid #eee
	}
	.wind-table-body {
		flex:1
		overflow:scroll
		.wind-table-tr {
			display:flex
			border-bottom: 1px solid #eee
			font-size:12px
			&:nth-child(2n) {
				background-color:#f0f2f7
			}
			.wind-table-td {
				height:40px
				line-height:40px
				overflow:hidden
				padding-left: 5px
				padding-right: 5px
				box-sizing: border-box
				&:not(:last-child) {
					border-right: 1px solid #eee
				}
			}
		}
	}
	.wind-table-sumTr {
		display:flex
		border-bottom: 1px solid #eee
		border-top: 1px solid #eee
		font-size:12px
		&:nth-child(2n) {
			background-color:#f0f2f7
		}
		.wind-table-sumTd {
			height:40px
			line-height:40px
			overflow:hidden
			padding-left: 5px
			padding-right: 5px
			box-sizing: border-box;
			&:not(:last-child) {
				border-right: 1px solid #eee
			}
		}
	}
}
</style>
