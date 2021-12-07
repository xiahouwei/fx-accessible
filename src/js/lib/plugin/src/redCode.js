import Vue from 'vue'
export default function redCodeEvent () {
	let redCode = ''
	let timer = null
	const keyupHandler = function (e) {
		const key = e.key
		if (e.target.tagName === 'INPUT' || /[^0-9]/.test(key)) {
			return false
		}
		const interval = Vue.prototype.$fxUtils.getTimeInterval('redCode')
		if (interval > 200) {
			redCode = ''
		}
		redCode += key
		window.clearTimeout(timer)
		timer = window.setTimeout(() => {
			Vue.prototype.$fxEventBus.$emit('redCode', redCode)
		}, 300)
	}
	document.querySelector('body').addEventListener('keydown', keyupHandler)
}

