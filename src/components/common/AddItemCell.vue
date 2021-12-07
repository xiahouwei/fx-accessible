<template>
	<div
		:class="{
			'is-active':rowActive===itemIndex,
			'is-error': isError
		}"
		class="item-detail-cell"
		@click="onItemClick">
		<div class="item-details-img">
			<w-img :src="itemData.goodsDTO.imageUrls"></w-img>
		</div>
		<div class="item-details-params">
			<div class="item-details-name fx-ellipsis">{{itemData.goodsDTO.name}}</div>
			<div v-if="sysShowCode" class="item-details-name fx-ellipsis">编号：{{itemData.goodsDTO.code}}</div>
			<div class="item-details-spec fx-ellipsis">
				{{showBom ? itemData.bomDTO.name : ''}}
				{{!showBom && showSpec ? itemData.goodsDTO.spec : ''}}
			</div>
			<div class="item-details-amount">
				<span class="item-details-count">{{getItemAmount()}}</span>
				<span class="item-details-unit">{{itemData.unitDTO.name}}</span>
			</div>
			<!-- <i v-show="rowActive===itemIndex" class="item-edit-icon"></i> -->
			<i v-show="(getItemAmount()>0 || isActive)" class="item-selected-icon"></i>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
export default {
	name: 'addItemCell',
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
		showBom: {
			type: Boolean,
			default: false
		},
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
		...mapState({
			sysShowCode: state => state.systemParams.sysShowCode
		})
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
	text-align:left
	padding-bottom: 7px
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
			$fx-dynamic-font-size(12px)
		}
		.item-details-spec {
			height:30px
			line-height:30px
			$fx-dynamic-font-size(10px)
		}
		.item-details-amount {
			$fx-dynamic-font-size(12px)
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
}
</style>
