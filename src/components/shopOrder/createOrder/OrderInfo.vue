<template>
	<div class="order-info-block fx-shadow-block">
		<van-collapse v-model="activeNames" :border="false">
			<van-collapse-item name="1" :disabled="collapseDisabled">
				<div slot="title" class="fx-info-title">
					<span>单据信息</span>
					<stateText class="stateTag fl-r" :billState="data.billState"></stateText>
				</div>
				<van-tabs class="fx-info-tab" v-model="tabActive" animated>
					<van-tab title="表头">
						<van-cell
							class="fx-info-item"
							title="门店"
							title-class="info-item-title"
							value-class="info-item-value"
							:value="data.shopDTO && data.shopDTO.name"
							:is-link="!isDisabled"
							@click="onEmitClick('on-shop-click')"
						/>
						<van-cell
							class="fx-info-item"
							title="业务日期"
							:value="formatterDate(data.businessDate)"
							:is-link="!isDisabled"
							@click="onBusDateClick"
						/>
						<van-cell
							class="fx-info-item"
							title="到货日期"
							:value="formatterDate(data.arriveDate)"
							:is-link="!isDisabled"
							@click="onEmitClick('on-arriveDate-click')"
						/>
						<van-cell
							class="fx-info-item"
							title="单据类型"
							value-class="info-item-value"
							:value="data.businessTypeDTO && data.businessTypeDTO.name"
							@click="onEmitClick('on-billType-click')"
						>
							<van-icon
								slot="right-icon"
								v-show="!isDisabled"
								:name="!hasBillType ? 'arrow' : 'close'"
								class="item-clear-btn"
								@click.stop="!hasBillType ? onEmitClick('on-billType-click') : onEmitClick('on-billType-clear')"
							/>
						</van-cell>
						<van-cell
							class="fx-info-item"
							title="订货方案"
							value-class="info-item-value"
							:value="data.orderGoodsPlanDTO && data.orderGoodsPlanDTO.name"
							:is-link="!isDisabled"
							@click="onEmitClick('on-orderGoodsPlan-click')"
						/>
						<van-switch-cell
							v-model="data.urgentFlag"
							:disabled="isDisabled || !$fxAuth('shopOrderBill.urgentOrder')"
							class="fx-info-item"
							title="加急标识"
							@input="onUrgentInput"
						/>
						<van-switch-cell
							v-show="$fxAuth('shopOrderBill.attachFlag') && $fxSysAuth('shopOrderBill.sysOrderGoodsAttachPlan')"
							:value="formatType(data.attachFlag)"
							:disabled="isDisabled"
							class="fx-info-item"
							title="本次订货启用附属关系"
							@input="onAttachFlagInput"
						/>
					</van-tab>
					<van-tab title="更多">
						<van-cell class="fx-info-item" title="制单人" :value="data.billEmp" />
						<van-cell class="fx-info-item" title="制单日期" :value="formatterDate(data.billDate)" />
						<van-cell class="fx-info-item" title="审核人" :value="data.checkEmp" />
						<van-cell class="fx-info-item" title="审核日期" :value="formatterDate(data.checkDate)" />
						<!-- <van-cell class="info-item" title="上级单据" :value="data.highBill" is-link /> -->
						<!-- <van-cell class="info-item" title="下级单据" :value="data.lowBill" is-link /> -->
						<!-- <van-cell class="info-item" title="单据履历" :value="data.billRecord" is-link /> -->
						<van-pro-field
							v-model="data.manualCode"
							class="fx-info-item"
							label="手工单号"
							:placeholder="isDisabled ? '' : '请输入手工单号'"
							input-align="right"
							maxlength="50"
							:disabled="isDisabled"
						/>
						<van-pro-field
							v-model="data.billMemo"
							class="fx-info-item"
							label="整单备注"
							:placeholder="isDisabled ? '' : '请输入整单备注'"
							input-align="right"
							maxlength="50"
							:disabled="isDisabled"
						/>
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
		hasBillType () {
			return this.data.businessTypeDTO && this.data.businessTypeDTO.id
		},
		formatType (date) {
			return (date) => {
				if (date === '0') {
					return true
				} else {
					return false
				}
			}
		}
	},
	methods: {
		onEmitClick (type) {
			if (this.isDisabled) {
				return false
			}
			this.$emit(type)
		},
		onBusDateClick () {
			if (!this.$fxAuth('shopOrderBill.modifyBusinessDate')) {
				this.$toast({
					message: '当前没有修改业务日期权限!',
					position: 'top'
				})
				return false
			}
			this.onEmitClick('on-busdate-click')
		},
		onUrgentInput (checked) {
			if (checked) {
				return false
			}
			let items = this.data.details.filter(item => {
				return item.changeType !== 'del'
			})
			if (items.length > 0) {
				this.$dialog.confirm({
					title: '提示',
					message: '确定要更换加急标识吗？会清空明细！'
				}).then(() => {
					this.data.urgentFlag = false
					this.$emit('on-item-clear')
				}, () => {
					this.data.urgentFlag = true
				})
			}
		},
		onAttachFlagInput (checked) {
			if (checked) {
				this.data.attachFlag = '0'
			} else {
				this.data.attachFlag = '1'
			}
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
	.fx-info-title {
		.stateTag {
			margin-right:10px
		}
	}
	.info-item-title {
		display: block
	}
	.info-item-value {
		text-overflow: ellipsis
		white-space: nowrap
		flex: 1
		text-align: right
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
</style>

