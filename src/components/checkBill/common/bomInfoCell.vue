<template>
	<div class="item-info-cell">
		<div class="item-img">
			<img :src="comptedItemImgSrc(itemData.goods.imageUrls)" :onerror="$fxCommon.errorImg('item')">
		</div>
		<div class="item-details">
			<div class="item-name-money">
				<div class="item-name fx-ellipsis">{{itemData.goods.name}}</div>
			</div>
			<div class="item-row">
				<span>{{itemData.bomName}}</span>
			</div>
			<div class="item-row item-amount">
				<span>{{itemData.bomAmount}}</span>
				<span class="item-unit-text">{{itemData.unit.name}}</span>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'bomInfoCell',
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
				if (!imageUrls) {
					return ''
				}
				return imageUrls.length === 0 ? '' : imageUrls[0]
			}
		}
	},
	methods: {}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.item-info-cell {
	display: flex
	flex-direction: row
	position:relative
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
			flex: 2
		}
		.item-name-money {
			display: flex
		}
		.item-row {
			font-size:12px
			line-height:30px
			height:30px
		}
		.item-amount {
			text-align: center
			margin-right:5px
		}
	}
}
</style>
