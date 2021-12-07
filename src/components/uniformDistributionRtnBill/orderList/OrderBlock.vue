<template>
	<div :style="orderBlockStyle" class="order-block fx-shadow-block" @click="onClick">
		<div class="block-title">
			<i class="block-icon"></i>
			<span class="title-text fx-ellipsis">{{data.rdcDTO.name}}</span>
			<stateTag :billState="data.billState" class="state-tag"></stateTag>
		</div>
		<div class="block-value">
			<div class="order-No fx-ellipsis">{{data.shopDTO.name}}</div>
			<div class="order-count">
				<span class="order-count-key">明细数：</span>
				<span class="order-count-value">{{data.detailCount}}</span>
			</div>
		</div>
		<div class="block-value">
			<div v-show="$fxAuth('uniformDistributionRtnBill.taxOutmoney')" class="order-No fx-price-font">
				<span>含税金额：</span>
				<span>￥{{data.sumTaxOutMoney | filterPrice({len: this.sysPointSize ,pushZero: false})}}</span>
			</div>
			<div class="order-date">
				<span>业务日期：</span>
				<span>{{data.businessDate | filterDateYMD}}</span>
				<van-icon name="arrow" class="order-date-arrow"/>
			</div>
		</div>
		<checkBox :visibleFlag="showCheckBox" :checked="data.checked" class="order-checkbox"></checkBox>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import checkBox from '@/components/common/CheckBox.vue'
import stateTag from '@/components/common/StateTag.vue'
export default {
	name: 'orderBlock',
	components: {
		checkBox,
		stateTag
	},
	props: {
		data: {
			type: Object,
			default: () => {
				return {}
			}
		},
		showCheckBox: {
			type: Boolean,
			default: false
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize'
		}),
		orderBlockStyle () {
			let paddingLeft = this.showCheckBox ? '50px' : '15px'
			return { 'paddingLeft': paddingLeft }
		}
	},
	methods: {
		onClick () {
			if (this.showCheckBox) {
				this.$set(this.data, 'checked', !this.data.checked)
			} else {
				this.$emit('on-click', this.data)
			}
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
		.difference-span {
			margin-left:10px
			color:$fxRed
		}
		.state-tag {
			position: relative;
			top: 2px;
		}
	}
	.block-value {
		display: flex
		flex-direction: row
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
		top: 50%
		left: 14px
		transform:translateY(-50%)
	}
}
</style>
