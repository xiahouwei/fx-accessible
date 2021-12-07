import WActionSheet from './action-sheet'
import WAppContainer from './app-container'
import WAppPage from './appPage'
import WBottomBtnBar from './bottomBtnBar'
import WButton from './button'
import WCell from './cell'
import WDatePicker from './date-picker'
import WEmpty from './empty'
import WHeader from './header'
import WIcon from './icon'
import WImg from './img'
import { IndexList, IndexListItem } from './indexList'
import WLoading from './loading'
import WNotify from './notify'
import WNumberKeyboard from './number-keyboard'
import WNumberInput from './numberInput'
import WindPay from './pay/Pay.vue'
import WindPriceSpan from './price-span'
import WStepper from './stepper'
import WSwitch from './switch'
import { WindTable, WindTableColumn } from './table'
import WToast from './toast'
import { WindVirtualTable, WindVirtualTableColumn } from './virtualTable'
import WImagePreview from './image-preview'

/* plugin-调用 */
import WPayPlugin from './pay'

const EDICommonComp = {
	install: function (Vue) {
		Vue.component('w-action-sheet', WActionSheet)
		Vue.component('w-app-container', WAppContainer)
		Vue.component('w-app-page', WAppPage)
		Vue.component('w-bottom-btn-bar', WBottomBtnBar)
		Vue.component('w-button', WButton)
		Vue.component('w-cell', WCell)
		Vue.component('w-date-picker', WDatePicker)
		Vue.component('w-empty', WEmpty)
		Vue.component('w-header', WHeader)
		Vue.component('w-icon', WIcon)
		Vue.component('w-img', WImg)
		Vue.component('w-indexList', IndexList)
		Vue.component('w-indexList-item', IndexListItem)
		Vue.component('w-number-keyboard', WNumberKeyboard)
		Vue.component('w-number-input', WNumberInput)
		Vue.component('w-pay', WindPay)
		Vue.component('w-price-span', WindPriceSpan)
		Vue.component('w-stepper', WStepper)
		Vue.component('w-switch', WSwitch)
		Vue.component('w-table', WindTable)
		Vue.component('w-table-column', WindTableColumn)
		Vue.component('w-virtual-table', WindVirtualTable)
		Vue.component('w-virtual-table-column', WindVirtualTableColumn)
		Vue.use(WPayPlugin)
		Vue.use(WImagePreview)
		Vue.prototype.$fxNotify = WNotify
		Vue.prototype.$fxToast = WToast
		Vue.prototype.$fxLoading = WLoading
	}
}

export default EDICommonComp
