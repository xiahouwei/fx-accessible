<template>
	<fx-item-row-edit
		:title="itemData.goodsDTO.name"
		@on-back="onConfirmClick"
	>
		<van-cell-group>
			<w-cell title="品项编号">{{itemData.goodsDTO.code}}</w-cell>
			<w-cell title="净重量">{{itemData.netWeight}}</w-cell>
			<w-cell title="毛重量">{{itemData.grossWeight}}</w-cell>
			<w-cell title="皮重量">{{itemData.skinWeight}}</w-cell>
			<w-cell title="称重单位">{{itemData.weightUnit}}</w-cell>
			<w-cell
				title="图片"
				:is-link="!!itemData.weightPic"
				@click="onWeigthPicClick"
			>查看</w-cell>
			<w-cell title="账存金额">{{itemData.billMoney}}</w-cell>
			<w-cell title="含税账存金额">{{itemData.billTaxMoney}}</w-cell>
			<w-cell title="实盘金额">{{itemData.factMoney}}</w-cell>
			<w-cell title="含税实盘金额">{{itemData.factTaxMoney}}</w-cell>
			<w-cell title="盈亏金额">{{itemData.diffMoney}}</w-cell>
			<w-cell title="含税盘亏金额">{{itemData.diffTaxMoney}}</w-cell>
			<w-cell title="辅助单位差异数">{{itemData.assistDiffAmoun}}</w-cell>
			<w-cell title="库位号">{{itemData.storeHouseName}}</w-cell>
			<w-cell title="批次号">{{itemData.batchCode}}</w-cell>
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
	</fx-item-row-edit>
</template>

<script>
export default {
	name: 'itemRowEdit',
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
	computed: {
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
		onWeigthPicClick () {
			if (this.itemData.weightPic) {
				this.$fxImagePreview([this.itemData.weightPic])
			}
		}
	}
}
</script>
