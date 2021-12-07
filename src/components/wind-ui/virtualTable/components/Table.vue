<template>
	<div class="wind-virtual-table-container">
		<div ref="table" class="wind-virtual-table">
			<div class="wind-virtual-table__hidden-columns"><slot></slot></div>
			<div
				v-show="getFrozenColumn.length !== 0"
				:style="{width: frozenTableWidth}"
				class="wind-virtual-table__left"
			>
				<Wind-virtual-header
					ref="headLeft"
					:columnArr="getFrozenColumn"
					:height="tableTrHeightStyle"
					:colWidth="colWidth"
					:sort="sort"
					@on-sort="onSortHandler"
				></Wind-virtual-header>
				<Wind-virtual-tbody
					:visibleData="visibleData"
					:columnData="getFrozenColumn"
					:width="frozenTableWidth"
					:height="phantomListHeightStyle"
					:trHeight="tableTrHeightStyle"
					:colWidth="colWidth"
					:viewListTranslateY="viewListTranslateY"
					class="left-body"
					@on-row-click="onRowClick"
					@on-cell-click="onCellClick"
				></Wind-virtual-tbody>
				<Wind-virtual-bottom
					v-show="sumVisible"
					:columnArr="getFrozenColumn"
					:sumData="sumData"
					:height="tableTrHeightStyle"
					:colWidth="colWidth"
				></Wind-virtual-bottom>
			</div>
			<div class="wind-virtual-table__right">
				<Wind-virtual-header
					ref="headRight"
					:columnArr="getVisivleColumn"
					:width="tableWidth"
					:height="tableTrHeightStyle"
					:colWidth="colWidth"
					:sort="sort"
					@on-sort="onSortHandler"
				></Wind-virtual-header>
				<Wind-virtual-tbody
					ref="tbody"
					:visibleData="visibleData"
					:columnData="getVisivleColumn"
					:width="tableWidth"
					:height="phantomListHeightStyle"
					:trHeight="tableTrHeightStyle"
					:colWidth="colWidth"
					:viewListTranslateY="viewListTranslateY"
					class="right-body"
					@on-row-click="onRowClick"
					@on-cell-click="onCellClick"
				></Wind-virtual-tbody>
				<Wind-virtual-bottom
					v-show="sumVisible"
					:columnArr="getVisivleColumn"
					:sumData="sumData"
					:width="tableWidth"
					:height="tableTrHeightStyle"
					:colWidth="colWidth"
				></Wind-virtual-bottom>
			</div>
			<WindVirtualScrollBar
				ref="scrollBarY"
				:translateY="scrollBarTranslateY"
				:length="scrollBarYLength"
			></WindVirtualScrollBar>
			<WindVirtualScrollBar
				ref="scrollBarX"
				type="x"
				:translateX="scrollBarTranslateX"
				:length="scrollBarXWidth"
			></WindVirtualScrollBar>
		</div>
	</div>
</template>

<script>
/**
 * VirtualTable by shang 2019/10/25
 * @desc 虚拟渲染表格
 * @param {sumCol}  [Boolean] - 显示合计
 * @param {sumFormatter}  [Function] - 合计方法 形参传入data,和当前合计列属性
 * @param {frozenCol}  [String] - 冻结列
 * @param {sort}  [Boolean] - 是否开启排序功能
 * @param {bufferRow}  [Number] - 缓冲行
 * @param {trHeight}  [Number] - 行高度
 * @param {tdWidth}  [Number] - 列宽
 * @param {screenScale}  [Number] - 原型图比例
 *
 * @methods {initGrid} [data, sumData] - 创建表格,data:表格数据, sumData:合计数据
 */
import WindVirtualHeader from './Table-header.js'
import WindVirtualTbody from './Table-tbody.js'
import WindVirtualBottom from './Table-bottom.js'
import WindVirtualScrollBar from './Table-scrollBar.js'
import { throttle, debounce, toFixedSHW } from '../js/utils.js'
const scrollThrottle = throttle()
const scrollBarDebounce = debounce()
export default {
	name: 'windVirtualTable',
	components: {
		WindVirtualHeader,
		WindVirtualTbody,
		WindVirtualBottom,
		WindVirtualScrollBar
	},
	props: {
		sumCol: {
			type: Array,
			default: () => {
				return []
			}
		},
		sumFormatter: Function,
		frozenCol: String,
		sort: Boolean,
		bufferRow: {
			type: Number,
			default: 40
		},
		trHeight: {
			type: Number,
			default: 40
		},
		tdWidth: {
			type: Number,
			default: 120
		},
		screenScale: {
			type: Number,
			default: 3.75
		}
	},
	data () {
		return {
			data: [],
			sumData: {},
			columnArr: [],
			VW: document.body.clientWidth,
			viewListTranslateY: 0,
			start: 0,
			end: 0,
			scrollBarYLength: 0,
			scrollBarTranslateY: 0,
			scrollBarXWidth: 0,
			scrollBarTranslateX: 0
		}
	},
	computed: {
		visibleCount () {
			return Math.ceil(this.$refs.tbody.getClientHeight() / this.tableTrHeight)
		},
		visibleData () {
			return this.data.slice(this.start, this.end)
		},
		tableTrHeight () {
			return (this.trHeight / this.screenScale) * (this.VW / 100)
		},
		tableTrHeightStyle () {
			return `${this.trHeight / this.screenScale}vw`
		},
		colWidth () {
			return `${this.tdWidth / this.screenScale}vw`
		},
		tableWidth () {
			let length = this.getVisivleColumn.length
			return `${length * (this.tdWidth / this.screenScale)}vw`
		},
		frozenTableWidth () {
			let length = this.getFrozenColumn.filter(item => {
				return !!item.visiable
			}).length
			return `${length * (this.tdWidth / this.screenScale)}vw`
		},
		phantomListHeight () {
			return this.data.length * (this.trHeight / this.screenScale)
		},
		phantomListHeightStyle () {
			return `${this.phantomListHeight}vw`
		},
		getVisivleColumn () {
			return this.columnArr.filter(item => {
				return !!item.visiable && this.frozenCol !== item.prop
			})
		},
		getFrozenColumn () {
			const frozen = this.columnArr.find(item => {
				return item.prop === this.frozenCol && !!item.visiable
			})
			return frozen ? [frozen] : []
		},
		visibleSumCol () {
			const visibleCol = this.columnArr.filter(item => {
				return !!item.visiable
			}).map(item => {
				return item.prop
			})
			return this.sumCol.filter(item => {
				return visibleCol.includes(item)
			})
		},
		sumVisible () {
			return this.visibleSumCol.length !== 0
		}
	},
	mounted () {
		this.bindEvents()
	},
	destroyed () {
		this.unbindEvents()
	},
	methods: {
		initGrid (data = []) {
			Object.preventExtensions(data)
			this.setIndex(data)
			this.$nextTick(() => {
				this.updateVisibleData()
				this.data = data
				this.sumData = this.getSumData(data)
				this.initScrollYBar()
				this.initScrollXBar()
				this.$refs.tbody.initScrollTop()
			})
		},
		getSumData (data) {
			const newSumData = {}
			this.sumCol.forEach((item, index) => {
				if (typeof this.sumFormatter === 'function') {
					newSumData[item] = this.sumFormatter(data, item)
				} else {
					newSumData[item] = data.reduce((pre, cur) => {
						let value = parseFloat(pre) + parseFloat(cur[item])
						return toFixedSHW(value, 4, false)
					}, 0)
				}
			})
			return newSumData
		},
		bindEvents () {
			const rightBody = this.$el.querySelector('.right-body')
			const rightTable = this.$el.querySelector('.wind-virtual-table__right')
			rightBody.addEventListener('scroll', this.handleScroll, { passive: true })
			rightTable.addEventListener('scroll', this.handleScrollX, { passive: true })
		},
		unbindEvents () {
			const rightBody = this.$el.querySelector('.right-body')
			const rightTable = this.$el.querySelector('.wind-virtual-table__right')
			rightBody.removeEventListener('scroll', this.handleScroll, { passive: true })
			rightTable.addEventListener('scroll', this.handleScrollX, { passive: true })
		},
		handleScroll (e) {
			const leftBody = this.$el.querySelector('.left-body')
			scrollThrottle(20).then(() => {
				const ele = e.srcElement || e.target
				let { scrollTop } = ele
				leftBody.scrollTop = scrollTop
				this.updateVisibleData(scrollTop)
			})
		},
		handleScrollX (e) {
			const ele = e.srcElement || e.target
			let { scrollLeft } = ele
			scrollThrottle(10).then(() => {
				this.setScrollTranslateX(scrollLeft)
			})
		},
		updateVisibleData (scrollTop = 0) {
			let startIndex = parseInt(scrollTop / this.tableTrHeight)
			const { start, end } = this.getVisibleRange(startIndex)
			this.start = start
			this.end = end
			this.viewListTranslateY = this.start * this.tableTrHeight
			this.setScrollTranslateY(scrollTop)
		},
		getVisibleRange (startIndex) {
			const start = startIndex - this.bufferRow
			return {
				start: start >= 0 ? start : 0,
				end: startIndex + this.visibleCount + this.bufferRow
			}
		},
		setIndex (tableData) {
			tableData.forEach((item, index) => {
				item.initRowIndex = index
			})
		},
		onRowClick (item, index) {
			this.$emit('on-row-click', item, index)
		},
		onCellClick (item, index) {
			this.$emit('on-cell-click', item, index)
		},
		initScrollYBar () {
			this.$nextTick(() => {
				const { tbodyClientHeight, phantomClientHeight } = this.$refs.tbody.getClient()
				this.scrollBarYLength = this.$refs.scrollBarY.initBarLength(tbodyClientHeight, phantomClientHeight)
				this.scrollBarTranslateY = this.tableTrHeight
			})
		},
		initScrollXBar () {
			const tableClientWidth = this.$refs.table.clientWidth
			this.scrollBarXWidth = this.$refs.scrollBarX.initBarLength(tableClientWidth, this.columnLength())
			this.scrollBarTranslateX = 0
		},
		setScrollTranslateY (scrollTop) {
			const { tbodyClientHeight, phantomClientHeight } = this.$refs.tbody.getClient()
			this.scrollBarTranslateY = this.tableTrHeight + this.computeScrollTranslate(scrollTop, phantomClientHeight, tbodyClientHeight)
		},
		setScrollTranslateX (scrollLeft) {
			const tableClientWidth = this.$refs.table.clientWidth
			scrollBarDebounce(1000).then(() => {
				this.scrollBarXWidth = this.$refs.scrollBarX.initBarLength(tableClientWidth, this.columnLength())
			})
			this.scrollBarTranslateX = this.computeScrollTranslate(scrollLeft, this.columnLength(), tableClientWidth)
		},
		computeScrollTranslate (scrollLength, scrollPageLength, viewLength) {
			return scrollLength / scrollPageLength * viewLength
		},
		onSortHandler (item) {
			let sortType = item.getSort() === 'up' ? 'down' : 'up'
			this.columnArr.forEach(item => {
				item.setSort('')
			})
			item.setSort(sortType)
			this.$emit('on-sort', item)
		},
		columnLength () {
			const headLeft = this.$refs.headLeft ? this.$refs.headLeft.$el.clientWidth : 0
			const headRight = this.$refs.headRight ? this.$refs.headRight.$el.clientWidth : 0
			return headLeft + headRight
		}
	}
}
</script>
<style lang="stylus">
@import '../style/style.styl'
</style>
