// 获取app私有化信息
export default {
	mounted () {
		Promise.all([this.$fxCordova.getPackageName(), this.$fxCordova.getVersionNumber()]).then(([packageName, versionNumber]) => {
			this.setPackgeName(packageName)
			this.setVersionNumber(versionNumber)
		})
	},
	methods: {
		setPackgeName (packageName) {
			let appSubjectObj = this.$fxGetAppSubject(packageName)
			this.$store.commit({
				type: 'SET_APP_SUBJECT',
				appSubjectPackageName: appSubjectObj.appSubjectPackageName,
				appSubjectName: appSubjectObj.appSubjectName,
				appSubjectNetAddress: appSubjectObj.appSubjectNetAddress
			})
		},
		setVersionNumber (versionNumber) {
			this.$store.commit({
				type: 'SET_APP_SUBJECT',
				appSubjectVersion: versionNumber
			})
		}
	}
}
