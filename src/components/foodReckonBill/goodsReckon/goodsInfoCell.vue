<template>
	<div class="item-info-cell">
		<div class="item-img">
			<img :src="comptedItemImgSrc(null)" :onerror="$fxCommon.errorImg('item')">
		</div>
		<div class="item-details">
			<div class="item-name fx-ellipsis">{{itemData.goods.name}}</div>
			<div class="details-cell">
				<div class="item-title fx-ellipsis">系统预估用量:</div>
				<div class="item-select">
					<span class="item-num">{{itemData.totalGoodsCount}}</span>
					<div class="unit-text">
						<span class="fx-ellipsis cell-unit last-unit">{{itemData.unit.name}}</span>
					</div>
				</div>
			</div>
			<div class="details-cell">
				<div class="item-title fx-ellipsis">自定义预估用量:</div>
				<div class="item-select"  @click="onEmitClick('on-customizeCount-click')">
					<span class="item-num">{{itemData.totalCustomizeCount}}</span>
					<div class="unit-text">
						<span class="fx-ellipsis cell-unit">{{itemData.unit.name}}</span>
						<van-icon class="unit-icon" name="arrow" />
					</div>
				</div>
			</div>
			<div class="details-cell">
				<div class="item-title fx-ellipsis">异常信息:</div>
				<div class="item-select">
					<div class="info-text fx-ellipsis">
						{{itemData.abnormalInfo}}
					</div>
				</div>
			</div>
			<div class="details-cell">
				<div class="item-title fx-ellipsis">订货仓库:</div>
				<div class="item-select">
					<div class="unit-text" @click="onEmitClick('on-house-click')">
						<span class="item-num"></span>
						<span class="fx-ellipsis cell-house">{{itemData.house.name}}</span>
						<van-icon class="unit-icon" name="arrow" />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'goodsInfoCell',
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
		onEmitClick (type) {
			this.$emit(type, this.itemData)
		},
		editItem () {
			if (this.itemData.id) this.$set(this.itemData, 'changeType', 'edit')
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.item-info-cell {
	display: flex
	flex-direction: row
	height: 175px
	position: relative
	.item-img {
		width: 80px
		height: 175px
		padding: 55px 10px
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
		.cell-goods-unit {
			width: 90px;
			margin-left: 8px
			display: inline-block;
		}
		.cell-unit {
			width: 35px;
			margin-left: 8px
			display: inline-block;
		}
		.last-unit {
			margin-right: 10px
		}
		.cell-house {
			width: 130px;
			margin-left: 8px
			display: inline-block;
		}
		.item-title {
			font-size:10px
			line-height:30px
			height:30px
			text-align:left
		}
		.info-text {
			line-height:30px
			height:30px
			text-align:right
			color: $fxRed
		}
		.item-amount {
			font-size:10px
			width:100px
			text-align:left
			line-height:30px
			height:30px
			overflow:hidden
			margin-left: 10px
			flex: 1
			display: flex
			.item-num {
				vertical-align: top
			}
		}
		.item-select {
			text-align: right
			width: 120px
			flex: 1
			font-size:10px
			.item-num {
				vertical-align: top
				line-height:30px
				height:30px
			}
		}
		.item-amount-edit {
			width: 90px
			overflow:hidden
			text-align: right;
			.amount-step {
				display:inline-block
			}
		}
		.unit-text {
			display: inline-block;
			line-height:30px
			height:30px
			text-align: right
			.unit-icon {
				height: 30px
				width: 10px
				vertical-align: top
				display: inline-block
				vertical-align: top
				padding-top: 10px
			}
		}
	}
}
</style>
