import reportRouterConfig from './src/report.js'
export default [
	...reportRouterConfig,
	{
		path: '/',
		redirect: 'login'
	}, {
		path: '/login',
		name: 'login',
		component: () => import(/* webpackChunkName: "login" */'@/views/login/Index.vue')
	}, {
		path: '/main',
		component: () => import(/* webpackChunkName: "main" */'@/views/main/Index.vue'),
		children: [
			{
				path: '/',
				redirect: 'home'
			}, {
				path: 'home',
				name: 'home',
				component: () => import(/* webpackChunkName: "main" */'@/views/main/src/Home.vue'),
				meta: {
					tabIndex: 0
				}
			}, {
				path: 'report',
				name: 'report',
				component: () => import(/* webpackChunkName: "main" */'@/views/main/src/Report.vue'),
				meta: {
					tabIndex: 2
				}
			}
		]
	}, {
		path: '/shopOrder',
		name: 'shopOrder',
		component: () => import(/* webpackChunkName: "shopOrder" */'@/views/shopOrder/Index.vue'),
		meta: {
			keepAlive: true
		}
	}, {
		path: '/createShopOrder',
		name: 'createShopOrder',
		component: () => import(/* webpackChunkName: "shopOrder" */'@/views/shopOrder/CreateOrder.vue')
	}, {
		path: '/shopOrderDetails',
		name: 'shopOrderDetails',
		component: () => import(/* webpackChunkName: "shopOrder" */'@/views/shopOrder/OrderDetails.vue')
	}, {
		path: '/unifyOrder',
		name: 'unifyOrder',
		component: () => import(/* webpackChunkName: "unifyOrder" */'@/views/unifyOrder/Index.vue'),
		meta: {
			keepAlive: true
		}
	}, {
		path: '/unifyOrderDetails',
		name: 'unifyOrderDetails',
		component: () => import(/* webpackChunkName: "shopOrder" */'@/views/unifyOrder/OrderDetails.vue')
	}, {
		path: '/directOrder',
		name: 'directOrder',
		component: () => import(/* webpackChunkName: "directOrder" */'@/views/directOrder/Index.vue'),
		meta: {
			keepAlive: true
		}
	}, {
		path: '/directOrderDetails',
		name: 'directOrderDetails',
		component: () => import(/* webpackChunkName: "directOrder" */'@/views/directOrder/OrderDetails.vue')
	}, {
		path: '/sendOrder',
		name: 'sendOrder',
		component: () => import(/* webpackChunkName: "sendOrder" */'@/views/sendOrder/Index.vue'),
		meta: {
			keepAlive: true
		}
	}, {
		path: '/sendOrderDetails',
		name: 'sendOrderDetails',
		component: () => import(/* webpackChunkName: "sendOrder" */'@/views/sendOrder/OrderDetails.vue')
	}, {
		path: '/moveOrder',
		name: 'moveOrder',
		component: () => import(/* webpackChunkName: "moveOrder" */'@/views/moveOrder/Index.vue'),
		meta: {
			keepAlive: true
		}
	}, {
		path: '/moveOrderDetails',
		name: 'moveOrderDetails',
		component: () => import(/* webpackChunkName: "moveOrder" */'@/views/moveOrder/OrderDetails.vue')
	}, {
		path: '/createMoveOrder',
		name: 'createMoveOrder',
		component: () => import(/* webpackChunkName: "moveOrder" */'@/views/moveOrder/CreateOrder.vue')
	}, {
		path: '/checkBill',
		name: 'checkBill',
		component: () => import(/* webpackChunkName: "checkBill" */'@/views/checkBill/Index.vue'),
		meta: {
			keepAlive: true
		}
	}, {
		path: '/checkBillDetails',
		name: 'checkBillDetails',
		component: () => import(/* webpackChunkName: "checkBill" */'@/views/checkBill/OrderDetails.vue')
	}, {
		path: '/creatCheckBill',
		name: 'creatCheckBill',
		component: () => import(/* webpackChunkName: "checkBill" */'@/views/checkBill/CreateOrder.vue')
	}, {
		path: '/sendReturnOrder',
		name: 'sendReturnOrder',
		component: () => import(/* webpackChunkName: "sendReturnOrder" */'@/views/sendReturnOrder/Index.vue'),
		meta: {
			keepAlive: true
		}
	}, {
		path: '/createSendReturnOrder',
		name: 'createSendReturnOrder',
		component: () => import(/* webpackChunkName: "sendReturnOrder" */'@/views/sendReturnOrder/CreateOrder.vue')
	}, {
		path: '/sendReturnOrderDetails',
		name: 'sendReturnOrderDetails',
		component: () => import(/* webpackChunkName: "sendReturnOrder" */'@/views/sendReturnOrder/OrderDetails.vue')
	}, {
		path: '/stockInBill',
		name: 'stockInBill',
		component: () => import(/* webpackChunkName: "stockInBill" */'@/views/stockInBill/Index.vue'),
		meta: {
			keepAlive: true
		}
	}, {
		path: '/stockInBillDetails',
		name: 'stockInBillDetails',
		component: () => import(/* webpackChunkName: "stockInBill" */'@/views/stockInBill/OrderDetails.vue')
	}, {
		path: '/createStockInBill',
		name: 'createStockInBill',
		component: () => import(/* webpackChunkName: "stockInBill" */'@/views/stockInBill/CreateOrder.vue')
	}, {
		path: '/stockApply',
		name: 'stockApply',
		component: () => import(/* webpackChunkName: "stockApply" */'@/views/stockApply/Index.vue'),
		meta: {
			keepAlive: true
		}
	}, {
		path: '/createStockApply',
		name: 'createStockApply',
		component: () => import(/* webpackChunkName: "stockApply" */'@/views/stockApply/CreateOrder.vue')
	}, {
		path: '/stockApplyOrderDetails',
		name: 'stockApplyOrderDetails',
		component: () => import(/* webpackChunkName: "stockApply" */'@/views/stockApply/OrderDetails.vue')
	}, {
		path: '/shopMoveIn',
		name: 'shopMoveIn',
		component: () => import(/* webpackChunkName: "shopMoveIn" */'@/views/shopMoveIn/Index.vue'),
		meta: {
			keepAlive: true
		}
	}, {
		path: '/shopMoveInDetails',
		name: 'shopMoveInDetails',
		component: () => import(/* webpackChunkName: "shopMoveIn" */'@/views/shopMoveIn/OrderDetails.vue')
	}, {
		path: '/shopMoveOut',
		name: 'shopMoveOut',
		component: () => import(/* webpackChunkName: "shopMoveOut" */'@/views/shopMoveOut/Index.vue'),
		meta: {
			keepAlive: true
		}
	}, {
		path: '/shopMoveOutDetails',
		name: 'shopMoveOutDetails',
		component: () => import(/* webpackChunkName: "shopMoveOut" */'@/views/shopMoveOut/OrderDetails.vue')
	}, {
		path: '/uniformDistributionOut',
		name: 'uniformDistributionOut',
		component: () => import(/* webpackChunkName: "uniformDistributionOut" */'@/views/uniformDistributionOut/Index.vue'),
		meta: {
			keepAlive: true
		}
	}, {
		path: '/createUniformDistributionOut',
		name: 'createUniformDistributionOut',
		component: () => import(/* webpackChunkName: "uniformDistributionOut" */'@/views/uniformDistributionOut/CreateOrder.vue')
	}, {
		path: '/uniformDistributionOutDetails',
		name: 'uniformDistributionOutDetails',
		component: () => import(/* webpackChunkName: "uniformDistributionOut" */'@/views/uniformDistributionOut/OrderDetails.vue')
	}, {
		path: '/textPage',
		name: 'textPage',
		component: () => import(/* webpackChunkName: "purchaseSaleStockReport" */'@/views/textPage')
	}, {
		path: '/otherOut',
		name: 'otherOut',
		component: () => import(/* webpackChunkName: "otherOut" */'@/views/otherOut/Index.vue'),
		meta: {
			keepAlive: true
		}
	}, {
		path: '/createOtherOut',
		name: 'createOtherOut',
		component: () => import(/* webpackChunkName: "otherOut" */'@/views/otherOut/CreateOrder.vue')
	}, {
		path: '/otherOutDetails',
		name: 'otherOutDetails',
		component: () => import(/* webpackChunkName: "otherOut" */'@/views/otherOut/OrderDetails.vue')
	}, {
		path: '/stockOrder',
		name: 'stockOrder',
		component: () => import(/* webpackChunkName: "stockOrder" */'@/views/stockOrder/Index.vue'),
		meta: {
			keepAlive: true
		}
	}, {
		path: '/createStockOrder',
		name: 'createStockOrder',
		component: () => import(/* webpackChunkName: "stockOrder" */'@/views/stockOrder/CreateOrder.vue')
	}, {
		path: '/stockOrderDetails',
		name: 'stockOrderDetails',
		component: () => import(/* webpackChunkName: "stockOrder" */'@/views/stockOrder/OrderDetails.vue')
	}, {
		path: '/departmentReceive',
		name: 'departmentReceive',
		component: () => import(/* webpackChunkName: "departmentReceive" */'@/views/departmentReceive/Index.vue'),
		meta: {
			keepAlive: true
		}
	}, {
		path: '/createDepartmentReceive',
		name: 'createDepartmentReceive',
		component: () => import(/* webpackChunkName: "departmentReceive" */'@/views/departmentReceive/CreateOrder.vue')
	}, {
		path: '/departmentReceiveDetails',
		name: 'departmentReceiveDetails',
		component: () => import(/* webpackChunkName: "departmentReceive" */'@/views/departmentReceive/OrderDetails.vue')
	}, {
		path: '/salesOut',
		name: 'salesOut',
		component: () => import(/* webpackChunkName: "salesOut" */'@/views/salesOut/Index.vue'),
		meta: {
			keepAlive: true
		}
	}, {
		path: '/createSalesOut',
		name: 'createSalesOut',
		component: () => import(/* webpackChunkName: "salesOut" */'@/views/salesOut/CreateOrder.vue')
	}, {
		path: '/salesOutDetails',
		name: 'salesOutDetails',
		component: () => import(/* webpackChunkName: "salesOut" */'@/views/salesOut/OrderDetails.vue')
	}, {
		path: '/stockApplySend',
		name: 'stockApplySend',
		component: () => import(/* webpackChunkName: "stockApplySend" */'@/views/stockApplySend/Index.vue'),
		meta: {
			keepAlive: true
		}
	}, {
		path: '/stockApplySendDetails',
		name: 'stockApplySendDetails',
		component: () => import(/* webpackChunkName: "stockApplySend" */'@/views/stockApplySend/OrderDetails.vue')
	}, {
		path: '/breakBill',
		name: 'breakBill',
		component: () => import(/* webpackChunkName: "breakBill" */'@/views/breakBill/Index.vue'),
		meta: {
			keepAlive: true
		}
	}, {
		path: '/createBreakBill',
		name: 'createBreakBill',
		component: () => import(/* webpackChunkName: "breakBill" */'@/views/breakBill/CreateOrder.vue')
	}, {
		path: '/breakBillDetails',
		name: 'breakBillDetails',
		component: () => import(/* webpackChunkName: "breakBill" */'@/views/breakBill/OrderDetails.vue')
	},
	// {{{中心统配出库单
	{
		path: '/distributionOutBill4cld',
		name: 'distributionOutBill4cld',
		component: () => import(/* webpackChunkName: "distributionOutBill4cld" */'@/views/distributionOutBill4cld/Index.vue'),
		meta: {
			keepAlive: true
		}
	}, {
		path: '/createDistributionOutBill4cld',
		name: 'createDistributionOutBill4cld',
		component: () => import(/* webpackChunkName: "distributionOutBill4cld" */'@/views/distributionOutBill4cld/CreateOrder.vue')
	}, {
		path: '/distributionOutBill4cldDetails',
		name: 'distributionOutBill4cldDetails',
		component: () => import(/* webpackChunkName: "distributionOutBill4cld" */'@/views/distributionOutBill4cld/OrderDetails.vue')
	},
	// }}}
	// {{{内部调拨单
	{
		path: '/insideMoveBill',
		name: 'insideMoveBill',
		component: () => import(/* webpackChunkName: "insideMoveBill" */'@/views/insideMoveBill/Index.vue'),
		meta: {
			keepAlive: true
		}
	}, {
		path: '/createInsideMoveBill',
		name: 'createInsideMoveBill',
		component: () => import(/* webpackChunkName: "insideMoveBill" */'@/views/insideMoveBill/CreateOrder.vue')
	}, {
		path: '/insideMoveBillDetails',
		name: 'insideMoveBillDetails',
		component: () => import(/* webpackChunkName: "insideMoveBill" */'@/views/insideMoveBill/OrderDetails.vue')
	},
	// }}}
	// {{{中心外销出库单
	{
		path: '/salesOutBill4cld',
		name: 'salesOutBill4cld',
		component: () => import(/* webpackChunkName: "salesOutBill4cld" */'@/views/salesOutBill4cld/Index.vue'),
		meta: {
			keepAlive: true
		}
	}, {
		path: '/createSalesOutBill4cld',
		name: 'createSalesOutBill4cld',
		component: () => import(/* webpackChunkName: "salesOutBill4cld" */'@/views/salesOutBill4cld/CreateOrder.vue')
	}, {
		path: '/salesOutBill4cldDetails',
		name: 'salesOutBill4cldDetails',
		component: () => import(/* webpackChunkName: "salesOutBill4cld" */'@/views/salesOutBill4cld/OrderDetails.vue')
	},
	// }}}
	{
		path: '/uniformDistributionRtnBill',
		name: 'uniformDistributionRtnBill',
		component: () => import(/* webpackChunkName: "uniformDistributionRtnBill" */'@/views/uniformDistributionRtnBill/Index.vue'),
		meta: {
			keepAlive: true
		}
	}, {
		path: '/createUniformDistributionRtnBill',
		name: 'createUniformDistributionRtnBill',
		component: () => import(/* webpackChunkName: "uniformDistributionRtnBill" */'@/views/uniformDistributionRtnBill/CreateOrder.vue')
	}, {
		path: '/uniformDistributionRtnBillDetails',
		name: 'uniformDistributionRtnBillDetails',
		component: () => import(/* webpackChunkName: "uniformDistributionRtnBill" */'@/views/uniformDistributionRtnBill/OrderDetails.vue')
	}, {
		path: '/foodSamples',
		name: 'foodSamples',
		component: () => import(/* webpackChunkName: "foodSamples" */'@/views/foodSamples/Index.vue'),
		meta: {
			keepAlive: true
		}
	}, {
		path: '/foodSamplesDetails',
		name: 'foodSamplesDetails',
		component: () => import(/* webpackChunkName: "foodSamples" */'@/views/foodSamples/OrderDetails.vue')
	}, {
		path: '/createFoodSamples',
		name: 'createFoodSamples',
		component: () => import(/* webpackChunkName: "foodSamples" */'@/views/foodSamples/CreateOrder.vue')
	}, {
		path: '/carBill',
		name: 'carBill',
		component: () => import(/* webpackChunkName: "carBill" */'@/views/carBill/Index.vue'),
		meta: {
			keepAlive: true
		}
	}, {
		path: '/carBillDetails',
		name: 'carBillDetails',
		component: () => import(/* webpackChunkName: "carBill" */'@/views/carBill/OrderDetails.vue')
	}, {
		path: '/createCarBill',
		name: 'createCarBill',
		component: () => import(/* webpackChunkName: "carBill" */'@/views/carBill/CreateOrder.vue')
	},
	// }}}
	// {{{中心采购订货单
	{
		path: '/stockOrderBill4cld',
		name: 'stockOrderBill4cld',
		component: () => import(/* webpackChunkName: "stockOrderBill4cld" */'@/views/stockOrderBill4cld/Index.vue'),
		meta: {
			keepAlive: true
		}
	}, {
		path: '/createStockOrderBill4cld',
		name: 'createStockOrderBill4cld',
		component: () => import(/* webpackChunkName: "stockOrderBill4cld" */'@/views/stockOrderBill4cld/CreateOrder.vue')
	}, {
		path: '/stockOrderBill4cldDetails',
		name: 'stockOrderBill4cldDetails',
		component: () => import(/* webpackChunkName: "stockOrderBill4cld" */'@/views/stockOrderBill4cld/OrderDetails.vue')
	},
	// }}}
	// {{{中心采购入库单
	{
		path: '/stockInBill4cld',
		name: 'stockInBill4cld',
		component: () => import(/* webpackChunkName: "stockInBill4cld" */'@/views/stockInBill4cld/Index.vue'),
		meta: {
			keepAlive: true
		}
	}, {
		path: '/createStockInBill4cld',
		name: 'createStockInBill4cld',
		component: () => import(/* webpackChunkName: "stockInBill4cld" */'@/views/stockInBill4cld/CreateOrder.vue')
	}, {
		path: '/stockInBill4cldDetails',
		name: 'stockInBill4cldDetails',
		component: () => import(/* webpackChunkName: "stockInBill4cld" */'@/views/stockInBill4cld/OrderDetails.vue')
	},
	// }}}
	// {{{
	{
		path: '/shopStraightRtnBill',
		name: 'shopStraightRtnBill',
		component: () => import(/* webpackChunkName: "shopStraightRtnBill" */'@/views/shopStraightRtnBill/Index.vue'),
		meta: {
			keepAlive: true
		}
	}, {
		path: '/createShopStraightRtnBill',
		name: 'createShopStraightRtnBill',
		component: () => import(/* webpackChunkName: "shopStraightRtnBill" */'@/views/shopStraightRtnBill/CreateOrder.vue')
	}, {
		path: '/shopStraightRtnBillDetails',
		name: 'shopStraightRtnBillDetails',
		component: () => import(/* webpackChunkName: "shopStraightRtnBill" */'@/views/shopStraightRtnBill/OrderDetails.vue')
	},
	{
		path: '/changePassWord',
		name: 'changePassWord',
		component: () => import(/* webpackChunkName: "stockInBill4cld" */'@/views/changePassWord/index.vue')
	},
	// }}}
	// {{{  中心盘点单
	{
		path: '/centerCheckBill4cld',
		name: 'centerCheckBill4cld',
		component: () => import(/* webpackChunkName: "centerCheckBill4cld" */'@/views/centerCheckBill4cld/Index.vue'),
		meta: {
			keepAlive: true
		}
	}, {
		path: '/createCenterCheckBill4cld',
		name: 'createCenterCheckBill4cld',
		component: () => import(/* webpackChunkName: "centerCheckBill4cld" */'@/views/centerCheckBill4cld/CreateOrder.vue')
	}, {
		path: '/centerCheckBill4cldDetails',
		name: 'centerCheckBill4cldDetails',
		component: () => import(/* webpackChunkName: "centerCheckBill4cld" */'@/views/centerCheckBill4cld/OrderDetails.vue')
	},
	// }}}
	// {{{ 中心盘盈单
	{
		path: '/centerCheckIn4cld',
		name: 'centerCheckIn4cld',
		component: () => import(/* webpackChunkName: "centerCheckIn4cld" */'@/views/centerCheckIn4cld/Index.vue'),
		meta: {
			keepAlive: true
		}
	}, {
		path: '/centerCheckIn4cldDetails',
		name: 'centerCheckIn4cldDetails',
		component: () => import(/* webpackChunkName: "centerCheckIn4cld" */'@/views/centerCheckIn4cld/OrderDetails.vue')
	},
	// }}}
	// {{{ 中心盘亏单
	{
		path: '/centerCheckOut4cld',
		name: 'centerCheckOut4cld',
		component: () => import(/* webpackChunkName: "centerCheckOut4cld" */'@/views/centerCheckOut4cld/Index.vue'),
		meta: {
			keepAlive: true
		}
	}, {
		path: '/centerCheckOut4cldDetails',
		name: 'centerCheckOut4cldDetails',
		component: () => import(/* webpackChunkName: "centerCheckOut4cld" */'@/views/centerCheckOut4cld/OrderDetails.vue')
	},
	// }}}
	// {{{ 菜品预估单
	{
		path: '/foodReckonBill',
		name: 'foodReckonBill',
		component: () => import(/* webpackChunkName: "foodReckonBill" */'@/views/foodReckonBill/Index.vue'),
		meta: {
			keepAlive: true
		}
	}, {
		path: '/foodReckonBillDetails',
		name: 'foodReckonBillDetails',
		component: () => import(/* webpackChunkName: "foodReckonBill" */'@/views/foodReckonBill/OrderDetails.vue')
	}, {
		path: '/createFoodReckonBill',
		name: 'createFoodReckonBill',
		component: () => import(/* webpackChunkName: "foodReckonBill" */'@/views/foodReckonBill/CreateOrder.vue')
	},
	// }}}
	// {{{ 采购退货单
	{
		path: '/shopReturnBill',
		name: 'shopReturnBill',
		component: () => import(/* webpackChunkName: "shopReturnBill" */'@/views/shopReturnBill/Index.vue'),
		meta: {
			keepAlive: true
		}
	}, {
		path: '/shopReturnBillDetails',
		name: 'shopReturnBillDetails',
		component: () => import(/* webpackChunkName: "shopReturnBill" */'@/views/shopReturnBill/OrderDetails.vue')
	}, {
		path: '/createShopReturnBill',
		name: 'createShopReturnBill',
		component: () => import(/* webpackChunkName: "shopReturnBill" */'@/views/shopReturnBill/CreateOrder.vue')
	},
	// }}}
	// {{{ 系统设置
	{
		path: '/systemSetting',
		name: 'systemSetting',
		component: () => import(/* webpackChunkName: "systemSetting" */'@/views/systemSetting/index.vue')
	}
	// }}}
]
