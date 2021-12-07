// 启用的权限角色
const permissionRoleList = {
	// 1.门店订货单
	shopOrderBill: {
		view: '查看门店订货单',
		add: '新增门店订货单',
		batch: '批量设置门店订货单',
		check: '审核门店订货单',
		copy: '复制门店订货单',
		del: '删除门店订货单',
		goodsSize: '查看规格',
		modifyBusinessDate: '修改业务日期',
		reCheck: '复审门店订货单',
		save: '编辑门店订货单',
		unCheck: '反审门店订货单',
		unReCheck: '取消复审门店订货单',
		urgentOrder: '门店订货单允许加急订货',
		attachFlag: '门店订货单启用附属关系',
		importCommonGoods: '导入常订品项',
		smartOrder: '智能订货',
		sysArriveDateNull: '门店订货单到货日期默认为空（采购订货单同理）',
		showReferenceMoney: '显示参考金额'
	},
	// 2.统配入库单
	distributionInBill: {
		view: '查看统配入库单',
		add: '新增统配入库单',
		check: '审核统配入库单',
		save: '编辑统配入库单',
		unCheck: '反审统配入库单',
		delete: '删除统配入库单',
		createRtn: '生成统配退货单',
		weighState: '单据下发/取消/结束称重',
		seenotaxmoney: '查看非税金额',
		seeprice: '查看单价',
		seetax: '查看税率',
		seetaxmoney: '查看税额',
		seewithtaxmoney: '查看含税金额',
		modifyAmount: '修改数量',
		delDetail: '删除明细',
		checkAndAccept: '验收',
		quickAccess: '快速领用'
	},
	// 3.直送入库单
	shopDirectInBill: {
		view: '查看直送入库单',
		check: '审核直送入库单',
		createRtn: '生成直送退货单',
		weighState: '单据下发/取消/结束称重',
		ediTax: '编辑税率',
		editNoTaxMoney: '编辑非税金额',
		editPrice: '编辑单价',
		editWithTaxMoney: '编辑含税金额',
		modifyAmount: '修改入库数量',
		save: '编辑直送入库单',
		seeNoTaxMoney: '查看非税金额',
		seePrice: '查看单价',
		seeTax: '查看税率',
		seeTaxMoney: '查看税额',
		seeWithTaxMoney: '查看含税金额',
		unCheck: '反审直送入库单',
		quickAccess: '快速领用'
	},
	// 4.直通入库单 (这里后端有个权限shopStraightInBill.ediPrice写错了,应该是editPrice)
	shopStraightInBill: {
		view: '查看直通入库单',
		check: '审核直通入库单',
		createRtn: '生成直通退货单',
		weighState: '单据下发/取消/结束称重',
		ediTax: '编辑税率',
		editNoTaxMoney: '编辑非税金额',
		ediPrice: '编辑单价',
		editWithTaxMoney: '编辑含税金额',
		editAmount: '修改入库数量',
		save: '编辑直通入库单',
		unCheck: '反审直通入库单',
		quickAccess: '快速领用'
	},
	// 5.调拨申请单
	shopMoveApplyBill: {
		view: '查看门店调拨申请单',
		add: '新增门店调拨申请单',
		check: '审核门店调拨申请单',
		save: '编辑门店调拨申请单',
		unCheck: '反审门店调拨申请单',
		delete: '删除门店调拨申请单',
		checkRegion: '限制门店同区域才允许调拨'
	},
	// 6.盘点单
	shopCheckBill: {
		add: '新增盘点单',
		view: '查看盘点单',
		check: '审核盘点单',
		save: '保存盘点单',
		unCheck: '反审盘点单',
		rdCheck: '复审盘点单',
		unReCheck: '取消复审盘点单',
		weighState: '单据下发/取消/结束称重',
		del: '删除盘点单',
		refreshAccounts: '刷新账存',
		seeCheckMoney: '查看实盘金额',
		seeMoney: '查看账存金额',
		seeAmount: '查看账存数量',
		seeDiffAmount: '查看差异数量',
		seeCheckOutMoney: '查看盘亏金额',
		modifyCheckDate: '修改盘点日期',
		bomCheck: '按bom盘点'
	},
	// 7.直送退货单
	shopDirectRtnBill: {
		view: '查看直送退货单',
		add: '新增直送退货单',
		check: '审核直送退货单',
		del: '删除直送退货单',
		save: '保存直送退货单',
		unCheck: '反审直送退货单',
		billType: '单据类型必选'
	},
	// 8.采购入库单
	shopStockInBill: {
		add: '新增采购入库单',
		view: '查看采购入库单',
		check: '审核采购入库单',
		save: '保存采购入库单',
		del: '删除采购入库单',
		unCheck: '反审采购入库单',
		reCheck: '复审采购入库单',
		unReCheck: '取消复审采购入库单',
		weighState: '单据下发/取消/结束称重',
		editAmount: '编辑数量',
		seeWithTaxMoney: '查看含税金额',
		editWithTaxMoney: '编辑含税金额',
		editNoTaxMoney: '编辑非税金额',
		seeNoTaxMoney: '查看非税金额',
		seePrice: '查看单价',
		editPrice: '编辑单价',
		seeTaxMoney: '查看税额',
		editTax: '编辑税率',
		agree: 'EDI价格',
		billMemoRequired: '备注必填', // 碧桂园版本
		batchSetProducedate: '批量设置生产日期',
		quickAccess: '快速领用'
	},
	// 9.采购申请单
	stockApplyBill: {
		add: '新增采购申请单',
		view: '查看采购申请单',
		copy: '复制采购申请单',
		check: '审核采购申请单',
		save: '保存采购申请单',
		del: '删除采购申请单',
		unCheck: '反审采购申请单',
		modifyBusinessDate: '修改业务日期',
		reduce: '减单'
	},
	// 10.调拨入库单
	shopMoveInBill: {
		view: '查看调拨入库单',
		check: '审核调拨入库单',
		save: '保存调拨入库单',
		unCheck: '反审调拨入库单'
	},
	// 11.调拨出库单
	shopMoveOutBill: {
		add: '新增调拨出库单',
		view: '查看调拨出库单',
		check: '审核调拨出库单',
		save: '保存调拨出库单',
		delete: '删除调拨出库单',
		unCheck: '反审调拨出库单',
		weighState: '单据下发/取消/结束称重',
		editAmount: '编辑调拨数量',
		editMoney: '调拨非税金额',
		editPrice: '编辑调拨单价',
		editTaxMoney: '编辑调拨含税金额',
		editTax: '编辑税率'
	},
	// 12.统配出库单
	distributionOutBill: {
		add: '新增统配出库单',
		view: '查看统配出库单',
		check: '审核统配出库单',
		save: '保存统配出库单',
		del: '删除统配出库单',
		unCheck: '反审统配出库单',
		billWeighState: '单据下发/取消/结束称重',
		seeNoTaxMoney: '查看非税金额',
		seePrice: '查看单价',
		seeTax: '查看税率',
		seeTaxMoney: '查看税额',
		seeWithTaxMoney: '查看含税金额',
		costPrice: '成本单价',
		costMoney: '查看成本金额',
		reCheck: '复审统配出库单',
		unReCheck: '取消复审统配出库单'
	},
	// 13.其他出库单
	otherOutBill: {
		add: '新增其他出库单',
		view: '查看其他出库单',
		check: '审核其他出库单',
		save: '保存其他出库单',
		del: '删除其他出库单',
		unCheck: '反审其他出库单',
		reCheck: '复审其他出库单',
		weighState: '单据下发/取消/结束称重',
		unReCheck: '取消复其他出库单'
	},
	// 14.采购订货单
	stockOrderBill: {
		add: '新增采购订货单',
		view: '查看采购订货单',
		check: '审核采购订货单',
		save: '保存采购订货单',
		del: '删除采购订货单',
		unCheck: '反审采购订货单',
		copy: '复制采购订货单',
		sendbilltosupplieredi: '发送单据至供货商EDI',
		zctaxinmoney: '查看自采税额',
		zcincostmoney: '查看自采非税金额',
		editzcincostmoney: '编辑自采非税金额',
		zcinmoneywithtax: '查看自采含税金额',
		editzcinmoneywithtax: '编辑自采含税金额',
		zctaxrate: '查看自采税率',
		editzctaxrate: '编辑自采税率',
		zcprice: '查看自采单价',
		editzcunitprice: '编辑自采单价',
		zpincostmoney: '查看直配非税金额',
		editzpincostmoney: '编辑直配非税金额',
		zpinmoneywithtax: '查看直配含税金额',
		editzpinmoneywithtax: '编辑直配含税金额',
		zpprice: '查看直配单价',
		editzpunitprice: '编辑直配单价',
		zptaxinmoney: '查看直配税额',
		zptaxrate: '查看直配税率',
		editzptaxrate: '编辑直配税率',
		editzpcount: '编辑直配数量',
		recallbillfromedi: '从供货商EDI撤回单据'
	},
	// 15.部门领用单
	departmentReceiveBill: {
		add: '新增部门领用单',
		view: '查看部门领用单',
		check: '审核部门领用单',
		save: '保存部门领用单',
		del: '删除部门领用单',
		unCheck: '反审部门领用单',
		reCheck: '复审部门领用单',
		unReCheck: '取消复审部门领用单',
		weighState: '单据下发/取消/结束称重',
		departmentBOM: '按BOM领用',
		editAmount: '编辑数量"'
	},
	// 16.外销出库单
	salesOutBill: {
		view: '查看外销出库单',
		del: '删除外销出库单',
		add: '新增外销出库单',
		save: '保存外销出库单',
		check: '审核外销出库单',
		unCheck: '反审外销出库单',
		reCheck: '复审外销出库单',
		unReCheck: '取消复审外销出库单',
		weighState: '单据下发/取消/结束称重',
		editNoTaxMoney: '编辑非税金额',
		editWithTaxMoney: '编辑含税金额',
		editTax: '编辑税率',
		ediPrice: '编辑单价'
	},
	// 17.采购申请分派
	stockApplySend: {
		add: '分派',
		del: '不分派',
		save: '保存'
	},
	// 18.报损单
	breakBill: {
		add: '新增报损单',
		view: '查看报损单',
		check: '审核报损单',
		save: '保存报损单',
		del: '删除报损单',
		bomBreak: '按BOM报损',
		unCheck: '反审报损单'
	},
	// 19.中心统配出库单-云供应链
	distributionOutBill4cld: {
		view: '查看统配出库单',
		add: '新增统配出库单',
		save: '保存统配出库单',
		del: '删除统配出库单',
		delDetail: '删除明细',
		submit: '提交单据',
		drawback: '退回单据',
		check: '审核统配出库单',
		unCheck: '反审统配出库单',
		copy: '复制单据',
		seePriceMoney: '可见单价金额',
		editBatchCode: '修改批次号',
		reCheck: '复审统配出库单',
		unReCheck: '取消复审统配出库单',
		editFreight: '修改单据运费',
		inputMultipleDetails: '允许同一个仓库录入相同的品项',
		sortingState: '允许查看分拣状态',
		sorting: '允许分拣'
	},
	// 20.内部调拨单
	insideMoveBill: {
		view: '查看内部调拨单',
		add: '新增内部调拨单',
		check: '审核内部调拨单',
		save: '编辑内部调拨单',
		unCheck: '反审内部调拨单',
		reCheck: '复审内部调拨单',
		unReCheck: '取消复审内部调拨单',
		del: '删除内部调拨单',
		weighState: '单据下发/取消/结束称重',
		modifyUnit: '修改内部调拨单单位',
		insideMoveBOM: '按BOM调拨',
		editAmount: '修改数量'
	},
	// 21.中心外销出库单-云供应链
	salesOutBill4cld: {
		view: '查看外销出库单',
		add: '新增外销出库单',
		addDetail: '新增明细',
		save: '保存外销出库单',
		del: '删除外销出库单',
		delDetail: '删除明细',
		submit: '提交单据',
		drawback: '退回单据',
		check: '审核外销出库单',
		unCheck: '反审外销出库单',
		copy: '复制单据',
		seeCostPriceMoney: '可见成本单价金额',
		seeSalePriceMoney: '可见销售单价金额',
		editSalePriceMoney: '修改销售单价金额',
		reCheck: '复审外销出库单',
		unReCheck: '取消复审外销出库单',
		inputMultipleDetails: '允许同一个仓库录入相同的品项'
	},
	// 22.统配退货单
	uniformDistributionRtnBill: {
		add: '新增统配退货单',
		view: '查看统配退货单',
		check: '审核统配退货单',
		save: '保存统配退货单',
		del: '删除统配退货单',
		unCheck: '反审统配退货单',
		reCheck: '复审统配退货单',
		unRecheck: '取消复审统配退货单',
		weighState: '单据下发/取消/结束称重',
		taxOutmoney: '查看含税金额',
		noTaxOutmoney: '查看非税金额',
		seePrice: '查看单价',
		taxAmount: '查看税额',
		taxRete: '查看税率'
	},
	// 23.采购订货单
	stockOrderBill4cld: {
		view: '查看中心采购订货单',
		add: '新增中心采购订货单',
		save: '保存中心采购订货单',
		del: '删除中心采购订货单',
		delDetail: '删除审核中心采购订货单明细',
		submit: '提交审核中心采购订货单',
		drawback: '退回审核中心采购订货单',
		check: '审核中心采购订货单',
		unCheck: '反审中心采购订货单',
		copy: '复制中心采购订货单',
		inputMultipleDetails: '允许同一个仓库录入相同的品项',
		canSeeMoney: '可见单价金额',
		allowModifyMoney: '可修改单价金额',
		sendToEDI: '发单到EDI',
		modifySupplier: '允许修改供货商',
		clear: '更换供货商清空品项',
		changeOrgan: '允许修改采购机构',
		changeBusDate: '允许修改业务日期',
		changeArrivalDate: '允许修改到货日期',
		changeBillType: '允许修改单据类型',
		priceInTax: '启用价内税',
		dayNum: '采购到货时间间隔小时:24'
	},
	// 24.菜品留样
	foodSamplBill: {
		save: '保存菜品留样单',
		del: '删除菜品留样单',
		process: '处理菜品留样单',
		cancelprocess: '取消处理菜品留样单',
		print: '打印'
	},
	// 25.中心采购入库单
	stockInBill4cld: {
		view: '查看中心采购入库单',
		add: '新增中心采购入库单',
		save: '保存中心采购入库单',
		del: '删除中心采购入库单',
		delDetail: '删除中心采购入库单明细',
		submit: '提交中心采购入库单',
		drawback: '退回中心采购入库单',
		check: '审核中心采购入库单',
		unCheck: '反审中心采购入库单',
		copy: '复制中心采购入库单',
		reCheck: '复审中心采购入库单',
		unReCheck: '取消复审中心采购入库单',
		weighState: '单据下发/取消/结束称重',
		inputMultipleDetails: '允许同一个仓库录入相同的品项',
		canSeeMoney: '可见单价金额',
		modifySupplier: '允许修改供货商',
		changeOrgan: '允许修改采购机构',
		changeBusDate: '允许修改业务日期',
		changeBillType: '允许修改单据类型'
	},
	// 26.门店直通退货单
	shopStraightRtnBill: {
		add: '新增统配退货单',
		view: '查看统配退货单',
		check: '审核统配退货单',
		save: '保存统配退货单',
		del: '删除统配退货单',
		unCheck: '反审统配退货单',
		reCheck: '复审统配退货单'
	},
	// 27.加工单
	carBill: {
		add: '新增加工单',
		view: '查看加工单',
		check: '审核加工单',
		save: '保存加工单',
		del: '删除加工单',
		unCheck: '反审加工单',
		addDetail: '新增明细',
		delDetail: '删除明细',
		modifyProductAmount: '修改产出数量',
		weighState: '下发称重'
	},
	// 28.中心盘点单
	centerCheckBill4cld: {
		view: '查看盘点单',
		add: '新增盘点单',
		save: '保存盘点单',
		del: '删除盘点单',
		delDetail: '删除盘点单明细',
		submit: '提交盘点单',
		drawback: '退回盘点单',
		check: '审核盘点单',
		unCheck: '反审盘点单',
		copy: '复制盘点单',
		reCheck: '复审盘点单',
		unReCheck: '取消复审盘点单',
		notAllAddDetail: '不允许新增品项',
		importMustItems: '导入必盘品项',
		importCheckItems: '导入盘点品项',
		uploadFiles: '上传附件',
		actualAmountZero: '品项实盘数量置为0',
		actualAmountEqualsAcc: '品项实盘数量置为账存数量'
	},
	// 29.中心盘盈单
	centerCheckIn4cld: {
		view: '查看',
		add: '新增',
		save: '保存',
		del: '删除单据',
		submit: '提交单据',
		drawback: '退回单据',
		check: '审核',
		unCheck: '反审',
		reCompute: '重算',
		reStoreBill: '单据还原',
		canSeeMoney: '可见单价金额'
	},
	// 30.中心盘亏单
	centerCheckOut4cld: {
		view: '查看',
		add: '新增',
		save: '保存',
		del: '删除单据',
		submit: '提交单据',
		drawback: '退回单据',
		check: '审核',
		unCheck: '反审',
		reCompute: '重算',
		reStoreBill: '单据还原',
		canSeeMoney: '可见单价金额'
	},
	// 31.菜品预估单
	foodReckonBill: {
		view: '查看外销出库单',
		del: '删除外销出库单',
		add: '新增外销出库单',
		save: '保存外销出库单',
		check: '审核外销出库单',
		unCheck: '反审外销出库单',
		createOrder: '生成门店订货单'
	},
	// 32.采购退货单
	shopReturnBill: {
		view: '查看采购退货单',
		add: '新增采购退货单',
		check: '审核采购退货单',
		del: '删除采购退货单',
		save: '保存采购退货单',
		unCheck: '反审采购退货单',
		reCheck: '复审采购退货单',
		unReCheck: '取消复审采购退货单',
		seePrice: '查看自采单价',
		seeNoTaxMoney: '查看自采非税金额',
		seeWithTaxMoney: '查看自采含税金额',
		seeTax: '查看自采税率',
		seeTaxMoney: '查看自采税额'
	}
}

export default permissionRoleList
