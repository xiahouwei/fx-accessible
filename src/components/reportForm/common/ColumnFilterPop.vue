<template>
	<div class="filter-popup">
		<w-header title="报表方案" :leftOptions="leftOptions" @on-click-back="onCloseClick">
			<van-button
				slot="header-right"
				class="header-confirm-btn"
				type="primary"
				size="small"
				round
				@click="onConfirmClick"
			>确定</van-button>
		</w-header>
		<div ref="filterContent" class="filter-content">
			<div class="column-select-all">
				<div class="column-select-tab" @click="onSelectAllClick">{{isSelectedAllColumn ? '取消全部' : '选择全部'}}</div>
			</div>
			<div v-for="item in columnData" :key="item.code" class="column-select-item">
				<div
					class="column-select-tab"
					:class="{'is-active': item.selected}"
					@click="onColumnTabClick(item)"
				>{{item.name}}</div>
			</div>
		</div>
		<div class="filter-bottom fx-shadow-up" @click="onPlanListClick">
			<div class="reprot-form-plan-title">选择报表方案</div>
			<div class="reprot-form-plan-value">{{plan.name}}</div>
		</div>
		<van-actionsheet
			v-model="plansActionShow"
			:actions="planList"
			cancel-text="取消"
			@select="onPlanListSelect"
		/>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import mixinAuth from '@/js/mixin/auth'
export default {
	name: 'columnFilterPop',
	mixins: [mixinAuth],
	props: {
		visibleFlag: Boolean,
		plan: {
			type: Object,
			default: () => {
				return {}
			}
		},
		planList: {
			type: Array,
			default: () => {
				return []
			}
		},
		planDetails: {
			type: Array,
			default: () => {
				return []
			}
		},
		planDetailsApi: Function
	},
	data () {
		return {
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			columnData: [],
			plansActionShow: false
		}
	},
	computed: {
		...mapState({
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId
		}),
		isSelectedAllColumn () {
			return this.columnData.filter(item => {
				return item.selected
			}).length === this.columnData.length
		}
	},
	watch: {
		visibleFlag: {
			immediate: true,
			handler (val) {
				if (val) {
					this.initHandler()
				}
			}
		}
	},
	methods: {
		onCloseClick () {
			this.$emit('update:visibleFlag', false)
		},
		onConfirmClick () {
			this.$emit('update:visibleFlag', false)
			this.$emit('update:planDetails', this.columnData)
			this.$emit('on-confirm', this.columnData)
		},
		initHandler () {
			this.columnData = this.$fxUtils.JSONcopy(this.planDetails)
		},
		onSelectAllClick () {
			const flag = this.isSelectedAllColumn
			this.columnData.forEach(item => {
				item.selected = !flag
			})
		},
		onColumnTabClick (item) {
			item.selected = !item.selected
		},
		onPlanListClick () {
			this.syncAuth().then(() => {
				this.plansActionShow = true
			})
		},
		onPlanListSelect (item) {
			this.$emit('update:plan', item)
			this.planDetailsApi(item.id).then(res => {
				this.$emit('update:planDetails', res)
				this.columnData = this.$fxUtils.JSONcopy(res)
				this.plansActionShow = false
			})
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.filter-popup {
	height:100%
	width: 100%
	text-align:left
	display: flex
	flex-direction: column
	.header-confirm-btn {
		width:60px
	}
	.filter-content {
		flex:1
		overflow:scroll
		.column-select-all, .column-select-item {
			box-sizing:border-box
			display: inline-block
			padding: 8px 20px
		}
		.column-select-all {
			width: 100%
		}
		.column-select-item {
			width:50%
		}
		.column-select-tab {
			height: 30px
			line-height:30px
			border-radius: 25px
			text-align:center
			border: 1px solid $fxGraySimple
			background-color: $fxGraySimple
			box-sizing:border-box
			&.is-active {
				border: 1px solid $fxBlue
				background-color: $fxBlueLight
				color: $fxBlue
				font-weight: 700
			}
		}
	}
	.filter-bottom {
		.reprot-form-plan-title, .reprot-form-plan-value {
			height:40px
			line-height:40px
			font-size:16px
			padding-left:20px
		}
		.reprot-form-plan-title {
			font-weight:700
		}
	}
}
</style>
