import { getLocalStorage, getLocalStorageNumber } from '../utils'
export const stateName = 'system-params-cld'
export default {
	// 单据列表筛选日期 起始日期
	businessDateStart: getLocalStorage(`${stateName}-businessDateStart`, ''),
	// 单据列表筛选日期 结束日期
	businessDateEnd: getLocalStorage(`${stateName}-businessDateEnd`, ''),
	// 中心统配-到货时间间隔，单位为小时，数字类型
	disOut_arrivalIntervalTime: getLocalStorageNumber(`${stateName}-disOut_arrivalIntervalTime`, 0),
	// 中心统配-审核重置日期
	disOut_setDate4Check: getLocalStorageNumber(`${stateName}-disOut_setDate4Check`, 0),
	// 允外销出库-允许销售价格按零配送：0不允许，1允许
	saleOut_allowSalePriceZero: getLocalStorageNumber(`${stateName}-saleOut_allowSalePriceZero`, 0),
	// 外销出库-到货时间间隔
	saleOut_arrivalIntervalTime: getLocalStorageNumber(`${stateName}-saleOut_arrivalIntervalTime`, 0),
	// 中心采购订货单-到货时间间隔
	centerPur_arrivalIntervalTime: getLocalStorageNumber(`${stateName}-centerPur_arrivalIntervalTime`, 0),
	// 中心采购订货单-是否启用价内税
	centerPur_taxPrice: getLocalStorageNumber(`${stateName}-centerPur_taxPrice`, 0),
	// 中心采购订货单-清空明细
	centerPur_clearItem: getLocalStorageNumber(`${stateName}-centerPur_clearItem`, 0),
	// 中心采购入库单-审核重置业务日期
	stockIn_resetBusDate: getLocalStorageNumber(`${stateName}-stockIn_resetBusDate`, 0),
	// 中心盘点单-盘点单是否默认当前时间
	centerCheck_defaultCurrentTime: getLocalStorage(`${stateName}-centerCheck_defaultCurrentTime`, '0'),
	// 盘点单是否默认当前日期
	centerCheck_defaultCurrentDay: getLocalStorage(`${stateName}-centerCheck_defaultCurrentDay`, '0'),
	// 未盘品项默认处理方式
	centerCheck_unCheckDoWay: getLocalStorage(`${stateName}-centerCheck_unCheckDoWay`, '0'),
	// 盘点分类显示全盘
	centerCheck_showAllCheckType: getLocalStorage(`${stateName}-centerCheck_showAllCheckType`, '0'),
	// 是否启用包装信息标志
	centerCheck_enableItemPack: getLocalStorage(`${stateName}-centerCheck_enableItemPack`, '0')
}
