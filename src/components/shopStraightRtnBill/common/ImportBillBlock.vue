<template>
	<div class="order-block fx-shadow-block" @click="onClick">
		<div class="block-title">
			<i class="block-icon"></i>
			<span class="title-text">{{data.sysbillCode}}</span>
		</div>
		<div class="block-value">
			<div class="order-date">
				<span>业务日期：</span>
				<span>{{data.businessDate | filterDateYMD}}</span>
			</div>
			<div class="order-count">
				<span class="order-count-key">明细数：</span>
				<span class="order-count-value">{{data.detailCount}}</span>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'importBillBlock',
	props: {
		data: {
			type: Object,
			default: () => {
				return {}
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
		align-items: center
		.block-icon {
			width:20px
			height:20px
			background-image:url('~images/icon/icon-report-form.png')
			background-repeat:no-repeat
			background-position: center
			background-size: 16px
			margin-right:5px
		}
		.title-text {
			display:inline-block
			width:170px
			overflow: hidden
			text-overflow: ellipsis
			white-space: nowrap
			height: 30px
			line-height: 30px
			flex:1
		}
	}
	.block-value {
		display: flex
		flex-direction: row
		align-items: center
		.order-date {
			flex:1
			text-align:left
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
	}
}
</style>
