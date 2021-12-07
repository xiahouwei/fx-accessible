// 项目通用类型设置
export const COMMON_TYPE_CONFIG = {
	// 未盘品项处理方式
	notCheckType: [{
		type: 'same',
		id: 1,
		name: '实盘不变'
	}, {
		type: 'zero',
		id: 2,
		name: '实盘结零'
	}],
	// 盘点方式
	checkWay: [{
		type: 'split',
		id: 0,
		name: '分批'
	}, {
		type: 'blending',
		id: 1,
		name: '合批'
	}],
	// 成本类型
	costType: [{
		type: 'all',
		id: null,
		name: '全部'
	}, {
		type: 'cost',
		id: 0,
		name: '成本'
	}, {
		type: 'zero',
		id: 1,
		name: '费用'
	}]
}
