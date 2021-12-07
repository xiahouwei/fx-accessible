const stylusMapping = {
	fontSizeType: 'data-font-size-type'
}


const setStyle = function (type, value) {
	const typeName = stylusMapping[type]
	const typeValue = window.document.documentElement.getAttribute(typeName)
	if (typeValue === value) {
		return false
	}
	window.document.documentElement.setAttribute(typeName, value)
}

const getStyle = function (type) {
	const typeName = stylusMapping[type]
	return window.document.documentElement.getAttribute(typeName)
}

export default {
	setStyle,
	getStyle
}
