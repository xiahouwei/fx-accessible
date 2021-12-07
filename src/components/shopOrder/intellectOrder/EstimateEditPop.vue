<template>
	<div class="inteledi-estimateEdit-details">
		<w-header title="预估编辑" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div class="estimateEdit-content">
			<van-tabs color="#538FFD" v-model="tabActive" animated class="fx-info-tab">
				<van-tab title="菜品预估" name="foods">
					<EstimateFoodsItem
						:data="foodsStoreItem.details"
						:visibleFlag.sync="visibleFlag"
						:checkFlag.sync="checkFlag"
						:breakFlag.sync="breakFlag"
						v-bind="$attrs"
					></EstimateFoodsItem>
				</van-tab>
				<van-tab title="原料预估" name="goods">
					<EstimateGoodsItem
						:data="goodsStoreItem.details"
						:visibleFlag.sync="visibleFlag"
					></EstimateGoodsItem>
				</van-tab>
			</van-tabs>
		</div>
		<div class="estimateEdit-bottom">
			<van-button type="primary fx-btn" round size="small" @click="onCreatDetails">生成明细</van-button>
		</div>
	</div>
</template>

<script>
import EstimateFoodsItem from '@/components/shopOrder/intellectOrder/EstimateFoodsItem.vue'
import EstimateGoodsItem from '@/components/shopOrder/intellectOrder/EstimateGoodsItem.vue'
export default {
	name: 'EstimateEditPop',
	components: {
		EstimateFoodsItem,
		EstimateGoodsItem
	},
	props: {
		foodsStoreItem: {
			type: Object,
			default: () => {
				return {
					details: []
				}
			}
		},
		goodsStoreItem: {
			type: Object,
			default: () => {
				return {
					details: []
				}
			}
		},
		visibleFlag: Boolean
	},
	data () {
		return {
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			tabActive: 'foods',
			checkFlag: false,
			breakFlag: false
		}
	},
	watch: {
		visibleFlag: {
			handler (val) {
				if (val) {
					this.tabActive = 'foods'
					this.checkFlag = false
					this.breakFlag = false
				}
			},
			immediate: true
		}
	},
	methods: {
		onCloseClick () {
			if (this.focusing) { // input不符合验证规则
				return false
			}
			this.$emit('update:visibleFlag', false)
		},
		// {{{生成明细
		onCreatDetails () {
			let goodsDetails = JSON.parse(JSON.stringify(this.goodsStoreItem))
			goodsDetails.details = this.goodsStoreItem.details.filter(item => {
				return item.customCount > 0
			})
			let foodsDetails = JSON.parse(JSON.stringify(this.foodsStoreItem))
			foodsDetails.details = this.foodsStoreItem.details.filter(item => {
				return item.foodCustomCount > 0
			})
			let params = {
				goodsDetails: goodsDetails,
				foodsDetails: foodsDetails,
				checkFlag: this.checkFlag,
				breakFlag: this.breakFlag
			}
			this.$emit('on-creatdetails-click', params)
		}
		// }}}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.inteledi-estimateEdit-details {
	height:100%
	background:$fxWhite
	display: flex
	flex-direction: column
	.estimateEdit-content {
		flex: 1
		overflow-y: auto
	}
	.estimateEdit-bottom {
		display: flex
		flex-direction: column
		padding: 10px
	}
}
</style>
