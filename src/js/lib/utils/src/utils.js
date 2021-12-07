// 生成uuid by shw
const createUUID = function () {
	let myDate = new Date()
	let myM = myDate.getMinutes()
	let myS = myDate.getSeconds()
	let myMS = myDate.getMilliseconds()
	let random = Math.round(Math.random() * 10000)
	return `fxCreateParams${myM}${myS}${myMS}${random}`
}
// 正则体 by shw
const getRegulars = function () {
	// 中文标点
	const punct = '\\u3002\\uff1f\\uff01\\uff0f\\uff0c\\u3001\\uff1b\\uff1a\\u201c\\u201d\\u2018\\u2019\\uff08\\uff09\\u300a\\u300b\\u3008\\u3009\\u3010\\u3011\\u300e\\u300f\\u300c\\u300d\\ufe43\\ufe44\\u3014\\u3015\\u301c\\u2026\\u2014\\uff5e\\ufe4f\\uffe5'
	return {
		emoji: '(?:[\\u00a9\\u00ae\\u203c\\u2049\\u2122\\u2139\\u2194-\\u2199\\u21a9-\\u21aa\\u231a-\\u231b\\u2328\\u23cf\\u23e9-\\u23f3\\u23f8-\\u23fa\\u24c2\\u25aa-\\u25ab\\u25b6\\u25c0\\u25fb-\\u25fe\\u2600-\\u2604\\u260e\\u2611\\u2614-\\u2615\\u2618\\u261d\\u2620\\u2622-\\u2623\\u2626\\u262a\\u262e-\\u262f\\u2638-\\u263a\\u2640\\u2642\\u2648-\\u2653\\u2660\\u2663\\u2665-\\u2666\\u2668\\u267b\\u267f\\u2692-\\u2697\\u2699\\u269b-\\u269c\\u26a0-\\u26a1\\u26aa-\\u26ab\\u26b0-\\u26b1\\u26bd-\\u26be\\u26c4-\\u26c5\\u26c8\\u26ce-\\u26cf\\u26d1\\u26d3-\\u26d4\\u26e9-\\u26ea\\u26f0-\\u26f5\\u26f7-\\u26fa\\u26fd\\u2702\\u2705\\u2708-\\u270d\\u270f\\u2712\\u2714\\u2716\\u271d\\u2721\\u2728\\u2733-\\u2734\\u2744\\u2747\\u274c\\u274e\\u2753-\\u2755\\u2757\\u2763-\\u2764\\u2795-\\u2797\\u27a1\\u27b0\\u27bf\\u2934-\\u2935\\u2b05-\\u2b07\\u2b1b-\\u2b1c\\u2b50\\u2b55\\u3030\\u303d\\u3297\\u3299]|\\ud83c[\\udc04\\udccf\\udd70-\\udd71\\udd7e-\\udd7f\\udd8e\\udd91-\\udd9a\\udde6-\\uddff\\ude01-\\ude02\\ude1a\\ude2f\\ude32-\\ude3a\\ude50-\\ude51\\udf00-\\udf21\\udf24-\\udf93\\udf96-\\udf97\\udf99-\\udf9b\\udf9e-\\udff0\\udff3-\\udff5\\udff7-\\udfff])|(?:\\ud83d[\\udc00-\\udcfd\\udcff-\\udd3d\\udd49-\\udd4e\\udd50-\\udd67\\udd6f-\\udd70\\udd73-\\udd7a\\udd87\\udd8a-\\udd8d\\udd90\\udd95-\\udd96\\udda4-\\udda5\\udda8\\uddb1-\\uddb2\\uddbc\\uddc2-\\uddc4\\uddd1-\\uddd3\\udddc-\\uddde\\udde1\\udde3\\udde8\\uddef\\uddf3\\uddfa-\\ude4f\\ude80-\\udec5\\udecb-\\uded2\\udee0-\\udee5\\udee9\\udeeb-\\udeec\\udef0\\udef3-\\udef6])|(?:\\ud83e[\\udd10-\\udd1e\\udd20-\\udd27\\udd30\\udd33-\\udd3a\\udd3c-\\udd3e\\udd40-\\udd45\\udd47-\\udd4b\\udd50-\\udd5e\\udd80-\\udd91\\uddc0])',
		english: '\\u0021-\\u007e\\u00a5\\u00b7',
		chinese: '\\u4e00-\\u9fa5' + punct,
		typeNumber: '(?:-|-?\\d+(?:\\.\\d*)?)'
	}
}
// 正则校验 满足 只包含 中文,英文,标点 by shw
const emojiPattern = function () {
	var r = getRegulars()
	return new RegExp('[^' + r.english + r.chinese + '\\s' + ']|' + r.emoji)
}
// 模糊查询
const fuzzyQueryString = function (val, key) {
	return val.toLowerCase().includes(key.toLowerCase())
}
// 防止重复操作
const syncCall = function (method) {
	let st = 0
	let cb = function () {
		return new Promise(resolve => {
			let res = method.apply(this, [])
			if (res) {
				resolve()
			}
		})
	}
	let freeLock = function freeLock () {
		--st
	}
	return function () {
		if (st !== 0) {
			return false
		}
		++st
		return cb.apply(this, []).then(freeLock)
	}
}
// 时间戳转换成年月日时分秒
const timestampToTime = function (timestamp) {
	var date = new Date() // 时间戳为10位需*1000，时间戳为13位的话不需乘1000
	var Y = date.getFullYear() + '-'
	var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
	var D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' '
	var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':'
	var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':'
	var s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds())
	var strDate = Y + M + D + h + m + s
	return strDate
}

export default {
	createUUID,
	emojiPattern,
	fuzzyQueryString,
	syncCall,
	timestampToTime
}
