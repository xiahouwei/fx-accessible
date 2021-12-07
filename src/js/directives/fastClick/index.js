/*
 * binding.value 用户绑定触发的事件
 */
export default {
	bind: (el, binding) => {
		el.addEventListener('touchend', binding.value)
	},
	unbind: (el, binding) => {
		el.removeEventListener('touchend', binding.value)
	}
}
