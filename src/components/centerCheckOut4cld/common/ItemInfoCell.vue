<template>
	<div class="item-info-cell">
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
					<span>包装信息：</span>
					<div class="fx-ellipsis">{{itemData.itemPack && itemData.itemPack.name}}</div>
				</div>
			</div>
		</div>
		<div class="item-details-other">
			<div class="item-details-cell">
				<div class="item-amount fx-ellipsis">
					<span>单位：</span>
					<span>{{itemData.mainUnit}}</span>
				</div>
				<div class="item-amount fx-ellipsis">
					<span>单价：</span>
					<span>{{itemData.price}}</span>
				</div>
			</div>
			<div class="item-details-cell">
				<div class="item-amount fx-ellipsis">
					<span>盘亏数量：</span>
					<span>{{itemData.busUnitOutAmount}}</span>
				</div>
				<div class="item-amount fx-ellipsis">
					<span>盘亏总价：</span>
					<span>{{itemData.outMoney}}</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
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
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize',
			sysMoneyPointSize: 'sysMoneyPointSize',
			numberLength: 'numberLength',
			maxAmount: 'maxAmount'
		}),
		hasBusUnit2 () {
			return this.itemData.busUnit1 !== this.itemData.busUnit2 && !!this.itemData.busUnit1
		}
	},
	data () {
		return {
			isHasGoods: false,
			fxCalculation: this.$fxCalculation('centerCheckBill4cld')
		}
	},
	methods: {
		onChange () {
			this.editItem()
		},
		editItem () {
			if (this.itemData.id) {
				this.itemData.changeType = 'edit'
			}
		},
		onItemEditClick () {
			this.editItem()
			this.$emit('on-item-edit', this.itemData)
		},
		onFocus () {
			this.$emit('on-item-focus')
		},
		onBlur () {
			this.$emit('on-item-blur')
		},
		onBusFactAmount1Change () {
			this.fxCalculation.computeDiffAmount(this.itemData)
			if (this.itemData.assistUnit) {
				this.fxCalculation.computeAssistAmount(this.itemData)
			}
			this.editItem()
		},
		onBusFactAmount2Change () {
			this.fxCalculation.computeDiffAmount2(this.itemData)
			this.editItem()
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
			.item-amount {
				flex: 1
			}
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
