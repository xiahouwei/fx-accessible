<template>
	<div class="inteledi-main">
		<router-view class="inteledi-content" keep-alive></router-view>
		<van-tabbar v-model="tabActive" class="inteledi-tabbar" @change="tabbarChange">
			<van-tabbar-item>主页
				<img
					slot="icon"
					slot-scope="props"
					:src="props.active ? tabIcon.homeActive : tabIcon.home"
				>
			</van-tabbar-item>
			<van-tabbar-item class="create-order">
				<img
					slot="icon"
					src="@/assets/images/icon/icon-add-bill.png"
				>
			</van-tabbar-item>
			<van-tabbar-item>报表
				<img
					slot="icon"
					slot-scope="props"
					:src="props.active ? tabIcon.reportActive : tabIcon.report"
				>
			</van-tabbar-item>
		</van-tabbar>
	</div>
</template>

<script>
import { getDefaultCreateOrder } from '@/config/order-module'
export default {
	name: 'mainPage',
	data () {
		return {
			tabActive: 0,
			routeList: [
				{ path: 'home' },
				{ path: '' },
				{ path: 'report' }
			],
			tabIcon: {
				home: require('@/assets/images/icon/index-icon/icon-index-home.png'),
				homeActive: require('@/assets/images/icon/index-icon/icon-index-home-active.png'),
				report: require('@/assets/images/icon/index-icon/icon-index-report.png'),
				reportActive: require('@/assets/images/icon/index-icon/icon-index-report-active.png')
			}
		}
	},
	created () {
		this.tabActive = this.$route.meta && this.$route.meta.tabIndex
	},
	watch: {
		$route (route) {
			this.tabActive = route.meta && route.meta.tabIndex
		}
	},
	methods: {
		tabbarChange (index) {
			this.checkCreateOrder(index).then(() => {
				this.$router.push(this.routeList[index])
			})
		},
		checkCreateOrder (index) {
			return new Promise(resolve => {
				const defaultCreateOrder = getDefaultCreateOrder()
				if (index !== 1) {
					resolve()
				} else {
					if (this.$fxAuth(defaultCreateOrder.auth)) {
						this.$router.push(defaultCreateOrder.path)
					} else {
						this.tabActive = null
						this.$dialog.alert({
							title: '提示',
							message: '没有该单据的管辖权限！'
						})
					}
				}
			})
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.inteledi-main {
	height:100%
	background:$fxWhite
	.inteledi-content {
		position: absolute;
		width: 100%;
		top: 0;
		bottom: 50px;
	}
	.inteledi-tabbar {
		.create-order {
			img {
				height:40px
				width:40px
				display: inline-block
			}
		}
	}
}
</style>
