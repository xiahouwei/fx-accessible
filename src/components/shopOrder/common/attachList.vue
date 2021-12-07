<template>
	<div class="order-wrap">
		<w-header :title="attachPopTitle" :leftOptions="leftOptions" titleFontSize="3.733vw" :border="true" @on-click-back="onCloseClick"></w-header>
		<div class="order-item-block fx-shadow-block">
			<div class="item-title">
				<span class="title-name">附属明细</span>
			</div>
			<div class="item-list" ref="details-content">
				<div
					v-for="itemDetails in data"
					:key="itemDetails.sysbillCode"
					class="item-row"
				>
					<div class="item-info-title fx-ellipsis">{{itemDetails.sysbillCode}}</div>
					<div class="item-info-cell" v-for="itemData in itemDetails.details" :key="itemData.goodsDTO.id">
						<div class="item-img">
							<img :src="comptedItemImgSrc(itemData.goodsDTO.imageUrls || [])" :onerror="$fxCommon.errorImg('item')">
						</div>
						<div class="item-details">
							<div class="item-name fx-ellipsis">{{itemData.goodsDTO.name}}</div>
							<div class="details-cell">
								<div class="item-spec fx-ellipsis">
									{{$fxAuth('shopOrderBill.goodsSize') ? itemData.goodsDTO.spec : ''}}
								</div>
							</div>
							<div class="details-cell">
								<div class="item-store fx-ellipsis">{{itemData.houseDTO.name}}</div>
								<div class="item-amount">
									<span>{{itemData.busUnitAmount}}</span>
									<span class="fx-ellipsis">{{itemData.unitDTO.name}}</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="order-bottom">
			<van-button
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onCloseClick"
			>取消</van-button>
			<van-button
				class="bottom-btn fx-no-radius"
				type="info"
				@click="onCheckClick"
			>继续审核</van-button>
		</div>
	</div>
</template>

<script>
export default {
	name: 'orderItem',
	props: {
		data: {
			type: Array,
			default: () => {
				return []
			}
		},
		attachPopTitle: String,
		visibleFlag: Boolean
	},
	data () {
		return {
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			}
		}
	},
	computed: {
		comptedItemImgSrc (imageUrls) {
			return (imageUrls) => {
				return imageUrls.length === 0 ? '' : imageUrls[0]
			}
		}
	},
	methods: {
		onCloseClick () {
			this.$emit('update:visibleFlag', false)
		},
		onCheckClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要审核所选单据?'
			}).then(() => {
				this.$emit('update:visibleFlag', false)
				this.$emit('on-continue-check')
			})
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.order-wrap {
	height: 100%
	background: #fff
	display: -webkit-box
	display: -ms-flexbox
	display: flex
	-webkit-box-orient: vertical
	-webkit-box-direction: normal
	-ms-flex-direction: column
	flex-direction: column
	.item-info-title {
		display: -webkit-box;
		display: -ms-flexbox;
		display: flex;
		-webkit-box-orient: horizontal;
		-webkit-box-direction: normal;
		-ms-flex-direction: row;
		flex-direction: row;
		position: relative;
		padding: 15px 10px 5px 15px
	}
	.order-item-block {
		width:340px
		margin:5px auto
		padding:5px
		text-align:left
		flex:1
		display: flex
		flex-direction: column
		min-height: 1px;
		.item-title {
			height:40px
			line-height:40px
			border-bottom:1px solid $fxBorder
			.title-name {
				font-size:12px
				margin-left:10px
			}
		}
		.item-list {
			flex:1
			overflow:scroll
			position: relative
			.item-row {
				border-bottom:1px solid $fxBorder
			}
		}
	}
	.item-info-cell {
		display: flex
		flex-direction: row
		height:90px
		position: relative
		.item-img {
			width:80px
			height:90px
			padding:15px 10px
			box-sizing:border-box
			&>img {
				width:100%
				height:100%
			}
		}
		.item-details {
			flex:1
			overflow:hidden
			.item-name {
				font-size:12px
				line-height:30px
				height:30px
				padding-right:30px
			}
			.details-cell {
				display: flex
				flex-direction: row
				overflow:hidden
			}
			.item-spec {
				font-size:10px
				line-height:24px
				height:24px
				flex:1
			}
			.item-store {
				font-size:10px
				line-height:30px
				height:30px
				flex:1
			}
			.item-amount {
				font-size:12px
				width:100px
				text-align:right
				line-height:30px
				height:30px
				overflow:hidden
				padding-right: 10px;
			}
		}
	}
	.order-bottom {
		width:100%
		display: flex
		flex-direction: row
		.bottom-btn {
			flex:1
		}
	}
}
</style>
