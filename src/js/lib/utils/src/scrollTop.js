import { requestAnimationFrameInit } from '@/js/lib/requestAnimationFrame'
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
		} else if ((scrollTop - offsetTop) > distance) {
			scrollTop -= distance
			$el.scrollTop = scrollTop
			timer = requestAnimationFrame(fn)
		} else {
			$el.scrollTop = offsetTop
			cancelAnimationFrame(timer)
		}
	})
}
const getComputedStyle = document.defaultView.getComputedStyle.bind(document.defaultView)
const getScrollEventTarget = function (element, rootParent = window) {
	let node = element
	while (
		node &&
		node.tagName !== 'HTML' &&
		node.tagName !== 'BODY' &&
		node.nodeType === 1 &&
		node !== rootParent
	) {
		const { overflowY } = getComputedStyle(node)
		if (overflowY === 'scroll' || overflowY === 'auto') {
			return node
		}
		node = node.parentNode
	}
	return rootParent
}
export const doScrollTop = function (element, distance = 20) {
	let scrollEventTarget = getScrollEventTarget(element)
	scrollTopW({
		$el: scrollEventTarget,
		offsetTop: element.offsetTop,
		distance
	})
}
