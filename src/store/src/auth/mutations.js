import { fxAuthModule } from '@/js/auth/index'
import { setLocalStorage } from '../utils'
export function SET_AUTH_LOCAL_JSON (state, obj) {
	for (var key in obj) {
		if (key !== 'type') {
			state[key] = obj[key]
			setLocalStorage(key, obj[key])
		}
	}
}
export function EXTEND_AUTH (state, obj) {
	for (var key in obj) {
		if (key !== 'type') {
			if (key === 'billAuth') {
				let billAuth = fxAuthModule.fxAuthInit(obj[key])
				Object.keys(billAuth).forEach(item => {
					Object.assign(state[key][item], billAuth[item])
				})
			}
			setLocalStorage(key, state[key])
		}
	}
}

export function RESET_BILL_AUTH (state, billAuth) {
	let _billAuth = fxAuthModule.fxAuthInit(billAuth)
	for (var key in _billAuth) {
		state.billAuth[key] = _billAuth[key]
	}
	setLocalStorage('billAuth', state.billAuth)
}
