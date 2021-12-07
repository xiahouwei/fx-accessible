import { TABLE_NAME } from '../js/config.js'
export default {
	name: 'windTableSortBtn',
	props: {
		sort: String
	},
	render (h) {
		return h('div', {
			class: [`${TABLE_NAME}__th-sort`]
		}, [h('i', {
			class: [`${TABLE_NAME}__th-sort-up`, {
				'is-active': this.sort === 'up'
			}]
		}), h('i', {
			class: [`${TABLE_NAME}__th-sort-down`, {
				'is-active': this.sort === 'down'
			}]
		})])
	}
}
