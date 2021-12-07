import utils from '@/js/lib/utils'
const filterPrice = (value, { len = 2, pushZero = true }) => {
	return utils.toFixedSHW(parseFloat(value), len, pushZero)
}
const filterTaxes = (value) => {
	return utils.toFixedSHW(value * 100, 2, false)
}
const filterDateYMD = (value) => {
	return utils.setDate(new Date(value))
}
const filterDateYMDHM = (value) => {
	return utils.setDateTime(new Date(value))
}
const filters = {
	filterPrice,
	filterTaxes,
	filterDateYMD,
	filterDateYMDHM
}
export default function fxFilters (vm) {
	Object.keys(filters).forEach(key => {
		vm.filter(key, filters[key])
	})
}
