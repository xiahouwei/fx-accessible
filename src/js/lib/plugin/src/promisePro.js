export default function promiseAlways () {
	const t = typeof window === 'undefined' ? global : window
	if (!t.Promise || t.Promise.prototype.always) {
		return false
	}
	t.Promise.prototype.always = function (callback) {
		return this.then(function (d) {
			return callback(d, undefined)
		}, function (e) {
			return callback(undefined, e)
		})
	}
}
