<template>
	<div class="shopOrder-filter fx-shadow-down">
		<div class="filter-item" @click="onStateClick">
			<span>审核状态</span>
			<van-icon name="arrow-down" class="filter-arrow" />
			<span>{{state}}</span>
		</div>
		<div class="filter-item" @click="onEdiStateClick">
			<span>EDI状态</span>
			<van-icon name="arrow-down" class="filter-arrow" />
			<span>{{ediState}}</span>
		</div>
	</div>
</template>

<script>
export default {
	name: 'filterTab',
	props: {
		state: String,
		ediState: String
	},
	methods: {
		onStateClick () {
			this.$emit('on-state-click')
		},
		onEdiStateClick () {
			this.$emit('on-ediState-click')
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
