export const REPORT_FORM_MODULE = [{
	id: 'kc010',
	label: '当前库存报表',
	icon: require('@/assets/images/icon/index-icon/icon-index-report-kc010.png'),
	path: '/reportKc010',
	auth: 'kc010',
	visible: false,
	searchColumsKey: ['goodName'],
	columnCount: ['amount', 'unCheckAmount', 'totalAmount'],
	columnPrice: ['money', 'price'],
	columnImage: ['lookPicture'],
	responseKey: 'mbStoreReportData'
}, {
	id: 'kc011',
	label: '进销存汇总表',
	icon: require('@/assets/images/icon/index-icon/icon-index-report-kc010.png'),
	path: '/reportKc011',
	auth: 'kc011',
	visible: false,
	searchColumsKey: ['goodName'],
	columnCount: ['qcAmount', 'inAmount', 'notCheckInAmount', 'outAmount', 'notCheckOutAmount', 'jyAmount', 'notCheckJyAmount'],
	columnPrice: ['qcMoney', 'inPrice', 'inMoney', 'outPrice', 'outMoney', 'jyMoney'],
	columnImage: ['lookPicture'],
	responseKey: 'mbStoreReportData'
}, {
	id: 'dp090',
	label: '中心库存价格查询表',
	icon: require('@/assets/images/icon/index-icon/icon-index-report-kc011.png'),
	path: '/reportDp090',
	auth: 'dp090',
	visible: false,
	searchColumsKey: ['goodsName'],
	columnCount: ['amount'],
	columnPrice: ['price', 'taxPrice', 'averagePrice', 'averagePriceWithTax'],
	columnImage: ['lookPicture'],
	responseKey: 'mbStoreReportData'
}, {
	id: 'cb070',
	label: '仓库原料用量差异分析',
	icon: require('@/assets/images/icon/index-icon/icon-index-report-dp070.png'),
	path: '/reportCb070',
	auth: 'cb070',
	visible: false,
	searchColumsKey: ['goodName'],
	columnCount: ['lastTimeAmount', 'inAmoutTotleAmount', 'returnAmount', 'removeInAmount', 'removeOutAmount', 'lastStockAmont', 'realExpendAmount', 'theoryExpendAmount', 'expendAmountDifference', 'offSetOutAmount', 'reportedLossAmount', 'otherInAmount', 'otherOutAmount', 'salesOutAmount', 'salesRtnAmount', 'lessAmount', 'overageAmount', 'theoryStockAmount'],
	columnPrice: ['lastTimeMoney', 'inAmoutTotleMoney', 'returnMoney', 'removeInMoney', 'removeOutMoney', 'lastStockMoney', 'realExpendMoney', 'theoryExpendMoney', 'expendMoneyDifference', 'offSetOutMoney', 'reportedLossMoney', 'otherInMoney', 'otherOutMoney', 'salesOutMoney', 'salesRtnMoney', 'lessMoney', 'overageMoney', 'theoryStockMoney', 'consumeDay'],
	columnImage: ['lookPicture'],
	responseKey: 'mbCostReportData'
}, {
	id: 'dp080',
	label: '门店订货报表',
	icon: require('@/assets/images/icon/index-icon/icon-index-report-kc011.png'),
	path: '/reportDp080',
	auth: 'dp080',
	visible: false,
	searchColumsKey: ['goodsName'],
	columnCount: ['busUnitAmount'],
	responseKey: 'dp080ReportData'
}, {
	id: 'ZXKC_100010',
	label: '中心当前结存表',
	icon: require('@/assets/images/icon/index-icon/icon-index-report-kc010.png'),
	path: '/reportDqjcb4cld',
	auth: 'dqjcb4cld',
	visible: false,
	searchColumsKey: ['shopName', 'storeName', 'dlName', 'lbName', 'itemName'],
	columnCount: ['jCCurrentAmount', 'aJCCurrentAmount', 'jCLastAmount', 'sumInNum', 'sumOutNum', 'checkProfitAmount', 'checkLossesAmount', 'noExamineCGinAmount', 'noExamineQTinAmount', 'noExamineWXoutAmount', 'noExamineTPoutAmount', 'noExamineQToutAmount', 'canUserAmount', 'jCCurrentMoney', 'jCCurrentTaxMoney', 'jCLastMoney', 'jCLastTaxMoney', 'sumInMoney', 'sumInTaxMoney', 'sumOutMoney', 'sumOutTaxMoney', 'checkProfitMoney', 'checkProfitTaxMoney', 'checkLossesMoney', 'checkLossesTaxMoney']
}]

export const REPORT_TYPE_EXTEND = [{
	// 新荣记
	id: 'XRJ',
	reg: /xinrongji/,
	report: [{
		id: 'dp090',
		label: '采购中心库存价格查询表'
	}]
}]
