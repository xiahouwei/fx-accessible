import order from './src/order'
import item from './src/item'
import reportForm from './src/reportForm'
import utils from '@/js/lib/utils/index'
// 表单自动跳转下一个文本框 by shw
const inputAutoFocusMoblie = function (refName, formRefArr) {
	return new Promise((resolve) => {
		let refIndex = formRefArr.indexOf(refName)
		if (~refIndex) {
			if (refIndex === formRefArr.length - 1) {
				resolve()
			} else {
				let nextRefName = formRefArr[refIndex + 1]
				this.$refs[nextRefName].focus()
			}
		}
	})
}
// 报表合计公共方法,用于计算合计, 以及区分价格这种需要添加'元'的类型 by shw 2019/10/25
const reportSumAddUnitFunc = function (param, array) {
	const { columns, data } = param
	const sums = []
	columns.forEach((column, index) => {
		if (index === 0) {
			sums[index] = '合计'
			return
		}
		const values = data.map(item => Number(item[column.property]))
		if (!values.every(value => isNaN(value))) {
			sums[index] = values.reduce((prev, curr) => {
				const value = Number(curr)
				if (!isNaN(value)) {
					return prev + curr
				} else {
					return prev
				}
			}, 0)
			if (array.includes(column.property)) {
				sums[index] = `${utils.toFixedSHW(sums[index], 2)} 元`
			} else if (typeof sums[index] === 'number') {
				sums[index] = utils.toFixedSHW(sums[index], 2, false)
			}
		} else {
			sums[index] = ''
		}
	})
	return sums
}
// 一维码转品项, 返回数据包含品项一维码, 计量一维码(非固定)
const redCode2Item = function (redCode) {
	if (redCode.length > 13) {
		return {
			itemCode: redCode.slice(0, 12),
			itemCount: redCode.slice(13)
		}
	} else {
		return {
			itemCode: redCode
		}
	}
}

// z5：单据列表筛选条件-日期
const orderFilterDate = function (date = new Date(), dateRange = 1, time = '23:59') {
	return utils.setDateTime(utils.getCustomerDateAndTime(utils.addMonth(date, dateRange), time), '时分')
}
// z5：单据列表筛选条件-开始日期
const orderFilterStartDate = function (date = new Date()) {
	return utils.setDateTime(utils.getCustomerDateAndTime(utils.addMonth(date, -1), '00:00'), '时分')
}
// z5：单据列表筛选条件-结束日期
const orderFilterEndDate = function () {
	return utils.setDateTime(utils.getCustomerDateAndTime(new Date(), '23:59'), '时分')
}
// z5：单据列表筛选条件-日期范围比较
const orderFilterRangeDate = function (startDate = new Date(), endDate = new Date()) {
	startDate = new Date(startDate)
	endDate = new Date(endDate).getTime()
	let nextDate = utils.addMonth(startDate, 1).getTime()
	if (nextDate < endDate || startDate > endDate) {
		return false
	}
	return true
}

export default {
	inputAutoFocusMoblie,
	reportSumAddUnitFunc,
	redCode2Item,
	orderFilterDate,
	orderFilterStartDate,
	orderFilterEndDate,
	orderFilterRangeDate,
	...order,
	...item,
	...reportForm
}
