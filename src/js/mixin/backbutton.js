// 安卓物理后退键
let backClick = 0
let backTime = null
export default {
	mounted () {
		document.addEventListener('backbutton', () => {
			this.loginHanle()
		}, false)
	},
	methods: {
		loginHanle () {
			if (this.isHaveDialog()) {
				return false
			} else if (this.$route.path === '/main/home' || this.$route.path === '/login') {
				let time = new Date()
				if (backTime === null || (time - backTime) > 1500) {
					backClick = 1
					this.$fxToast({
						message: '再按一次退出应用',
						position: 'bottom'
					})
				} else {
					if (++backClick === 2) {
						navigator.app.exitApp()
					}
				}
				backTime = time
			} else {
				window.history.back()
			}
		},
		isHaveDialog () {
			let dialogs = document.getElementsByClassName('van-dialog')
			if (dialogs.length === 0) {
				return false
			} else {
				let showDialogs = [].filter.call(dialogs, (item) => {
					return item.style.display !== 'none'
				})
				return showDialogs.length > 0
			}
		}
	}
}
