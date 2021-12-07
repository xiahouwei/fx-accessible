import { COMMON_TYPE_CONFIG } from '@/config/app_common_type_config.js'
// 获取类型list by shw
const getCommonTypeList = function (type) {
	if (!COMMON_TYPE_CONFIG[type]) {
		console.warn('fxWarn: 无法找到要查询类型,请检查type值是否传输正确')
	}
	return COMMON_TYPE_CONFIG[type]
}
// 根据类型id获取类型数据对象
const getCommonTypeItemById = function (type) {
	return (id) => {
		return getCommonTypeList(type).find(item => {
			return `${item.id}` === `${id}`
		}) || {}
	}
}
// 根据类型rule获取类型数据对象
const getCommonTypeItemByRule = function (type) {
	return (...arg) => {
		return getCommonTypeList(type).find(item => {
			return item.rule(...arg)
		}) || {}
	}
}
// 类型判断
const isCommonType = function (type) {
	return (typeName = []) => {
		return (typeId) => {
			const types = [].concat(typeName)
			const typeValues = getCommonTypeItemById(type)(typeId).type
			return types.includes(typeValues)
		}
	}
}

export default {
	getCommonTypeList,
	getCommonTypeItemById,
	getCommonTypeItemByRule,
	isCommonType
}
