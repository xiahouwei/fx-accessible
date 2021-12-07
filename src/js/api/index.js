import API_CONFIG from '@/config/api_config/index.js'
import DATA_SERVICE_CONFIG from '@/config/dataService_config'
import { reportForm } from './src/reportForm.js'
import { dataSource } from './src/dataSource'

const API = {
	...API_CONFIG,
	...DATA_SERVICE_CONFIG,
	reportForm
}

export default function (apiName, ...arg) {
	const [apiModule, apiFunc] = apiName.split('.')
	if (!API[apiModule][apiFunc]) {
		console.warn('warn:api接口命名有误')
		return false
	}
	if (apiModule === 'reportForm') {
		return function () {
			return API[apiModule][apiFunc](...arguments)
		}
	} else {
		const options = API[apiModule][apiFunc](...arg)
		return dataSource(options)
	}
}
