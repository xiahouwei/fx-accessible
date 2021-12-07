<template>
	<div class="meMenu">
		<div class="meMenu-user">
			<div class="me-avatar">
				<img class="avatar-img" src="@/assets/images/img/shanglong-logo.jpg">
			</div>
			<div class="me-name fx-ellipsis">{{loginerName}}</div>
		</div>
		<div class="meMenu-list">
			<van-cell-group>
				<van-cell icon="chat-o">
					<template slot="title">
						<span>消息通知</span>
						<!-- <span class="message-count">99</span> -->
					</template>
				</van-cell>
				<van-cell @click="onSetSysClick" title="系统设置" icon="setting-o" />
				<van-cell  @click="onChangePwd" class="change-cell">
         <template>
            <img src="../../assets/images/icon/lock.png" style="width: 1.6rem;">
						<span class="custom-text">修改密码</span>
          </template>
				</van-cell>
				<van-cell title="版本升级" icon="warning-o" @click="onVersionUpdate" >
					<w-icon v-show="hasNewVersion" slot="right-icon" type="new-version" :stop="false" class="new-version-icon"></w-icon>
				</van-cell>
				<van-cell title="关于我们" icon="warning-o" />
				<van-cell title="退出登录" icon="share" @click="onLogoutClick" />
			</van-cell-group>
		</div>
		<div class="meMenu-bottom">
			<div class="version">version:{{appSubjectVersion}}</div>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
export default {
	name: 'meMenu',
	computed: {
		...mapState({
			hasNewVersion: state => state.hasNewVersion,
			loginerName: state => state.loginer.loginerName,
			loginerOrganType: state => state.loginer.loginerOrganType,
			appSubjectVersion: state => state.appSubject.appSubjectVersion
		})
	},
	methods: {
		onLogoutClick () {
			this.$dialog.confirm({ message: '退出登录' })
				.then(this.checkAppType)
				.then(this.logoutHandler)
		},
		checkAppType () {
			return new Promise(resolve => {
				this.$fxUtils.appTypeCheck(['z5']).then(() => {
					this.$fxApi('common.logout').then(resolve)
				}).catch(resolve)
			})
		},
		logoutHandler () {
			this.$store.commit('CLEAR_LOGINER')
			this.$fxCordova.jpushCleanAlias()
			this.$router.push('/login')
		},
		onVersionUpdate () {
			this.$store.commit({
				type: 'SETSTATE',
				ignoreVersionUpdate: false
			})
			this.$fxVerCheck().then(() => {
				this.$fxToast.top('当前已是最新版本!')
			})
		},
		onChangePwd () {
			console.log('修改密码')
			this.$router.push({
				name: 'changePassWord'
			})
		},
		onSetSysClick () {
			this.$router.push({
				name: 'systemSetting'
			})
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.change-cell {
	img {
		display: inline-block
		vertical-align: middle
		margin-right: 3px;
	}
	span {
		vertical-align: middle
	}
}
.meMenu {
	height:100%
	width:250px
	padding-top: 50px
	box-sizing: border-box;
	display: flex
	flex-direction: column
	.meMenu-user {
		padding-left:10px
		padding-right:10px
		.me-avatar {
			display:inline-block
			height:60px
			width:60px
			border:2px solid #9191F3
			border-radius:32px
			margin-left:20px
			margin-right:20px
			overflow:hidden
			background-color:#9191F3
			.avatar-img {
				width:100%
				height:100%
			}
		}
		.me-name {
			font-size:18px
			height:40px
			line-height:40px
		}
		.me-type {
			font-size:14px
			height:20px
			line-height:20px
			color:$fxGray
		}
	}
	.meMenu-list {
		margin-top:40px
		text-align:left
		flex:1
		.message-count {
			display:inline-block
			width:16px
			height:16px
			line-height:16px
			border-radius:8px
			text-align:center
			font-size:10px
			color:$fxWhite
			background-color:$fxRed
			position:relative
			top:-8px
			left:5px
		}
		.new-version-icon {
			height: 30px
			width: 30px
		}
	}
	.meMenu-bottom {
		.version {
			height:40px
			line-height:40px
		}
	}
}
</style>
