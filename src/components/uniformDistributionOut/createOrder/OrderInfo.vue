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
							title="配送中心"
							value-class="info-item-value"
							:value="data.rdcDTO && data.rdcDTO.name"
							:is-link="!isDisabled && (data.autoType === 1 || data.autoType === undefined)"
							@click="onEmitClick('on-rdc-click')"
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
							title="门店"
							value-class="info-item-value"
							:value="data.inShopDTO && data.inShopDTO.name"
							:is-link="!isDisabled && (data.autoType === 1 || data.autoType === undefined)"
							@click="onEmitClick('on-shop-click')"
						/>
						<van-cell
							v-show="data.autoType === 1 || data.autoType === undefined"
							class="info-item"
							title="到货日期"
							:value="formatterDate(data.arriveDate)"
							:is-link="!isDisabled"
							@click="onEmitClick('on-arriveDate-click')"
						/>
						<van-pro-field
							v-model="data.manualCode"
							class="info-item"
							label="手工单号"
							:placeholder="isDisabled ? '' : '请输入手工单号'"
							input-align="right"
							maxlength="50"
							:disabled="isDisabled"
						/>
						<van-switch-cell
							v-model="data.expressFlag"
							v-show="$fxSysAuth('distributionOutBill.seeExpressFlag')"
							:disabled="isDisabled || (data.autoType !== 1 && data.autoType !== undefined)"
							class="info-item"
							title="加急标识"
							@input="onUrgentInput"
						/>
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
						<van-cell class="info-item" title="制单人" :value="data.billEmp" />
						<van-cell class="info-item" title="制单日期" :value="formatterDate(data.billDate)" />
						<van-cell class="info-item" title="审核人" :value="data.checkEmp" />
						<van-cell class="info-item" title="审核日期" :value="formatterDate(data.checkDate)" />
						<van-cell
							v-show="$fxSysAuth('distributionOutBill.seeBillType')"
							class="info-item"
							title="单据类型"
							value-class="info-item-value"
							:value="data.businessTypeDTO && data.businessTypeDTO.name"
							@click="onEmitClick('on-billType-click')"
						>
							<van-icon
								slot="right-icon"
								v-show="!isDisabled && (data.autoType === 1 || data.autoType === undefined)"
								:name="!hasBillType ? 'arrow' : 'close'"
								class="item-clear-btn"
								@click.stop="!hasBillType ? onEmitClick('on-billType-click') : onEmitClick('on-billType-clear')"
							/>
						</van-cell>
						<van-pro-number-field
							v-model="data.freight"
							v-show="$fxSysAuth('distributionOutBill.seeFreight')"
							label="运费"
							class="info-item info-number"
							input-align="right"
							min="0"
							:defaultValue="0"
							:max="maxAmount"
							:intLength="numberLength"
							:pointSize="sysPointSize"
							:disabled="isDisabled"
						></van-pro-number-field>
						<van-pro-number-field
							v-model="data.pieceAmount"
							v-show="$fxSysAuth('distributionOutBill.seePieceAmount')"
							label="件数"
							type="number"
							class="info-item"
							input-align="right"
							min="1"
							:max="maxAmount"
							:intLength="8"
							:integer="true"
							:disabled="isDisabled"
						></van-pro-number-field>
						<!-- <van-cell class="info-item" title="上级单据" :value="data.highBill" is-link /> -->
						<!-- <van-cell class="info-item" title="下级单据" :value="data.lowBill" is-link /> -->
						<!-- <van-cell class="info-item" title="单据履历" :value="data.billRecord" is-link /> -->
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
		hasBillType () {
			return this.data.businessTypeDTO && this.data.businessTypeDTO.id
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
			this.onEmitClick('on-busdate-click')
		},
		onUrgentInput () {
			if (this.data.autoType !== 1 && this.data.autoType !== undefined) {
				return false
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

