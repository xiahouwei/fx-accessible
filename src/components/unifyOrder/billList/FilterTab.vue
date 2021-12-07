<template>
	<div class="shopOrder-filter fx-shadow-down">
		<div class="filter-state" @click="onStateClick">
			<span>审核状态</span>
			<van-icon name="arrow-down" class="filter-arrow" />
			<span>{{state}}</span>
		</div>
		<div class="filter-differenceFlag" @click="onDifferenceFlagClick">
			<span>差异状态</span>
			<van-icon name="arrow-down" class="filter-arrow" />
			<span>{{differenceFlag}}</span>
		</div>
	</div>
</template>

<script>
export default {
	name: 'filterTab',
	props: {
		state: String,
		differenceFlag: String
	},
	methods: {
		onStateClick () {
			this.$emit('on-state-click')
		},
		onDifferenceFlagClick () {
			this.$emit('on-differenceFlag-click')
		}
	}
}
</script>
<style lang="stylus" scoped>
	@import '~$assets/stylus/varsty.styl'
.shopOrder-filter {
	display: flex;
	flex-direction: row;
	height:50px
	line-height:50px
	border-bottom:1px solid $fxBorder
	box-shadow:0px 2px 6px $fxBorder
	font-size:14px
	&>div {
		flex:1
	}
	.filter-arrow {
		margin-left:10px
		margin-right:20px
	}
	.filter-state {
		position:relative
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
</style>
