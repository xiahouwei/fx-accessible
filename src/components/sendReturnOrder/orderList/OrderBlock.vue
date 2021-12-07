<template>
	<div class="order-block fx-shadow-block" @click="onClick">
		<checkBox
			:visibleFlag="showCheckBox"
			:checked="data.checked"
			class="order-checkbox"
			@on-checkbox-click="onClick"></checkBox>
		<div class="block-content">
			<div class="block-title">
				<i class="block-icon"></i>
				<span class="title-text fx-ellipsis">{{data.supplierDTO.name}}</span>
				<stateTag :billState="data.billState" class="state-tag"></stateTag>
				<sendBillStateTag :sendBillState="data.ediSendState" class="sendBill-state-tag" ></sendBillStateTag>
			</div>
			<div class="block-value">
				<div class="order-No fx-ellipsis">{{data.shopDTO.name}}</div>
				<div class="order-count">
					<span class="order-count-key">明细数：</span>
					<span class="order-count-value">{{data.detailCount}}</span>
				</div>
			</div>
			<div class="block-value">
				<div class="order-No fx-price-font">
					<span>含税金额：</span>
					<span>￥{{data.taxMoney | filterPrice({len: this.sysPointSize ,pushZero: false})}}</span>
				</div>
				<div class="order-date">
					<span>业务日期：</span>
					<span>{{data.businessDate | filterDateYMD}}</span>
					<van-icon name="arrow" class="order-date-arrow"/>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import checkBox from '@/components/common/CheckBox.vue'
import stateTag from '@/components/common/StateTag.vue'
import sendBillStateTag from '@/components/common/SendBillStateTag.vue'
export default {
	name: 'orderBlock',
	components: {
		stateTag,
		checkBox,
		sendBillStateTag
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
		})
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
	display: flex
	flex-direction: row
	align-items: center
	.order-checkbox {
		margin-right:10px
	}
	.block-content {
		flex:1
		.block-title {
			height:30px
			line-height:30px
			font-size:14px
			font-weight:700
			margin-bottom:10px
			display: flex
			flex-direction: row
			align-items: center
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
			}
			.title-text {
				display:inline-block
				width:190px
				vertical-align: middle;
				height: 30px;
				line-height: 30px;
				margin-right:5px
				flex:1
			}
			.sendBill-state-tag {
				margin-left: 5px;
			}
		}
		.block-value {
			display: flex;
			flex-direction: row;
			align-items: center
			.order-No {
				width: 129px
			}
			.order-count {
				flex:1
				text-align:right
				.order-count-key {
					margin-right:20px
				}
				.order-count-value {
					margin-right:20px
				}
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
}
</style>
