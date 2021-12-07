<template>
	<div class="bill-info-block fx-shadow-block">
		<van-collapse v-model="activeNames" :border="false">
			<van-collapse-item name="1" :disabled="collapseDisabled">
				<div slot="title" class="info-title">
					<span class="info-title-name">单据信息</span>
					<stateText class="stateTag fl-r" :billState="data.billState"></stateText>
					<span class="info-title-weightState" v-show="data.weightState === 1">待称重</span>
				</div>
				<van-tabs v-model="tabActive" animated>
					<van-tab title="表头">
						<van-cell-group>
							<van-cell class="info-item" title="收货门店" :value="data.shopDTO && data.shopDTO.name"/>
							<van-cell class="info-item" title="配送中心" :value="data.rdcDTO && data.rdcDTO.name"/>
							<van-cell class="info-item" title="系统单号" :value="data.sysbillCode"/>
							<van-cell
								class="info-item"
								title="业务日期"
								:value="formatterDate(data.businessDate)"
								:is-link="!isDisabled && $fxSysAuth('distributionInBill.modifyWorkDate')"
								@click="onBusDateClick"
							/>
							<van-cell
								class="info-item"
								title="到货日期"
								:value="formatterDate(data.arriveDate)"
								:is-link="!isDisabled"
								@click="onEmitClick('on-arriveDate-click')"
							/>
							<van-cell
								class="info-item"
								title="单据类型"
								:value="data.businessTypeDTO && data.businessTypeDTO.name"
							/>
							<van-pro-field
								v-model="data.billMemo"
								class="info-item"
								label="整单备注"
								:placeholder="isDisabled ? '' : '请输入整单备注'"
								input-align="right"
								:disabled="isDisabled"
							/>
						</van-cell-group>
					</van-tab>
					<van-tab title="更多">
						<van-cell-group>
							<van-cell class="info-item" title="制单人" :value="data.billEmp"/>
							<van-cell class="info-item" title="制单时间" :value="formatterDate(data.billDate)"/>
							<van-cell class="info-item" title="审核人" :value="data.checkEmp"/>
							<van-cell class="info-item" title="审核日期" :value="formatterDate(data.checkDate)"/>
							<van-cell class="info-item" title="订货日期" :value="formatterDate(data.orderDate)"/>
							<van-cell class="info-item" title="发货日期" :value="formatterDate(data.deliverDate)"/>
							<van-pro-field
								v-model="data.manualCode"
								class="info-item"
								label="手工单号"
								:placeholder="isDisabled ? '' : '请输入手工单号'"
								input-align="right"
								maxlength="50"
								:disabled="isDisabled"
							/>
						</van-cell-group>
					</van-tab>
				</van-tabs>
			</van-collapse-item>
		</van-collapse>
	</div>
</template>

<script>
import stateText from '@/components/common/StateText.vue'
export default {
	name: 'billInfo',
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
		collapseDisabled: Boolean,
		checkAllItemFlag: Boolean
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
		}
	},
	watch: {
		checkAllItemFlag: {
			handler (val) {
				if (val) {
					this.activeNames = ['0']
				} else {
					this.activeNames = ['1']
				}
			},
			immediate: true
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
		},
		onBusDateClick () {
			if (!this.$fxSysAuth('distributionInBill.modifyWorkDate')) {
				this.$toast({
					message: '当前没有修改业务日期权限!',
					position: 'top'
				})
				return false
			}
			this.onEmitClick('on-businessDate-click')
		}
	}
}
</script>

<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.bill-info-block {
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
.bill-info-block {
	.van-collapse-item__content {
		padding-top: 5px;
		padding-bottom: 5px;
		.van-tabs--line {
			padding-top: 24px !important
		}
		.van-tabs__wrap {
			height: 24px !important
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
