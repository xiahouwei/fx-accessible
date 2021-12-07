<template>
	<fx-item-row-edit
		:title="itemData.goodsDTO.name"
		@on-back="onConfirmClick"
	>
		<van-cell-group>
			<w-cell title="申购数量">{{itemData.parentAmount ? itemData.parentAmount : 0}}</w-cell>
			<van-pro-number-field
				v-model="itemData.price"
				label="非税单价"
				input-align="right"
				min="0"
				:defaultValue="0"
				:max="maxAmount"
				:intLength="numberLength"
				:pointSize="sysMoneyPointSize"
				:disabled="isDisabled || !itemData.canChangePriceFlag"
				@change="onPriceChange"
				v-show="$fxAuth('stockOrderBill4cld.canSeeMoney')"
			></van-pro-number-field>
			<van-pro-number-field
				v-model="itemData.inMoney"
				label="非税金额"
				input-align="right"
				min="0"
				:defaultValue="0"
				:max="maxAmount"
				:intLength="numberLength"
				:pointSize="sysMoneyPointSize"
				:disabled="isDisabled || !itemData.canChangePriceFlag"
				@change="onInMoneyChange"
				v-show="$fxAuth('stockOrderBill4cld.canSeeMoney')"
			></van-pro-number-field>
			<w-cell
				title="税率"
				:is-link="!isDisabled"
				:disabled="isDisabled || !itemData.canChangeTaxFlag"
				@click="onTaxClick"
				v-show="$fxAuth('stockOrderBill4cld.canSeeMoney')"
			>{{fomatterTaxes(itemData.tax)}}</w-cell>
			<van-pro-number-field
				v-model="itemData.taxPrice"
				label="含税单价"
				input-align="right"
				min="0"
				:defaultValue="0"
				:max="maxAmount"
				:intLength="numberLength"
				:pointSize="sysMoneyPointSize"
				:disabled="isDisabled || !itemData.canChangePriceFlag"
				@change="onTaxPriceChange"
				v-show="$fxAuth('stockOrderBill4cld.canSeeMoney')"
			></van-pro-number-field>
			<van-pro-number-field
				v-model="itemData.inMoneyWithTax"
				label="含税金额"
				input-align="right"
				min="0"
				:defaultValue="0"
				:max="maxAmount"
				:intLength="numberLength"
				:pointSize="sysMoneyPointSize"
				:disabled="isDisabled || !itemData.canChangePriceFlag"
				@change="onTaxInMoneyChange"
				v-show="$fxAuth('stockOrderBill4cld.canSeeMoney')"
			></van-pro-number-field>
			<w-cell
				title="税额"
				v-show="$fxAuth('stockOrderBill4cld.canSeeMoney')"
			>{{itemData.taxInMoney}}</w-cell>
			<w-cell title="品项编号">{{itemData.goodsDTO.code}}</w-cell>
			<van-pro-field
				ref="memo"
				v-model="itemData.memo"
				:placeholder="setPlaceholder('请输入备注')"
				:disabled="isDisabled"
				label="备注"
				input-align="right"
				@focus="onFocus('memo')"
			/>
		</van-cell-group>
		<w-button
			slot="bottom-btn"
			v-if="!isDisabled"
			size="large"
			type="primary"
			@click="onConfirmClick"
		>保存
		</w-button>
		<taxesActionSheet
			v-model="taxesActionShow"
			:sync="true"
			@on-taxes-select="onTaxesSelect"
		></taxesActionSheet>
	</fx-item-row-edit>
</template>

<script>
import { mapState } from 'vuex'
import taxesActionSheet from '@/components/common/taxesActionSheet.vue'
export default {
	name: 'itemRowEdit',
	components: {
		taxesActionSheet
	},
	props: {
		visibleFlag: Boolean,
		itemData: {
			type: Object,
			default: () => {
				return {}
			}
		},
		isDisabled: Boolean
	},
	data () {
		return {
			taxesActionShow: false,
			taxClass: this.$fxAuth('stockOrderBill4cld.priceInTax') ? 'inTaxes' : 'outTaxes'
		}
	},
	computed: {
		...mapState({
			sysMoneyPointSize: 'sysMoneyPointSize',
			numberLength: 'numberLength',
			maxAmount: 'maxAmount'
		}),
		fomatterTaxes (value) {
			return (value) => {
				if (value) {
					return `${value}%`
				} else {
					return '0%'
				}
			}
		},
		setPlaceholder (val) {
			return (val) => {
				return this.isDisabled ? '' : val
			}
		}
	},
	methods: {
		onCloseClick () {
			this.$emit('update:visibleFlag', false)
		},
		onConfirmClick () {
			if (this.itemData.id) {
				this.itemData.changeType = 'edit'
			}
			this.$emit('on-Confirm', this.itemData)
			this.$emit('update:visibleFlag', false)
		},
		onFocus (ref) {
			this.$fxUtils.doScrollTop(this.$refs[ref].$el)
		},
		onPriceChange () {
			this.$fxCalculation('stockOrderBill4cld').changePrice(this.itemData, this.taxClass)
		},
		onInMoneyChange () {
			this.$fxCalculation('stockOrderBill4cld').changeMoney(this.itemData, this.taxClass)
		},
		onTaxPriceChange () {
			this.$fxCalculation('stockOrderBill4cld').changePriceWithTax(this.itemData, this.taxClass)
		},
		onTaxInMoneyChange () {
			this.$fxCalculation('stockOrderBill4cld').changeMoneyWithTax(this.itemData, this.taxClass)
		},
		onTaxClick () {
			this.taxesActionShow = true
		},
		onTaxesSelect (item) {
			this.itemData.tax = this.$fxUtils.toFixedParseNumber(item.tax * 100, 2, false)
			this.$fxCalculation('stockOrderBill4cld').changeTaxes(this.itemData, this.taxClass)
			this.taxesActionShow = false
		},
		onBatchCodeClear () {
			this.itemData.batchCode = ''
		}
	}
}
</script>
