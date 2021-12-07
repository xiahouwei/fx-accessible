import {
	getLocalStorageJson
} from '../utils'
export default {
	// 单据角色权限
	billAuth: getLocalStorageJson('billAuth', {}),
	// 单据系统参数权限
	billSysAuth: getLocalStorageJson('billSysAuth', {}),
	// 报表权限及方案
	reportFormAuth: getLocalStorageJson('reportFormAuth', {})
}
