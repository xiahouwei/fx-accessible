// 同步最新系统参数
import { mapState } from 'vuex'
export default {
	computed: {
		...mapState({
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId
		})
	},
	methods: {
		getSystemParams () {
			return new Promise(resolve => {
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/systemParams`
				}).then(res => {
					resolve(res.systemParams[0])
				})
			})
		},
		syncSystemParams () {
			return this.getSystemParams().then(res => {
				this.commitStoreSystemParams(res)
				return Promise.resolve(res)
			})
		},
		commitStoreSystemParams (systemParams) {
			this.$store.commit({
				type: 'SET_STATE_LOCAL',
				sysPointSize: systemParams.sysPointSize,
				sysMoneyPointSize: systemParams.sysMoneyPointSize
			})
			this.$store.commit({
				type: 'SET_SYSTEM_PARAMS_CLD',
				state: systemParams
			})
			this.$store.commit({
				type: 'SET_STATE_LOCAL_JSON',
				systemParams: systemParams
			})
		}
	}
}
