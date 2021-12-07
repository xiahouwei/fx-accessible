import { TABLE_NAME } from '../js/config.js'
export default {
	name: 'windTableBottom',
	props: {
		columnArr: {
			type: Array,
			default: () => {
				return []
			}
		},
		sumData: {
			type: Object,
			default: () => {
				return {}
			}
		},
		width: String,
		height: String,
		colWidth: String
	},
	computed: {
		sumColumnStyle (colItem, colIndex) {
			return (colItem, colIndex) => {
				let colStyle = {}
				colStyle['text-align'] = colIndex === 0 ? 'left' : colItem.align || 'center'
				return colStyle
			}
		}
	},
	render (h) {
		const bottomCell = this.columnArr.filter(item => {
			return item.visiable
		})
		return h('div', {
			class: [`${TABLE_NAME}__bottom`],
			style: {
				width: this.width,
				height: this.height,
				'line-height': this.height
			}
		}, bottomCell.map((item, index) => {
			let value = this.$parent.getFrozenColumn.length !== 0
				? item.prop === this.$parent.getFrozenColumn[0].prop ? '合计' : this.sumData[item.prop]
				: index === 0 ? '合计' : this.sumData[item.prop]
			return h('div', {
				class: [`${TABLE_NAME}__sum-td`],
				style: Object.assign(this.sumColumnStyle(item, index), {
					'flex-basis': this.colWidth
				}),
				key: item.prop
			}, value)
		}))
	}
}
