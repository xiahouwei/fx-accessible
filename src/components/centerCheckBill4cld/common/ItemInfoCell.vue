<template>
	<div class="item-info-cell" :class="{'is-edit':isEdit}">
		<div class="item-details-main">
			<div class="item-img">
				<w-img :src="itemData.goodsDTO.imageUrls"></w-img>
			</div>
			<div class="item-details">
				<div class="item-details-cell">
					<div class="item-name fx-ellipsis">{{itemData.goodsDTO.name}}</div>
					<w-icon
						v-show="!isDisabled && !disabledEditBtn"
						type="item-edit"
						class="block-item-edit"
						@click="onItemEditClick"
					></w-icon>
					<w-icon
						v-show="isDisabled && showEditBtn"
						type="item-info"
						class="block-item-edit"
						@click="onItemEditClick"
					></w-icon>
				</div>
				<div class="item-details-cell">
					<span>规格：</span>
					<div class="fx-ellipsis">{{itemData.goodsDTO.spec}}</div>
				</div>
				<div class="item-details-cell">
					<span v-if="showPackInfo">包装信息：</span>
					<div v-if="showPackInfo" class="fx-ellipsis">{{itemData.itemPack && itemData.itemPack.name}}</div>
				</div>
			</div>
		</div>
		<div class="item-details-other">
			<div class="item-details-cell" @click="onAmountClick('busFactAmount1')">
				<div class="item-details-cell__label">账存：</div>
				<div class="item-details-cell__content">
					<div class="item-details-cell__content-item">
						<span>{{itemData.busBillAmount1}}</span>
						<span class="item-details-unit">{{itemData.busUnit1}}</span>
					</div>
					<div v-if="hasBusUnit2" class="item-details-cell__content-item">
						<span>{{itemData.busBillAmount2}}</span>
						<span class="item-details-unit">{{itemData.busUnit2}}</span>
					</div>
				</div>
			</div>
			<div class="item-details-cell" @click="onAmountClick('busFactAmount1')">
				<div class="item-details-cell__label">差异：</div>
				<div class="item-details-cell__content">
					<div class="item-details-cell__content-item">
						<span>{{itemData.busDiffAmount}}</span>
						<span class="item-details-unit">{{itemData.busUnit1}}</span>
					</div>
					<div v-if="hasBusUnit2" class="item-details-cell__content-item">
						<span>{{itemData.busDiffAmount2}}</span>
						<span class="item-details-unit">{{itemData.busUnit2}}</span>
					</div>
				</div>
			</div>
			<div
				:class="{'is-active': editAmountType==='busFactAmount1'&&isEdit}"
				class="item-details-cell"
				@click="onAmountClick('busFactAmount1')"
			>
				<div class="item-details-cell__label">实盘数量：</div>
				<div class="item-details-cell__content">
					<div class="item-details-cell__content-item">
						<span>{{itemData.busFactAmount1}}</span>
						<span class="item-details-unit fx-ellipsis">{{itemData.busUnit1}}</span>
					</div>
				</div>
			</div>
			<div
				v-show="hasBusUnit2"
				:class="{'is-active': editAmountType==='busFactAmount2'&&isEdit}"
				class="item-details-cell"
				@click="onAmountClick('busFactAmount2')"
			>
				<div class="item-details-cell__label"></div>
				<div class="item-details-cell__content">
					<div class="item-details-cell__content-item">
						<span>{{itemData.busFactAmount2}}</span>
						<span class="item-details-unit fx-ellipsis">{{itemData.busUnit2}}</span>
					</div>
				</div>
			</div>
			<div v-show="itemData.assistUnit" class="item-details-cell">
				<div class="item-details-cell__content">
					<span class="item-details-cell__label">辅助账存：</span>
					<div class="item-details-cell__content-item">
						<span>{{itemData.assistBillAmount}}</span>
						<span class="item-details-unit fx-ellipsis">{{itemData.assistUnit}}</span>
					</div>
				</div>
				<div class="item-details-cell__content">
					<span class="item-details-cell__label">差异：</span>
					<div class="item-details-cell__content-item">
						<span>{{itemData.assistDiffAmount}}</span>
						<span class="item-details-unit fx-ellipsis">{{itemData.assistUnit}}</span>
					</div>
				</div>
			</div>
			<div
				v-show="itemData.assistUnit"
				:class="{'is-active': editAmountType==='assistFactAmount'&&isEdit}"
				class="item-details-cell"
				@click="onAmountClick('assistFactAmount')"
			>
				<div class="item-details-cell__label">辅助实盘：</div>
				<div class="item-details-cell__content">
					<div class="item-details-cell__content-item">
						<span>{{itemData.assistFactAmount}}</span>
						<span class="item-details-unit fx-ellipsis">{{itemData.assistUnit}}</span>
					</div>
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
		isDisabled: Boolean,
		disabledEditBtn: Boolean,
		showEditBtn: {
			type: Boolean,
			default: () => {
				return true
			}
		},
		itemIndex: Number,
		isEdit: Boolean,
		editAmountType: String,
		showPackInfo: Boolean
	},
	computed: {
		hasBusUnit2 () {
			return this.itemData.busUnit1 !== this.itemData.busUnit2 && !!this.itemData.busUnit1
		}
	},
	methods: {
		onItemEditClick () {
			this.editItem()
			this.$emit('on-item-edit', this.itemData)
		},
		editItem () {
			if (this.itemData.id) {
				this.itemData.changeType = 'edit'
			}
		},
		onAmountClick (type) {
			if (this.isDisabled) {
				return false
			}
			this.$emit('on-amount-edit', type, this.itemData, this.itemIndex)
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.item-info-cell {
	display: flex
	flex-direction: column
	position: relative
	font-size:12px
	&.is-edit::before {
		content: ''
		position: absolute
		width: 4px
		top: 0
		left: 0
		bottom: 0
		background-color: $fxDefaultColor
	}
	.item-details-main {
		display: flex
		flex-direction: row
		position: relative
	}
	.item-details-main, .item-details-other {
		.item-img {
			display: flex
			align-items: center
			width:80px
		}
		.item-details {
			flex:1
			overflow:hidden
		}
		.item-details-cell {
			display: flex
			flex-direction: row
			align-items: center
			overflow:hidden
			height:30px
			.block-item-edit {
				width: 24px
				height: 24px
			}
			.item-name {
				flex: 1
			}
			&__label {
				width: 70px
			}
			&__content {
				display: flex
				flex-direction: row
				align-items: center
				flex: 1
				&-item {
					flex: 1
					text-align: right
				}
			}
			&.is-active {
				background-image: linear-gradient(to right, #538ffd00 ,#538ffd54, #538ffd8f);
			}
		}
		.item-details-unit {
			margin: 0 5px
		}
	}
	.item-details-other {
		display: flex
		flex-direction: column
		position: relative
		padding-left: 10px;
	}
}
</style>
