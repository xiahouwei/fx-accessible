<template>
	<div class="itemRowEdit-popup">
		<w-header :title="currentItemData.goodsDTO.name" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div class="itemRowEdit-content">
			<van-cell-group>
				<van-cell
					v-show="$fxAuth('shopOrderBill.goodsSize')"
					title="品项规格"
					:value="currentItemData.goodsDTO.spec"
					value-class="info-item-value"
					class="fx-van-cell"
				/>
				<van-cell title="订货单位" :value="currentItemData.unitDTO.name" value-class="info-item-value" class="fx-van-cell"/>
				<van-cell title="实际分派数量" :value="currentItemData.assignAmount" value-class="info-item-value" class="fx-van-cell"/>
				<van-pro-field
					v-model="currentItemData.memo"
					label="备注"
					value-class="info-item-value"
					:placeholder="setPlaceholder('请输入备注')"
					input-align="right"
					:disabled="isDisabled"
					class="fx-van-cell"
				/>
				<van-cell v-if="$fxAuth('shopOrderBill.showReferenceMoney')" title="参考税率" :value="fomatterTaxes(currentItemData.consultTax)" value-class="info-item-value" class="fx-van-cell"/>
				<van-cell v-if="$fxAuth('shopOrderBill.showReferenceMoney')" title="参考税额" :value="currentItemData.consultTaxMoney" value-class="info-item-value" class="fx-van-cell"/>
				<van-cell v-if="$fxAuth('shopOrderBill.showReferenceMoney')" title="参考含税单价" :value="currentItemData.consultTaxPrice" value-class="info-item-value" class="fx-van-cell"/>
				<van-cell v-if="$fxAuth('shopOrderBill.showReferenceMoney')" title="参考含税金额" :value="currentItemData.consultMoneyWithTax" value-class="info-item-value" class="fx-van-cell"/>
				<van-cell title="配送属性" :value="fomatterDT(currentItemData.dispatchAttr)" value-class="info-item-value" class="fx-van-cell"/>
				<van-cell v-if="currentItemData.dispatchAttr === '2' && $fxSysAuth('shopOrderBill.directSelectSup')" title="供货商" :value="currentItemData.expectSupplierDTO && currentItemData.expectSupplierDTO.name" value-class="info-item-value" class="fx-van-cell" is-link @click="onSupplierClick" />
			</van-cell-group>
		</div>
		<div class="itemRowEdit-bottom">
			<van-button
				v-if="!isDisabled"
				class="confirm-btn fx-no-radius fx-btn"
				type="primary"
				@click="onConfirmClick"
			>保存</van-button>
			<van-button
				v-else
				class="confirm-btn fx-no-radius fx-btn"
				type="primary"
				@click="onCloseClick"
			>确定</van-button>
			<filterListPopup
				v-model="supplierPopShow"
				title="供货商检索"
				:rollingLoad="true"
				:getDataApi="getSupplierListData"
				@on-select="selectSupplier(arguments)"
			></filterListPopup>
		</div>
	</div>
</template>

<script>
import filterListPopup from '@/components/common/FilterListPopup.vue'
export default {
	name: 'itemRowEdit',
	components: {
		filterListPopup
	},
	props: {
		visibleFlag: Boolean,
		itemData: {
			type: Object,
			default: () => {
				return {}
			}
		},
		shopId: String,
		isDisabled: Boolean
	},
	data () {
		return {
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			supplierPopShow: false,
			currentItemData: {}
		}
	},
	computed: {
		setPlaceholder (val) {
			return (val) => {
				return this.isDisabled ? '' : val
			}
		},
		fomatterTaxes (value) {
			return (value) => {
				if (value) {
					let taxes = this.$fxUtils.toFixedSHW(value * 100, 2, false)
					return `${taxes}%`
				} else {
					return '0%'
				}
			}
		},
		fomatterDT (value) {
			return (value) => {
				let stateText = ''
				switch (value) {
				case '0' :
					stateText = '统配'
					break
				case '1' :
					stateText = '直配'
					break
				case '2' :
					stateText = '直送'
					break
				case '3' :
					stateText = '直通'
					break
				}
				return stateText
			}
		}
	},
	watch: {
		visibleFlag: {
			handler (val) {
				if (val) {
					this.currentItemData = JSON.parse(JSON.stringify(this.itemData))
				}
			},
			immediate: true
		}
	},
	methods: {
		onCloseClick () {
			this.$emit('update:visibleFlag', false)
		},
		onConfirmClick () {
			if (this.currentItemData.id) {
				this.currentItemData.changeType = 'edit'
			}
			this.$emit('on-Confirm', this.currentItemData)
			this.$emit('update:visibleFlag', false)
		},
		// {{{ 供货商
		onSupplierClick () {
			this.supplierPopShow = true
		},
		selectSupplier ([item]) {
			this.currentItemData.expectSupplierDTO = item
		},
		getSupplierListData (keyword = null, start, size) {
			let params = {
				pid: this.currentItemData.goodsDTO.id,
				sendGoodsId: this.currentItemData.sendGoodPlanDetailId,
				searchText: keyword,
				start: start,
				size: size
			}
			return this.$fxApi('shopOrderBill.getDirectGoodsSupplier', this.shopId)({ data: params }).then(res => {
				return res.suppliers
			})
		}
		// }}}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.itemRowEdit-popup {
	height:100%
	width: 100%
	text-align:left
	display: flex
	flex-direction: column
	.itemRowEdit-content {
		flex:1
		overflow:scroll
		.info-item-value {
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}
	.itemRowEdit-bottom {
		display: flex
		flex-direction: row
		width:100%
		.confirm-btn {
			flex:1
		}
	}
}
</style>
