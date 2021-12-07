<template>
	<div class="item-info-cell">
		<div class="item-img">
			<img :src="comptedItemImgSrc(itemData.goodsDTO.imageUrls)" :onerror="$fxCommon.errorImg('item')">
		</div>
		<div class="item-details">
			<div class="item-name fx-ellipsis">{{itemData.goodsDTO.name}}</div>
			<div class="details-cell">
				<div class="item-spec fx-ellipsis">{{itemData.goodsDTO.spec}}</div>
				<div class="item-amount">
					<span>{{itemData.busUnitOutAmount}}</span>
				</div>
				<div class="unit-text">
					<span class="fx-ellipsis cell-unit">{{itemData.unitDTO.name}}</span>
				</div>
			</div>
			<div class="details-cell">
				<div class="item-spec fx-ellipsis">发货仓库</div>
				<div class="item-house">
					<span class="fx-ellipsis cell-house"><label @click="onCenterHouseClick">{{itemData.centerHouseDTO.name}}</label></span>
					<van-icon @click.stop="onCenterHouseClick" class="unit-icon" name="arrow" />
				</div>
			</div>
			<div class="details-cell">
				<div class="item-spec fx-ellipsis">库存数量</div>
				<div class="item-amount">
					<span :class="{'text-red': itemData.currentAmount < itemData.busUnitOutAmount}">{{itemData.currentAmount}}</span>
				</div>
				<div class="unit-text">
					<span class="fx-ellipsis cell-unit">{{itemData.unitDTO.name}}</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'itemInfoCell',
	props: {
		itemData: {
			type: Object,
			default: () => {
				return {}
			}
		},
		isDisabled: Boolean
	},
	computed: {
		comptedItemImgSrc (imageUrls) {
			return (imageUrls) => {
				return imageUrls === null ? '' : imageUrls[0]
			}
		}
	},
	data () {
		return {
		}
	},
	methods: {
		onCenterHouseClick () {
			this.$emit('on-centerHouse-edit', this.itemData)
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.item-info-cell {
	display: flex
	flex-direction: row
	height:120px
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
		.cell-house {
			width: 135px;
			display: inline-block;
		}
		.cell-unit {
			width: 35px;
			display: inline-block;
		}
		.item-spec {
			font-size:10px
			line-height:30px
			height:30px
			flex:1
			text-align:left
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
		.item-house {
			font-size:12px
			width:150px
			text-align:right
			line-height:30px
			height:30px
			overflow:hidden
			padding-right: 10px;
			.unit-icon {
				height: 100%
				vertical-align: bottom
			}
		}
		.item-amount-edit {
			width:100px
			overflow:hidden
			text-align: right;
			.amount-step {
				display:inline-block
			}
		}
		.unit-text {
			line-height:30px
			height:30px
			width: 56px
			.unit-icon {
				height: 100%
				vertical-align: bottom
			}
		}
	}
	.text-red {
		color: $fxRed
	}
	.block-item-edit {
		width:20px
		height:20px
		background-image:url('~images/icon/icon-item-edit.png')
		background-repeat:no-repeat
		background-position: center
		background-size: 100%
		position:absolute
		top:0
		right:0
	}
	.block-item-watch {
		width:20px
		height:20px
		background-repeat:no-repeat
		background-position: center
		background-size: 100%
		position:absolute
		top:0
		right:0
		background-image:url('~images/icon/icon-item-info.png')
	}
}
</style>
