<template>
	<div
		:class="{
			'is-active':rowActive===itemIndex,
			'is-error': isError
		}"
		class="item-detail-cell"
		@click="onItemClick">
		<div class="item-details-img">
			<img :src="comptedItemImgSrc(itemData.goods.imageUrls)" :onerror="$fxCommon.errorImg('item')">
		</div>
		<div class="item-details-params">
			<div class="item-details-name fx-ellipsis">{{itemData.goods.name}}</div>
			<div class="item-details-spec fx-ellipsis">
				{{itemData.name}}
			</div>
			<div class="item-details-amount">
				<span class="item-details-count">{{getItemAmount()}}</span>
				<span class="item-details-unit">{{itemData.unit.name}}</span>
			</div>
			<!-- <i v-show="rowActive===itemIndex" class="item-edit-icon"></i> -->
			<i v-show="(getItemAmount()>0 || isActive)" class="item-selected-icon"></i>
		</div>
		<van-checkbox
			v-model="itemData.checked"
			class="item-checkbox"
			@click="clickCheckBoxes()"
		></van-checkbox>
	</div>
</template>

<script>
export default {
	name: 'bomAddItemCell',
	props: {
		itemData: {
			type: Object,
			default: () => {
				return {}
			}
		},
		itemIndex: Number,
		rowActive: [Number, String],
		isActive: Boolean,
		isError: Boolean,
		showSpec: {
			type: Boolean,
			default: true
		},
		itemAmoutName: {
			type: String,
			default: ''
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
	methods: {
		onItemClick () {
			this.$emit('on-item-click', this.itemIndex)
		},
		getItemAmount () {
			if (this.itemAmoutName === '') {
				return this.itemData.busUnitAmount
			} else {
				return this.itemData[this.itemAmoutName]
			}
		},
		clickCheckBoxes () {
			this.$emit('on-checkbox-click', this.itemData)
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.item-detail-cell {
	width:100%
	height:80px
	display: flex
	flex-direction: row
	box-sizing: border-box;
	border: 2px solid transparent;
	&.is-active {
		border-color: $fxDefaultColor
	}
	&.is-error {
		border-color: $fxRed
	}
	.item-details-img {
		width:80px
		height:100%
		padding:5px
		box-sizing:border-box
		&>img {
			width:100%
			height:100%
		}
	}
	.item-details-params {
		flex:1
		overflow:hidden
		position:relative
		.item-details-name {
			width:100%
			height:30px
			line-height:30px
			font-size:12px
		}
		.item-details-spec {
			height:30px
			line-height:30px
			font-size:10px
		}
		.item-details-amount {
			.item-details-count {
				font-weight:bold
				margin-right:10px
			}
		}
		.item-edit-icon, .item-selected-icon {
			position:absolute
			background-repeat:no-repeat
			background-position: center
			background-size: 100%
			width: 20px;
			height: 20px;
			bottom: 0;
			right: 5px;
		}
		.item-edit-icon {
			background-image:url('~images/icon/icon-item-edit.png')
		}
		.item-selected-icon {
			background-image:url('~images/icon/icon-item-selected.png')
		}
	}
	.item-checkbox {
		display: flex;
		justify-content: center;
		align-items: Center;
		padding-right: 26px;
	}
}
</style>
