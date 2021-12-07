/*
 * @ 节流函数 SHW
 * @ wait 延迟毫秒数
 */
const throttle = function () {
	let previous = 0
	return function (wait) {
		return new Promise(resolve => {
			let now = Date.now()
			if (now - previous > wait) {
				previous = now
				resolve()
			}
		})
	}
}

/*
 * @ 防抖函数 SHW
 * @ wait 延迟毫秒数
 * @ immediate 立即执行
 */
const debounce = function () {
	let timeout = null
	return function (wait, immediate = true) {
		return new Promise(resolve => {
			if (timeout) {
				clearTimeout(timeout)
			}
			if (immediate) {
				let immediateAction = !timeout
				timeout = setTimeout(() => {
					timeout = null
				}, wait)
				if (immediateAction) {
					resolve()
				}
			} else {
				timeout = setTimeout(() => {
					resolve()
				}, wait)
			}
		})
	}
}
/*
 * @ 精准四舍五入及补零 SHW
 * @ number 操作的数据
 * @ len 保留位数
 * @ pushZero 是否补领
 */
const toFixedSHW = function (number, len = 0, pushZero = true) {
	if (isNaN(number)) {
		return number
	}
	let num = number - 0 + 0.0000000001
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
export {
	throttle,
	debounce,
	toFixedSHW
}
