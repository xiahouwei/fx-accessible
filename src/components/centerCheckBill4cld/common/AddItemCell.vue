<template>
	<div
		class="item-detail-cell"
		@click="onItemClick">
		<div class="item-detail-cell_container">
			<div class="item-detail-cell_container-main"  @click="onAmountClick('busFactAmount1')">
				<div class="item-details-img">
					<w-img :src="itemData.goodsDTO.imageUrls"></w-img>
				</div>
				<div class="item-details-params">
					<div class="item-details-name fx-ellipsis">{{itemData.goodsDTO.name}}</div>
					<div class="item-details-spec fx-ellipsis">{{itemData.goodsDTO.spec}}</div>
				</div>
			</div>
			<div
				v-if="isLoaded"
				:class="{'is-active': editAmountType==='busFactAmount1'&&isEdit}"
				class="item-detail-cell_container-sub"
				@click="onAmountClick('busFactAmount1')"
			>
				<span class="item-details-sub-label">实盘数量</span>
				<div class="item-details-sub-content">
					<span class="item-details-count">{{itemData.busFactAmount1}}</span>
					<span class="item-details-unit">{{itemData.busUnit1}}</span>
				</div>
			</div>
			<div
				v-if="hasBusUnit2&&isLoaded"
				:class="{'is-active': editAmountType==='busFactAmount2'&&isEdit}"
				class="item-detail-cell_container-sub"
				@click="onAmountClick('busFactAmount2')"
			>
				<span class="item-details-sub-label"></span>
				<div class="item-details-sub-content">
					<span class="item-details-count">{{itemData.busFactAmount2}}</span>
					<span class="item-details-unit">{{itemData.busUnit2}}</span>
				</div>
			</div>
			<div
				v-if="itemData.assistUnit&&isLoaded"
				:class="{'is-active': editAmountType==='assistFactAmount'&&isEdit}"
				class="item-detail-cell_container-sub"
				@click="onAmountClick('assistFactAmount')"
			>
				<span class="item-details-sub-label">辅助实盘：</span>
				<div class="item-details-sub-content">
					<span class="item-details-count">{{itemData.assistFactAmount}}</span>
					<span class="item-details-unit">{{itemData.assistUnit}}</span>
				</div>
			</div>
		</div>
		<van-checkbox
			v-model="itemData.checked"
			class="item-checkbox"
			@change="onCheckBoxChange"
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
		editAmountType: String,
		isEdit: Boolean,
		isLoaded: Boolean
	},
	computed: {
		comptedItemImgSrc (imageUrls) {
			return (imageUrls) => {
				if (!imageUrls) {
					return ''
				}
				return imageUrls.length === 0 ? '' : imageUrls[0]
			}
		},
		hasBusUnit2 () {
			return this.itemData.busUnit1 !== this.itemData.busUnit2 && !!this.itemData.busUnit1
		}
	},
	methods: {
		onItemClick () {
			this.$emit('on-item-click', this.itemIndex)
		},
		onCheckBoxChange () {
			this.$emit('on-item-select-change', this.itemData)
		},
		onAmountClick (type) {
			this.$emit('on-amount-edit', type, this.itemData, this.itemIndex)
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.item-detail-cell {
	width:100%
	display: flex
	flex-direction: row
	box-sizing: border-box;
	border: 2px solid transparent;
	text-align: left
	&.is-active {
		border-color: $fxDefaultColor
	}
	&.is-error {
		border-color: $fxRed
	}
	&_container {
		flex: 1
		&-main {
			display: flex
			flex-direction: row
			height:80px
		}
		&-sub {
			display: flex
			flex-direction: row
			height:20px
			.item-details-sub-label {
				margin-left: 5px
			}
			.item-details-sub-content {
				flex: 1
				text-align: right
				margin-right: 5px
				.item-details-count {
					margin-right: 5px
				}
			}
			&.is-active {
				background-image: linear-gradient(to right, #538ffd00 ,#538ffd54, #538ffd8f);
			}
		}
	}
	.item-details-img {
		width:80px
		height:100%
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
	}
	.item-checkbox {
		display: flex;
		justify-content: center;
		align-items: Center;
		padding-right: 16px;
		padding-left: 16px
	}
}
</style>
