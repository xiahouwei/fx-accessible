<template>
	<div class="wind-price-span">
		<span>¥</span>
		<span class="wind-price__int" :style="{'font-size': intSize}">{{priceInt}}</span>
		<span v-show="PriceFloat!==''" class="wind-price__float" :style="{'font-size': floatSize}">.{{PriceFloat}}</span>
	</div>
</template>
<script>
/**
 * PriceSpan by shang 2020/4/14
 * @desc PriceSpan 价格span
 */
export default {
	name: 'w-price-span',
	props: {
		price: [String, Number],
		intSize: String,
		floatSize: String
	},
	computed: {
		priceSplit () {
			const hasFloat = (this.price + '').indexOf('.')
			if (~hasFloat) {
				const _price = (this.price + '').split('.')
				return [_price[0], _price[1]]
			} else {
				return [this.price, '']
			}
		},
		priceInt () {
			return this.priceSplit[0]
		},
		PriceFloat () {
			return this.priceSplit[1]
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.wind-price-span {
	display:inline-block;
	color:$fxPrice;
	font-weight: 900;
	.wind-price__int {
		font-size: 30px;
	}
	.wind-price__float {
		font-size: 16px
	}
}
</style>
