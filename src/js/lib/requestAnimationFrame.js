export const requestAnimationFrameInit = () => {
	var lastTime = 0
	var vendors = ['webkit', 'moz']
	for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame']
		window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame']
	}
	if (!window.requestAnimationFrame) {
		window.requestAnimationFrame = (callback, element) => {
			var currTime = new Date().getTime()
			var timeToCall = Math.max(0, 16 - (currTime - lastTime))
			var id = window.setTimeout(() => {
				let _time = currTime + timeToCall
				callback(_time)
			}, timeToCall)
			lastTime = currTime + timeToCall
			return id
		}
	}
	if (!window.cancelAnimationFrame) {
		window.cancelAnimationFrame = id => {
			clearTimeout(id)
		}
	}
}
