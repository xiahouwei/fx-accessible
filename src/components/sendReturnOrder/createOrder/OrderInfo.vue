<template>
	<div class="order-info-block fx-shadow-block">
		<van-collapse v-model="activeNames" :border="false">
			<van-collapse-item name="1" :disabled="collapseDisabled">
				<div slot="title" class="info-title">
					<span class="info-title-name">单据信息</span>
					<stateText class="stateTag fl-r" :billState="data.billState"></stateText>
				</div>
				<van-tabs v-model="tabActive" animated>
					<van-tab title="表头">
						<van-cell
							class="info-item"
							title="退货机构"
							value-class="info-item-value"
							:value="data.shopDTO && data.shopDTO.name"
							:is-link="isCreated && !loginerIsShop"
							@click="onShopClick"
						/>
						<van-cell
							class="info-item"
							title="供货商"
							value-class="info-item-value"
							:value="data.supplierDTO && data.supplierDTO.name"
							:is-link="!isDisabled"
							@click="onEmitClick('on-supplier-click')"
						/>
						<van-cell
							class="info-item"
							title="发单状态"
							value-class="info-item-value"
							:value="computedSendState(data.ediSendState)"
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
								v-show="!isDisabled"
								:name="!hasBillType ? 'arrow' : 'close'"
								class="item-clear-btn"
								@click.stop="!hasBillType ? onEmitClick('on-billType-click') : onEmitClick('on-billType-clear')"
							/>
						</van-cell>
						<van-cell
							class="info-item"
							title="系统单号"
							value-class="info-item-value"
							:value="data.sysbillCode"
						/>
						<van-cell
							class="info-item"
							title="业务日期"
							:value="formatterDate(data.businessDate)"
							:is-link="!isDisabled"
							@click="onEmitClick('on-busdate-click')"
						/>
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
							:disabled="isDisabled"
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
		isCreated: Boolean,
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
			loginerOrganType: state => state.loginer.loginerOrganType
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
		computedSendState (sendState) {
			return sendState => {
				let stateText = ''
				switch (sendState) {
				case 0 :
					stateText = '未发送'
					break
				case 1 :
					stateText = '已发送'
					break
				case 2 :
					stateText = '已同意'
					break
				case 3 :
					stateText = '已发货'
					break
				case 4 :
					stateText = '已收货'
					break
				case 9 :
					stateText = '被退回'
					break
				default :
					stateText = '未发送'
				}
				return stateText
			}
		},
		loginerIsShop () {
			return this.$fxStateMiddleware.stateIs('loginerOrganType')('shop')(this.loginerOrganType)
		},
		hasBillType () {
			return this.data.businessTypeDTO && this.data.businessTypeDTO.id
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
		onShopClick () {
			if (!this.isCreated || this.loginerIsShop || this.isDisabled) return false
			this.onEmitClick('on-shop-click')
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
