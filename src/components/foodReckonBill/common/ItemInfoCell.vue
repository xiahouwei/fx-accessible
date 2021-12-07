<template>
	<div class="item-info-cell">
		<div class="item-img">
			<img :src="comptedItemImgSrc(null)" :onerror="$fxCommon.errorImg('item')">
		</div>
		<div class="item-details">
			<div class="item-name fx-ellipsis">{{itemData.foodName}}</div>
			<div class="details-cell">
				<div class="item-spec fx-ellipsis"></div>
				<div class="item-amount">
					<span>{{itemData.totalFoodCount}}</span>
				</div>
				<div class="unit-text">
					<span class="fx-ellipsis cell-unit">{{itemData.foodUnitName}}</span>
				</div>
			</div>
		</div>
		<i v-show="!isDisabled" class="block-item-edit" @click="onItemEditClick"></i>
		<i v-show="isDisabled && showEditBtn" class="block-item-watch" @click="onItemEditClick"></i>
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
		isDisabled: Boolean,
		showEditBtn: {
			type: Boolean,
			default: () => {
				return true
			}
		}
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
			isHasGoods: false
		}
	},
	methods: {
		editItem () {
			if (this.itemData.id) this.$set(this.itemData, 'changeType', 'edit')
		},
		onItemEditClick () {
			this.editItem()
			this.$emit('on-item-edit', this.itemData)
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
		padding: 10px
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
		.unit-text {
			line-height:30px
			height:30px
			width: 56px
			text-align: right
			.unit-icon {
				height: 100%
				vertical-align: bottom
			}
		}
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
