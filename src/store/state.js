import {
	getLocalStorage,
	getLocalStorageNumber,
	getLocalStorageJson
} from './src/utils'
export default {
	// 连接域名
	netAddressX: getLocalStorage('netAddressX', ''),
	// 账号
	urserNameX: getLocalStorage('urserNameX', ''),
	// 单据列表请求参数
	billListPostParams: {},
	// 整数最大位数
	numberLength: 8,
	// 系统小数点保留位数(数量)
	sysPointSize: getLocalStorageNumber('sysPointSize', 0),
	// 金额小数点保留位数
	sysMoneyPointSize: getLocalStorageNumber('sysMoneyPointSize', 0),
	// 可输入最大数量
	maxAmount: 99999999,
	// 税率
	taxes: getLocalStorageJson('taxes', []),
	// 系统设置
	systemParams: getLocalStorageJson('systemParams', {}),
	// 有新版本
	hasNewVersion: false,
	// 忽略版本更新
	ignoreVersionUpdate: false
}
