/*
 * binding.value 用于清空dom元素内容(占位作用)
 */
export default {
	bind: (el, binding) => {
		let value = binding.value
		if (value) {
			el.innerHTML = ''
		}
	},
	update: (el, binding, vnode) => {
		let value = binding.value
		if (value) {
			el.innerHTML = ''
		}
	}
}
