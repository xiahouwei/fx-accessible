<template>
	<div class="wind-empty">
		<img class="wind-empty__icon" src="@/assets/images/img/order-empty.png">
		<div class="wind-empty__text">{{message}}</div>
	</div>
</template>

<script>
export default {
	name: 'w-empty',
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
.wind-empty {
	flex:1
	&__icon {
		height:120px
		width:140px
		margin:0 auto
		margin-top:100px
	}
	&__text {
		color:$fxGray
	}
}
</style>
