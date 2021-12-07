import http from 'http'
import https from 'https'

export default {
	headers: {
		post: {
			'Content-Type': 'multipart/form-data'
		}
	},
	withCredentials: true,
	httpAgent: new http.Agent({
		keepAlive: true
	}),
	httpsAgent: new https.Agent({
		keepAlive: true
	})
}
