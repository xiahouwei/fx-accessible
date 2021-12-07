<template>
	<w-app-page class="inteledi-login">
		<div class="login-container">
			<div class="login-welcome clearfix">
				<div aria-label="风行无障碍演示" class="welcome-text fl-l">欢迎进入项目</div>
				<img class="welcome-login fl-r" src="@/assets/images/img/logo-login.png" alt="">
			</div>
            <div class="container-text">在Web开发无障碍性意味着使尽可能多的人能够使用Web站点,即使这些人的能力是有限的。</div>
            <div class="container-text">网络从根本上是为了为所有的人工作, 无论他们的硬件、软件、语言、文化、位置或身体或精神能力</div>
		</div>
	</w-app-page>
</template>

<script>
import { mapState } from 'vuex'
export default {
	name: 'accessible',
	data () {
		return {
			formFieldRef: ['netAddress', 'urserName', 'password'],
			netAddress: '',
			urserName: '',
			password: '',
			errorMessage: {
				netAddress: '',
				urserName: '',
				password: ''
			},
			showPassword: false
		}
	},
	computed: {
		...mapState({
			netAddressX: 'netAddressX',
			urserNameX: 'urserNameX',
			appSubjectName: state => state.appSubject.appSubjectName,
			appSubjectNetAddress: state => state.appSubject.appSubjectNetAddress,
			appSubjectVersion: state => state.appSubject.appSubjectVersion,
			loginerUuid: state => state.loginer.loginerUuid
		}),
		netAddressClearBtnVisible () {
			return !!this.netAddress
		},
		passwordWatchBtn () {
			return this.showPassword ? 'eye-o' : 'closed-eye'
		},
		passwordType () {
			return this.showPassword ? 'text' : 'password'
		}
	},
	created () {
		this.netAddress = this.netAddressX || this.appSubjectNetAddress
		this.urserName = this.urserNameX
	},
	mounted () {
		this.silentLogin()
	},
	methods: {
		onKeyupInput (refName) {
			this.$fxCommon.inputAutoFocusMoblie.apply(this, [refName, this.formFieldRef]).then(() => {
				this.loginHanle()
			})
		},
		silentLogin () {
			this.$nextTick(() => {
				this.$fxUtils.appTypeCheck(['z5']).then(this.silentLoginHandler)
			})
		},
		silentLoginHandler () {
			if (this.netAddress && this.loginerUuid) {
				this.$store.commit({
					type: 'SETSTATE',
					netAddressX: this.netAddress
				})
				this.$fxApi('common.silentLogin')
					.then(this.loginSuccessHandler)
					.catch(() => {
						this.$fxCordova.jpushCleanAlias()
					})
			}
		},
		loginHanle () {
			this.$router.push('/main/accessible')
		},
		loginPost () {
			this.$store.commit({
				type: 'SETSTATE',
				netAddressX: this.netAddress
			})
			const params = {
				username: this.urserName,
				password: this.password
			}
			this.$fxApi('common.login')({ data: params })
				.then(this.handLoginSuccess)
				.then(this.loginSuccessHandler)
		},
		handLoginSuccess (res) {
			this.$store.commit({
				type: 'SET_LOGINER',
				loginerPassword: this.password
			})
			return Promise.resolve(res)
		},
		loginSuccessHandler (res) {
			let loginer = res.accounts[0]
			this.$store.commit({
				type: 'SET_STATE_LOCAL',
				netAddressX: this.netAddress,
				urserNameX: this.urserName
			})
			this.$store.commit({
				type: 'SET_LOGINER',
				loginerCode: loginer.code,
				loginerId: loginer.id,
				loginFlag: loginer.loginFlag,
				loginerName: loginer.name,
				loginerUserName: loginer.username,
				loginerUuid: loginer.uuid,
				loginerOrganType: loginer.organType,
				loginerShopId: loginer.shopId,
				loginerShopName: loginer.shopName
			})
			if (this.urserName !== 'admin') {
				this.$fxCordova.jpushSetAlias(loginer.id)
			}
			this.syncAuth().then(() => {
				this.$router.push('/main/home')
			})
		},
		validate () {
			return new Promise(resolve => {
				this.clearValidate()
				let validateFlag = true
				if (this.urserName === '') {
					this.errorMessage.urserName = '请输入账号'
					validateFlag = false
				}
				if (this.netAddress === '') {
					this.errorMessage.netAddress = '请输入网址'
					validateFlag = false
				}
				if (this.password === '') {
					this.errorMessage.password = '请输入密码'
					validateFlag = false
				}
				resolve(validateFlag)
			})
		},
		clearValidate () {
			for (let key in this.errorMessage) {
				this.errorMessage[key] = ''
			}
		},
		netAddressClear () {
			this.netAddress = ''
		},
		passwordWatchClick () {
			this.showPassword = !this.showPassword
		}
	}
}
</script>
<style lang="stylus" scoped>
.inteledi-login {
	.login-container {
		flex:1
		.login-welcome {
			padding-top:40px
			padding-bottom:10px
			position:relative
			.welcome-text {
				$fx-dynamic-font-size(17px)
				font-weight:700
				position:absolute
				top:100px
				left:20px
			}
			.welcome-login {
				height:150px
				width:150px
			}
		}
		.login-form {
			width:350px
			margin: 0 auto
			.login-cell-group {
				padding:20px 20px
				.login-cell {
					padding-top: 30px
					padding-bottom: 10px
				}
				.login-cell-icon {
					width:16px
					height:16px
					margin-right: 20px
				}
				.verification-btn {
					width:100px
				}
				.login-cell-right-icon {
					height:19px
					line-height:19px
				}
			}
			.login-btn {
				margin-top:20px
				width:320px
			}
		}
	}
	.login-bottom {
		display: flex
		flex-direction: row;
		height:40px
		width:100%
		align-items: center;
		justify-content: center;
	}
	.van-cell::after {
		content: ' ';
		position: absolute;
		pointer-events: none;
		-webkit-box-sizing: border-box;
		box-sizing: border-box;
		left: 4vw;
		right: 0;
		bottom: 0;
		transform: scaleY(0.5);
		border-bottom: 1px solid #d9d9d9
	}
    .container-text {
        font-size: 14px;
        margin-bottom: 20px
    }
}
</style>
