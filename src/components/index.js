import fxFilterTab from './common/Fx-filter-tab'
import fxItemNumberKeyboard from './common/Fx-item-number-keyboard'
import fxItemRowEdit from './common/Fx-item-row-edit'
import fxOrderListFilter from './common/Fx-order-list-filter'
import fxOrderListContainer from './common/Fx-order-list-container'
import fxOrderListHeader from './common/Fx-order-list-header'
import fxSearchBar from './common/Fx-search-bar'
import fxStateTag from './common/Fx-state-tag'

export default {
	install: function (Vue) {
		Vue.component('fx-filter-tab', fxFilterTab)
		Vue.component('fx-item-number-keyboard', fxItemNumberKeyboard)
		Vue.component('fx-item-row-edit', fxItemRowEdit)
		Vue.component('fx-order-list-filter', fxOrderListFilter)
		Vue.component('fx-order-list-container', fxOrderListContainer)
		Vue.component('fx-order-list-header', fxOrderListHeader)
		Vue.component('fx-search-bar', fxSearchBar)
		Vue.component('fx-state-tag', fxStateTag)
	}
}
