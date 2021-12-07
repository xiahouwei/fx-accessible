<template>
	<div class="order-info-block fx-shadow-block">
		<van-collapse v-model="activeNames" :border="false">
			<van-collapse-item name="1" :disabled="collapseDisabled">
				<div slot="title" class="info-title">
					<span class="info-title-name">单据信息</span>
					<span class="stateTag fl-r">{{data.billReState === 1 ? '已复审' : $fxStateMiddleware.getStateName('stateCld')(data.billStateFlag)}}</span>
				</div>
				<van-tabs v-model="tabActive" animated>
					<van-tab title="表头">
						<w-cell
							class="info-item"
							title="配送中心"
							:is-link="!isDisabled"
							@click="onEmitClick('on-rdc-click')"
						>{{data.rdcDTO && data.rdcDTO.name}}</w-cell>
						<w-cell
							class="info-item"
							title="业务日期"
							:is-link="!isDisabled"
							@click="onBusDateClick"
						>{{formatterDate(data.businessDate)}}</w-cell>
						<w-cell
							class="info-item"
							title="客户(付款方集团)"
							:is-link="!isDisabled"
							@click="onEmitClick('on-shop-click')"
						>{{data.inShopDTO && data.inShopDTO.name}}</w-cell>
						<w-cell
							class="info-item"
							title="拣货人"
							:is-link="!isDisabled"
							@click="onEmitClick('on-picker-click')"
						>{{data.pickerId && data.pickerName}}</w-cell>
						<w-cell
							class="info-item"
							title="到货日期"
							:is-link="!isDisabled"
							@click="onEmitClick('on-arriveDate-click')"
						>{{formatterDate(data.arriveDate)}}</w-cell>
						<w-cell
							class="info-item"
							title="业务类型"
							:is-link="!isDisabled"
							@click="onEmitClick('on-billType-click')"
						>{{data.businessTypeDTO && data.businessTypeDTO.name}}</w-cell>
					</van-tab>
					<van-tab title="更多1">
						<van-pro-field
							type="textarea"
							v-model="data.billMemo"
							class="info-item"
							label="整单备注"
							:placeholder="isDisabled ? '' : '请输入整单备注'"
							input-align="right"
							maxlength="300"
							:disabled="isDisabled"
						/>
						<w-cell class="info-item" title="制单人">{{data.billEmp}}</w-cell>
						<w-cell class="info-item" title="制单日期">{{formatterDate(data.billDate)}}</w-cell>
						<w-cell class="info-item" title="提交人">{{data.submitEmp}}</w-cell>
						<w-cell class="info-item" title="提交日期">{{formatterDate(data.submitDate)}}</w-cell>
					</van-tab>
					<van-tab title="更多2">
						<w-cell class="info-item" title="审核人">{{data.checkEmp}}</w-cell>
						<w-cell class="info-item" title="审核日期">{{formatterDate(data.checkDate)}}</w-cell>
						<w-cell class="info-item" title="复审人">{{data.reCheckEmp}}</w-cell>
						<w-cell class="info-item" title="复审日期">{{formatterDate(data.reCheckDate)}}</w-cell>
					</van-tab>
				</van-tabs>
			</van-collapse-item>
		</van-collapse>
	</div>
</template>

<script>
import { mapState } from 'vuex'
export default {
	name: 'orderInfo',
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
			if (this.isDisabled) {
				return false
			}
			this.$emit(type)
		},
		closeCollapse () {
			this.activeNames = []
		},
		onBusDateClick () {
			this.onEmitClick('on-busdate-click')
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
	}
}
</style>

