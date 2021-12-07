import app from '@/main.js'

export function SET_STYLUS_DYNAMIC (state, obj) {
	for (var key in obj) {
		if (key !== 'type') {
			state[key] = obj[key]
			window.localStorage.setItem(key, obj[key])
			app.vue.$fxStylusDynamic.setStyle(key, obj[key])
		}
	}
}
