<template>
	<div class="itemRowEdit-popup">
		<w-header :title="currentItemData.goodsDTO.name" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div ref="rowEditContent" class="itemRowEdit-content">
			<van-cell-group>
				<van-cell v-show="isStockType([0])" title="申购数量" :value="currentItemData.purchaseAmount" value-class="info-item-value"/>
				<!-- 自采、直配有查看单价权限才可以查看，外销可以查看 -->
				<van-cell
					v-show="(isStockType([0]) && $fxAuth('stockOrderBill.zcprice')) || (isStockType([1]) && $fxAuth('stockOrderBill.zpprice')) || isStockType([2])"
					:value="currentItemData.price"
					title="非税单价"
					value-class="info-item-value"
				></van-cell>
				<!-- 自采、直配有查看非税金额权限才可以查看，外销可以查看 -->
				<van-cell
					v-show="(isStockType([0]) && $fxAuth('stockOrderBill.zcincostmoney')) || (isStockType([1]) && $fxAuth('stockOrderBill.zpincostmoney'))|| isStockType([2])"
					:value="currentItemData.money"
					title="非税金额"
					value-class="info-item-value"
				></van-cell>
				<!-- 自采、直配有查看、编辑税率权限才可以操作，外销可以查看、编辑 -->
				<van-cell title="税率"
					v-show="(isStockType([0]) && $fxAuth('stockOrderBill.zctaxrate')) || (isStockType([1]) && $fxAuth('stockOrderBill.zptaxrate')) || isStockType([2])"
					:value="fomatterTaxes(currentItemData.tax)"
					:is-link="!isDisabled && couldChangePrice === '0' && (isStockType([0]) && $fxAuth('stockOrderBill.editzctaxrate')) || (isStockType([1]) && $fxAuth('stockOrderBill.editzptaxrate')) || isStockType([2])"
					value-class="info-item-value"
					:class="{ 'text-tax': !isDisabled }"
					@click="onTaxClick"
				/>
				<!-- 自采、直配有查看税额权限才可以操查看，外销可以查看 -->
				<van-cell v-show="(isStockType([0]) && $fxAuth('stockOrderBill.zctaxinmoney')) || (isStockType([1]) && $fxAuth('stockOrderBill.zptaxinmoney')) || isStockType([2])" title="税额" :value="currentItemData.taxMoney" value-class="info-item-value"/>
				<!-- 自采、直配有查看、编辑单价权限才可以查看、编辑，外销可以查看、编辑，ps：选择供货商必须有修改价格权限 -->
				<van-pro-number-field
					ref="taxPriceInput"
					v-show="(isStockType([0]) && $fxAuth('stockOrderBill.zcprice')) || (isStockType([1]) && $fxAuth('stockOrderBill.zpprice')) || isStockType([2])"
					v-model="currentItemData.taxPrice"
					label="含税单价"
					input-align="right"
					min="0"
					:max="maxAmount"
					:intLength="numberLength"
					:pointSize="sysPointSize"
					:disabled="(isStockType([0]) && !$fxAuth('stockOrderBill.editzcunitprice')) || (isStockType([1]) && !$fxAuth('stockOrderBill.editzpunitprice')) || isDisabled || couldChangePrice === '1'"
					@change="onTaxPriceChange(currentItemData.taxPrice)"
					@blur="onTaxPriceBlur"
				></van-pro-number-field>
				<van-cell title="品项编号" :value="currentItemData.goodsDTO.code" value-class="info-item-value"/>
				<van-switch-cell v-model="currentItemData.giftFlag" :disabled="isDisabled" @change="changeGiftFlag" class="info-item-value" title="赠送" />
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
		<taxesActionSheet
			v-model="taxesActionShow"
			:sync="true"
			@on-taxes-select="onTaxesSelect"
		></taxesActionSheet>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import taxesActionSheet from '@/components/common/taxesActionSheet.vue'
export default {
	name: 'itemRowEdit',
	components: {
		taxesActionSheet
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
		},
		couldChangePrice: {// 供货商价格是否可以修改 0：是，1：否
			type: String,
			default: '0'
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
			this.onCheckMoneyOrAmount().then(() => {
				this.$emit('update:visibleFlag', false)
			}).catch(() => {
				this.$refs.taxPriceInput.setFocus()
			})
		},
		onConfirmClick () {
			this.onCheckMoneyOrAmount().then(() => {
				if (this.currentItemData.id) {
					this.currentItemData.changeType = 'edit'
				}
				this.$emit('on-Confirm', this.currentItemData)
				this.$emit('update:visibleFlag', false)
			}).catch(() => {
				this.$refs.taxPriceInput.setFocus()
			})
		},
		onTaxClick () {
			// 被审核、没有保存权限、供货商不能改价、自采没有编辑权限、直配没有编辑权限时，不能编辑税率
			if (this.isDisabled || this.couldChangePrice === '1' || (this.isStockType([0]) && !this.$fxAuth('stockOrderBill.editzctaxrate')) || (this.isStockType([1]) && !this.$fxAuth('stockOrderBill.editzptaxrate'))) {
				return false
			}
			this.onCheckMoneyOrAmount().then(() => {
				this.taxesActionShow = true
			}).catch(() => {
				this.$refs.taxPriceInput.setFocus()
			})
		},
		onTaxesSelect (item) {
			this.currentItemData.tax = item.tax
			this.computedByTaxes(item.tax)
		},
		computedByTaxes (tax) {
			// 修改税率，发生改变的应该是非税单价和非税金额
			let { price, busUnitAmount, money, taxMoney, moneyWithTax } = this.currentItemData
			price = parseFloat(this.$fxUtils.toFixedSHW(moneyWithTax / busUnitAmount / (1 + tax), this.sysPointSize))
			money = parseFloat(this.$fxUtils.toFixedSHW(price * busUnitAmount, this.sysPointSize))
			taxMoney = parseFloat(this.$fxUtils.toFixedSHW((moneyWithTax - money), this.sysPointSize))
			this.currentItemData.price = price
			this.currentItemData.money = money
			this.currentItemData.taxMoney = taxMoney
		},
		onTaxPriceChange (taxMoney) {
			this.calcMoney('taxPrice', taxMoney, this.currentItemData)
		},
		// {{{计算税额并渲染
		calcMoney (target, amountOrMoney, itemData) {
			let { taxPrice, busUnitAmount, price, tax } = itemData
			let money = 0
			let moneyWithTax = 0
			let itemPrice = 0
			let itemTaxPrice = 0
			amountOrMoney = this.toFixedNumberSize(amountOrMoney)
			if (itemData.giftFlag || (target === 'money' && amountOrMoney === 0)) {
				// 赠送、数量为0
				itemData.money = 0
				itemData.moneyWithTax = 0
				itemData.taxMoney = 0
				return true
			}
			if (target === 'money') {
				money = amountOrMoney
				itemPrice = this.toFixedNumberSize(money / busUnitAmount)
				moneyWithTax = this.toFixedNumberSize(money * (1 + tax))
				itemTaxPrice = this.toFixedNumberSize(moneyWithTax / busUnitAmount)
			} else if (target === 'amount') {
				itemData.busUnitAmount = amountOrMoney
				itemPrice = price
				itemTaxPrice = taxPrice
				money = this.toFixedNumberSize(price * amountOrMoney)
				moneyWithTax = this.toFixedNumberSize(taxPrice * amountOrMoney)
			} else if (target === 'moneyWithTax') {
				moneyWithTax = amountOrMoney
				itemTaxPrice = this.toFixedNumberSize(moneyWithTax / busUnitAmount)
				money = this.toFixedNumberSize(moneyWithTax / (1 + tax))
				itemPrice = this.toFixedNumberSize(money / busUnitAmount)
			} else if (target === 'taxPrice') {
				itemTaxPrice = amountOrMoney
				moneyWithTax = this.toFixedNumberSize(busUnitAmount * itemTaxPrice)
				itemPrice = this.toFixedNumberSize(itemTaxPrice / (1 + tax))
				money = this.toFixedNumberSize(itemPrice * busUnitAmount)
			} else if (target === 'price') {
				itemPrice = amountOrMoney
				money = this.toFixedNumberSize(itemPrice * busUnitAmount)
				itemTaxPrice = this.toFixedNumberSize(itemPrice * (1 + tax))
				moneyWithTax = this.toFixedNumberSize(busUnitAmount * itemTaxPrice)
			}
			itemData.money = money
			itemData.moneyWithTax = moneyWithTax
			itemData.taxMoney = this.toFixedNumberSize(this.toFixedNumberSize(moneyWithTax) - this.toFixedNumberSize(money))
			itemData.price = itemPrice
			itemData.taxPrice = itemTaxPrice
		},
		// }}}
		toFixedNumberSize (data) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysPointSize))
		},
		changeGiftFlag () {
			if (this.currentItemData.giftFlag) {
				this.currentItemData.money = 0
				this.currentItemData.moneyWithTax = 0
				this.currentItemData.taxMoney = 0
			} else {
				this.calcMoney('price', this.currentItemData.price, this.currentItemData)
			}
		},
		onTaxPriceBlur () {
			this.onCheckMoneyOrAmount().then(() => {
			}).catch(() => {
				this.$refs.taxPriceInput.setFocus()
			})
		},
		onCheckMoneyOrAmount (tips = true) {
			return new Promise((resolve, reject) => {
				let error = '不符合规则'
				let data = this.currentItemData
				let pricePlan = this.currentItemData.pricePlanDTO
				let getPriceWay = data.getPriceWay
				if (!this.$fxUtils.isDef(pricePlan)) {
					resolve()
					return false
				}
				// 数量大于0
				// priced 定价标志 0不定价 1定价
				// getPriceWay取价方式 0:采购价格,1:固定价格,2:比例加价,3:定额加价
				// floatRate价格浮动比例
				if (getPriceWay === '1' && pricePlan.priced) {
					let taxPrice = data.taxPrice
					let floatRate = this.toFixedNumberSize(pricePlan.floatRate)
					let downFloatRate = this.toFixedNumberSize(pricePlan.downFloatRate)
					let planTaxPrice = pricePlan.priceWithTax / pricePlan.unit.value * data.unitDTO.value
					let minTaxPrice = this.toFixedNumberSize(planTaxPrice * (1 - downFloatRate / 100))
					let maxTaxPrice = this.toFixedNumberSize(planTaxPrice * (1 + floatRate / 100))

					// let planPrice = pricePlan.price / pricePlan.unit.value * data.unitDTO.value
					// let minPrice = this.toFixedNumberSize(planPrice * (1 - floatRate / 100))
					// let maxPrice = this.toFixedNumberSize(planPrice * (1 + floatRate / 100))

					if (taxPrice < minTaxPrice || taxPrice > maxTaxPrice) {
						this.$nextTick(() => {
							if (tips) {
								let message = '含税单价：请填写 ' + minTaxPrice + ' 到 ' + maxTaxPrice + ' 范围内的数值！'
								this.$fxNotify.fail(message)
							}
							reject(error)
						})
					} else {
						resolve()
					}
				} else {
					resolve()
				}
			})
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
