<template>
	<div class="itemRowEdit-popup">
		<w-header :title="currentItemData.goodsDTO.name" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div class="itemRowEdit-content">
			<van-cell-group>
				<van-cell
					v-show="$fxAuth('shopOrderBill.goodsSize')"
					title="品项规格"
					:value="currentItemData.goodsDTO.spec"
					value-class="info-item-value"
				/>
				<van-cell title="分派状态" :value="computedAssignState" value-class="info-item-value"/>
				<van-cell v-show="$fxAuth('stockApplyBill.reduce') && reduceFlag" title="原申购数量" :value="currentItemData.originalAmount" value-class="info-item-value"/>
				<van-cell title="申购数量" :value="currentItemData.assignAmount" value-class="info-item-value"/>
				<van-pro-field
					v-model="currentItemData.memo"
					label="备注"
					value-class="info-item-value"
					:placeholder="setPlaceholder('请输入备注')"
					input-align="right"
					:disabled="isDisabled"
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
		reduceFlag: {
			type: Boolean,
			default: false
		},
		isDisabled: Boolean
	},
	data () {
		return {
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			currentItemData: {},
			assignStateActions: [
				{ id: null, name: '' },
				{ id: '0', name: '未分派' },
				{ id: '1', name: '已分派' },
				{ id: '2', name: '不分派' },
				{ id: '3', name: '进行中' }
			]
		}
	},
	computed: {
		setPlaceholder (val) {
			return (val) => {
				return this.isDisabled ? '' : val
			}
		},
		computedAssignState () {
			return this.assignStateActions.find(item => {
				return item.id === this.currentItemData.assignFlag
			}).name
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
