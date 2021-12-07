import initUi from '@/js/appInit/src/ui.js'
import initUitls from '@/js/appInit/src/utils.js'
import initVueCommon from '@/js/appInit/src/vueCommon.js'
import initAppPlugin from '@/js/appInit/src/appPlugin.js'
import initCordova from '@/js/appInit/src/cordova.js'
export const appMount = function (Vue, router, store, App) {
	let vue = new Vue({
		router,
		store,
		render: h => h(App)
	})
	vue.$mount('#app')
	return vue
}
export default (vue) => {
	initUi(vue)
	initUitls(vue)
	initVueCommon(vue)
	initAppPlugin(vue)
	initCordova(vue)
}


