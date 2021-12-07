<template>
	<div class="order-info-block fx-shadow-block">
		<van-collapse v-model="activeNames" :border="false">
			<van-collapse-item name="1" :disabled="collapseDisabled">
				<div slot="title" class="info-title">
					<span class="info-title-name">单据信息</span>
					<stateText class="stateTag fl-r" :billState="data.billState"></stateText>
					<span class="info-title-weightState" v-show="data.weightState === 1">待称重</span>
				</div>
				<van-tabs v-model="tabActive" animated>
					<van-tab title="表头">
						<van-cell
							class="info-item"
							title="机构"
							value-class="info-item-value"
							:value="data.shopDTO && data.shopDTO.name"
						/>
						<van-cell
							class="info-item"
							title="盘点仓库"
							value-class="info-item-value"
							:value="data.houseDTO && data.houseDTO.name"
						/>
						<van-cell
							class="info-item"
							title="系统单号"
							value-class="info-item-value"
							:value="data.sysbillCode"
						/>
						<van-cell
							class="info-item"
							title="盘点日期"
							:value="formatterDate(data.businessDate)"
						/>
						<van-pro-field
							v-model="data.manualCode"
							class="info-item"
							label="手工单号"
							:placeholder="isDisabled ? '' : '请输入手工单号'"
							maxlength="50"
							input-align="right"
							:disabled="isDisabled"
						/>
						<van-pro-field
							v-model="data.billMemo"
							class="info-item"
							label="整单备注"
							:placeholder="isDisabled ? '' : '请输入整单备注'"
							input-align="right"
							:disabled="isDisabled"
						/>
						<van-cell class="info-item" title="称重状态" :value="weightStateComputed"/>
					</van-tab>
					<van-tab title="更多">
						<van-cell class="info-item" title="制单人" :value="data.billEmp" />
						<van-cell class="info-item" title="制单日期" :value="formatterDate(data.billDate)" />
						<van-cell class="info-item" title="审核人" :value="data.checkEmp" />
						<van-cell class="info-item" title="审核日期" :value="formatterDate(data.checkDate)" />
						<van-cell class="info-item" title="盘点方案" :value="data.planName" />
						<van-cell class="info-item" title="生成方式" :value="data.hasSumBatch ? '合批' : '分批'"/>
					</van-tab>
				</van-tabs>
			</van-collapse-item>
		</van-collapse>
	</div>
</template>

<script>
import stateText from '@/components/common/StateText.vue'
export default {
	name: 'orderInfo',
	components: {
		stateText
	},
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
		formatterDate (date) {
			return (date) => {
				if (typeof date === 'number') {
					return this.$fxUtils.setDateTime(new Date(date), '时分')
				} else {
					return ''
				}
			}
		},
		weightStateComputed () {
			let weightState = ['未称重', '待称重', '称重中', '已称重']
			return weightState[this.data.weightState]
		}
	},
	methods: {
		onEmitClick (type) {
			if (this.isDisabled) {
				return false
			}
			this.$emit(type)
		},
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
		.info-title-weightState {
			margin-left:20px
			color:$fxRed
			font-size:16px
		}
	}
	.info-item {
		font-size:12px !important
		padding:5px 0 !important
		.info-item-value {
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}
}
</style>
<style lang="stylus">
.order-info-block {
	.van-collapse-item__content {
		padding-top: 5px;
		padding-bottom: 5px;
		.van-tabs--line {
			padding-top: 24px !important
		}
		.van-tabs__wrap {
			height:24px !important
			.van-ellipsis {
				height:24px
				line-height:24px
				font-size:12px
			}
			&.van-hairline--top-bottom::after {
				border-width: 0 !important;
			}
		}
	}
}
</style>
