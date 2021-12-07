import fxClear from './clear'
import fxFastClick from './fastClick'
import fxHistoryBack from './fx-history-back'
const directives = {
	fxClear,
	fxFastClick,
	'fx-history-back': fxHistoryBack
}
export default function fxDirectives (vm) {
	Object.keys(directives).forEach(key => {
		vm.directive(key, directives[key])
	})
}
