import STATE_MODULE from '@/config/state_config.js'
const stateNames = STATE_MODULE['stateName']
export default {
	// 审核状态
	checkState: {
		name: '审核状态',
		actions: [
			{ id: null, name: stateNames['all'] },
			{ id: '0', name: stateNames['unSubmit'], type: 'danger' },
			{ id: '1', name: stateNames['checked'], type: 'success' }
		]
	},
	// 复审状态
	recheckState: {
		name: '复审状态',
		actions: [
			{ id: null, name: '全部' },
			{ id: '0', name: '未复审', type: 'success' },
			{ id: '1', name: '已复审', type: 'success' }
		]
	},
	// 审核状态-云供应链版
	checkStateCld: {
		name: '审核状态',
		actions: [
			{ id: '0', name: stateNames['all'] },
			{ id: '4', name: stateNames['unSubmit'], type: 'danger' },
			{ id: '1', name: stateNames['unCheck'], type: 'primary' },
			{ id: '2', name: stateNames['returned'], type: 'danger' },
			{ id: '3', name: stateNames['checked'], type: 'success' }
		]
	},
	// 审核/复审状态-云供应链版
	checkAndRecheckStateCld: {
		name: '审核状态',
		actions: [
			{ id: '0', state: '0', rescheck: null, name: stateNames['all'] },
			{ id: '4', state: '4', rescheck: null, name: stateNames['unSubmit'], type: 'danger' },
			{ id: '1', state: '1', rescheck: null, name: stateNames['unCheck'], type: 'primary' },
			{ id: '2', state: '2', rescheck: null, name: stateNames['returned'], type: 'danger' },
			{ id: '3', state: '3', rescheck: null, name: stateNames['checked'], type: 'success' },
			{ id: '5', state: '0', rescheck: '0', name: stateNames['unRechecked'], type: 'success' },
			{ id: '6', state: '0', rescheck: '1', name: stateNames['rechecked'], type: 'success' }
		]
	},
	checkAndRecheckStateSingle: {
		name: '审核状态',
		actions: [
			{ id: '0', name: stateNames['all'] },
			{ id: '1', name: stateNames['unCheck'], type: 'primary' },
			{ id: '2', name: stateNames['returned'], type: 'danger' },
			{ id: '3', name: stateNames['checked'], type: 'success' },
			{ id: '4', name: stateNames['unSubmit'], type: 'danger' },
			{ id: '5', name: stateNames['rechecked'], type: 'success' },
			{ id: '6', name: stateNames['cancelRechecked'], type: 'success' }
		]
	},
	// 分拣状态-云供应链
	sortingStateCld: {
		name: '分拣状态',
		actions: [
			{ id: null, name: stateNames['all'] },
			{ id: '0', name: stateNames['unSorting'], type: 'danger' },
			{ id: '1', name: stateNames['sorting'], type: 'primary' },
			{ id: '2', name: stateNames['sorted'], type: 'success' }
		]
	},
	// 发单状态-云供应链
	ediSendStateCld: {
		name: 'EDI状态',
		actions: [
			{ id: '0', name: stateNames['all'] },
			{ id: '1', name: stateNames['noSend'], type: 'danger' },
			{ id: '2', name: stateNames['notYetSend'], type: 'danger' },
			{ id: '3', name: stateNames['send'], type: 'success' },
			{ id: '4', name: stateNames['agreed'], type: 'success' },
			{ id: '5', name: stateNames['returned'], type: 'danger' },
			{ id: '6', name: stateNames['delivered'], type: 'success' },
			{ id: '7', name: stateNames['revoke'], type: 'danger' },
			{ id: '103', name: stateNames['finished'], type: 'success' },
			{ id: '110', name: stateNames['deliverying'], type: 'success' },
			{ id: '111', name: stateNames['received'], type: 'success' }
		]
	},
	// 称重状态-云供应链
	weightStateCld: {
		name: '称重状态',
		actions: [
			{ id: null, name: stateNames['all'] },
			{ id: '0', name: stateNames['unWeight'], type: 'danger' },
			{ id: '1', name: stateNames['waitWeight'], type: 'danger' },
			{ id: '2', name: stateNames['weighting'], type: 'danger' },
			{ id: '3', name: stateNames['hasWeight'], type: 'success' }
		]
	}
}
