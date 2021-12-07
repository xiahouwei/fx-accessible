<template>
	<div class="order-block fx-shadow-block" @click="onClick">
		<checkBox
			:visibleFlag="showCheckBox"
			:checked="data.checked"
			@on-checkbox-click="onClick"></checkBox>
		<div class="block-content">
			<div class="block-title">
				<i class="block-icon"></i>
				<span class="title-text">{{data.rdcDTO.name}}</span>
				<fx-state-tag
					type="stateCld"
					:billState="data.billStateFlag"
					:reCheckState="data.billReState"
					class="state-tag"
				>
				</fx-state-tag>
				<fx-state-tag
					type="weightStateCld"
					:weightState="data.weightState"
					class="weight-state-tag"
				></fx-state-tag>
			</div>
			<div class="block-value">
				<div class="order-No">{{data.sysbillCode}}</div>
			</div>
			<div class="block-value">
				<div class="order-No">
					<span>供货商：</span>
					<span>{{data.supplierDTO.name}}</span>
				</div>
				<div
					class="order-date fx-price-font"
					v-show="$fxAuth('stockInBill4cld.canSeeMoney')">
					<span>含税金额（含运费）：</span>
					<span>￥{{toFixedNumberSize(data.sumTaxInMoney)}}</span>
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
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import checkBox from '@/components/common/CheckBox.vue'
export default {
	name: 'OrderBlock',
	components: {
		checkBox
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
			sysMoneyPointSize: 'sysMoneyPointSize'
		}),
		toFixedNumberSize (data) {
			return (data) => {
				return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysMoneyPointSize))
			}
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
	box-sizing: border-box
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
			.block-icon {
				width:20px
				height:20px
				background-image:url('~images/icon/icon-shop.png')
				background-repeat:no-repeat
				background-position: center
				background-size: 16px
				display:inline-block
				vertical-align: middle
				margin-right:5px
				position: relative
				top: 5px;
			}
			.title-text {
				display:inline-block
				width:170px
				overflow: hidden
				text-overflow: ellipsis
				white-space: nowrap
				vertical-align: middle
				height: 30px
				line-height: 30px
				margin-right:5px
				flex:1
			}
			.state-tag {
				position: relative;
				top: 2px;
			}
			.weight-state-tag {
				position: relative;
				top: 2px;
				margin-left: 5px
			}
		}
		.block-value {
			display: flex;
			flex-direction: row
			.order-No {
				flex:1
			}
			.order-date {
				flex:1
				text-align:right
			}
		}
	}
}
</style>
