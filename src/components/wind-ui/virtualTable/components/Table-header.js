import { TABLE_NAME } from '../js/config.js'
import WindVirtualSort from './Table-sort.js'
export default {
	name: 'windTableHeader',
	props: {
		columnArr: {
			type: Array,
			default: () => {
				return []
			}
		},
		width: String,
		height: String,
		colWidth: String,
		sort: Boolean
	},
	methods: {
		onColumnClick (item) {
			if (this.sort) {
				this.$emit('on-sort', item)
			}
		}
	},
	render (h) {
		const headerCell = this.columnArr.filter(item => {
			return item.visiable
		})
		return h('div', {
			class: [`${TABLE_NAME}__title`],
			style: { width: this.width }
		}, [h('div', {
			class: [`${TABLE_NAME}__title-box`],
			style: {
				width: this.width,
				height: this.height,
				'line-height': this.height
			}
		}, headerCell.map(item => {
			return h('div', {
				class: [`${TABLE_NAME}__th`],
				style: {
					'flex-basis': this.colWidth
				},
				key: item.prop,
				on: {
					click: () => {
						this.onColumnClick(item)
					}
				}
			}, [h('div', {
				class: [`${TABLE_NAME}__th-label`]
			}, item.label), h(WindVirtualSort, {
				style: {
					display: this.sort ? '' : 'none'
				},
				props: {
					sort: item.getSort()
				}
			})])
		}))])
	}
}
