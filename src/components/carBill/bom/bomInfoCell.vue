<template>
	<div class="item-info-cell">
		<div class="item-img">
			<img :src="comptedItemImgSrc(itemData.goodsDTO.imageUrls)" :onerror="$fxCommon.errorImg('item')">
		</div>
		<div class="item-details">
			<div class="item-name fx-ellipsis">{{itemData.goodsDTO.name}}</div>
			<div class="details-cell">
				<div class="item-taxprice fx-ellipsis">
					<span>金额：￥</span>
					<span>{{itemData.factMoney}}</span>
				</div>
			</div>
			<div class="details-cell">
				<div class="item-spec fx-ellipsis">{{itemData.goodsDTO.spec}}</div>
				<div v-if="isDisabled" class="item-amount">
					<span class="item-amount-text">{{itemData.factCount}}</span>
				</div>
				<div v-else class="item-amount-edit">
					<w-stepper
						ref="amountInput"
						v-model="itemData.factCount"
						min="0"
						:max="maxAmount"
						class="amount-step"
						:stepperBtnShow="false"
						:intLength="numberLength"
						:pointSize="sysPointSize"
						inputWidth="28vw"
						@change="onChange"
						@blur="onBlur"
					/></w-stepper>
				</div>
				<div class="unit-text">
					<span class="cell-unit fx-ellipsis" @click.stop="onUnitClick">{{itemData.unitDTO.name}}</span>
					<van-icon class="unit-icon" name="arrow-down" />
				</div>
			</div>
		</div>
		<i v-show="!isDisabled && !disabledEditBtn" class="block-item-edit" @click="onItemEditClick"></i>
		<i v-show="isDisabled" class="block-item-watch" @click="onItemEditClick"></i>
	</div>
</template>

<script>
import { mapState } from 'vuex'
export default {
	name: 'bomInfoCell',
	props: {
		itemData: {
			type: Object,
			default: () => {
				return {}
			}
		},
		isDisabled: Boolean,
		disabledEditBtn: Boolean
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize',
			numberLength: 'numberLength',
			maxAmount: 'maxAmount'
		}),
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
		editItem () {
			if (this.itemData.id) this.$set(this.itemData, 'changeType', 'edit')
		},
		onItemEditClick () {
			this.editItem()
			this.$emit('on-bom-edit', this.itemData)
		},
		onChange (arg) {
			if (this.itemData.changeType === 'del') return false
			this.editItem()
		},
		onUnitClick () {
			if (this.isDisabled) {
				return false
			}
			this.editItem()
			this.$emit('on-unit-edit', this.itemData)
		},
		onFocus () {
			this.$emit('on-bom-focus')
		},
		onBlur () {
			this.$emit('on-bom-blur')
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.item-info-cell {
	display: flex
	flex-direction: row
	height:80px
	.item-img {
		width:80px
		height:80px
		padding:10px
		box-sizing:border-box
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
		.details-cell {
			display: flex
			flex-direction: row
			overflow:hidden
		}
		.item-spec {
			font-size:10px
			line-height:30px
			height:30px
			flex:1
			text-align:right
		}
		.item-taxprice {
			font-size:12px
			line-height:30px
			height:30px
		}
		.item-amount {
			font-size:12px
			width:100px
			text-align:right
			line-height:30px
			height:30px
			overflow:hidden
			padding-right: 10px
		}
		.item-amount-edit {
			width:130px
			overflow:hidden
			text-align: right
			.amount-step {
				display: inline-block;
			}
		}
		.unit-text {
			line-height:30px
			height:30px
			width: 56px
			.cell-unit {
				max-width: 35px;
				display: inline-block;
			}
			.unit-icon {
				height: 100%
				vertical-align: bottom
			}
		}
		.item-empty {
			flex:1
		}
	}
	.block-item-edit, .block-item-watch {
		width:20px
		height:20px
		background-repeat:no-repeat
		background-position: center
		background-size: 100%
		position:absolute
		top:0
		right:0
	}
	.block-item-edit {
		background-image:url('~images/icon/icon-item-edit.png')
	}
	.block-item-watch {
		background-image:url('~images/icon/icon-item-info.png')
	}
}
</style>
