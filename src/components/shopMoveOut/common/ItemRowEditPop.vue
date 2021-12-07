<template>
	<div class="itemRowEdit-popup">
		<w-header :title="currentItemData.goodsDTO.name" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div ref="rowEditContent" class="itemRowEdit-content">
			<van-cell-group>
				<van-cell title="申请数量" :value="currentItemData.busUnitApplyAmount" value-class="info-item-value"/>
				<van-cell title="差异数量" :value="differenceAmount" value-class="info-item-value"/>
				<van-cell title="成本单价" :value="currentItemData.costPrice" value-class="info-item-value"/>
				<van-cell title="非税成本金额" :value="currentItemData.outMoney" value-class="info-item-value"/>
				<van-cell title="成本税率" :value="fomatterTaxes(currentItemData.tax)" value-class="info-item-value"/>
				<van-cell title="含税成本单价" :value="currentItemData.costTaxPrice" value-class="info-item-value"/>
				<van-cell title="含税成本金额" :value="currentItemData.outMoneyWithTax" value-class="info-item-value"/>
				<van-cell title="成本税额" :value="currentItemData.taxOutMoney" value-class="info-item-value"/>
				<van-cell
					:value="currentItemData.price"
					title="调拨单价"
					value-class="info-item-value"
				></van-cell>
				<van-cell
					:value="currentItemData.sendMoney"
					title="调拨非税金额"
					value-class="info-item-value"
				></van-cell>
				<van-cell title="调拨税率"
					:value="fomatterTaxes(currentItemData.sendTaxes)"
					:is-link="!isDisabled || !$fxAuth('shopMoveOutBill.editPrice')"
					value-class="info-item-value"
					:class="{ 'text-tax': !isDisabled }"
					@click="onTaxClick"
				/>
				<van-pro-number-field
					v-model="currentItemData.taxPrice"
					label="调拨含税单价"
					input-align="right"
					min="0"
					:max="maxAmount"
					:intLength="numberLength"
					:pointSize="sysPointSize"
					:disabled="!$fxAuth('shopMoveOutBill.editPrice') || isDisabled || currentItemData.busUnitOutAmount === 0"
					@change="onTaxPriceChange(currentItemData.taxPrice)"
				></van-pro-number-field>
				<van-cell title="调拨税额" :value="currentItemData.sendTaxMoney" value-class="info-item-value"/>
				<van-cell title="品项编号" :value="currentItemData.goodsDTO.code" value-class="info-item-value"/>
				<van-cell title="品项类型" :value="currentItemData.goodsDTO.styleName" value-class="info-item-value"/>
				<van-cell title="批次号" :value="currentItemData.batchCode" value-class="info-item-value"/>
				<van-pro-field
					ref="memo"
					v-model="currentItemData.memo"
					:placeholder="setPlaceholder('请输入备注')"
					:disabled="isDisabled"
					label="备注"
					input-align="right"
					@focus="onFocus('memo')"
				/>
				<van-cell v-show="sysShowDZCData" title="净重量" :value="toFixedNumberSize(currentItemData.netWeight)" value-class="info-item-value"></van-cell>
				<van-cell v-show="sysShowDZCData" title="皮重量" :value="toFixedNumberSize(currentItemData.skinWeight)" value-class="info-item-value"></van-cell>
				<van-cell v-show="sysShowDZCData" title="毛重量" :value="toFixedNumberSize(currentItemData.grossWeight)" value-class="info-item-value"></van-cell>
				<van-cell v-show="sysShowDZCData" title="称重单位" :value="currentItemData.weightUnit" value-class="info-item-value"></van-cell>
				<van-cell v-show="sysShowDZCData" title="称重状态" :value="currentItemData.isWeightSign ? '已称重' : '未称重'" value-class="info-item-value"></van-cell>
				<van-cell v-show="sysShowDZCData" title="图片" :border="false" value-class="info-item-value"></van-cell>
				<van-cell v-show="sysShowDZCData && currentItemData.images.length" class="info-cell-img" value-class="info-item-img">
					<img :src="comptedItemImgSrc(currentItemData.images)">
				</van-cell>
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
			datePickerShow: false,
			taxesActionShow: false
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize',
			numberLength: 'numberLength',
			maxAmount: 'maxAmount',
			sysShowDZCData: state => state.systemParams.sysShowDZCData,
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId
		}),
		fomatterDate (date) {
			return (date) => {
				if (date) {
					return this.$fxUtils.setDate(new Date(date))
				} else {
					return ''
				}
			}
		},
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
		differenceAmount () {
			let differenceAmount = this.currentItemData.busUnitApplyAmount - this.currentItemData.busUnitOutAmount
			differenceAmount = parseFloat(this.$fxUtils.toFixedSHW(differenceAmount, this.sysPointSize))
			return Number.isNaN(differenceAmount) ? '' : differenceAmount
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
		onProductDateClick () {
			if (this.isDisabled) {
				return false
			}
			if (this.currentItemData.productDate) this.currentDate = new Date(this.currentItemData.productDate)
			this.datePickerShow = true
		},
		dateConfirmhandle (date) {
			this.currentItemData.productDate = date.getTime()
			this.datePickerShow = false
		},
		onTaxClick () {
			if (this.isDisabled || !this.$fxAuth('shopMoveOutBill.editTax')) return false
			this.taxesActionShow = true
		},
		onTaxesSelect (item) {
			this.currentItemData.sendTaxes = item.tax
			this.computedByTaxes(item.tax)
		},
		computedByTaxes (tax) {
			// 修改税率，发生改变的应该是非税单价和非税金额
			let { price, busUnitOutAmount, sendMoney, sendTaxMoney, sendMoneyWithTax } = this.currentItemData
			price = parseFloat(this.$fxUtils.toFixedSHW(sendMoneyWithTax / busUnitOutAmount / (1 + tax), this.sysPointSize))
			sendMoney = parseFloat(this.$fxUtils.toFixedSHW(price * busUnitOutAmount, this.sysPointSize))
			sendTaxMoney = parseFloat(this.$fxUtils.toFixedSHW((sendMoneyWithTax - sendMoney), this.sysPointSize))
			this.currentItemData.price = price
			this.currentItemData.sendMoney = sendMoney
			this.currentItemData.sendTaxMoney = sendTaxMoney
		},
		onTaxPriceChange (taxPrice) {
			this.calcMoney('taxPrice', taxPrice, this.currentItemData)
		},
		// {{{计算税额并渲染
		calcMoney (target, amountOrMoney, itemData) {
			let { taxPrice, busUnitOutAmount, price, sendTaxes } = itemData
			let money = 0
			let moneyWithTax = 0
			let itemPrice = 0
			let itemTaxPrice = 0
			amountOrMoney = this.toFixedNumberSize(amountOrMoney)
			if (itemData.giftFlag || (target === 'money' && amountOrMoney === 0)) {
				// 赠送、数量为0
				itemData.sendMoney = 0
				itemData.sendMoneyWithTax = 0
				itemData.sendTaxMoney = 0
				return true
			}
			if (target === 'money') {
				money = amountOrMoney
				itemPrice = this.toFixedNumberSize(money / busUnitOutAmount)
				moneyWithTax = this.toFixedNumberSize(money * (1 + sendTaxes))
				itemTaxPrice = this.toFixedNumberSize(moneyWithTax / busUnitOutAmount)
			} else if (target === 'amount') {
				itemData.busUnitOutAmount = amountOrMoney
				itemPrice = price
				itemTaxPrice = taxPrice
				money = this.toFixedNumberSize(price * amountOrMoney)
				moneyWithTax = this.toFixedNumberSize(taxPrice * amountOrMoney)
			} else if (target === 'moneyWithTax') {
				moneyWithTax = amountOrMoney
				itemTaxPrice = this.toFixedNumberSize(moneyWithTax / busUnitOutAmount)
				money = this.toFixedNumberSize(moneyWithTax / (1 + sendTaxes))
				itemPrice = this.toFixedNumberSize(money / busUnitOutAmount)
			} else if (target === 'taxPrice') {
				itemTaxPrice = amountOrMoney
				moneyWithTax = this.toFixedNumberSize(busUnitOutAmount * itemTaxPrice)
				itemPrice = this.toFixedNumberSize(itemTaxPrice / (1 + sendTaxes))
				money = this.toFixedNumberSize(itemPrice * busUnitOutAmount)
			} else if (target === 'price') {
				itemPrice = amountOrMoney
				money = this.toFixedNumberSize(itemPrice * busUnitOutAmount)
				itemTaxPrice = this.toFixedNumberSize(itemPrice * (1 + sendTaxes))
				moneyWithTax = this.toFixedNumberSize(busUnitOutAmount * itemTaxPrice)
			}
			itemData.sendMoney = money
			itemData.sendMoneyWithTax = moneyWithTax
			itemData.sendTaxMoney = this.toFixedNumberSize(this.toFixedNumberSize(moneyWithTax) - this.toFixedNumberSize(money))
			itemData.price = itemPrice
			itemData.taxPrice = itemTaxPrice
		},
		// }}}
		toFixedNumberSize (data) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysPointSize))
		},
		changeGiftFlag () {
			if (this.currentItemData.giftFlag) {
				this.currentItemData.sendMoney = 0
				this.currentItemData.sendMoneyWithTax = 0
				this.currentItemData.sendTaxMoney = 0
			} else {
				this.calcMoney('price', this.currentItemData.price, this.currentItemData)
			}
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
	.text-tax .info-item-value {
		color: $fxTextColor;
	}
}
</style>
