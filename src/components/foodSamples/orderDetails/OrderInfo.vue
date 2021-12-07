<template>
	<div class="filter-info-popup fx-shadow-block">
		<van-cell-group>
			<van-cell title="机构名称" :value="data.shopDTO && data.shopDTO.name" value-class="info-item-value" is-link @click="onEmitClick('on-shop-click')" />
			<van-cell title="菜谱日期" :value="formatterDate(data.foodDate)" is-link @click="onEmitClick('on-foodDate-click')" />
			<van-cell title="餐别" :value="data.goodsMealsDTO && data.goodsMealsDTO.name" value-class="info-item-value" is-link @click="onEmitClick('on-meals-click')" />
			<van-cell title="菜品名称" :value="data.foodsDTO && data.foodsDTO.name" is-link @click="onEmitClick('on-food-click')" />
			<van-cell title="厨师" :value="data.cookDTO && data.cookDTO.name" value-class="info-item-value" is-link @click="onEmitClick('on-chef-click')" />
			<van-pro-number-field
				v-model="data.amount"
				label="留样重量(克)"
				input-align="right"
				min="0"
				:max="maxAmount"
				:defaultValue="0"
				:intLength="numberLength"
				:pointSize="sysPointSize"
			></van-pro-number-field>
		</van-cell-group>
	</div>
</template>

<script>
import { mapState } from 'vuex'
export default {
	name: 'filterInfo',
	props: {
		data: {
			type: Object,
			default: () => {
				return {}
			}
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
	height: 100%
	text-align: left
	display: flex
	flex-direction: column
}
</style>
