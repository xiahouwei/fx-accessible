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
							:is-link="!isDisabled && data.autoType === 1"
							@click="onEmitClick('on-shop-click')"
						/>
						<van-cell
							class="info-item"
							title="发货仓库"
							value-class="info-item-value"
							:value="data.houseDTO && data.houseDTO.name"
							:is-link="!isDisabled && data.autoType === 1"
							@click="onEmitClick('on-house-click')"
						/>
						<van-cell
							class="info-item"
							title="客户"
							value-class="info-item-value"
							:value="data.customerDTO && data.customerDTO.name"
							:is-link="!isDisabled && data.autoType === 1"
							@click="onEmitClick('on-customer-click')"
						/>
						<van-cell
							class="info-item"
							title="业务日期"
							:value="formatterDate(data.businessDate)"
							:is-link="!isDisabled"
							@click="onBusDateClick"
						/>
						<van-cell
							class="info-item"
							title="到货日期"
							:value="formatterDate(data.arriveDate)"
							:is-link="!isDisabled && data.autoType !== 10"
							@click="onEmitClick('on-arriveDate-click')"
						/>
						<van-cell
							class="info-item"
							title="单据类型"
							value-class="info-item-value"
							:value="data.businessTypeDTO && data.businessTypeDTO.name"
							@click="onEmitClick('on-billType-click')"
						>
							<van-icon
								slot="right-icon"
								v-show="!isDisabled && data.autoType === 1"
								:name="!hasBillType ? 'arrow' : 'close'"
								class="item-clear-btn"
								@click.stop="!hasBillType ? onEmitClick('on-billType-click') : onEmitClick('on-billType-clear')"
							/>
						</van-cell>
						<van-cell class="info-item" title="外销属性" :value="formatterStockType(data.stockType)" />
						<van-cell v-if="isAutoType([10])" class="info-item" title="第三方单号" :value="data.thirdPartyId" />
						<van-cell v-if="isAutoType([10])" class="info-item" title="付款方式" :value="formatterPaymentWay(data.paymentWay)" />
					</van-tab>
					<van-tab title="更多">
						<van-cell class="info-item" title="制单人" :value="data.billEmp" />
						<van-cell class="info-item" title="制单日期" :value="formatterDate(data.billDate)" />
						<van-cell class="info-item" title="审核人" :value="data.checkEmp" />
						<van-cell class="info-item" title="审核日期" :value="formatterDate(data.checkDate)" />
						<van-pro-field
							v-model="data.manualCode"
							class="info-item"
							label="手工单号"
							:placeholder="isDisabled ? '' : '请输入手工单号'"
							input-align="right"
							maxlength="50"
							:disabled="isDisabled || isAutoType([10])"
						/>
						<van-pro-field
							v-model="data.billMemo"
							class="info-item"
							label="整单备注"
							:placeholder="isDisabled ? '' : '请输入整单备注'"
							input-align="right"
							maxlength="50"
							:disabled="isDisabled || isAutoType([10])"
						/>
						<!-- <van-cell class="info-item" title="上级单据" :value="data.highBill" is-link /> -->
						<!-- <van-cell class="info-item" title="下级单据" :value="data.lowBill" is-link /> -->
						<!-- <van-cell class="info-item" title="单据履历" :value="data.billRecord" is-link /> -->
						<van-cell v-if="isAutoType([10])" class="info-item" title="联系人" :value="data.orderUser" />
						<van-cell v-if="isAutoType([10])" class="info-item" title="联系方式" :value="data.orderPhone" />
						<van-cell v-if="isAutoType([10])" class="info-item" title="收货地址" :value="data.orderAddress" />
					</van-tab>
				</van-tabs>
			</van-collapse-item>
		</van-collapse>
	</div>
</template>

<script>
import { mapState } from 'vuex'
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
		formatterStockType (data) {
			return (date) => {
				if (date === 3) {
					return '直发'
				} else if (date === 2) {
					return '代发'
				} else {
					return ''
				}
			}
		},
		formatterPaymentWay () {
			return (date) => {
				if (date === 0) {
					return '线下'
				} else if (date === 1) {
					return '吾享'
				} else if (date === 2) {
					return '微信'
				} else if (date === 3) {
					return '支付宝'
				} else if (date === 4) {
					return '预付货款'
				} else {
					return ''
				}
			}
		},
		hasBillType () {
			return this.data.businessTypeDTO && this.data.businessTypeDTO.id
		},
		// 生成方式 0自动生成 1手动生成 10极速订2.0
		// 极速订2.0可以编辑业务日期
		isAutoType (state) {
			return state => {
				if (Object.prototype.toString.call(state) === '[object Array]') {
					return state.includes(this.data.autoType)
				} else {
					return this.data.autoType === state
				}
			}
		}
	},
	methods: {
		onEmitClick (type) {
			if (this.isDisabled || (this.data.autoType !== 1 && this.data.autoType !== undefined)) {
				return false
			}
			this.$emit(type)
		},
		onBusDateClick () {
			if (this.isDisabled || this.isAutoType([0])) {
				return false
			}
			this.$emit('on-busdate-click')
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
		.item-clear-btn {
			width:16px
			height:24px
			line-height:24px
			margin-left:5px
			font-size:16px
			color: $fxGraylight
		}
	}
}
</style>

