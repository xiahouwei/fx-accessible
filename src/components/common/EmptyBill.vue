<template>
	<div class="order-empty">
		<img class="empty-icon" src="@/assets/images/img/order-empty.png">
		<div class="empty-text">{{message}}</div>
	</div>
</template>

<script>
export default {
	name: 'emptyBill',
	props: {
		message: {
			type: String,
			default: '暂无可查看的订单'
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.order-empty {
	flex:1
	.empty-icon {
		height:120px
		width:140px
		margin:0 auto
		margin-top:100px
	}
	.empty-text {
		color:$fxGray
	}
}
</style>
