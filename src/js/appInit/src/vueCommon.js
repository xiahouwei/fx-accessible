// vue 全局注册
import fxFilters from '@/js/filter/index'
import fxDirectives from '@/js/directives/index'

export default (vue) => {
	fxFilters(vue)
	fxDirectives(vue)
}
