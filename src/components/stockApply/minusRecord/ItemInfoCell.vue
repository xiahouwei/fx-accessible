<template>
	<div class="order-block">
		<div class="block-content">
			<div class="block-title">
				<span class="title-text fx-ellipsis">{{itemData.goodsDTO.name}}</span>
			</div>
			<div class="block-value">
				<div class="order-No fx-ellipsis">减单数量：</div>
				<div class="order-date">
					{{itemData.reduceAmount}}
				</div>
			</div>
			<div class="block-value">
				<div class="order-No fx-ellipsis">减单人：</div>
				<div class="order-date">
					{{itemData.reduceEmp}}
				</div>
			</div>
			<div class="block-value">
				<div class="order-No fx-ellipsis">减单时间：</div>
				<div class="order-date">
					{{itemData.reduceDate | filterDateYMDHM}}
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'itemInfoCell',
	props: {
		itemData: {
			type: Object,
			default: () => {
				return {}
			}
		}
	},
	methods: {
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.order-block {
	width: 350px
	margin: 10px auto
	padding: 9px
	text-align: left
	position: relative
	box-sizing: border-box;
	display: flex
	flex-direction: row
	align-items: baseline
	border-bottom: 1px solid $fxGray
	.block-content {
		flex: 1
		.block-title {
			height: 30px
			line-height: 30px
			font-size: 14px
			font-weight: 700
			margin-bottom: 10px
			display: flex
			flex-direction: row
			overflow: hidden
			align-items: center
			.title-text {
				display: inline-block
				overflow: hidden;
				height: 30px;
				line-height: 30px;
				margin-right: 5px
				flex: 1
				width: 190px
			}
		}
		.block-value {
			display: flex
			flex-direction: row
			margin-bottom: 15px
			.order-No {
				flex: 1
			}
			.order-date {
				flex: 1
				text-align: right
			}
		}
		.block-last {
			margin-bottom: 0px
		}
	}
}
</style>
