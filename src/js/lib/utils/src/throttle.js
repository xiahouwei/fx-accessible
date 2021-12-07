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

const fxThrottle = throttle()

export default {
	throttle,
	fxThrottle
}
