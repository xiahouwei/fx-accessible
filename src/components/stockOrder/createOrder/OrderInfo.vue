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
							title="采购机构"
							value-class="info-item-value"
							:value="data.shopDTO && data.shopDTO.name"
							:is-link="!isDisabled && isStockType([0])"
							@click="onEmitClick('on-shop-click')"
						/>
						<van-cell
							class="info-item"
							title="供货商"
							value-class="info-item-value"
							:value="data.supplierDTO && data.supplierDTO.name"
							:is-link="!isDisabled && isStockType([0])"
							@click="onEmitClick('on-supplier-click')"
						/>
						<van-cell
							class="info-item"
							title="业务日期"
							:value="formatterDate(data.businessDate)"
							:is-link="!isDisabled && isStockType([0,2])"
							@click="onSaleEmitClick('on-busdate-click')"
						/>
						<van-cell
							class="info-item"
							title="到货日期"
							:value="formatterDate(data.arriveDate)"
							:is-link="!isDisabled && isStockType([0, 2])"
							@click="onSaleEmitClick('on-arriveDate-click')"
						/>
						<van-cell
							class="info-item"
							title="单据类型"
							value-class="info-item-value"
							:value="data.businessTypeDTO && data.businessTypeDTO.name"
							@click="onSaleEmitClick('on-billType-click')"
						>
							<van-icon
								slot="right-icon"
								v-show="!isDisabled && isStockType([0, 2])"
								:name="!hasBillType ? 'arrow' : 'close'"
								class="item-clear-btn"
								@click.stop="!hasBillType ? onSaleEmitClick('on-billType-click') : onSaleEmitClick('on-billType-clear')"
							/>
						</van-cell>
						<van-cell
							class="info-item"
							title="配送中心"
							value-class="info-item-value"
							:value="data.rdcDTO && data.rdcDTO.name"
							:is-link="false"
							@click="onEmitClick('on-rdc-click')"
						/>
					</van-tab>
					<van-tab title="更多">
						<van-cell class="info-item" title="制单人" :value="data.billEmp" />
						<van-cell class="info-item" title="制单日期" :value="formatterDate(data.billDate)" />
						<van-cell class="info-item" title="审核人" :value="data.checkEmp" />
						<van-cell class="info-item" title="审核日期" :value="formatterDate(data.checkDate)" />
						<!-- <van-cell class="info-item" title="上级单据" :value="data.highBill" is-link /> -->
						<!-- <van-cell class="info-item" title="下级单据" :value="data.lowBill" is-link /> -->
						<!-- <van-cell class="info-item" title="单据履历" :value="data.billRecord" is-link /> -->
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
		// 生成方式 0自采 1直配 2外销 0可编辑
		// 直配、外销把仓库、单位置为不可用
		isStockType (state) {
			return state => {
				if (Object.prototype.toString.call(state) === '[object Array]') {
					return state.includes(this.data.stockType)
				} else {
					return this.data.stockType === state
				}
			}
		}
	},
	methods: {
		onEmitClick (type) {
			if (this.isDisabled || this.isStockType([1, 2])) {
				return false
			}
			this.$emit(type)
		},
		onSaleEmitClick (type) {
			if (this.isDisabled || this.isStockType([1])) {
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

