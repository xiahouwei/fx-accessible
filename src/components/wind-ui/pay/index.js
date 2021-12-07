import Pay from './Pay.vue'

export default {
	install (Vue, options) {
		const PayComp = Vue.extend(Pay)
		let instance = null
		let getPayInstance = () => {
			if (instance) {
				return instance
			}
			return new PayComp({
				el: document.createElement('div')
			})
		}
		let $payComp = (options = {}) => {
			return new Promise((resolve, reject) => {
				instance = getPayInstance()
				instance.money = options.money
				instance.payer = options.payer
				instance.payee = options.payee
				instance.payTypes = options.payTypes
				instance.confirmHandler = resolve
				instance.cancelHandler = reject
				document.body.appendChild(instance.$el)
				Vue.nextTick(function () {
					instance.popupShow()
				})
				return instance
			})
		}
		$payComp.getVisiable = function () {
			return instance && instance.visible
		}
		$payComp.close = function () {
			instance && instance.popupHide()
		}
		Vue.prototype.$fxPay = $payComp
	}
}
