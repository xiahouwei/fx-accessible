export default {
	// 状态命名
	stateName: {
		all: '全部',
		unCheck: '待审核',
		returned: '被退回',
		checked: '已审核',
		unSubmit: '待提交',
		rechecked: '已复审',
		unRechecked: '未复审',
		cancelRechecked: '取消复审',
		unSorting: '待分拣',
		sorting: '分拣中',
		sorted: '已分拣',
		agreed: '已同意',
		noSend: '不能发单',
		notYetSend: '尚未发单',
		send: '已发单',
		delivered: '已发货',
		revoke: '已撤销',
		unWeight: '未称重',
		waitWeight: '待称重',
		weighting: '称重中',
		hasWeight: '已称重',
		finished: '已完成',
		deliverying: '发货中',
		received: '已收货确认'
	},
	// 机构类型 0:门店, 1:中心, 2:区域, 3:企业
	loginerOrganType: {
		shop: '0',
		center: '1',
		area: '2',
		ent: '3'
	},
	// 通用状态-云供应链版 0:全部, 1:已提交, 2:被退回, 3.已审核, 4.待提交
	stateCld: {
		all: '0',
		unCheck: '1',
		returned: '2',
		checked: '3',
		unSubmit: '4'
	},
	// 通用复审状态
	reState: {
		all: null,
		unRecheck: '0',
		rechecked: '1'
	},
	stateAndRecheckCld: {
		all: '0',
		unCheck: '1',
		returned: '2',
		checked: '3',
		unSubmit: '4',
		unRecheck: '5',
		rechecked: '6'
	},
	// 云供应链有的单据使用, 审核, 复审状态合并到一个字段
	stateAndRecheckSingleCld: {
		all: '0',
		unCheck: '1',
		returned: '2',
		checked: '3',
		unSubmit: '4',
		rechecked: '5',
		cancelRechecked: '6'
	},
	// 分拣状态-云供应链 0: 待分拣, 1: 分拣中, 2:已分拣
	sortingState: {
		unSorting: '0',
		sorting: '1',
		sorted: '2'
	},
	// 发单状态-云供应链 1：不能发单，2：尚未发单，3：已发单，4：已同意，5：已退回，6：已发货，7：已撤销
	sendStateCld: {
		noSend: '1',
		notYetSend: '2',
		send: '3',
		agreed: '4',
		returned: '5',
		delivered: '6',
		revoke: '7'
	},
	// 称重状态-云供应链
	weightStateCld: {
		all: null,
		unWeight: '0',
		waitWeight: '1',
		weighting: '2',
		hasWeight: '3'
	}
}
