import Vue from 'vue'
import utils from '@/js/lib/utils'
import {
	setLocalStorage
} from '../utils'
export function SET_REPORT_FROZEN_COL (state, obj) {
	Object.keys(obj).forEach(item => {
		let _reportFrozenCol = utils.JSONcopy(state.reportFormFrozenColumn)
		_reportFrozenCol[item] = obj[item]
		Vue.set(state, 'reportFormFrozenColumn', _reportFrozenCol)
		setLocalStorage('reportFormFrozenColumn', state.reportFormFrozenColumn)
	})
}
