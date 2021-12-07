// 数组去重  by shw
const arrDedup = function (arr = []) {
	return Array.from(new Set(arr))
}
// 查找数组满足条件的元素,且返回指定值  by shw
const appointedMap = function (arr = [], filter) {
	let res = []
	arr.forEach((item, i) => {
		const data = filter(item, i)
		if (undefined !== data) {
			res.push(data)
		}
	})
	return res
}
// split by shw
const split = function (str, separator, howmany) {
	if (!str) {
		return []
	} else {
		return str.split(separator, howmany)
	}
}
export default {
	arrDedup,
	appointedMap,
	split
}
