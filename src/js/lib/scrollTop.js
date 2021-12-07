import { requestAnimationFrameInit } from './requestAnimationFrame'
export const scrollTopW = ({ offsetTop = 0, $el = document.documentElement, distance = 100 }) => {
	if (!window.requestAnimationFrame) {
		requestAnimationFrameInit()
	}
	let timer = null
	let scrollTop = $el.scrollTop
	cancelAnimationFrame(timer)
	timer = requestAnimationFrame(function fn () {
		if (scrollTop < offsetTop) {
			scrollTop += distance
			$el.scrollTop = scrollTop
			timer = requestAnimationFrame(fn)
		} else {
			$el.scrollTop = offsetTop
			cancelAnimationFrame(timer)
		}
	})
}
