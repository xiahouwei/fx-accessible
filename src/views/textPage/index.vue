<template>
	<div class="inteledi-report-page">
		<w-header title="进销存汇总表测试" :border="true"></w-header>
		<div class="wraper">
			<w-virtual-table
				ref="table"
				show-summary
				frozenCol="shopCode"
				@on-row-click="onRowClick"
				@on-cell-click="onCellClick"
				@on-sort="onSortHandler"
			>
				<w-virtual-table-column
					v-for="item in columnData"
					:key="item.prop"
					:prop="item.prop"
					:label="item.label"
					:align="item.align"
					:visiable="item.visiable"
					:formatter="item.formatter"
				>
				</w-virtual-table-column>
			</w-virtual-table>
		</div>
	</div>
</template>

<script>
export default {
	name: 'report',
	data () {
		let columnData = [
			{ prop: 'shopCode', label: '机构编码0', align: 'left', visiable: true },
			{ prop: 'shopName', label: '机构名称1机构名称1机构名称1机构名称1机构名称1机构名称1', align: 'left' },
			{ prop: 'houseName', label: '仓库名称2', align: 'left' },
			{ prop: 'goodBigType', label: '品项大类3' },
			{ prop: 'goodSmallType', label: '品项小类4' },
			{ prop: 'goodStyle', label: '品项类型5' },
			{ prop: 'goodCode', label: '品项编号6' },
			{ prop: 'goodName', label: '品项名称7' },
			{ prop: 'spec', label: '规格8' },
			{ prop: 'goodUnit', label: '单位9' },
			{ prop: 'batchCode', label: '批次号10' },
			{ prop: 'qcAmount', label: '期初数量11', align: 'right' },
			{ prop: 'qcMoney', label: '期初金额12', align: 'right', formatter: this.priceFomatter },
			{ prop: 'inAmount', label: '入库数量13', align: 'right' },
			{ prop: 'inPrice', label: '入库平均单价14', align: 'right', formatter: this.priceFomatter },
			{ prop: 'inMoney', label: '入库金额15', align: 'right', formatter: this.priceFomatter },
			{ prop: 'notCheckInAmount', label: '未审核入库数量16', align: 'right' },
			{ prop: 'outAmount', label: '出库数量17', align: 'right' },
			{ prop: 'outPrice', label: '出库平均单价18', align: 'right', formatter: this.priceFomatter },
			{ prop: 'outMoney', label: '出库金额19', align: 'right', formatter: this.priceFomatter },
			{ prop: 'notCheckOutAmount', label: '未审核出库数量20', align: 'right' },
			{ prop: 'jyAmount', label: '期末数量21', align: 'right' },
			{ prop: 'jyMoney', label: '期末金额22', align: 'right', formatter: this.priceFomatter },
			{ prop: 'notCheckJyAmount', label: '未审核期末数量23' }
		]
		return {
			columnData,
			data: []
		}
	},
	mounted () {
		let data = Array.from({ length: 100 }, (_, i) => ({
			shopCode: i,
			shopName: `${i + 1}哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈`,
			houseName: i + 2,
			goodBigType: i + 3,
			goodSmallType: i + 4,
			goodStyle: i + 5,
			goodCode: i + 6,
			goodName: i + 7,
			spec: i + 8,
			goodUnit: i + 9,
			batchCode: i + 10,
			qcAmount: i + 11,
			qcMoney: i + 12,
			inAmount: i + 13,
			inPrice: i + 14,
			inMoney: i + 15,
			notCheckInAmount: i + 16,
			outAmount: i + 17,
			outPrice: i + 18,
			outMoney: i + 19,
			notCheckOutAmount: i + 20,
			jyAmount: i + 21,
			jyMoney: i + 22,
			notCheckJyAmount: `${i + 23}哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈`
		}))
		const sumData = this.getSum()
		this.$refs.table.initGrid(data, sumData)
	},
	methods: {
		getSum () {
			return this.columnData.map((item, index) => {
				return index
			})
		},
		onRowClick (item, index) {
		},
		onCellClick (item, index) {
		},
		onSortHandler (item) {
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.inteledi-report-page {
	background:$fxWhite
	display: flex
	flex-direction: column
	height:100%
	.wraper {
		display: flex
		flex-direction: column
		flex:1
		width: 100%
		overflow: auto
	}
}
</style>
