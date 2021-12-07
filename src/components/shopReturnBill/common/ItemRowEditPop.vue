<template>
	<div class="itemRowEdit-popup">
		<w-header :title="currentItemData.goodsDTO.name" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div ref="rowEditContent" class="itemRowEdit-content">
			<van-cell-group>
				<!-- 自采、直配有查看单价权限才可以查看，外销可以查看 -->
				<van-cell
					v-show="(isStockType([0]) && $fxAuth('shopReturnBill.seePrice')) || (isStockType([1]) && $fxAuth('shopReturnBill.seePrice')) || isStockType([2])"
					:value="currentItemData.price"
					title="非税单价"
					value-class="info-item-value"
				></van-cell>
				<!-- 自采、直配有查看非税金额权限才可以查看，外销可以查看 -->
				<van-cell
					v-show="(isStockType([0]) && $fxAuth('shopReturnBill.seeNoTaxMoney')) || (isStockType([1]) && $fxAuth('shopReturnBill.seeNoTaxMoney'))|| isStockType([2])"
					:value="currentItemData.outMoney"
					title="非税金额"
					value-class="info-item-value"
				></van-cell>
				<!-- 自采、直配有查看、编辑税率权限才可以操作，外销可以查看、编辑 -->
				<van-cell title="税率"
					v-show="(isStockType([0]) && $fxAuth('shopReturnBill.seeTax')) || (isStockType([1]) && $fxAuth('shopReturnBill.seeTax')) || isStockType([2])"
					:value="fomatterTaxes(currentItemData.tax)"
					:is-link="false"
					value-class="info-item-value"
					:class="{ 'text-tax': false }"
				/>
				<!-- 自采、直配有查看税额权限才可以操查看，外销可以查看 -->
				<van-cell v-show="(isStockType([0]) && $fxAuth('shopReturnBill.seeTaxMoney')) || (isStockType([1]) && $fxAuth('shopReturnBill.seeTaxMoney')) || isStockType([2])" title="税额" :value="currentItemData.taxOutMoney" value-class="info-item-value"/>
				<!-- 自采、直配有查看、编辑单价权限才可以查看、编辑，外销可以查看、编辑，ps：选择供货商必须有修改价格权限 -->
				<van-pro-number-field
					ref="taxPriceInput"
					v-show="(isStockType([0]) && $fxAuth('shopReturnBill.seePrice')) || (isStockType([1]) && $fxAuth('shopReturnBill.seePrice')) || isStockType([2])"
					v-model="currentItemData.taxPrice"
					label="含税单价"
					input-align="right"
					min="0"
					:max="maxAmount"
					:intLength="numberLength"
					:pointSize="sysPointSize"
					:disabled="true"
				></van-pro-number-field>
				<van-cell title="品项编号" :value="currentItemData.goodsDTO.code" value-class="info-item-value"/>
				<van-switch-cell v-model="currentItemData.giftFlag" :disabled="true" class="info-item-value" title="赠送" />
				<van-pro-field
					ref="memo"
					v-model="currentItemData.memo"
					:placeholder="setPlaceholder('请输入备注')"
					:disabled="isDisabled"
					label="备注"
					input-align="right"
					@focus="onFocus('memo')"
				/>
			</van-cell-group>
		</div>
		<div class="itemRowEdit-bottom">
			<van-button v-if="!isDisabled" class="confirm-btn fx-no-radius" type="primary" @click="onConfirmClick">保存</van-button>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
export default {
	name: 'itemRowEdit',
	components: {
	},
	props: {
		visibleFlag: Boolean,
		itemData: {
			type: Object,
			default: () => {
				return {}
			}
		},
		isDisabled: Boolean,
		stockType: {// 生成方式 0自采 1直配 2外销
			type: Number,
			default: 0
		}
	},
	data () {
		return {
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			currentItemData: {},
			taxesActionShow: false
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize',
			numberLength: 'numberLength',
			maxAmount: 'maxAmount',
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId
		}),
		fomatterTaxes (value) {
			return (value) => {
				if (value) {
					let taxes = this.$fxUtils.toFixedSHW(value * 100, 2, false)
					return `${taxes}%`
				} else {
					return '0%'
				}
			}
		},
		setPlaceholder (val) {
			return (val) => {
				return this.isDisabled ? '' : val
			}
		},
		// 生成方式 0自采 1直配 2外销 0可编辑
		// 直配、外销把仓库、单位置为不可用
		isStockType (state) {
			return state => {
				if (Object.prototype.toString.call(state) === '[object Array]') {
					return state.includes(this.stockType)
				} else {
					return this.stockType === state
				}
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
	.text-tax .info-item-value {
		color: $fxTextColor;
	}
}
</style>
