import appPlugin, { $fxStylusDynamic } from '@/js/lib/plugin'

export default (vue) => {
	appPlugin(vue)
	vue.prototype.$fxStylusDynamic = $fxStylusDynamic
}
