import vuexState from '@/store/state'
import utils from '@/js/lib/utils/index'
import config from '@/config/calculation_config'
const parseFixed = function (n) {
	return utils.toFixedParseNumber(n, vuexState.sysMoneyPointSize)
}
// 总价运算 = 数量 * 单价
const compSumPrice = function (a, p) {
	return parseFixed(a * p)
}
// 税额运算 = 含税金额 - 非税金额
const compTaxes = function (tm, m) {
	return parseFixed(tm - m)
}
/*
* 含税单价、金额运算
* type --- outTaxes价外税、inTaxes价内税
* 价外税 单价、金额 * (1 + 税率)
* 价内税 单价、金额 / (1 - 税率)
* */
const compWithTaxes = function (p, t, type) {
	if (type === 'inTaxes') {
		return parseFixed(p / (1 - translatTax(t)))
	} else {
		return parseFixed(p * (1 + translatTax(t)))
	}
}
/*
* 非税单价运算
* type --- outTaxes价外税、inTaxes价内税
* 价外税 单价、金额 / (1 + 税率)
* 价内税 单价、金额 * (1 - 税率)
* */
const compNoTaxes = function (tp, t, type) {
	if (type === 'inTaxes') {
		return parseFixed(tp * (1 - translatTax(t)))
	} else {
		return parseFixed(tp / (1 + translatTax(t)))
	}
}
// 单价运算 = 金额 / 数量
const compPrice = function (p, a) {
	return parseFixed(p / a)
}
// 单换换算系数 = 新单位换算率 / 旧单位换算率
const compUnitRate = function (na, oa) {
	return na / oa
}
// 单位换算价格 = 原价格 * 单换换算系数
const compPriceByUnitRate = function (p, u) {
	return parseFixed(p * u)
}
// 税率换算 : 云供应链 税率 均为整数 z5税率 均为小数 因此计算前转成小数
const translatTax = function (tax) {
	return tax < 1 ? tax : tax / 100
}
class CopmutedFunc {
	constructor ({
		// 数量
		amount,
		// 非税单价
		price,
		// 不含运费非税金额
		sumNoTransPrice,
		// 非税金额
		sumPrice,
		// 含税单价
		priceWithTax,
		// 不含运费含税金额
		sumNoTransPriceWithTax,
		// 含税金额
		sumPriceWithTax,
		// 税率
		taxes,
		// 税额
		taxMoney
	}) {
		this.amount = amount
		this.price = price
		this.sumPrice = sumPrice
		this.sumNoTransPrice = sumNoTransPrice
		this.priceWithTax = priceWithTax
		this.sumNoTransPriceWithTax = sumNoTransPriceWithTax
		this.sumPriceWithTax = sumPriceWithTax
		this.taxes = taxes
		this.taxMoney = taxMoney
	}
	// 修改数量
	changeAmount (item) {
		if (this.sumNoTransPrice) {
			item[this.sumNoTransPrice] = compSumPrice(item[this.amount], item[this.price])
			item[this.sumNoTransPriceWithTax] = compSumPrice(item[this.amount], item[this.priceWithTax])
		}
		item[this.sumPrice] = compSumPrice(item[this.amount], item[this.price])
		item[this.sumPriceWithTax] = compSumPrice(item[this.amount], item[this.priceWithTax])
		item[this.taxMoney] = compTaxes(item[this.sumPriceWithTax], item[this.sumPrice])
	}
	// 修改非税单价
	changePrice (item, type) {
		item[this.sumPrice] = compSumPrice(item[this.amount], item[this.price])
		item[this.sumNoTransPrice] = item[this.sumPrice]
		this.changeTaxes(item, type)
	}
	// 修改含税单价
	changePriceWithTax (item, type) {
		item[this.sumPriceWithTax] = compSumPrice(item[this.amount], item[this.priceWithTax])
		item[this.sumPrice] = compNoTaxes(item[this.sumPriceWithTax], item[this.taxes], type)
		if (this.sumNoTransPrice) {
			item[this.sumNoTransPriceWithTax] = item[this.sumPriceWithTax]
			item[this.sumNoTransPrice] = item[this.sumPrice]
		}
		if (item[this.amount] === 0) {
			item[this.price] = compNoTaxes(item[this.priceWithTax], item[this.taxes], type)
		} else {
			item[this.price] = compPrice(item[this.sumPrice], item[this.amount])
		}
		item[this.taxMoney] = compTaxes(item[this.sumPriceWithTax], item[this.sumPrice])
	}
	// 修改非税金额
	changeMoney (item, type) {
		if (this.sumNoTransPrice) {
			item[this.price] = compPrice(item[this.sumNoTransPrice], item[this.amount])
			item[this.sumNoTransPriceWithTax] = compWithTaxes(item[this.sumNoTransPrice], item[this.taxes], type)
			item[this.sumPriceWithTax] = item[this.sumNoTransPriceWithTax]
			item[this.sumPrice] = item[this.sumNoTransPrice]
			item[this.priceWithTax] = compPrice(item[this.sumNoTransPriceWithTax], item[this.amount])
			item[this.taxMoney] = compTaxes(item[this.sumPriceWithTax], item[this.sumNoTransPrice])
		} else {
			item[this.price] = compPrice(item[this.sumPrice], item[this.amount])
			item[this.sumPriceWithTax] = compWithTaxes(item[this.sumPrice], item[this.taxes], type)
			item[this.priceWithTax] = compPrice(item[this.sumPriceWithTax], item[this.amount])
			item[this.taxMoney] = compTaxes(item[this.sumPriceWithTax], item[this.sumPrice])
		}
	}
	// 修改含税金额
	changeMoneyWithTax (item, type) {
		if (this.sumNoTransPrice) {
			item[this.priceWithTax] = compPrice(item[this.sumNoTransPriceWithTax], item[this.amount])
			item[this.sumNoTransPrice] = compNoTaxes(item[this.sumNoTransPriceWithTax], item[this.taxes], type)
			item[this.sumPrice] = item[this.sumNoTransPrice]
			item[this.sumPriceWithTax] = item[this.sumNoTransPriceWithTax]
			item[this.price] = compPrice(item[this.sumNoTransPrice], item[this.amount])
			item[this.taxMoney] = compTaxes(item[this.sumNoTransPriceWithTax], item[this.sumPrice])
		} else {
			item[this.priceWithTax] = compPrice(item[this.sumPriceWithTax], item[this.amount])
			item[this.sumPrice] = compNoTaxes(item[this.sumPriceWithTax], item[this.taxes], type)
			item[this.price] = compPrice(item[this.sumPrice], item[this.amount])
			item[this.taxMoney] = compTaxes(item[this.sumPriceWithTax], item[this.sumPrice])
		}
	}
	// 修改税率
	changeTaxes (item, type) {
		item[this.sumPriceWithTax] = compWithTaxes(item[this.sumPrice], item[this.taxes], type)
		if (this.sumNoTransPrice) {
			item[this.sumNoTransPriceWithTax] = item[this.sumPriceWithTax]
		}
		if (item[this.amount] === 0) {
			item[this.priceWithTax] = compWithTaxes(item[this.price], item[this.taxes], type)
		} else {
			item[this.priceWithTax] = compPrice(item[this.sumPriceWithTax], item[this.amount])
		}
		item[this.taxMoney] = compTaxes(item[this.sumPriceWithTax], item[this.sumPrice])
	}
	// 修改单位
	changeUnit (item, unit) {
		const unitRate = compUnitRate(unit.value, item.unitDTO.value)
		item[this.price] = compPriceByUnitRate(item[this.price], unitRate)
		item[this.priceWithTax] = compWithTaxes(item[this.price], item[this.taxes])
		item[this.sumPrice] = compSumPrice(item[this.amount], item[this.price])
		item[this.sumPriceWithTax] = compWithTaxes(item[this.sumPrice], item[this.taxes])
		if (this.sumNoTransPrice) {
			item[this.sumNoTransPrice] = item[this.sumPrice]
			item[this.sumNoTransPriceWithTax] = item[this.sumPriceWithTax]
		}
		item[this.taxMoney] = compTaxes(item[this.sumPriceWithTax], item[this.sumPrice])
		item.unitDTO = unit
	}
}
export default function (billType) {
	const billConfig = config[billType]
	const computedFunc = new CopmutedFunc(billConfig.init)
	Object.keys(billConfig).forEach(item => {
		computedFunc[item] = billConfig[item]
	})
	return computedFunc
}
