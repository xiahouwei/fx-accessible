<template>
	<w-app-page class="inteledi-login">
		<div class="login-container">
			<div class="login-welcome clearfix">
				<div aria-label="风行无障碍演示" class="welcome-text fl-l">风行无障碍演示</div>
				<img class="welcome-login fl-r" src="@/assets/images/img/logo-login.png" alt="一张图片, 描述一个人在浏览网页">
			</div>
			<div class="login-form">
				<van-cell-group class="login-cell-group" :border="false">
					<van-field
						v-model="netAddress"
						ref="netAddress"
						class="login-cell"
						placeholder="请输入网址"
						aria-label="请输入你的网址"
						:error-message="errorMessage.netAddress"
						@keyup.enter.native="onKeyupInput('netAddress')">
						<img
							class="login-cell-icon"
							slot="left-icon"
							src="@/assets/images/icon/icon-netname.png"
							alt="网址图标"
						>
						<van-icon
							v-show="netAddressClearBtnVisible"
							slot="right-icon"
							name="close"
							class="login-cell-right-icon"
							@click="netAddressClear"
						/>
					</van-field>
					<van-field
						v-model="urserName"
						ref="urserName"
						class="login-cell"
						placeholder="请输入账号"
						aria-label="请输入你的账号"
						autocomplete="off"
						:error-message="errorMessage.urserName"
						@keyup.enter.native="onKeyupInput('urserName')">
						<img
							class="login-cell-icon"
							slot="left-icon"
							src="@/assets/images/icon/icon-ursename.png"
							alt="账号图标"
						>
					</van-field>
					<van-field
						v-model="password"
						ref="password"
						class="login-cell"
						placeholder="请输入密码"
						aria-label="请输入你的密码"
						:type="passwordType"
						:error-message="errorMessage.password"
						@keyup.enter.native="onKeyupInput('password')">
						<img
							class="login-cell-icon"
							slot="left-icon"
							src="@/assets/images/icon/icon-password.png"
							alt="密码图标"
						>
						<van-icon
							slot="right-icon"
							:name="passwordWatchBtn"
							class="login-cell-right-icon"
							aria-label="显示密码按钮"
							@click="passwordWatchClick"
						/>
					</van-field>
				</van-cell-group>
				<van-button
					class="login-btn"
					type="primary"
					round
					aria-label="这是登录按钮"
					@click="loginHanle"
				>登录</van-button>
			</div>
		</div>
		<div class="login-bottom">
			<div aria-label="当前版本1.0.0" class="version">version:{{appSubjectVersion}}</div>
		</div>
	</w-app-page>
</template>

<script>
import { mapState } from 'vuex'
import mixinAuth from '@/js/mixin/auth'
export default {
	name: 'login',
	mixins: [mixinAuth],
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
			this.$router.push('/accessible')
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
	background-color: blue
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
}
</style>
