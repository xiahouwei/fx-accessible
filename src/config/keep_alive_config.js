import routerConfig from '@/router/routerConfig.js'
const flatten = function (arr, keepAlives) {
	arr.forEach(item => {
		if (item.meta && item.meta.keepAlive) {
			keepAlives.push(item.name)
		}
		if (Array.isArray(item.children)) {
			flatten(item.children, keepAlives)
		}
	})
}
const flattenRouterConfig = function (routerConfig) {
	var keepAlives = []
	flatten(routerConfig, keepAlives)
	return keepAlives
}
const keepAlives = flattenRouterConfig(routerConfig)
export default keepAlives
