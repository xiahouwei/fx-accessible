import vuexState from '@/store/state'
import utils from '@/js/lib/utils'
import { REPORT_FORM_MODULE, REPORT_TYPE_EXTEND } from '@/config/reportForm_module_config.js'
const getReportType = function () {
	var reportType = REPORT_TYPE_EXTEND.find(item => {
		return item.reg.test(vuexState.netAddressX)
	})
	return (reportType && reportType.report) || []
}
const getreportFormModule = function () {
	var extendReport = getReportType()
	var report = utils.JSONcopy(REPORT_FORM_MODULE)
	report.forEach((item, index) => {
		var _item = extendReport.find(reportItem => {
			return reportItem.id === item.id
		})
		if (_item) {
			report[index] = Object.assign(report[index], _item)
		}
	})
	return report
}

const getReportFormConfig = function (reportId) {
	return getreportFormModule().find(item => {
		return item.id === reportId
	})
}

export default {
	getreportFormModule,
	getReportFormConfig
}
