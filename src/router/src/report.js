export default [
	// 进销存报表
	{
		path: '/reportKc011',
		name: 'reportKc011',
		component: () => import(/* webpackChunkName: "reportKc011" */'@/views/reportForm/report-kc011')
	},
	// 当前库存报表
	{
		path: '/reportKc010',
		name: 'reportKc010',
		component: () => import(/* webpackChunkName: "reportKc010" */'@/views/reportForm/report-kc010')
	},
	// 中心库存价格查询表
	{
		path: '/reportDp090',
		name: 'reportDp090',
		component: () => import(/* webpackChunkName: "reportKc010" */'@/views/reportForm/report-dp090')
	},
	// 仓库原料用量差异分析
	{
		path: '/reportCb070',
		name: 'reportCb070',
		component: () => import(/* webpackChunkName: "reportCb070" */'@/views/reportForm/report-cb070')
	},
	// 门店订货报表
	{
		path: '/reportDp080',
		name: 'reportDp080',
		component: () => import(/* webpackChunkName: "reportDp080" */'@/views/reportForm/report-dp080')
	},
	// 中心当前结存表
	{
		path: '/reportDqjcb4cld',
		name: 'reportDqjcb4cld',
		component: () => import(/* webpackChunkName: "reportDqjcb4cld" */'@/views/reportForm/report-dqjcb4cld')
	}
]
