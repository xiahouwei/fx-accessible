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
				<span class="title-text fx-ellipsis">{{data.shopDTO.name}}</span>
				<stateTag
					:billState="data.billState"
					:reCheckState="data.billReState"
					class="state-tag"
				></stateTag>
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
	</div>
</template>

<script>
import checkBox from '@/components/common/CheckBox.vue'
import stateTag from '@/components/common/StateTag.vue'
import { mapState } from 'vuex'
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
				.order-date-arrow {
					position: relative
					top:1px
				}
			}
		}
	}
}
</style>
