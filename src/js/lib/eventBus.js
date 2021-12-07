import Vue from 'vue'

var eventBus = new Vue({})

eventBus.initEvent = function (context, event, methods) {
	eventBus.$on(event, methods)
	context.$once('hook:beforeDestroy', function () {
		eventBus.$off(event, methods)
	})
}
export default eventBus
