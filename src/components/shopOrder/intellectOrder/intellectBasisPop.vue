<template>
	<div class="inteledi-intellectBasisPop">
		<w-header title="智能订货依据" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div class="intellectBasis-content">
			<div class="content-house">
				<h1>订货仓库：</h1>
				<h1 class="house-value fx-ellipsis">{{data.houseName}}</h1>
			</div>
			<div>
				预估营业额：{{data.recMoney}}
				<a class="content-text" @click="onDayClick">日额依据</a>
			</div>
			<div class="content-block">
				<h1>智能订货品项：</h1>
				<div v-html="data.smartGoodsMemo" class="block-value"></div>
			</div>
			<div class="content-block">
				<h1>智能订货参数：</h1>
				<div v-html="data.smartPlanMemo" class="block-value"></div>
			</div>
		</div>
		<van-popup
			v-model="estimateDayPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<EstimateDayPop
				:estimateDayList="data.averDays"
				:visibleFlag.sync="estimateDayPopShow"
				:isDisabled="true"
			></EstimateDayPop>
		</van-popup>
	</div>
</template>

<script>
import EstimateDayPop from '@/components/shopOrder/intellectOrder/EstimateDayPop.vue'
export default {
	name: 'intellectBasisPop',
	components: {
		EstimateDayPop
	},
	props: {
		visibleFlag: Boolean,
		data: {
			type: Object,
			default: () => {
				return {}
			}
		}
	},
	data () {
		return {
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			estimateDayPopShow: false
		}
	},
	methods: {
		onCloseClick () {
			this.$emit('update:visibleFlag', false)
		},
		onDayClick () {
			if (!this.data.averDays.length) {
				this.$fxToast.top('没有日额依据数据!')
				return
			}
			this.estimateDayPopShow = true
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.inteledi-intellectBasisPop {
	height: 100%
	background: $fxWhite
	display: flex
	flex-direction: column
	.intellectBasis-content {
		display: flex
		flex-direction: column
		text-align: left
		padding: 10px 20px
		height: 100%
		.content-text {
			margin-left: 15px
			color: $fxBlue
			text-decoration: underline
		}
	}
	.content-house {
		padding: 8px 0px
		border-bottom: 1px solid $fxGray
		display: flex
		flex-direction: row
		.house-value {
			flex: 1
			text-align: right
		}
	}
	.content-block {
		flex: 1
		padding: 10px 0px
		display: flex
		flex-direction: column
		.block-value {
			margin-top: 5px
			padding: 5px 0
			border: 1px solid $fxGray
			flex: 1
		}
	}
	.content-params {
		flex: 1
	}
}
</style>
