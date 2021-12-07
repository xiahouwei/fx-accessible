<template>
	<div :style="orderBlockStyle" class="order-block fx-shadow-block" @click="onClick">
		<div class="block-title">
			<i class="block-icon"></i>
			<span class="title-text">{{data.shopDTO.name}}</span>
			<stateTag :billState="data.billState" class="state-tag"></stateTag>
			<span v-show="data.reCheckState" class="reCheckState-span">已复审</span>
		</div>
		<div class="block-value">
			<div class="order-No">{{data.houseDTO.name}}</div>
			<div v-show="data.billState" class="order-date">
				<span>盈亏金额：</span>
				<span>{{data.sumPLMoney*(-1)}}</span>
			</div>
		</div>
		<div class="block-value">
			<div class="order-No">
				<span>明细数：</span>
				<span>{{data.detailCount}}</span>
			</div>
			<div class="order-date">
				<span>业务日期：</span>
				<span>{{data.businessDate | filterDateYMD}}</span>
				<van-icon name="arrow" class="order-date-arrow"/>
			</div>
		</div>
	</div>
</template>

<script>
import stateTag from '@/components/common/StateTag.vue'
export default {
	name: 'orderBlock',
	components: {
		stateTag
	},
	props: {
		data: {
			type: Object,
			default: () => {
				return {}
			}
		}
	},
	computed: {
		orderBlockStyle () {
			let paddingLeft = '15px'
			return { 'paddingLeft': paddingLeft }
		}
	},
	methods: {
		onClick () {
			this.$emit('on-click', this.data)
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.order-block {
	width:350px
	margin:10px auto
	padding:15px
	text-align:left
	position:relative
	box-sizing: border-box;
	.block-title {
		height:30px
		line-height:30px
		font-size:14px
		font-weight:700
		margin-bottom:10px
		display: flex
		flex-direction: row
		.block-icon {
			width:20px
			height:20px
			background-image:url('~images/icon/icon-shop.png')
			background-repeat:no-repeat
			background-position: center
			background-size: 16px
			display:inline-block
			vertical-align: middle;
			margin-right:5px
			position: relative;
			top: 5px;
		}
		.title-text {
			display:inline-block
			width:170px
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			vertical-align: middle;
			height: 30px;
			line-height: 30px;
			margin-right:5px
			flex:1
		}
		.reCheckState-span {
			margin-left:10px
			color:$fxRed
		}
		.state-tag {
			position: relative;
			top: 2px;
		}
	}
	.block-value {
		display: flex;
		flex-direction: row;
		margin-top:10px
		.order-No {
			flex:1
		}
		.order-date {
			flex:1
			text-align:right
			.order-date-arrow {
				position: relative;
				top:2px
			}
		}
	}
}
</style>
