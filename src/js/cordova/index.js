import { getPackageName, getVersionNumber, getAppName, checkVersion } from './src/appversion'
import camera from './src/camera'
import media from './src/media'
import { getFileFullPath } from './src/file'
import { fileTransfer } from './src/fileTransfer'
import { openInBrowser } from './src/inappbrowser'
import { barcodeScan } from './src/barcodeScanner'
import {
	JPushInstance,
	jpushSetBadge,
	jpushSetTag,
	jpushCleanTag,
	jpushSetAlias,
	jpushCleanAlias,
	fireOpenNotification
} from './src/jpush'
import { sunmiprint } from './src/sunmiprint'
export const cordovaInit = function () {
	JPushInstance()
}
export default {
	getPackageName,
	getVersionNumber,
	getAppName,
	checkVersion,
	camera,
	media,
	getFileFullPath,
	fileTransfer,
	openInBrowser,
	jpushSetBadge,
	jpushSetTag,
	jpushCleanTag,
	jpushSetAlias,
	jpushCleanAlias,
	fireOpenNotification,
	sunmiprint,
	barcodeScan
}


