<template>
	<w-app-page class="inteledi-report">
		<w-header title="报表中心" :leftOptions="leftOptions" :border="true"></w-header>
		<div class="inteledi-report__content">
			<div v-for="item in reports" v-show="item.visible" :key="item.label" class="report-cell">
				<div class="report-block fx-shadow-block" @click="reportFormClickHandler(item)">
					<img class="report-block__logo" :src="item.icon">
					<div class="report-block__No">{{item.id}}</div>
					<div class="report-block__title">{{item.label}}</div>
				</div>
			</div>
			<emptyBill v-show="reportsVisible.length === 0" message="暂无可查看的报表"></emptyBill>
		</div>
	</w-app-page>
</template>

<script>
import { mapState } from 'vuex'
import emptyBill from '@/components/common/EmptyBill.vue'
import mixinAuth from '@/js/mixin/auth'
export default {
	name: 'report',
	mixins: [mixinAuth],
	components: {
		emptyBill
	},
	data () {
		return {
			leftOptions: {
				showBackBtn: false
			},
			reports: this.$fxCommon.getreportFormModule()
		}
	},
	computed: {
		...mapState({
			reportFormAuth: state => state.auth.reportFormAuth
		}),
		reportsVisible () {
			return this.reports.filter(item => {
				return item.visible
			})
		}
	},
	created () {
		this.syncAuth().then(() => {
			this.authReportForm()
		})
	},
	methods: {
		reportFormClickHandler (item) {
			this.$router.push(item.path)
		},
		authReportForm () {
			this.reports.forEach((item, index) => {
				item.visible = this.$fxUtils.isDef(this.reportFormAuth[item.auth])
			})
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.inteledi-report {
	&__content {
		flex:1
		.report-cell {
			float: left
			width: 50%
			padding: 10px
			box-sizing:border-box
			.report-block {
				display: flex
				flex-direction: column
				align-items: center
				&__logo {
					width: 70px
					height: 70px
				}
				&__title {
					font-size:14px
					height: 30px
					line-height: 30px
				}
				&__No {
					font-size:12px
					height: 20px
					line-height: 20px
				}
			}
		}
	}
}
</style>
