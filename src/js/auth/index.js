import vuexState from '@/store/state'
import utils from '@/js/lib/utils'
import permissionRoleList from './permissionRoleList.js'
import systemParamsAuthList from './systemParamsAuthList.js'
import reportFormAuthList from './reportFormAuthList.js'
const fxAuthHandler = (type, billOrSys) => {
	let auth = type
	if (/\./g.test(type)) {
		auth = type.split('.')
		return !!vuexState['auth'][billOrSys][auth[0]] && !!vuexState['auth'][billOrSys][auth[0]][auth[1]]
	}
	return !!vuexState['auth'][billOrSys][auth]
}
const fxAuthInit = (authArr) => {
	return filterAuthArr(authArr, permissionRoleList)
}
const fxSysAuthInit = (authArr) => {
	return filterAuthArr(authArr, systemParamsAuthList)
}
const filterAuthArr = (authArr, authList) => {
	let billAuth = {}
	Object.keys(authList).forEach(item => {
		let billAuthType = authArr[item] || []
		let authObj = {}
		billAuthType.forEach(authTypeItem => {
			if (Object.keys(authList[item]).includes(authTypeItem.functionCode)) {
				authObj[authTypeItem.functionCode] = authTypeItem
			}
		})
		if (!utils.isEmptyObjSHW(authObj)) {
			billAuth[item] = authObj
		}
	})
	return billAuth
}
const fxReportFormAuthInit = (authArr) => {
	let billAuth = {}
	Object.keys(reportFormAuthList).forEach(item => {
		let authPlan = authArr[item]
		let authObj = {}
		if (utils.isDef(authPlan)) {
			authPlan.forEach(planItem => {
				planItem.id = planItem.functionCode
				planItem.name = planItem.functionName
			})
			authObj.plan = authPlan
			authObj.id = item
			authObj.label = reportFormAuthList[item]
			billAuth[item] = authObj
		}
	})
	return billAuth
}
export const fxAuth = (type) => {
	return fxAuthHandler(type, 'billAuth')
}
export const fxSysAuth = (type) => {
	return fxAuthHandler(type, 'billSysAuth')
}
export const fxAuthModule = {
	fxAuthInit,
	fxSysAuthInit,
	fxReportFormAuthInit
}
