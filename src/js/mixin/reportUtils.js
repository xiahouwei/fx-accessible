// 同步最新税率
import { mapState } from 'vuex'
export default {
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize',
			sysMoneyPointSize: 'sysMoneyPointSize'
		})
	},
	methods: {
		createDecimalColumns (cols, decimal) {
			return cols.map(item => {
				return {
					prop: item,
					decimal: decimal
				}
			})
		},
		createColumnsWithSysPointSize (cols) {
			return this.createDecimalColumns(cols, this.sysPointSize)
		},
		createColumnsWithSysMoneyPointSize (cols) {
			return this.createDecimalColumns(cols, this.sysMoneyPointSize)
		}
	}
}
