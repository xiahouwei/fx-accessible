import { setLocalStorageTimeStamp } from '../utils'
export function SET_LOGINER (state, obj) {
	for (var key in obj) {
		if (key !== 'type') {
			state[key] = obj[key]
			if (key === 'loginerUuid') {
				setLocalStorageTimeStamp(key, obj[key])
			} else {
				window.localStorage.setItem(key, obj[key])
			}
		}
	}
}

export function CLEAR_LOGINER (state) {
	for (var key in state) {
		state[key] = ''
		window.localStorage.setItem(key, '')
	}
}
