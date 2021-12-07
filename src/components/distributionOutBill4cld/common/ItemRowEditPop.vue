<template>
	<fx-item-row-edit
		:title="itemData.goodsDTO.name"
		@on-back="onConfirmClick"
	>
		<van-cell-group>
			<w-cell title="应发数量">{{itemData.shouldDeliverAmount || 0}}</w-cell>
			<w-cell v-show="$fxAuth('distributionOutBill4cld.seePriceMoney')" title="成本单价">{{itemData.costPrice}}</w-cell>
			<w-cell v-show="$fxAuth('distributionOutBill4cld.seePriceMoney')" title="成本金额">{{itemData.costMoney}}</w-cell>
			<w-cell title="成本价配送">
				<w-switch
					v-model="itemData.costDispatch"
					:disabled="isDisabled"
					type="normal"
				></w-switch>
			</w-cell>
			<van-pro-number-field
				v-show="$fxAuth('distributionOutBill4cld.seePriceMoney')"
				v-model="itemData.price"
				label="非税配送单价"
				input-align="right"
				min="0"
				:defaultValue="0"
				:max="maxAmount"
				:intLength="numberLength"
				:pointSize="sysMoneyPointSize"
				:disabled="isDisabled || costDispatched || gived || !itemData.canChangePriceFlag"
				@change="onPriceChange"
			></van-pro-number-field>
			<w-cell v-show="$fxAuth('distributionOutBill4cld.seePriceMoney')" title="非税配送金额">{{itemData.outMoney}}</w-cell>
			<w-cell title="规格">{{itemData.goodsDTO.spec}}</w-cell>
			<w-cell
				title="税率"
				:is-link="!isDisabled"
				:disabled="isDisabled || costDispatched || !itemData.canChangeTaxFlag"
				@click="onTaxClick"
			>{{fomatterTaxes(itemData.tax)}}</w-cell>
			<van-pro-number-field
				v-show="$fxAuth('distributionOutBill4cld.seePriceMoney')"
				v-model="itemData.taxPrice"
				label="含税配送单价"
				input-align="right"
				min="0"
				:defaultValue="0"
				:max="maxAmount"
				:intLength="numberLength"
				:pointSize="sysMoneyPointSize"
				:disabled="isDisabled || costDispatched || gived || !itemData.canChangePriceFlag"
				@change="onTaxPriceChange"
			></van-pro-number-field>
			<w-cell v-show="$fxAuth('distributionOutBill4cld.seePriceMoney')" title="含税配送金额">{{itemData.outMoneyWithTax}}</w-cell>
			<w-cell title="税额">{{itemData.taxOutMoney}}</w-cell>
			<w-cell title="品项编号">{{itemData.goodsDTO.code}}</w-cell>
			<w-cell title="赠送">
				<w-switch
					v-model="itemData.giftFlag"
					:disabled="isDisabled"
					type="normal"
					@change="changeGiftFlag"
				></w-switch>
			</w-cell>
			<w-cell title="批次号"
				:is-clear="!!itemData.batchCode && !isDisabled && $fxAuth('distributionOutBill4cld.editBatchCode')"
				:disabled="isDisabled"
				@on-clear="onBatchCodeClear"
			>{{itemData.batchCode}}</w-cell>
			<van-pro-field
				ref="memo"
				v-model="itemData.memo"
				:placeholder="setPlaceholder('请输入备注')"
				:disabled="isDisabled"
				label="备注"
				input-align="right"
				@focus="onFocus('memo')"
			/>
			<w-cell title="称重异常">{{itemData.shortageFlag}}</w-cell>
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
			taxesActionShow: false
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
		},
		costDispatched () {
			return this.itemData.costDispatch
		},
		gived () {
			return this.itemData.giftFlag
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
		changeGiftFlag (val) {
			this.$fxCalculation('distributionOutBill4cld').giftChange(this.itemData)
		},
		onFocus (ref) {
			this.$fxUtils.doScrollTop(this.$refs[ref].$el)
		},
		onPriceChange () {
			this.$fxCalculation('distributionOutBill4cld').changePrice(this.itemData)
		},
		onTaxPriceChange () {
			this.$fxCalculation('distributionOutBill4cld').changePriceWithTax(this.itemData)
		},
		onTaxClick () {
			this.taxesActionShow = true
		},
		onTaxesSelect (item) {
			this.itemData.tax = this.$fxUtils.toFixedParseNumber(item.tax * 100, 2, false)
			this.$fxCalculation('distributionOutBill4cld').changeTaxes(this.itemData)
			this.taxesActionShow = false
		},
		onBatchCodeClear () {
			this.itemData.batchCode = ''
		}
	}
}
</script>
