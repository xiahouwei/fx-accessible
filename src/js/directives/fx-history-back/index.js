/*
 * fx-history-back 后退关闭组件指令 by shw
 * @params visible: 控制组件开启关闭的变量
 * @params historyBackBefore: 回调函数
 * exmple:
 * v-fx-history-back="visible"
 * v-fx-history-back:historyBackBefore="visible"
 */
import historyBack from './historyBack.js'
export default {
	bind: (el, binding, vnode) => {
		const { value, expression, arg } = binding
		const context = vnode.context
		const key = el
		const index = historyBack.getHistoryArr().findIndex(item => {
			return item.key === key
		})
		if (value && !~index) {
			historyBack.pushHistoryArr({
				key,
				expression,
				context,
				arg
			})
		} else if (!value && ~index) {
			historyBack.spliceHistoryArr(index)
		}
	},
	update: (el, binding, vnode) => {
		const { value, expression, arg } = binding
		const context = vnode.context
		const key = el
		const index = historyBack.getHistoryArr().findIndex(item => {
			return item.key === key
		})
		if (value && !~index) {
			historyBack.pushHistoryArr({
				key,
				expression,
				context,
				arg
			})
		} else if (!value && ~index) {
			historyBack.spliceHistoryArr(index)
		}
	}
}
