<template>
	<div class="order-block">
		<checkBox
			:visibleFlag="showCheckBox"
			:checked="itemData.checked"
			class="order-checkbox"
			@on-checkbox-click="onClick"></checkBox>
		<div class="block-content">
			<div class="block-title">
				<span class="title-text fx-ellipsis">{{itemData.houseDTO.name}}</span>
			</div>
			<div class="block-value">
				<div class="order-No fx-ellipsis">品项编号：</div>
				<div class="order-date">
					{{itemData.goodsDTO.code}}
				</div>
			</div>
			<div class="block-value">
				<div class="order-No fx-ellipsis">品项名称：</div>
				<div class="order-date">
					{{itemData.goodsDTO.name}}
				</div>
			</div>
			<div class="block-value">
				<div class="order-No fx-ellipsis">品项规格：</div>
				<div class="order-date">
					{{itemData.goodsDTO.spec}}
				</div>
			</div>
			<!--<div v-if="sysShowPacking && (itemData.shopDTO.organType === 1 || itemData.shopDTO.organType === 2)" class="block-value">
				<div class="order-No fx-ellipsis">包装信息：</div>
				<div class="order-date" @click="onPackingClick">
					<span>{{itemData.packingDTO ? itemData.packingDTO.name : ''}}</span>
					<van-icon name="arrow"/>
				</div>
			</div>-->
			<div class="block-value">
				<div class="order-No fx-ellipsis">供货商：</div>
				<div class="order-date" @click="onSupplierClick">
					<span>{{itemData.supplierDTO.name}}</span>
					<van-icon name="arrow"/>
				</div>
			</div>
			<div class="block-value">
				<div class="order-No fx-ellipsis">单价：</div>
				<div class="order-date">
					{{itemData.priceWithTax}}
				</div>
			</div>
			<div class="block-value">
				<div class="order-No fx-ellipsis">申请数量：</div>
				<div class="order-date">
					{{itemData.busUnitAmount}}
				</div>
			</div>
			<div class="block-value">
				<div class="order-No fx-ellipsis">库存数：</div>
				<div class="order-date" :class="{ 'fx-red-font': itemData.kcAmount < itemData.busUnitAmount }">
					{{itemData.kcAmount}}
				</div>
			</div>
			<div class="block-value block-last">
				<div class="order-No fx-ellipsis">本次分派数量：</div>
				<div class="order-date">
					<span>
						<w-stepper
							ref="amountInput"
							v-model="itemData.waitAmount"
							min="0"
							:max="maxAmount"
							class="amount-step"
							:stepperBtnShow="false"
							:intLength="numberLength"
							:pointSize="sysPointSize"
							inputWidth="28vw"
							@change="onChange"
						></w-stepper>
					</span>
				</div>
			</div>
			<div class="block-value">
				<div class="order-No fx-ellipsis">单据号：</div>
				<div class="order-date">
					{{itemData.sysbillCode}}
				</div>
			</div>
			<div class="block-value block-last">
				<div class="order-No fx-ellipsis">备注：</div>
				<div class="order-date">
					{{itemData.memo}}
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import checkBox from '@/components/common/CheckBox.vue'
export default {
	name: 'itemInfoCell',
	components: {
		checkBox
	},
	props: {
		itemData: {
			type: Object,
			default: () => {
				return {}
			}
		},
		showCheckBox: {
			type: Boolean,
			default: false
		}
	},
	computed: {
		...mapState({
			// sysShowPacking: state => state.systemParams.sysShowPacking,
			sysPointSize: 'sysPointSize',
			numberLength: 'numberLength',
			maxAmount: 'maxAmount'
		})
	},
	methods: {
		onClick () {
			if (this.showCheckBox) {
				this.$set(this.itemData, 'checked', !this.itemData.checked)
			} else {
				this.$emit('on-check-click', this.itemData)
			}
		},
		onPackingClick () {
			this.$emit('on-packing-click', this.itemData)
		},
		onSupplierClick () {
			this.$emit('on-supplier-click', this.itemData)
		},
		onChange (arg) {
			this.editItem()
		},
		editItem () {
			if (this.itemData.goodsDTO.id) {
				this.$set(this.itemData, 'changeType', 'edit')
			}
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.order-block {
	width: 350px
	margin: 10px auto
	padding: 9px
	text-align: left
	position: relative
	box-sizing: border-box;
	display: flex
	flex-direction: row
	align-items: baseline
	border-bottom: 1px solid $fxGray
	.order-checkbox {
		margin-right: 10px
        min-width: 19px
	}
	.block-content {
		flex: 1
		.block-title {
			height: 30px
			line-height: 30px
			font-size: 14px
			font-weight: 700
			margin-bottom: 10px
			display: flex
			flex-direction: row
			overflow: hidden
			align-items: center
			.title-text {
				display: inline-block
				overflow: hidden;
				height: 30px;
				line-height: 30px;
				margin-right: 5px
				flex: 1
				width: 190px
			}
			.block-urgency {
				width: 30px
				height: 30px
				background-image: url('~images/icon/icon-urgency.png')
				background-repeat: no-repeat
				background-position: center
				background-size: 100%
				margin-left: 10px;
			}
		}
		.block-value {
			display: flex
			flex-direction: row
			margin-bottom: 15px
			.order-No {
				flex: 1
			}
			.order-date {
				flex: 1
				text-align: right
				.order-date-arrow {
					position: relative
					top: 1px
				}
			}
			.fx-red-font {
				color: $fxRed
			}
		}
		.block-last {
			margin-bottom: 0px
		}
	}
}
</style>
