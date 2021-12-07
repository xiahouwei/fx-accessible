<template>
	<fx-item-row-edit
		:title="itemData.goodsDTO.name"
		@on-back="onCloseClick"
	>
		<van-cell-group>
			<w-cell title="品项编号">{{itemData.goodsDTO.code}}</w-cell>
			<w-cell title="品项名称">{{itemData.goodsDTO.name}}</w-cell>
			<w-cell title="规格">{{itemData.goodsDTO.spec}}</w-cell>
			<w-cell title="单位">{{itemData.mainUnit}}</w-cell>
			<w-cell title="单价">{{itemData.price}}</w-cell>
			<w-cell title="数量">{{itemData.busUnitOutAmount}}</w-cell>
			<w-cell title="金额">{{itemData.outMoney}}</w-cell>
			<w-cell v-if="itemData.assistUnit" title="辅助单位">{{itemData.assistUnit}}</w-cell>
			<w-cell v-if="itemData.assistUnit" title="辅助数量">{{itemData.outAssistAmount}}</w-cell>
			<w-cell title="生产时间">{{$fxUtils.setDateTime(new Date(itemData.productDate))}}</w-cell>
			<w-cell title="批次号">{{itemData.batchCode}}</w-cell>
			<w-cell title="主单位">{{itemData.mainUnit}}</w-cell>
			<w-cell title="主单位数量">{{itemData.mainAmount}}</w-cell>
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
		onFocus (ref) {
			this.$fxUtils.doScrollTop(this.$refs[ref].$el)
		}
	}
}
</script>
