import utils from '@/js/lib/utils'
export default {
	// 获取报表方案
	reportPlansGetter: state => (reportId) => {
		return (state.auth.reportFormAuth[reportId] && state.auth.reportFormAuth[reportId].plan) || []
	},
	// 获取报表冻结列开关
	reportFrozenColGetter: state => (reportId) => {
		const flag = state.reportForm.reportFormFrozenColumn[reportId]
		if (!utils.isDef(flag)) {
			return true
		}
		return flag
	}
}
