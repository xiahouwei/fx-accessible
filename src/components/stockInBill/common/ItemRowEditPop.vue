<template>
	<div class="itemRowEdit-popup">
		<w-header :title="currentItemData.goodsDTO.name" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div ref="rowEditContent" class="itemRowEdit-content">
			<van-cell-group>
				<van-cell title="入库数量" :value="currentItemData.busUnitInAmount" value-class="info-item-value"/>
				<van-cell title="单位" :value="currentItemData.unitDTO.name" value-class="info-item-value"/>
				<van-cell title="仓位编号" :value="currentItemData.positionCode" value-class="info-item-value"/>
				<van-cell
					v-show="$fxAuth('shopStockInBill.seePrice')"
					:value="currentItemData.price"
					title="非税单价"
					value-class="info-item-value"
				></van-cell>
				<van-cell
					v-show="$fxAuth('shopStockInBill.seeNoTaxMoney')"
					:value="currentItemData.inMoney"
					title="非税金额"
					value-class="info-item-value"
				></van-cell>
				<van-cell title="税率"
					v-show="$fxAuth('shopStockInBill.seeTaxMoney')"
					:value="fomatterTaxes(currentItemData.tax)"
					:is-link="!isDisabled"
					value-class="info-item-value"
					:class="{ 'text-tax': !isDisabled }"
					@click="onTaxClick"
				/>
				<van-cell v-show="$fxAuth('shopStockInBill.seeTaxMoney')" title="税额" :value="currentItemData.taxInMoney" value-class="info-item-value"/>
				<van-pro-number-field
					ref="taxPriceInput"
					v-show="$fxAuth('shopStockInBill.seePrice')"
					v-model="currentItemData.taxPrice"
					label="含税单价"
					input-align="right"
					min="0"
					:max="maxAmount"
					:intLength="numberLength"
					:pointSize="sysPointSize"
					:disabled="!$fxAuth('shopStockInBill.editPrice') || isDisabled || currentItemData.busUnitInAmount === 0"
					@change="onTaxPriceChange(currentItemData.taxPrice)"
				></van-pro-number-field>
				<van-cell
					title="生产日期"
					:value="fomatterDate(currentItemData.productDate)"
					:is-link="!isDisabled"
					@click="onProductDateClick" />
				<van-cell title="品项编号" :value="currentItemData.goodsDTO.code" value-class="info-item-value"/>
				<van-switch-cell v-model="currentItemData.giftFlag" :disabled="isDisabled || hasFatherIsEdit" @change="changeGiftFlag" class="info-item-value" title="赠送" />
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
				<van-cell v-show="hasFatherIsEdit" title="EDI发货数量" :value="currentItemData.ediDeliveryAmount" value-class="info-item-value"/>
				<van-cell v-show="hasFatherIsEdit" title="EDI单价" :value="currentItemData.ediDeliveryPrice" value-class="info-item-value"/>
				<van-cell v-show="hasFatherIsEdit" title="EDI含税金额" :value="currentItemData.ediDeliveryMoneyWithTaxes" value-class="info-item-value"/>
				<van-cell v-show="hasFatherIsEdit" title="EDI税率" :value="currentItemData.ediDeliveryTaxes + '%'" value-class="info-item-value"/>
				<van-cell v-show="sysShowDZCData" title="净重量" :value="toFixedNumberSize(currentItemData.netWeight)" value-class="info-item-value"></van-cell>
				<van-cell v-show="sysShowDZCData" title="皮重量" :value="toFixedNumberSize(currentItemData.skinWeight)" value-class="info-item-value"></van-cell>
				<van-cell v-show="sysShowDZCData" title="毛重量" :value="toFixedNumberSize(currentItemData.grossWeight)" value-class="info-item-value"></van-cell>
				<van-cell v-show="sysShowDZCData" title="称重单位" :value="currentItemData.weightUnit" value-class="info-item-value"></van-cell>
				<van-cell v-show="sysShowDZCData" title="称重状态" :value="currentItemData.isWeightSign ? '已称重' : '未称重'" value-class="info-item-value"></van-cell>
				<!-- <van-cell v-show="sysShowDZCData" title="图片" :border="false" value-class="info-item-value"></van-cell>
				<van-cell v-show="sysShowDZCData && currentItemData.images.length" class="info-cell-img" value-class="info-item-img">
					<img :src="comptedItemImgSrc(currentItemData.images)">
				</van-cell> -->
				<stock-select-image
					v-on="$listeners"
					v-bind="$props"
					:disabled="isDisabled"
					:uploadAble="6"
					v-show="currentItemData.id"
					:currentItemData="currentItemData"
					@pictureChange="pictureChange"
				/>
			</van-cell-group>
		</div>
		<div class="itemRowEdit-bottom">
			<van-button v-if="!isDisabled" class="confirm-btn fx-no-radius" type="primary" @click="onConfirmClick">保存</van-button>
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
import stockSelectImage from '../../../components/stockInBill/common/StockSelectImage'
import taxesActionSheet from '@/components/common/taxesActionSheet.vue'
export default {
	name: 'itemRowEdit',
	components: {
		taxesActionSheet,
		stockSelectImage
	},
	props: {
		visibleFlag: Boolean,
		itemData: {
			type: Object,
			default: () => {
				return {}
			}
		},
		selcetPictureMode: {
			type: Object,
			default: () => {}
		},
		hasFatherBillFlag: Boolean,
		isDisabled: Boolean
	},
	data () {
		return {
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			delImagesArr: [],
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
			uploadCloud: state => state.systemParams.uploadCloud,
			sysShowDZCData: state => state.systemParams.sysShowDZCData,
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId
		}),
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
		},
		hasFatherIsEdit () {
			return this.hasFatherBillFlag && !!this.currentItemData.preDetailId
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
		pictureChange (val, delImagesArr) {
			this.currentItemData.images = val
			this.delImagesArr = delImagesArr
		},
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
					this.saveBill().then(_ => this.saveNotice())
				} else {
					this.saveNotice()
				}
			}).catch(() => {
				this.$refs.taxPriceInput.setFocus()
			})
		},
		saveBill () {
			return new Promise((resolve, reject) => {
				let inputFile = []
				this.currentItemData.images.map(item => {
					if (item.type && item.type === 'add') {
						inputFile.push(item.imagUrl)
					}
				})
				let delParams = this.delImagesArr.map(item => {
					return item.imagUrl
				})
				let params = {
					'input_files[]': inputFile,
					'del_filename': delParams
				}
				if (inputFile.length || delParams.length) {
					this.$fxHttp.requestPost({
						url: `${this.$fxBaseApi.url}/upload/detailId/${this.currentItemData.id}/uploadDetailPicturesMultipleWithMaxCount`,
						data: params
					}).then(res => {
						/* 将base64地址替换为服务端返回地址，替换规则为按服务端返回顺序 */
						this.resetImagesUrl(res.storeBillImags)
						resolve()
					}).catch(e => reject(e))
				} else {
					resolve()
				}
			})
		},
		// 截取返回图片Url
		getLasturl (value) {
			if (value !== null || value !== '') {
				const str = value.split('http://')
				const index = str[1].indexOf('/')
				return str[1].substring(index + 1)
			}
			return false
		},
		resetImagesUrl (storeBillImags) {
			this.currentItemData.images = storeBillImags
		},
		saveNotice () {
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
			if (this.isDisabled || !this.$fxAuth('shopStockInBill.editTax')) return false
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
			let { price, busUnitInAmount, inMoney, taxInMoney, inMoneyWithTax } = this.currentItemData
			price = parseFloat(this.$fxUtils.toFixedSHW(inMoneyWithTax / busUnitInAmount / (1 + tax), this.sysPointSize))
			inMoney = parseFloat(this.$fxUtils.toFixedSHW(price * busUnitInAmount, this.sysPointSize))
			taxInMoney = parseFloat(this.$fxUtils.toFixedSHW((inMoneyWithTax - inMoney), this.sysPointSize))
			this.currentItemData.price = price
			this.currentItemData.inMoney = inMoney
			this.currentItemData.taxInMoney = taxInMoney
		},
		onTaxPriceChange (taxInMoney) {
			this.calcMoney('taxPrice', taxInMoney, this.currentItemData)
		},
		// {{{计算税额并渲染
		calcMoney (target, amountOrMoney, itemData) {
			let { taxPrice, busUnitInAmount, price, tax } = itemData
			let money = 0
			let moneyWithTax = 0
			let itemPrice = 0
			let itemTaxPrice = 0
			amountOrMoney = this.toFixedNumberSize(amountOrMoney)
			if (itemData.giftFlag || (target === 'money' && amountOrMoney === 0)) {
				// 赠送、数量为0
				itemData.inMoney = 0
				itemData.inMoneyWithTax = 0
				itemData.taxInMoney = 0
				return true
			}
			if (target === 'money') {
				money = amountOrMoney
				itemPrice = this.toFixedNumberSize(money / busUnitInAmount)
				moneyWithTax = this.toFixedNumberSize(money * (1 + tax))
				itemTaxPrice = this.toFixedNumberSize(moneyWithTax / busUnitInAmount)
			} else if (target === 'amount') {
				itemData.busUnitInAmount = amountOrMoney
				itemPrice = price
				itemTaxPrice = taxPrice
				money = this.toFixedNumberSize(price * amountOrMoney)
				moneyWithTax = this.toFixedNumberSize(taxPrice * amountOrMoney)
			} else if (target === 'moneyWithTax') {
				moneyWithTax = amountOrMoney
				itemTaxPrice = this.toFixedNumberSize(moneyWithTax / busUnitInAmount)
				money = this.toFixedNumberSize(moneyWithTax / (1 + tax))
				itemPrice = this.toFixedNumberSize(money / busUnitInAmount)
			} else if (target === 'taxPrice') {
				itemTaxPrice = amountOrMoney
				moneyWithTax = this.toFixedNumberSize(busUnitInAmount * itemTaxPrice)
				itemPrice = this.toFixedNumberSize(itemTaxPrice / (1 + tax))
				money = this.toFixedNumberSize(itemPrice * busUnitInAmount)
			} else if (target === 'price') {
				itemPrice = amountOrMoney
				money = this.toFixedNumberSize(itemPrice * busUnitInAmount)
				itemTaxPrice = this.toFixedNumberSize(itemPrice * (1 + tax))
				moneyWithTax = this.toFixedNumberSize(busUnitInAmount * itemTaxPrice)
			}
			itemData.inMoney = money
			itemData.inMoneyWithTax = moneyWithTax
			itemData.taxInMoney = this.toFixedNumberSize(this.toFixedNumberSize(moneyWithTax) - this.toFixedNumberSize(money))
			itemData.price = itemPrice
			itemData.taxPrice = itemTaxPrice
		},
		// }}}
		toFixedNumberSize (data) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysPointSize))
		},
		changeGiftFlag () {
			if (this.currentItemData.giftFlag) {
				this.currentItemData.inMoney = 0
				this.currentItemData.inMoneyWithTax = 0
				this.currentItemData.taxInMoney = 0
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
				if (!data.giftFlag && getPriceWay === '1' && pricePlan.priced) {
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
