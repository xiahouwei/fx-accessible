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

const fxDebounce = debounce()
export default {
	debounce,
	fxDebounce
}
