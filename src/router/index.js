import Vue from 'vue'
import Router from 'vue-router'
import routerConfig from './routerConfig.js'
import fxHistoryBackDirective from '@/js/directives/fx-history-back/historyBack'

Vue.use(Router)

const router = new Router({
	mode: 'hash',
	base: process.env.BASE_URL,
	routes: routerConfig
})
router.beforeEach((to, from, next) => {
	const fxPayShow = Vue.prototype.$fxPay.getVisiable()
	const fxImagePreviewShow = Vue.prototype.$fxImagePreview.getVisiable()
	if (fxPayShow) {
		Vue.prototype.$fxPay.close()
		router.go(1)
		return false
	}
	if (fxImagePreviewShow) {
		Vue.prototype.$fxImagePreview.close()
		router.go(1)
		return false
	}
	if (fxHistoryBackDirective.hasShowComponet() && to.path !== '/login') {
		fxHistoryBackDirective.hideComponet(to, from)
		router.go(1)
		return false
	}
	next()
})
router.afterEach((to, from) => {
	fxHistoryBackDirective.resetHistoryArr()
})
export default router
