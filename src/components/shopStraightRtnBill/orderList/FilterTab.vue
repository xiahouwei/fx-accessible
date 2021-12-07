<template>
	<div class="shopStraightRtnBill-filter fx-shadow-down">
		<div class="filter-item" @click="onStateClick">
			<span>审核状态</span>
			<van-icon name="arrow-down" class="filter-arrow" />
			<span>{{state}}</span>
		</div>
	</div>
</template>

<script>
export default {
	name: 'filterTab',
	props: {
		state: String,
		sendBillState: String
	},
	methods: {
		onStateClick () {
			this.$emit('on-state-click')
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.shopStraightRtnBill-filter {
	display: flex;
	flex-direction: row;
	height:50px
	line-height:50px
	border-bottom:1px solid $fxBorder
	box-shadow:0px 2px 6px $fxBorder
	font-size:14px
	&>div {
		flex:0.5
	}
	.filter-arrow {
		margin-left:10px
		margin-right:20px
	}
	.filter-item {
		position:relative
		&:not(:last-of-type) {
			&::after {
				content:''
				width:1px
				height:30px
				position:absolute
				top:10px
				right:0
				background-color:$fxBorder
			}
		}
	}
}
</style>
