import ImagePreview from './ImagePreview.vue'
export default {
	install (Vue) {
		const VueImagePreview = Vue.extend(ImagePreview)
		let instance = null
		let getInstance = () => {
			if (instance) {
				return instance
			}
			return new VueImagePreview({
				el: document.createElement('div')
			})
		}
		const $imagePreview = (images) => {
			return new Promise((resolve) => {
				instance = getInstance()
				instance.images = images
				document.body.appendChild(instance.$el)
				Vue.nextTick(function () {
					instance.show()
				})
				return instance
			})
		}
		$imagePreview.getVisiable = function () {
			return instance && instance.visible
		}
		$imagePreview.close = function () {
			instance && instance.hide()
		}
		Vue.prototype.$fxImagePreview = $imagePreview
	}
}
