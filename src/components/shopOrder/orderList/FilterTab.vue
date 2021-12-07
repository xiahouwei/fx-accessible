<template>
	<div class="shopOrder-filter fx-shadow-down" :class="{'fx-big-size': fontSizeType !== 'normal'}">
		<div class="filter-item" @click="onStateClick">
			<span>审核状态</span>
			<van-icon name="arrow-down" class="filter-arrow" />
			<span>{{state}}</span>
		</div>
		<div class="filter-item" @click="onUrgencyClick">
			<span>是否加急</span>
			<van-icon name="arrow-down" class="filter-arrow" />
			<span>{{urgency}}</span>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
export default {
	name: 'filterTab',
	props: {
		state: String,
		urgency: String
	},
	computed: {
		...mapState({
			fontSizeType: state => state.stylusDynamic.fontSizeType
		})
	},
	methods: {
		onStateClick () {
			this.$emit('on-state-click')
		},
		onUrgencyClick () {
			this.$emit('on-urgency-click')
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
		overflow: hidden
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
