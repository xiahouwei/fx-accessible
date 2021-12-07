import API_DISTRIBUTION_OUT from './distributionOutBill4cld'
import API_SALES_OUT from './salesOutBill4cld'
import API_STOCK_IN from './stockInBill4cld'
import API_STOCK_ORDER from './stockOrderBill4cld'
import API_CENTER_CHECK from './centerCheckBill4cld'
import API_CENTER_CHECK_IN from './centerCheckIn4cld'
import API_CENTER_CHECK_OUT from './centerCheckOut4cld'
export default {
	...API_DISTRIBUTION_OUT,
	...API_SALES_OUT,
	...API_STOCK_IN,
	...API_STOCK_ORDER,
	...API_CENTER_CHECK,
	...API_CENTER_CHECK_IN,
	...API_CENTER_CHECK_OUT
}
