<template>
	<div class="itemRowEdit-popup">
		<w-header :title="currentItemData.goodsDTO.name" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div ref="rowEditContent" class="itemRowEdit-content">
			<van-cell-group>
				<van-cell title="入库数量" :value="currentItemData.busUnitInAmount" value-class="info-item-value"/>
				<van-cell title="差异数量" :value="differenceAmount" value-class="info-item-value"/>
				<van-cell
					title="非税单价"
					:value="currentItemData.price"
					value-class="info-item-value"
				/>
				<van-cell
					title="非税金额"
					:value="currentItemData.inMoney"
					value-class="info-item-value"
				/>
				<van-cell title="税率"
					:value="fomatterTaxes(currentItemData.tax)"
					:is-link="!isDisabled"
					value-class="info-item-value"
					:class="{ 'text-tax': !isDisabled }"
					@click="onTaxClick"
				/>
				<van-cell title="税额" :value="currentItemData.taxInMoney" value-class="info-item-value"/>
				<!-- 这里后端有个权限shopStraightInBill.ediPrice写错了,应该是editPrice -->
				<van-pro-number-field
					ref="taxPrice"
					v-model="currentItemData.taxPrice"
					label="含税单价"
					input-align="right"
					min="0"
					:max="maxAmount"
					:intLength="numberLength"
					:pointSize="sysPointSize"
					:disabled="isDisabled || !$fxAuth('shopStraightInBill.ediPrice') || busUnitInAmountIs0"
					@change="onTaxInMoneyChange(currentItemData.taxPrice)"
					@focus="onFocus('taxPrice')"
				></van-pro-number-field>
				<van-cell
					title="生产日期"
					:value="fomatterDate(currentItemData.productDate)"
					:is-link="!isDisabled"
					@click="onProductDateClick"
				/>
				<van-cell
					title="品项编号"
					:value="currentItemData.goodsDTO.code"
					value-class="info-item-value"
				/>
				<van-pro-field
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
		differenceAmount () {
			let differenceAmount = this.toFixedNumberSize(this.currentItemData.rawAmount - this.currentItemData.busUnitInAmount)
			return Number.isNaN(differenceAmount) ? '' : differenceAmount
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
		busUnitInAmountIs0 () {
			return this.itemData.busUnitInAmount === 0 || this.itemData.busUnitInAmount === '0'
		},
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
		onCloseClick () {
			this.$emit('update:visibleFlag', false)
		},
		onConfirmClick () {
			this.currentItemData.changeType = 'edit'
			this.$emit('on-Confirm', this.currentItemData)
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
		onTaxClick () {
			if (this.isDisabled || this.busUnitInAmountIs0) return false
			if (!this.$fxAuth('shopStraightInBill.ediTax')) {
				this.$fxToast({
					message: '当前没有修改税率的权限!',
					position: 'top'
				})
				return false
			}
			this.taxesActionShow = true
		},
		onTaxesSelect (item) {
			this.currentItemData.tax = item.tax
			this.computedByTaxes(item.tax)
			this.taxesActionShow = false
		},
		computedCurrentItemData () {
			return {
				// 非税单价
				price: this.currentItemData.price,
				// 含税单价
				taxPrice: this.currentItemData.taxPrice,
				// 非税金额
				inMoney: this.currentItemData.inMoney,
				// 含税金额
				inMoneyWithTax: this.currentItemData.inMoneyWithTax,
				// 税额
				taxInMoney: this.currentItemData.taxInMoney,
				// 税率
				tax: this.currentItemData.tax,
				// 入库数量
				busUnitInAmount: this.currentItemData.busUnitInAmount
			}
		},
		computedByTaxes (tax) {
			let { price, taxPrice, inMoney, taxInMoney, inMoneyWithTax } = this.computedCurrentItemData()
			price = parseFloat(this.$fxUtils.toFixedSHW(taxPrice / (1 + tax), this.sysPointSize))
			inMoney = parseFloat(this.$fxUtils.toFixedSHW(inMoneyWithTax / (1 + tax), this.sysPointSize))
			taxInMoney = parseFloat(this.$fxUtils.toFixedSHW(inMoney * tax, this.sysPointSize))
			this.currentItemData.price = price
			this.currentItemData.inMoney = inMoney
			this.currentItemData.taxInMoney = taxInMoney
		},
		onPriceChange (price) {
			let { tax, busUnitInAmount } = this.computedCurrentItemData()
			let _price = parseFloat(price)
			_price = this.$fxUtils.toFixedSHW(_price, this.sysPointSize)
			this.currentItemData.price = _price
			this.currentItemData.taxPrice = parseFloat(this.$fxUtils.toFixedSHW(_price * (1 + tax), this.sysPointSize))
			this.currentItemData.inMoney = parseFloat(this.$fxUtils.toFixedSHW(_price * busUnitInAmount, this.sysPointSize))
			this.currentItemData.taxInMoney = parseFloat(this.$fxUtils.toFixedSHW(this.currentItemData.inMoney * tax, this.sysPointSize))
			this.currentItemData.inMoneyWithTax = parseFloat(this.$fxUtils.toFixedSHW(this.currentItemData.inMoney * (1 + tax), this.sysPointSize))
		},
		toFixedNumberSize (data, pointSize = this.sysPointSize) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, pointSize))
		},
		onInMoneyChange (inMoney) {
			let { tax, busUnitInAmount } = this.computedCurrentItemData()
			let _inMoney = parseFloat(inMoney)
			_inMoney = this.$fxUtils.toFixedSHW(_inMoney, this.sysPointSize)
			this.currentItemData.taxInMoney = parseFloat(this.$fxUtils.toFixedSHW(_inMoney * tax, this.sysPointSize))
			this.currentItemData.price = parseFloat(this.$fxUtils.toFixedSHW(_inMoney / busUnitInAmount, this.sysPointSize))
			this.currentItemData.taxPrice = parseFloat(this.$fxUtils.toFixedSHW(this.currentItemData.price * (1 + tax), this.sysPointSize))
			this.currentItemData.inMoneyWithTax = parseFloat(this.$fxUtils.toFixedSHW(inMoney * (1 + tax), this.sysPointSize))
		},
		onTaxInMoneyChange (taxInMoney) {
			let { tax, busUnitInAmount } = this.computedCurrentItemData()
			let _taxInMoney = parseFloat(taxInMoney)
			_taxInMoney = this.$fxUtils.toFixedSHW(_taxInMoney, this.sysPointSize)
			this.currentItemData.price = parseFloat(this.$fxUtils.toFixedSHW(_taxInMoney / (1 + tax), this.sysPointSize))
			this.currentItemData.inMoney = parseFloat(this.$fxUtils.toFixedSHW(this.currentItemData.price * busUnitInAmount, this.sysPointSize))
			this.currentItemData.taxInMoney = parseFloat(this.$fxUtils.toFixedSHW(this.currentItemData.inMoney * tax, this.sysPointSize))
			this.currentItemData.inMoneyWithTax = parseFloat(this.$fxUtils.toFixedSHW(this.currentItemData.inMoney * (1 + tax), this.sysPointSize))
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
