// 同步最新税率
import { mapState } from 'vuex'
export default {
	computed: {
		...mapState({
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId
		})
	},
	methods: {
		getTaxes () {
			return new Promise(resolve => {
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/systemParams/taxes`
				}).then(res => {
					let taxes = res.taxes
					taxes.forEach(item => {
						let taxName = this.$fxUtils.toFixedSHW(item.tax * 100, 2, false)
						item.id = item.tax
						item.name = `${taxName}%`
					})
					resolve(taxes)
				})
			})
		},
		syncTaxes () {
			return this.getTaxes().then(res => {
				this.commitStoreTaxes(res)
				return Promise.resolve(res)
			})
		},
		commitStoreTaxes (taxes) {
			this.$store.commit({
				type: 'SET_STATE_LOCAL_JSON',
				taxes: taxes
			})
		}
	}
}
