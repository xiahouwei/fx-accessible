import numberField from './numberField'
import fieldPro from './fieldPro'
import searchPro from './searchPro'

export default {
	install: function (Vue) {
		Vue.component('van-pro-number-field', numberField)
		Vue.component('van-pro-field', fieldPro)
		Vue.component('van-pro-search', searchPro)
	}
}
