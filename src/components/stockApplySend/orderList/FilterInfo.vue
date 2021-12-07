<template>
	<div class="filter-info-popup fx-shadow-block">
		<van-cell-group>
			<van-cell title="业务日期"/>
			<van-cell title="起始时间" :value="filterParams.beginDate" is-link @click="onEmitClick('on-beginDate-click')" />
			<van-cell title="结束时间" :value="filterParams.endDate" is-link @click="onEmitClick('on-endDate-click')" />
			<van-cell title="申请机构" :value="filterParams.shop" value-class="info-item-value" is-link @click="onEmitClick('on-shop-click')" />
			<van-cell
				title="单据类型"
				:value="filterParams.billType"
				value-class="info-item-value"
				@click="onEmitClick('on-billtype-click')"
			>
				<van-icon
					slot="right-icon"
					:name="!filterParams.billTypeId ? 'arrow' : 'close'"
					class="item-clear-btn"
					@click.stop="!filterParams.billTypeId ? onEmitClick('on-billtype-click') : onEmitClick('on-billtypeclear-click')"
				/>
			</van-cell>
		</van-cell-group>
	</div>
</template>

<script>
export default {
	name: 'filterInfo',
	props: {
		filterParams: {
			type: Object,
			default: () => {
				return {}
			}
		}
	},
	methods: {
		onEmitClick (type) {
			this.$emit(type)
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.filter-info-popup {
	height:100%
	text-align:left
	display: flex
	flex-direction: column
}
</style>
