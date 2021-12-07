import { getLocalStorage } from '../utils'
export default {
	// 字体规格类型: 可选择[normal big large]
	fontSizeType: getLocalStorage('fontSizeType', 'normal')
}
