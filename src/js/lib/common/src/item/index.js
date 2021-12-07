import vuexState from '@/store/state'
// 获取默认图片 by shw
const getDefaultImg = function (type) {
	switch (type) {
	case 'item':
		return require('@/assets/images/icon/no-item-img.png')
	default:
		return require('@/assets/images/icon/no-item-img.png')
	}
}
// 默认品项图片路径 by shw
const errorImg = function (type) {
	return 'this.src="' + getDefaultImg(type) + '"'
}
// 添加品项
const addEditItem = function (list, item) {
	item.changeType = 'add'
	list.push(item)
}
// 删除品项
const delEditItem = function (list, item, index) {
	if (item.id) {
		item.changeType = 'del'
	} else {
		list.splice(index, 1)
	}
}
// 品项修改
const editItem = function (item) {
	item.changeType = 'edit'
}
// 品项替换
const replaceItem = function (list, item, index) {
	list.splice(index, 1, item)
}
// 可输入数量校验
const checkAmountRange = function (amount) {
	return amount > vuexState.maxAmount ? vuexState.maxAmount : amount
}
// 搜索过滤品项列表
// 其中一些单据涉及到扫码入库，扫码时页面只显示被扫码品项，不只由搜索条件去判断是否显示，增加了showFlag的判断（关于扫码有更好的方案，去掉showFlag）
// 故没有全部单据都替换此方法，如以后所有单据都支持扫码，则优化此方法
const detailFilter = function (items, searchKey, searchKeywords = 'code,name,pinYin') {
	return items.filter(item => {
		return item.changeType !== 'del' && !!searchKeywords.split(',').find(itemKey => {
			if (item.goodsDTO[itemKey].toLowerCase().includes(searchKey.toLowerCase())) {
				return true
			}
		})
	})
}
const storeFilter = function (store, searchKey) {
	return detailFilter(store.details, searchKey).length > 0
}
export default {
	getDefaultImg,
	errorImg,
	addEditItem,
	delEditItem,
	editItem,
	replaceItem,
	checkAmountRange,
	detailFilter,
	storeFilter
}
