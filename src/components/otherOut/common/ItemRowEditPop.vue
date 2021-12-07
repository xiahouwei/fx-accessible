<template>
	<div class="itemRowEdit-popup">
		<w-header :title="currentItemData.goodsDTO.name" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div class="itemRowEdit-content">
			<van-cell-group>
				<van-cell title="单位" :value="currentItemData.unitDTO.name" value-class="info-item-value"/>
				<van-cell title="单价" :value="currentItemData.price" value-class="info-item-value"/>
				<van-cell title="批次号" :value="currentItemData.batchCode" value-class="info-item-value"/>
				<van-cell title="规格" :value="currentItemData.goodsDTO.spec" value-class="info-item-value"/>
				<van-cell title="品项编号" :value="currentItemData.goodsDTO.code" value-class="info-item-value"/>
				<van-pro-field
					v-model="currentItemData.memo"
					label="备注"
					value-class="info-item-value"
					:placeholder="setPlaceholder('请输入备注')"
					input-align="right"
					:disabled="isDisabled"
				/>
				<van-cell v-show="sysShowDZCData" title="净重量" :value="toFixedNumberSize(currentItemData.netWeight)" value-class="info-item-value"></van-cell>
				<van-cell v-show="sysShowDZCData" title="皮重量" :value="toFixedNumberSize(currentItemData.skinWeight)" value-class="info-item-value"></van-cell>
				<van-cell v-show="sysShowDZCData" title="毛重量" :value="toFixedNumberSize(currentItemData.grossWeight)" value-class="info-item-value"></van-cell>
				<van-cell v-show="sysShowDZCData" title="称重单位" :value="currentItemData.weightUnit" value-class="info-item-value"></van-cell>
				<van-cell v-show="sysShowDZCData" title="称重状态" :value="currentItemData.isWeightSign ? '已称重' : '未称重'" value-class="info-item-value"></van-cell>
				<van-cell v-show="sysShowDZCData" title="图片" :border="false" value-class="info-item-value"></van-cell>
				<van-cell v-show="sysShowDZCData && currentItemData.images && currentItemData.images.length" class="info-cell-img" value-class="info-item-img">
					<img :src="comptedItemImgSrc(currentItemData.images)">
				</van-cell>
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
import { mapState } from 'vuex'
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
		...mapState({
			sysShowDZCData: state => state.systemParams.sysShowDZCData,
			sysPointSize: 'sysPointSize'
		}),
		setPlaceholder (val) {
			return (val) => {
				return this.isDisabled ? '' : val
			}
		},
		comptedItemImgSrc (imageUrls) {
			return (imageUrls) => {
				if (!imageUrls) {
					return ''
				}
				return imageUrls.length === 0 ? '' : imageUrls[0].imagUrl
			}
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
		toFixedNumberSize (data) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysPointSize))
		},
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
		.info-cell-img {
			padding: 0
		}
		.info-item-img {
			padding:0 10px 15px 50px
			box-sizing:border-box
			&>img {
				width:100%
				height:100%
			}
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
