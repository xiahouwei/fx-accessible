import http from 'http'
import https from 'https'

export default {
	// 自定义的请求头
	headers: {
		post: {
			'Content-Type': 'application/json'
		}
		// 'X-Requested-With': 'XMLHttpRequest',
		// 'pname': '59a0bf8dc0cea0d36d299b9cb77d4f27',
		// 'originname': 'PC'
	},
	// 超时设置
	timeout: 60000,
	// 跨域是否带Token
	withCredentials: true,
	// 响应的数据格式 json / blob /document /arraybuffer / text / stream
	// responseType: 'json',
	// XSRF 设置
	// xsrfCookieName: 'XSRF-TOKEN',
	// xsrfHeaderName: 'X-XSRF-TOKEN',
	// 用于node.js
	httpAgent: new http.Agent({
		keepAlive: true
	}),
	httpsAgent: new https.Agent({
		keepAlive: true
	})
}
