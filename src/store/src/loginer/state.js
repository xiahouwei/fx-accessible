import { getLocalStorage } from '../utils'
export default {
	// 登录人信息
	loginerCode: getLocalStorage('loginerCode', ''),
	loginerId: getLocalStorage('loginerId', ''),
	loginFlag: getLocalStorage('loginFlag', ''),
	loginerName: getLocalStorage('loginerName', ''),
	loginerPassword: getLocalStorage('loginerPassword', ''),
	loginerUuid: getLocalStorage('loginerUuid', '', 30),
	// 机构类型 0:门店, 1:中心, 2:区域, 3:企业
	loginerOrganType: getLocalStorage('loginerOrganType', ''),
	loginerShopId: getLocalStorage('loginerShopId', ''),
	loginerShopName: getLocalStorage('loginerShopName', '')
}
