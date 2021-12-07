<template>
	<div class="order-block fx-shadow-block" @click="onClick">
		<div class="block-title">
			<i class="block-icon"></i>
			<span class="title-text">{{data.foodsDTO.name}}</span>
			<stateTag :billState="data.billState" class="state-tag"></stateTag>
		</div>
		<div class="block-value">
			<div class="order-No">
				<span>厨师：</span>
				{{data.cookDTO.name}}
			</div>
			<div class="order-date">
				<span>餐别：</span>
				<span>{{data.goodsMealsDTO.name}}</span>
			</div>
		</div>
		<div class="block-value">
			<div class="order-No">
				<span>留样人：</span>
				<span>{{data.samplerDTO.name}}</span>
			</div>
			<div class="order-date">
				<span>菜谱日期：</span>
				<span>{{data.foodDate | filterDateYMD}}</span>
				<van-icon name="arrow" class="order-date-arrow"/>
			</div>
		</div>
	</div>
</template>

<script>
import stateTag from '@/components/foodSamples/common/StateTag.vue'
import { mapState } from 'vuex'
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
		...mapState({
			sysPointSize: 'sysPointSize'
		}),
		toFixedNumberSize (data) {
			return (data) => {
				return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysPointSize))
			}
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
            background-image:url('~images/icon/icon-food.png')
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
		.state-tag {
			position: relative;
			top: 2px;
		}
	}
	.block-value {
		display: flex;
		flex-direction: row;
		.order-No {
			flex:1
		}
		.order-date {
			flex:1
			text-align:right
			.order-date-arrow {
				position: relative;
				top:1px
			}
		}
	}
	.order-checkbox {
		position:absolute
		top: 50%;
		left: 14px;
		transform:translateY(-50%)
	}
}
</style>
