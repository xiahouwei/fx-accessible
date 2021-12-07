const _toString = Object.prototype.toString
// 类型检查  by shw
const toRawType = function (value) {
	return _toString.call(value).slice(8, -1)
}
// 判断空对象 by shw
const isEmptyObjSHW = function (obj) {
	if (toRawType(obj) !== 'Object') {
		throw new Error('this is not object')
	}
	for (let key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			return false
		}
	}
	return true
}
// JSON解析
const JSONparse = function (jsonStr, type) {
	try {
		let obj = JSON.parse(jsonStr)
		if (type === 'object' && typeof obj !== 'object') {
			return {}
		}
		return obj
	} catch (error) {
		console.log(error)
		if (type === 'object') {
			return {}
		}
		return undefined
	}
}
// JSON 深拷贝
const JSONcopy = function (obj) {
	console.warn('fxwarning: JSONcopy方法建议改为deepClone')
	return JSON.parse(JSON.stringify(obj))
}
// 深拷贝
const deepClone = function (target) {
	let result
	if (toRawType(target) === 'Object') {
		result = {}
		for (const i in target) {
			if (Object.prototype.hasOwnProperty.call(target, i)) {
				result[i] = deepClone(target[i])
			}
		}
	} else if (toRawType(target) === 'Array') {
		result = []
		target.forEach(item => {
			result.push(deepClone(item))
		})
	} else {
		result = target
	}
	return result
}
// 判断undefined/null
const isDef = function (value) {
	return value !== undefined && value !== null
}
// 隐式类型转换比较-number|string
const compareStrNum = function (val, compVal) {
	if (typeof compVal !== 'string' && typeof compVal !== 'number') {
		return false
	}
	return val === (compVal - 0) || val === (compVal + '')
}

// obj转化str
const obj2str = function (obj) {
	let description = ''
	for (var i in obj) {
		var property = obj[i]
		description += i + ' = ' + property + '\n'
	}
	return description
}
// 判断两个数据完全相等 by shw
const compare = function (origin, target) {
	if (typeof target !== 'object' || target === null) {
		return origin === target
	}
	if (typeof origin !== 'object') {
		return false
	}
	if (Object.keys(origin).length !== Object.keys(target).length) {
		return false
	}
	for (let key of Object.keys(target)) {
		if (!compare(origin[key], target[key])) {
			return false
		}
	}
	return true
}

export default {
	toRawType,
	isEmptyObjSHW,
	JSONparse,
	JSONcopy,
	deepClone,
	isDef,
	compareStrNum,
	obj2str,
	compare
}
