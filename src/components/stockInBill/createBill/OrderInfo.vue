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
							title="入库机构"
							value-class="info-item-value"
							:value="data.shopDTO && data.shopDTO.name"
							:is-link="!isDisabled"
							@click="onEmitClick('on-shop-click')"
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
							title="业务日期"
							:value="formatterDate(data.businessDate)"
							:is-link="!isDisabled && modifyBusinessDateFlag"
							@click="onBusDateClick"
						/>
						<van-cell
							class="info-item"
							title="订货日期"
							:value="formatterDate(data.orderDate)"
							:is-link="!isDisabled"
							@click="onEmitClick('on-orderDate-click')"
						/>
						<van-cell
							class="info-item"
							title="单据类型"
							value-class="info-item-value"
							:value="data.businessTypeDTO && data.businessTypeDTO.name"
							@click="onBillTypeClick('on-billType-click')"
						>
							<van-icon
								slot="right-icon"
								v-show="!isDisabled || data.fatherId ? false : true"
								:name="!hasBillType ? 'arrow' : 'close'"
								class="item-clear-btn"
								@click.stop="!hasBillType ? onBillTypeClick('on-billType-click') : onBillTypeClick('on-billType-clear')"
							/>
						</van-cell>
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
					</van-tab>
					<van-tab title="更多">
						<van-cell class="info-item" title="制单人" :value="data.billEmp" />
						<van-cell class="info-item" title="制单日期" :value="formatterDate(data.billDate)" />
						<van-cell class="info-item" title="审核人" :value="data.checkEmp" />
						<van-cell class="info-item" title="审核日期" :value="formatterDate(data.checkDate)" />
						<van-cell
							v-if="data.id"
							class="info-item"
							title="上传附件"
							value-class="info-item-value"
							:is-link="!isDisabled"
							@click="onEmitClick('on-uploader-click')"
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
		collapseDisabled: Boolean,
		modifyBusinessDateFlag: {
			type: Boolean,
			default: false
		}
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
		}
	},
	methods: {
		onEmitClick (type) {
			if (this.isDisabled) {
				return false
			}
			this.$emit(type)
		},
		onBillTypeClick (type) {
			if (this.isDisabled || this.data.fatherId !== null) {
				return false
			}
			this.$emit(type)
		},
		closeCollapse () {
			this.activeNames = []
		},
		onBusDateClick () {
			if (this.isDisabled) {
				return false
			}
			if (!this.modifyBusinessDateFlag) {
				this.$toast({
					message: '当前没有修改业务日期权限!',
					position: 'top'
				})
				return false
			}
			this.$emit('on-busdate-click')
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
