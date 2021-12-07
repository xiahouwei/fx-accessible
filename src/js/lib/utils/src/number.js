// 精准四舍五入及补零 by shw
const toFixedSHW = function (number, len = 0, pushZero = true) {
	let num = number - 0 + 0.0000000001
	num = isNaN(num) ? 0 : num
	let _len = len - 0
	let mathPow = Math.pow(10, _len)
	let _num = Math.round(num * mathPow) / mathPow + ''
	if (pushZero && _len > 0) {
		let dot = _num.indexOf('.')
		if (!~dot) {
			_num += '.'
			dot = _num.length - 1
		}
		// 获取当前小数点后位数,跟参数_len比较一下,如果不等用0补齐
		let dotLen = _num.length - (dot + 1)
		// 需要补0的个数
		let zeroLen = _len - dotLen
		if (dotLen < _len) {
			for (let i = 0; i < zeroLen; i++) {
				_num += '0'
			}
		}
	}
	return _num
}
const toFixedParseNumber = function () {
	return parseFloat(toFixedSHW(...arguments))
}
// 字符串反转
const strReverse = (str) => {
	return str.split('').reverse().join('')
}
// 判断小数位是否满足条件
const checkNumberPoint = (num, point) => {
	let index = strReverse(num + '').indexOf('.')
	return !(~index && index > point)
}
// 格式化小数位保留指定位数
const formatNumByPoint = (num, point) => {
	let strVal = num + ''
	if (!checkNumberPoint(num, point)) {
		return parseFloat(strVal.slice(0, strVal.indexOf('.') + point + 1))
	} else {
		return num
	}
}
// 判断string 与 number 类型是否相等
const isEqualNumberString = (pre, cur) => {
	return parseFloat(pre) === parseFloat(cur)
}

export default {
	toFixedSHW,
	toFixedParseNumber,
	strReverse,
	checkNumberPoint,
	formatNumByPoint,
	isEqualNumberString
}
