<template>
	<div class="order-block" @click="onClick">
		<checkBox
			:visibleFlag="showCheckBox"
			:checked="data.checked"
			class="order-checkbox"
			@on-checkbox-click="onClick"></checkBox>
		<div class="block-content">
			<div class="block-title">
				<span class="title-text fx-ellipsis">{{data.sysbillCode}}</span>
			</div>
			<div class="block-value">
				<div class="order-No fx-ellipsis">业务日期：</div>
				<div class="order-date">
					<span>{{formatterDate(data.businessDate)}}</span>
				</div>
			</div>
			<div class="block-value">
				<div class="order-No fx-ellipsis">到货日期：</div>
				<div class="order-date">
					<span>{{formatterDate(data.arriveDate)}}</span>
				</div>
			</div>
			<div class="block-value">
				<div class="order-No fx-ellipsis">单据类型：</div>
				<div class="order-date">
					<span>{{data.businessTypeDTO.name}}</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import checkBox from '@/components/common/CheckBox.vue'
export default {
	name: 'orderBlock',
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
		formatterDate (date) {
			return (date) => {
				if (typeof date === 'number') {
					return this.$fxUtils.setDateTime(new Date(date), '时分')
				} else {
					return ''
				}
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
	box-sizing: border-box;
	display: flex
	flex-direction: row
	align-items: baseline
	border-bottom: 1px solid #ebedf0
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
			overflow:hidden
			align-items: center
			.title-text {
				display:inline-block
				overflow: hidden;
				height: 30px;
				line-height: 30px;
				margin-right:5px
				flex:1
				width:190px
			}
			.block-urgency {
				width:30px
				height:30px
				background-image:url('~images/icon/icon-urgency.png')
				background-repeat:no-repeat
				background-position: center
				background-size: 100%
				margin-left: 10px;
			}
		}
		.block-value {
			display: flex
			flex-direction: row
			margin-bottom: 10px
			.order-No {
				flex:1
			}
			.order-date {
				flex:1
				text-align:right
				.order-date-arrow {
					position: relative
					top: 1px
				}
			}
		}
	}
}
</style>
