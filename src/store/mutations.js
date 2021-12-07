export function SET_STATE_LOCAL (state, obj) {
	for (var key in obj) {
		if (key !== 'type') {
			state[key] = obj[key]
			window.localStorage.setItem(key, obj[key])
		}
	}
}
export function SET_STATE_LOCAL_JSON (state, obj) {
	for (var key in obj) {
		if (key !== 'type') {
			state[key] = obj[key]
			if ({}.toString.call(obj[key]) === '[object Object]') {
				window.localStorage.setItem(key, JSON.stringify(obj[key]))
			} else if ({}.toString.call(obj[key]) === '[object Array]') {
				window.localStorage.setItem(key, JSON.stringify(obj[key]))
			} else {
				window.localStorage.setItem(key, obj[key])
			}
		}
	}
}
export function SETSTATE (state, obj) {
	for (var key in obj) {
		if (key !== 'type') {
			state[key] = obj[key]
		}
	}
}

