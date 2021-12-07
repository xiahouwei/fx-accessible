const timeIntervalObj = {}
// new Data 解决ios识别问题 by shw
const newDate = function (date) {
	return date ? new Date(date.replace(/-/g, '/')) : new Date()
}
// 格式化日期 by shw
const setDate = function (date = new Date(), formatter) {
	let y = date.getFullYear()
	let m = date.getMonth() + 1
	let d = date.getDate()
	m = m < 10 ? '0' + m : m
	d = d < 10 ? '0' + d : d
	switch (formatter) {
	case '年月日':
		return `${y}年${m}月${d}日`
	case 'ios':
		return `${y}/${m}/${d}`
	default:
		return `${y}-${m}-${d}`
	}
}
// 获取年月日小时分钟秒  by shw
const setDateTime = function (date = new Date(), formatter) {
	const pushZero = (val) => {
		return val < 10 ? '0' + val : val
	}
	let y = date.getFullYear()
	let m = pushZero(date.getMonth() + 1)
	let d = pushZero(date.getDate())
	let myH = pushZero(date.getHours())
	let myM = pushZero(date.getMinutes())
	let myS = pushZero(date.getSeconds())
	switch (formatter) {
	case '年月日':
		return `${y}年${m}月${d}日 ${myH}:${myM}:${myS}`
	case '年月日时分':
		return `${y}年${m}月${d}日 ${myH}:${myM}`
	case '时分':
		return `${y}-${m}-${d} ${myH}:${myM}`
	default:
		return `${y}-${m}-${d} ${myH}:${myM}:${myS}`
	}
}
// 获取当前小时分钟秒 by shw
const getCurrentTime = function (formatter) {
	let myDate = new Date()
	let myH = myDate.getHours()
	let myM = myDate.getMinutes()
	let myS = myDate.getSeconds()
	return `${myH}:${myM}:${myS}`
}
// 获取星期几 by shw
const getDateWeek = (date) => {
	let week = '日一二三四五六'.charAt(date.getDay())
	return `星期${week}`
}
// 获取当月第一天 by shw
const getCurrentMonthFirst = function () {
	let date = new Date()
	let firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
	return setDate(firstDay)
}
// 获取当月最后一天 by shw
const getCurrentMonthLast = function () {
	let date = new Date()
	let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0)
	return setDate(lastDay)
}
// 获取当前天的指定前/后天数 by shw
const getCustomDate = (days) => {
	var date = new Date()
	date.setDate(date.getDate() + days)
	return date
}
// 获取指定天的指定前/后天数  by shw
const getCustomAssignDate = function (assignDate, days) {
	let date = newDate(assignDate)
	date.setDate(date.getDate() + days)
	return date
}
// 比较两个日期,是否满足 firstDate + range < secondDate by shw
const compareDateRange = (firstDate, secondDate, range = 0) => {
	return (new Date(secondDate) >= new Date(firstDate)) && getCustomAssignDate(firstDate, range) >= new Date(secondDate)
}
// 获取指定日期 + 当前时间 by shw
const getCustomerDateAndCurrentTime = (date) => {
	return newDate(setDate(date) + ' ' + getCurrentTime())
}
// 获取指定日期 + 指定时间 by shw
const getCustomerDateAndTime = (date, time) => {
	return newDate(setDate(date) + ' ' + time)
}
// 获取间隔 by shw
const getTimeInterval = function (type = 'default') {
	let currentTime = newDate().getTime()
	let interval = currentTime - timeIntervalObj.type
	timeIntervalObj.type = currentTime
	return isNaN(interval) ? 0 : interval
}
// 毫秒转化分钟
const ms2m = function (ms) {
	return Math.floor(ms / 1000 / 60)
}
// 毫秒转天
const ms2d = function (ms) {
	return ms / 1000 / 60 / 60 / 24
}
// 小时转毫秒
const h2ms = function (h) {
	return Math.floor(h * 60 * 60 * 1000)
}
// 天转毫秒
const d2ms = function (d) {
	return Math.floor(d * 24 * 60 * 60 * 1000)
}
// 获取前月/后月对应的一天
const addMonth = function (date = new Date(), addMonth = 1) {
	let nextY = date.getFullYear()
	let nextM = date.getMonth() + addMonth
	let nextD = date.getDate()
	if (nextM > 11) { // 12月特殊处理
		nextY = nextY + 1
		nextM = nextM - 12
	}
	let nextLastDay = new Date(nextY, nextM + 1, 0).getDate()
	if (date.getDate() > nextLastDay) {
		nextD = nextLastDay
	}
	let nextDate = new Date(nextY, nextM, nextD)
	return nextDate
}
export default {
	newDate,
	setDate,
	setDateTime,
	getCurrentTime,
	getDateWeek,
	getCustomAssignDate,
	getCurrentMonthFirst,
	getCurrentMonthLast,
	getCustomDate,
	compareDateRange,
	getCustomerDateAndCurrentTime,
	getCustomerDateAndTime,
	getTimeInterval,
	ms2m,
	ms2d,
	h2ms,
	d2ms,
	addMonth
}
