import utilsType from './type.js'
/*
 * @ 数据校验类 by shw
 */
class Verification {
	constructor (data) {
		this.resetData(data)
	}
	resetData (data) {
		this.origin = typeof data === 'object' ? utilsType.deepClone(data) : data
	}
	checkData (data) {
		return utilsType.compare(this.origin, data)
	}
}

export const fxDataVerification = function (origin) {
	return new Verification(origin)
}

