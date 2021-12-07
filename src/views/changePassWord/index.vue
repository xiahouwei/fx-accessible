<template>
	<div class="inteledi-changePassWord">
		<w-header title="修改密码" :border="true">
		</w-header>
			<div class="changepwd-content">
				<van-cell-group>
					<van-field
						v-model="formData.oldPwd"
						required
						clearable
						type="password"
						label="原密码"
						placeholder="请输入原密码"
						:error-message="errorMessage.oldPwd"
					/>

					<van-field
						v-model="formData.newPwd"
						required
						clearable
						type="password"
						label="新密码"
						:error-message="errorMessage.newPwd"
						placeholder="请输入新密码"
					/>

					<van-field
						v-model="formData.newPwdAffirm"
						required
						clearable
						type="password"
						label="密码确认"
						:error-message="errorMessage.newPwdAffirm"
						placeholder="请确认新密码"
					/>
				</van-cell-group>
			</div>
			<div class="changepwd-bottom">
				<van-button
					class="add-btn fx-no-radius"
					type="primary"
					@click="onClickConfirm"
				>确认</van-button>
			</div>
	</div >
</template>

<script>
export default {
	name: 'changePassWord',
	data () {
		return {
			validateFlag: false,
			formData: {
				newPwd: '',
				oldPwd: '',
				newPwdAffirm: ''
			},
			errorMessage: {
				newPwd: '',
				oldPwd: '',
				newPwdAffirm: ''
			}
		}
	},
	methods: {
		onClickConfirm () {
			this.submitHanle()
		},
		validate () {
			return new Promise(resolve => {
				this.clearValidate()
				let validateFlag = true
				if (this.formData.oldPwd === '') {
					this.errorMessage.oldPwd = '请输入原密码'
					validateFlag = false
				}
				if (this.formData.oldPwd.length > 50) {
					this.errorMessage.oldPwd = '密码长度超过50个字符'
					validateFlag = false
				}
				if (this.formData.newPwd === '') {
					this.errorMessage.newPwd = '请输入新密码'
					validateFlag = false
				}
				if (this.formData.newPwd === this.formData.oldPwd) {
					this.errorMessage.newPwd = '原密码与新密码不能相同'
					validateFlag = false
				}
				if (this.formData.newPwd.length > 50) {
					this.errorMessage.newPwd = '密码长度超过50个字符'
					validateFlag = false
				}
				if (this.formData.newPwdAffirm === '') {
					this.errorMessage.newPwdAffirm = '请确认密码'
					validateFlag = false
				}
				if (this.formData.newPwdAffirm.length > 50) {
					this.errorMessage.newPwdAffirm = '密码长度超过50个字符'
					validateFlag = false
				}
				if (this.formData.newPwdAffirm !== this.formData.newPwd) {
					this.errorMessage.newPwdAffirm = '两次录入新密码不一致'
					validateFlag = false
				}
				resolve(validateFlag)
			})
		},
		submitHanle () {
			this.validate().then(validateFlag => {
				validateFlag && this.PutPassword().then((res) => {
					this.$dialog.alert({
						title: '提示',
						message: res.message
					}).then(() => {
						this.$router.push('/main')
					})
				})
			})
		},
		PutPassword () {
			const params = {
				password: this.formData.oldPwd,
				newPassword: this.formData.newPwd
			}
			return this.$fxApi('common.changePassword')({ data: params })
		},
		clearValidate () {
			for (let key in this.errorMessage) {
				this.errorMessage[key] = ''
			}
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.inteledi-changePassWord{
	height:100%
	background:$fxWhite
	display: flex
	flex-direction: column
	.changepwd-content {
			flex:1
	}
	.changepwd-bottom {
		width:100%
		display: flex
		flex-direction: row
		.add-btn {
			width:100%
		}
	}
}
</style>
