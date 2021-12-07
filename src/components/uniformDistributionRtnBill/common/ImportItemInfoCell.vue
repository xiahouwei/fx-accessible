<template>
	<div class="item-info-cell" @click="onClick">
		<checkBox
			:visibleFlag="true"
			:checked="itemData.checked"
			class="order-checkbox"
			@on-checkbox-click="onClick"
		></checkBox>
		<div class="item-img">
			<img :src="comptedItemImgSrc(itemData.goodsDTO.imageUrls || [])" :onerror="$fxCommon.errorImg('item')">
		</div>
		<div class="item-details">
			<div class="item-name fx-ellipsis">{{itemData.goodsDTO.name}}</div>
			<div v-show="$fxAuth('distributionInBill.seewithtaxmoney')" class="item-taxprice fx-ellipsis">
				<span>含税金额：￥</span>
				<span>{{itemData.inMoneyWithTax}}</span>
			</div>
			<div class="item-amount-spec">
				<div class="item-spec fx-ellipsis">{{itemData.goodsDTO.spec}}</div>
				<div class="item-amount">
					<span>入库数量：</span>
					<span class="item-amount-text">{{itemData.busUnitInAmount}}</span>
					<span>{{itemData.unitDTO.name}}</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import checkBox from '@/components/common/CheckBox.vue'
export default {
	name: 'importItemInfoCell',
	components: {
		checkBox
	},
	props: {
		itemData: {
			type: Object,
			default: () => {
				return {}
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
		onClick () {
			this.$set(this.itemData, 'checked', !this.itemData.checked)
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.item-info-cell {
	display: flex
	flex-direction: row
	height:90px
	align-items: center
	&:not(:last-of-type) {
		border-bottom:1px solid $fxBorder
	}
	.order-checkbox {
		margin-left:10px
	}
	.item-img {
		width:60px
		height:60px
		padding:0px 10px
		&>img {
			width:100%
			height:100%
		}
	}
	.item-details {
		flex:1
		overflow:hidden
		display: flex
		flex-direction: column
		.item-name {
			font-size:12px
			line-height:30px
			height:30px
			padding-right:30px
		}
		.item-taxprice {
			font-size:12px
			line-height:30px
			height:30px
		}
		.item-amount-spec {
			display: flex
			flex-direction: row
			align-items: center
			height:30px
			.item-spec {
				flex:1
				font-size:10px
			}
			.item-amount {
				font-size:12px
				text-align:right
				padding-right:20px
				.item-amount-text {
					margin-right:10px
				}
			}
		}
	}
}
</style>
