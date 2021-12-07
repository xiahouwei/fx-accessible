<template>
	<div class="itemRowEdit-popup">
		<w-header :title="currentItemData.goodsDTO.name" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div class="itemRowEdit-content">
			<van-cell-group>
				<van-cell title="申请数量" :value="currentItemData.busUnitApplyAmount" value-class="info-item-value"/>
				<van-cell title="调拨数量" :value="currentItemData.busUnitInAmount" value-class="info-item-value"/>
				<van-cell title="差异数量" :value="differenceAmount" value-class="info-item-value"/>
				<van-cell title="调拨单价" :value="currentItemData.price" value-class="info-item-value"/>
				<van-cell title="调拨非税金额" :value="currentItemData.inMoney" value-class="info-item-value"/>
				<van-cell title="税率" :value="fomatterTaxes(currentItemData.taxes)" value-class="info-item-value"/>
				<van-cell title="税额" :value="currentItemData.taxInMoney" value-class="info-item-value"/>
				<van-cell title="调拨含税单价" :value="currentItemData.taxPrice" value-class="info-item-value"/>
				<van-cell title="品项编号" :value="currentItemData.goodsDTO.code" value-class="info-item-value"/>
				<van-pro-field
					ref="memo"
					v-model="currentItemData.memo"
					label="备注"
					value-class="info-item-value"
					:placeholder="setPlaceholder('请输入备注')"
					input-align="right"
					:disabled="isDisabled"
					@focus="onFocus('memo')"
				/>
			</van-cell-group>
		</div>
		<div class="itemRowEdit-bottom">
			<van-button
				v-if="!isDisabled"
				class="confirm-btn fx-no-radius"
				type="primary"
				@click="onConfirmClick"
			>保存</van-button>
			<van-button
				v-else
				class="confirm-btn fx-no-radius"
				type="primary"
				@click="onCloseClick"
			>确定</van-button>
		</div>
	</div>
</template>

<script>
export default {
	name: 'itemRowEdit',
	props: {
		visibleFlag: Boolean,
		itemData: {
			type: Object,
			default: () => {
				return {}
			}
		},
		isDisabled: Boolean
	},
	data () {
		return {
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			currentItemData: {}
		}
	},
	computed: {
		setPlaceholder (val) {
			return (val) => {
				return this.isDisabled ? '' : val
			}
		},
		fomatterTaxes (tax) {
			return (tax) => {
				if (tax) {
					let taxes = this.$fxUtils.toFixedSHW(tax * 100, 2, false)
					return `${taxes}%`
				} else {
					return '0%'
				}
			}
		},
		differenceAmount () {
			let differenceAmount = this.currentItemData.busUnitApplyAmount - this.currentItemData.busUnitInAmount
			differenceAmount = parseFloat(this.$fxUtils.toFixedSHW(differenceAmount, this.sysPointSize))
			return Number.isNaN(differenceAmount) ? '' : differenceAmount
		}
	},
	watch: {
		visibleFlag: {
			handler (val) {
				if (val) {
					this.currentItemData = JSON.parse(JSON.stringify(this.itemData))
				}
			},
			immediate: true
		}
	},
	methods: {
		onCloseClick () {
			this.$emit('update:visibleFlag', false)
		},
		onConfirmClick () {
			if (this.currentItemData.id) {
				this.currentItemData.changeType = 'edit'
			}
			this.$emit('on-Confirm', this.currentItemData)
			this.$emit('update:visibleFlag', false)
		},
		onFocus (ref) {
			this.onScrollTop(ref)
		},
		onScrollTop (scrollRef, distance = 20) {
			let detailsRowRef = this.$refs[scrollRef]
			if (!detailsRowRef || detailsRowRef.length === 0) {
				return false
			}
			let offsetTop = detailsRowRef.$el.offsetTop
			let $el = this.$refs['rowEditContent']
			this.$fxUtils.scrollTopW({ offsetTop, $el, distance })
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.itemRowEdit-popup {
	height:100%
	width: 100%
	text-align:left
	display: flex
	flex-direction: column
	.itemRowEdit-content {
		flex:1
		overflow:scroll
		.info-item-value {
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}
	.itemRowEdit-bottom {
		display: flex
		flex-direction: row
		width:100%
		.confirm-btn {
			flex:1
		}
	}
}
</style>
