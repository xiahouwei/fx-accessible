<template>
	<div class="order-info-block fx-shadow-block">
		<van-collapse v-model="activeNames" :border="false">
			<van-collapse-item name="1" :disabled="collapseDisabled">
				<div slot="title" class="info-title">
					<span class="info-title-name">单据信息</span>
					<span v-show="$fxAuth('distributionOutBill4cld.sortingState')" class="stateTag fl-r">{{$fxStateMiddleware.getStateName('sortingState')(data.sortingState)}}</span>
					<span class="stateTag fl-r">{{$fxStateMiddleware.getStateName('stateCld')(data.billStateFlag)}}</span>
				</div>
				<van-tabs v-model="tabActive" animated>
					<van-tab title="表头">
						<w-cell
							class="info-item"
							title="配送中心"
							:is-link="!isDisabled"
						>{{data.sendOrgan && data.sendOrgan.name}}</w-cell>
						<w-cell
							class="info-item"
							title="盘点仓库"
							:is-link="!isDisabled"
						>{{data.outStore && data.outStore.name}}</w-cell>
						<w-cell
							class="info-item"
							title="业务人员"
						>{{data.busUser && data.busUser.name}}</w-cell>
						<w-cell
							class="info-item"
							title="业务日期"
							:is-link="!isDisabled"
						>{{formatterDate(data.businessDate)}}</w-cell>
						<w-cell
							class="info-item"
							title="单据类型"
							:is-link="!isDisabled"
						>{{data.businessTypeDTO && data.businessTypeDTO.name}}</w-cell>
						<van-pro-field
							v-model="data.billMemo"
							class="info-item"
							label="整单备注"
							:placeholder="isDisabled ? '' : '请输入整单备注'"
							input-align="right"
							maxlength="50"
							:disabled="isDisabled"
						/>
					</van-tab>
					<van-tab title="更多">
						<w-cell class="info-item" title="制单人">{{data.billEmp}}</w-cell>
						<w-cell class="info-item" title="制单日期">{{formatterDate(data.billDate)}}</w-cell>
						<w-cell class="info-item" title="审核人">{{data.checkEmp}}</w-cell>
						<w-cell class="info-item" title="审核日期">{{formatterDate(data.checkDate)}}</w-cell>
					</van-tab>
				</van-tabs>
			</van-collapse-item>
		</van-collapse>
	</div>
</template>

<script>
import { mapState } from 'vuex'
export default {
	name: 'orderInfo',
	props: {
		data: {
			type: Object,
			default: () => {
				return {}
			}
		},
		isDisabled: Boolean,
		collapseDisabled: Boolean
	},
	data () {
		return {
			activeNames: ['1'],
			tabActive: 0
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize',
			numberLength: 'numberLength',
			maxAmount: 'maxAmount'
		}),
		formatterDate (date) {
			return (date) => {
				if (typeof date === 'number') {
					return this.$fxUtils.setDateTime(new Date(date), '时分')
				} else {
					return ''
				}
			}
		},
		unCheckItemDoTypeName () {
			return this.$fxTypeMiddleware.getCommonTypeItemById('notCheckType')(this.data.unCheckItemDoType).name
		},
		groupFlagName () {
			return this.$fxTypeMiddleware.getCommonTypeItemById('checkWay')(this.data.groupFlag).name
		},
		costTypeName () {
			return this.$fxTypeMiddleware.getCommonTypeItemById('costType')(this.data.costType).name
		}
	},
	methods: {
		closeCollapse () {
			this.activeNames = []
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.order-info-block {
	width:340px
	margin:10px auto
	padding:5px
	text-align:left
	.info-title {
		.info-title-name {
			font-size:12px
		}
		.stateTag {
			font-size:12px
			margin-right:10px
		}
	}
	.info-item {
		font-size:12px !important
		padding:5px 0 !important
	}
}
</style>

