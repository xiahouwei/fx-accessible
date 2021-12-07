export function SET_APP_SUBJECT (state, obj) {
	for (var key in obj) {
		if (key !== 'type') {
			state[key] = obj[key]
		}
	}
}
