<template>
	<div class="itemRowEdit-popup">
		<w-header :title="currentItemData.goodsDTO.name" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div class="itemRowEdit-content">
			<van-cell-group>
				<van-cell title="材料编号" :value="currentItemData.goodsDTO.code" value-class="info-item-value"/>
				<van-cell title="单价" :value="formatBomPrice()" value-class="info-item-value"/>
				<van-cell title="理论数量" :value="currentItemData.theoryCount" value-class="info-item-value"/>
				<van-cell title="理论金额" :value="currentItemData.theoryMoney" value-class="info-item-value"/>
				<van-cell title="计划数量" :value="currentItemData.planCount" value-class="info-item-value"/>
				<van-cell title="计划金额" :value="currentItemData.planMoney" value-class="info-item-value"/>
				<van-cell v-show="sysShowDZCData" title="净重量" :value="toFixedNumberSize(currentItemData.netWeight)" value-class="info-item-value"></van-cell>
				<van-cell v-show="sysShowDZCData" title="皮重量" :value="toFixedNumberSize(currentItemData.skinWeight)" value-class="info-item-value"></van-cell>
				<van-cell v-show="sysShowDZCData" title="毛重量" :value="toFixedNumberSize(currentItemData.grossWeight)" value-class="info-item-value"></van-cell>
				<van-cell v-show="sysShowDZCData" title="称重单位" :value="currentItemData.weightUnit" value-class="info-item-value"></van-cell>
				<van-cell v-show="sysShowDZCData" title="称重状态" :value="currentItemData.isWeightSign ? '已称重' : '未称重'" value-class="info-item-value"></van-cell>
				<van-pro-field
					v-model="currentItemData.memo"
					:placeholder="setPlaceholder('请输入备注')"
					:disabled="isDisabled"
					label="备注"
					value-class="info-item-value"
					input-align="right"
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
		<van-popup v-model="datePickerShow" position="bottom">
			<w-date-picker
				:visibleFlag.sync="datePickerShow"
				:currentDate="currentDate"
				@confirm="dateConfirmhandle"
			></w-date-picker>
		</van-popup>
	</div>
</template>

<script>
import { mapState } from 'vuex'
export default {
	name: 'bomRowEdit',
	props: {
		visibleFlag: Boolean,
		bomData: {
			type: Object,
			default: () => {
				return {}
			}
		},
		isBillState: Boolean,
		isDisabled: Boolean
	},
	data () {
		return {
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			currentItemData: {},
			currentDate: new Date(),
			datePickerShow: false
		}
	},
	computed: {
		...mapState({
			sysShowDZCData: state => state.systemParams.sysShowDZCData,
			sysPointSize: 'sysPointSize'
		}),
		setPlaceholder (val) {
			return (val) => {
				return this.isDisabled ? '' : val
			}
		},
		fomatterDate (date) {
			return (date) => {
				if (date) {
					return this.$fxUtils.setDateTime(new Date(date), '时分')
				} else {
					return ''
				}
			}
		},
		comptedItemImgSrc (imageUrls) {
			return (imageUrls) => {
				if (!imageUrls) {
					return ''
				}
				return imageUrls.length === 0 ? '' : imageUrls[0].imagUrl
			}
		},
		formatBomPrice () {
			return () => {
				if (this.isBillState) {
					return this.toFixedNumberSize(this.bomData.factMoney / this.bomData.factCount)
				} else {
					return this.toFixedNumberSize(this.bomData.referencePrice)
				}
			}
		}
	},
	watch: {
		visibleFlag: {
			handler (val) {
				if (val) {
					this.currentItemData = JSON.parse(JSON.stringify(this.bomData))
				}
			},
			immediate: true
		}
	},
	methods: {
		toFixedNumberSize (data) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysPointSize))
		},
		onCloseClick () {
			this.$emit('update:visibleFlag', false)
		},
		onProductDateClick () {
			if (this.isDisabled) return false
			if (this.currentItemData.productDate) this.currentDate = new Date(this.currentItemData.productDate)
			this.datePickerShow = true
		},
		dateConfirmhandle (date) {
			this.currentItemData.productDate = date.getTime()
			this.datePickerShow = false
		},
		onConfirmClick () {
			if (this.currentItemData.id) {
				this.currentItemData.changeType = 'edit'
			}
			this.$emit('on-Confirm', this.currentItemData)
			this.$emit('update:visibleFlag', false)
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.itemRowEdit-popup {
	height: 100%
	width: 100%
	text-align: left
	display: flex
	flex-direction: column
	.itemRowEdit-content {
		flex: 1
		overflow: scroll
		.info-item-value {
			text-overflow: ellipsis
			white-space: nowrap
		}
	}
	.itemRowEdit-bottom {
		display: flex
		flex-direction: row
		width: 100%
		.confirm-btn {
			flex: 1
		}
	}
}
</style>
