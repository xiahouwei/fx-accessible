import utilsArray from './src/array'
import utilsDate from './src/date'
import utilsNumber from './src/number'
import utilsType from './src/type'
import utilsFunc from './src/utils'
import utilsDebounce from './src/debounce'
import utilsThrottle from './src/throttle'
import utilsPlatform from './src/platform'
import { scrollTopW, doScrollTop } from './src/scrollTop'
import { fxDataVerification } from './src/verification'

export default Object.assign(
	{
		scrollTopW,
		doScrollTop,
		fxDataVerification
	},
	utilsArray,
	utilsDate,
	utilsNumber,
	utilsType,
	utilsFunc,
	utilsDebounce,
	utilsThrottle,
	utilsPlatform
)
