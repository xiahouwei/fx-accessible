import { stateName } from './state'
import utils from '@/js/lib/utils'
import {
	setLocalStorage
} from '../utils'
export function SET_SYSTEM_PARAMS_CLD (state, obj) {
	Object.keys(state).forEach(item => {
		const value = obj.state[item]
		if (utils.isDef(value)) {
			state[item] = value
			setLocalStorage(`${stateName}-${item}`, value)
		}
	})
}

export function ADD_SYSTEM_PARAMS_CLD (state, { state: obj }) {
	for (var key in obj) {
		state[key] = obj[key]
		setLocalStorage(`${stateName}-${key}`, obj[key])
	}
}
