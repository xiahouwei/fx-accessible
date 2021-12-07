<template>
	<div class="filter-info-popup fx-shadow-block">
		<div class="block-content">
			<div class="block-wrap">
				<h3 class="block-name fx-ellipsis fx-block-title">预估范围：</h3>
			</div>
			<div class="block-wrap">
				<div class="block-name fx-ellipsis">考虑同比：</div>
				<div class="block-right">
					<w-switch
						v-model="filterRange.sameCompare"
						type="normal"
					></w-switch>
				</div>
			</div>
			<div class="block-wrap">
				<div class="block-name fx-ellipsis">考虑环比：</div>
				<div class="block-right">
					<w-switch
						v-model="filterRange.ringCompare"
						type="normal"
					></w-switch>
				</div>
			</div>
			<div class="block-wrap">
				<div class="block-name fx-ellipsis">考虑订货前一天：</div>
				<div class="block-right">
					<w-switch
						v-model="filterRange.orderBeforeDay"
						type="normal"
					></w-switch>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
export default {
	name: 'filterRange',
	props: {
		filterRange: {
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
		})
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
	text-align:left
	display: flex
	flex-direction: column
	background-color: #fff
	padding: 9px 12px
	.block-content {
		flex: 1
		.block-title {
			height: 30px
			line-height: 30px
			$fx-dynamic-font-size(14px)
			font-weight: 700
			margin-bottom: 10px
			display: flex
			flex-direction: row
			overflow: hidden
			align-items: center
		}
		.block-wrap {
			display: flex
			flex-direction: row
			padding: 8px 0px
			margin-bottom: 0px
			.block-name {
				flex: 1
			}
			.block-right {
				flex: 1
				text-align: right
			}
		}
	}
}
</style>
