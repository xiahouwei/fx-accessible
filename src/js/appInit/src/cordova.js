// cordova
import cordovaApi, { cordovaInit } from '@/js/cordova'

export default (vue) => {
	cordovaInit()
	vue.prototype.$fxCordova = cordovaApi
}

