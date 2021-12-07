import app from '@/main.js'
const amountFixed = function (n) {
	return app.vue.$fxUtils.toFixedParseNumber(n, app.vue.$store.state.sysPointSize)
}
/*
 * 掌中宝项目通用计算函数
 * 1.init为配置单据对应字段名, 此字段名为最终提交保存参数
 * 2.init以外属性为 追加函数
 */
export default {
	// 中心统配出库单
	distributionOutBill4cld: {
		init: {
			// 数量
			amount: 'busUnitOutAmount',
			// 非税单价
			price: 'price',
			// 非税金额
			sumPrice: 'outMoney',
			// 含税单价
			priceWithTax: 'taxPrice',
			// 含税金额
			sumPriceWithTax: 'outMoneyWithTax',
			// 税率
			taxes: 'tax',
			// 税额
			taxMoney: 'taxOutMoney'
		},
		// 赠送
		giftChange (item) {
			if (item.giftFlag) {
				item.price = 0
				item.outMoney = 0
				item.taxPrice = 0
				item.outMoneyWithTax = 0
				item.tax = 0
				item.taxOutMoney = 0
			}
		}
	},
	// 中心外销出库单
	salesOutBill4cld: {
		init: {
			// 数量
			amount: 'busUnitOutAmount',
			// 非税单价
			price: 'price',
			// 非税金额
			sumPrice: 'outMoney',
			// 含税单价
			priceWithTax: 'taxPrice',
			// 含税金额
			sumPriceWithTax: 'outMoneyWithTax',
			// 税率
			taxes: 'tax',
			// 税额
			taxMoney: 'taxOutMoney'
		},
		// 赠送
		giftChange (item) {
			if (item.giftFlag) {
				item.price = 0
				item.outMoney = 0
				item.taxPrice = 0
				item.outMoneyWithTax = 0
				item.tax = 0
				item.taxOutMoney = 0
			}
		}
	},
	// 中心采购订货单
	stockOrderBill4cld: {
		init: {
			// 数量
			amount: 'busUnitInAmount',
			// 非税单价
			price: 'price',
			// 非税金额
			sumPrice: 'inMoney',
			// 含税单价
			priceWithTax: 'taxPrice',
			// 含税金额
			sumPriceWithTax: 'inMoneyWithTax',
			// 税率
			taxes: 'tax',
			// 税额
			taxMoney: 'taxInMoney'
		}
	},
	// 中心采购入库单
	stockInBill4cld: {
		init: {
			// 数量
			amount: 'busUnitInAmount',
			// 非税单价
			price: 'price',
			// 不含运费非税金额
			sumNoTransPrice: 'noTransMoney',
			// 非税金额
			sumPrice: 'inMoney',
			// 含税单价
			priceWithTax: 'taxPrice',
			// 不含运费含税金额
			sumNoTransPriceWithTax: 'noTransInTaxesMoney',
			// 含税金额
			sumPriceWithTax: 'inMoneyWithTax',
			// 税率
			taxes: 'tax',
			// 税额
			taxMoney: 'taxInMoney'
		},
		// 赠送
		giftChange (item) {
			if (item.giftFlag) {
				item.price = 0
				item.noTransMoney = 0
				item.inMoney = 0
				item.taxPrice = 0
				item.noTransInTaxesMoney = 0
				item.inMoneyWithTax = 0
				item.tax = 0
				item.taxInMoney = 0
			}
		}
	},
	// 中心盘点单
	centerCheckBill4cld: {
		init: {
			// 数量
			amount: 'busFactAmount1',
			assistUnitAmount: 'assistFactAmount'
		},
		// 计算辅助数量
		computeAssistAmount (row) {
			row.assistFactAmount = amountFixed(row.busFactAmount1 / row.assistUnitRatio)
		},
		// 计算差异数量
		// 差异数量 = 最小单位实盘数量 -  最小单位账存数量
		computeDiffAmount (row) {
			row.busDiffAmount = amountFixed(row.busFactAmount1 - row.busBillAmount1)
		},
		computeDiffAmount2 (row) {
			row.busDiffAmount2 = amountFixed(row.busFactAmount2 - row.busBillAmount2)
		},
		computeDiffAssistAmount (row) {
			row.assistDiffAmount = amountFixed(row.assistFactAmount - row.assistBillAmount)
		}
	}
}
