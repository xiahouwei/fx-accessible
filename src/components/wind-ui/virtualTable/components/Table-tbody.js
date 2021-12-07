import { TABLE_NAME } from '../js/config.js'
import { toFixedSHW } from '../js/utils.js'
export default {
	name: 'windTableTbody',
	props: {
		visibleData: {
			type: Array,
			default: () => {
				return []
			}
		},
		columnData: {
			type: Array,
			default: () => {
				return []
			}
		},
		width: String,
		height: String,
		trHeight: String,
		colWidth: String,
		viewListTranslateY: {
			type: Number,
			default: 0
		}
	},
	computed: {
		columnStyle (colItem) {
			return (colItem) => {
				let colStyle = {}
				colStyle['text-align'] = (colItem && colItem.align) || 'center'
				return colStyle
			}
		}
	},
	methods: {
		onRowClick (item, index) {
			this.$emit('on-row-click', item, index)
		},
		onCellClick (item, index) {
			this.$emit('on-cell-click', item, index)
		},
		getClientHeight () {
			return this.$refs.tbody ? this.$refs.tbody.clientHeight : 0
		},
		getPhantomClientHeight () {
			return this.$refs.phantom ? this.$refs.phantom.clientHeight : 0
		},
		getClient () {
			return {
				tbodyClientHeight: this.getClientHeight(),
				phantomClientHeight: this.getPhantomClientHeight()
			}
		},
		initScrollTop () {
			this.$nextTick(() => {
				this.$refs.tbody.scrollTop = 0
			})
		},
		initCell (h, value, item, index, rowItem, rowIndex) {
			let slotVNode = null
			if (item.$scopedSlots.default) {
				slotVNode = item.$scopedSlots.default({ row: rowItem, index: rowIndex })
			}
			return slotVNode || item.$slots.default || [h('span', value)]
		}
	},
	render (h) {
		return h('div', {
			ref: 'tbody',
			class: [`${TABLE_NAME}__tbody`],
			style: { width: this.width }
		}, [h('div', {
			ref: 'phantom',
			class: [`${TABLE_NAME}__tbody-phantom`],
			style: { width: this.width, height: this.height }
		}, [h('div', {
			class: [`${TABLE_NAME}__tbody-content`],
			style: { transform: `translate3d(0px, ${this.viewListTranslateY}px, 0px)` }
		}, this.visibleData.map((item, index) => {
			return h('div', {
				class: [`${TABLE_NAME}__tr`, {
					'is-even': index % 2 === 0
				}],
				style: {
					height: this.trHeight,
					'line-height': this.trHeight
				},
				key: item.initRowIndex,
				on: {
					click: () => {
						this.onRowClick(item, index)
					}
				}
			}, this.columnData.map((columnItem, columnIndex) => {
				const formatter = columnItem.formatter
				const decimal = columnItem.decimal
				const value = typeof formatter === 'function'
					? formatter(item, columnItem, item[columnItem.prop], index)
					: typeof decimal === 'number'
						? toFixedSHW(item[columnItem.prop], decimal, false)
						: item[columnItem.prop]
				return h('div', {
					class: [`${TABLE_NAME}__td`],
					key: columnItem.prop,
					style: Object.assign(this.columnStyle(columnItem), {
						'flex-basis': this.colWidth
					}),
					on: {
						click: () => {
							this.onCellClick(item, index)
						}
					}
				}, this.initCell(h, value, columnItem, columnIndex, item, index))
			}))
		}))])])
	}
}
