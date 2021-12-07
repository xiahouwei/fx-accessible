// 项目常用函数
import utils from '@/js/lib/utils'
import common from '@/js/lib/common'
import { BASE_URL, getAppTypeUrlPath } from '@/js/service/baseUrl'
import service from '@/js/service/index'
import fxApi from '@/js/api/index'
import eventBus from '@/js/lib/eventBus'
import { go } from '@/js/lib/router'
import { fxAuth, fxSysAuth, fxAuthModule } from '@/js/auth/index'
import getAppSubject from '@/js/appSubject'
import stateMiddleware from '@/js/stateMiddleware'
import typeMiddleware from '@/js/typeMiddleware'
import calculation from '@/js/lib/calculation'
import versionVerification from '@/js/lib/versionVerification'

export default (vue) => {
	vue.prototype.$fxUtils = utils
	vue.prototype.$fxCommon = common
	vue.prototype.$fxBaseApi = BASE_URL
	vue.prototype.$fxGetBaseUrl = getAppTypeUrlPath
	vue.prototype.$fxHttp = service
	vue.prototype.$fxApi = fxApi
	vue.prototype.$fxEventBus = eventBus
	vue.prototype.$fxGo = go
	vue.prototype.$fxAuth = fxAuth
	vue.prototype.$fxSysAuth = fxSysAuth
	vue.prototype.$fxAuthModule = fxAuthModule
	vue.prototype.$fxGetAppSubject = getAppSubject
	vue.prototype.$fxStateMiddleware = stateMiddleware
	vue.prototype.$fxTypeMiddleware = typeMiddleware
	vue.prototype.$fxCalculation = calculation
	vue.prototype.$fxVerCheck = versionVerification
}
