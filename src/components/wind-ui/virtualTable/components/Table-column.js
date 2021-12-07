/**
 * VirtualTableColumn by shang 2019/10/25
 * @desc 虚拟渲染表格列
 * @param {prop}  [String] - 列key
 * @param {label}  [String] - 列名
 * @param {align}  [String] - 对齐方式
 * @param {sort}  [String] - 排序规则 up, down
 * @param {decimal}  [Number] - 保留小数
 * @param {formatter}  [Function] - 列value自定义
 * @param {visiable}  [Boolean] - 列是否显示
 */
export default {
	name: 'windTableColumn',
	props: {
		prop: String,
		label: String,
		align: {
			type: String,
			default: 'center'
		},
		sort: String,
		decimal: Number,
		formatter: Function,
		visiable: {
			type: Boolean,
			default: true
		}
	},
	data () {
		return {
			currentSort: 'up'
		}
	},
	created () {
		this.currentSort = this.sort
	},
	mounted () {
		this.$parent.columnArr.push(this)
	},
	methods: {
		setSort (val) {
			this.currentSort = val
		},
		getSort () {
			return this.currentSort
		}
	},
	render (h) {
		return h('div', this.$slots.default)
	}
}
