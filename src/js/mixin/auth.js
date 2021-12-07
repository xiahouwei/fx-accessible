// 同步权限
import { mapState } from 'vuex'
export default {
	computed: {
		...mapState({
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId
		})
	},
	methods: {
		getAuth () {
			return new Promise(resolve => {
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/function`,
					loading: false
				}).then(res => {
					resolve(res.functionMapData[0])
				})
			})
		},
		syncAuth () {
			return this.getAuth().then(res => {
				this.commitAuth(res)
				return Promise.resolve(res)
			})
		},
		commitAuth (auth) {
			let billAuth = this.$fxAuthModule.fxAuthInit(auth)
			let billSysAuth = this.$fxAuthModule.fxSysAuthInit(auth)
			let reportFormAuth = this.$fxAuthModule.fxReportFormAuthInit(auth)
			this.$store.commit({
				type: 'SET_AUTH_LOCAL_JSON',
				billAuth: billAuth,
				billSysAuth: billSysAuth,
				reportFormAuth: reportFormAuth
			})
			console.log(billAuth)
			console.log(billSysAuth)
			console.log(reportFormAuth)
			this.getAuthHaveSysParam(auth)
		},
		// 此函数为了查看后端有哪些权限是系统参数权限而用,对于实际业务是无用的
		getAuthHaveSysParam (authArr) {
			let billAuth = {}
			Object.keys(authArr).forEach(item => {
				let billAuthType = authArr[item]
				billAuth[item] = {}
				billAuthType.forEach(authTypeItem => {
					billAuth[item][authTypeItem.functionCode] = authTypeItem
				})
			})
			console.log('包含系统参数的权限:')
			console.log(billAuth)
		}
	}
}
