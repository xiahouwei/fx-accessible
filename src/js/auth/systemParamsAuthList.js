const systemParamsAuthList = {
	// 直送入库单
	shopDirectInBill: {
		editBusinessDate: '修改业务日期',
		checkPrice: '校验价格是否为零',
		modifyCode: '编辑手工单号'
	},
	// 调拨申请单
	shopMoveApplyBill: {
		selectGoodsByPlan: '按照调入方的门店订货方案选择品项',
		editWorkDate: '编辑门店调拨申请单业务日期',
		shopMoveOutAdd: '允许调出方主动新增',
		limitOrgan: '限制同级别机构间才允许调拨'
	},
	// 统配入库单
	distributionInBill: {
		modifyUnit: '修改单位',
		modifyWorkDate: '修改业务日期',
		SysOpenAcceptGroup: '是否开启分组验收'
	},
	// 部门领用单
	departmentReceiveBill: {
		viewSubject: '查看科目'
	},
	// 门店订货单
	shopOrderBill: {
		sysOrderGoodsAttachPlan: '门店订货单是否开启附属物',
		SysSmartOrderRefShop: '参考其他门店”',
		SysShopOrderViewHouses: '主页面是否显示订货仓库(采购入库单同理)',
		directSelectSup: '直送品项编辑期望供货商(小尾羊专属)'
	},
	// 采购订货单
	stockOrderBill: {
		sysstockordermodifyunit: '采购订货单是否允许修改单位'
	},
	// 统配出库单
	distributionOutBill: {
		sysMultiOutHouseForTPC: '统配出库单是否可以实现多个出库仓库',
		seeExpressFlag: '显示加急标志',
		seeBillType: '显示单据类型',
		seePieceAmount: '显示件数',
		seeFreight: '显示运费',
		noEnoughAmount: '库存不足发货'
	},
	// 盘点单
	shopCheckBill: {
		defaultPlan: '新增盘点单默认盘点方案',
		showUnit2column: '盘点方案是否设置双单位',
		viewSync: '同步,仅海底捞显示'
	},
	// 采购入库单
	shopStockInBill: {
		sysStockProductionDate: '开启保质期的品项是否必须填写生产日期',
		SysEnableAutoShopInAddDetail: '自动生成的入库单点是否可以新增明细'
	},
	// 加工单
	carBill: {
		sysCarBillChangeAmount: '投料数量是否根据产出数量变动',
		SysDefaultDate: '生产日期置默认值'
	}
}

export default systemParamsAuthList
