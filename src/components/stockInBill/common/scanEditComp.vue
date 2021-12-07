<template>
	<div class="item-edit">
		<div class="edit-head">
			<van-icon @click="onCloseClick" name="cross" />
		</div>
		<div class="item-edit-content">
			<div class="edit-content-wrap">
				<div class="content-row">入库仓库：<span>{{store.name}}</span></div>
				<div>品项名称：<span>{{scanGoods.goodsDTO.name}}</span></div>
				<div>单位：<span>{{scanGoods.unitDTO.name}}</span></div>
				<div class="content-row">数量：<span class="item-amount" @click="onItemEdit">{{scanGoods.busUnitInAmount}}</span></div>
				<div v-if="scanGoods.scanType !== 'add'" class="content-row">
					<span class="row-title">重复品项添加方式</span>
					<van-radio-group  @change="onScanTypeClick" v-model="scanType" class="radio-group">
						<van-radio class="radio-item" name="acc">累加</van-radio>
						<van-radio name="cover">覆盖</van-radio>
					</van-radio-group>
				</div>
			</div>
		</div>
		<div class="item-bottom">
			<van-button class="bottom-btn fx-no-radius" type="danger" @click="onItemConfirm" >完成</van-button>
			<van-button class="bottom-btn fx-no-radius" type="primary" @click="onReScanClick">继续</van-button>
		</div>
		<div v-show="numberKeyboardShow" class="details-number-keyboard">
			<itemNumberKeyboard
				:title="keyboardTitleCompted"
				:unit="keyboardUnitCompted"
				:amount="keyboardAmountCompted"
				:pointSize="sysPointSize"
				:intLength="numberLength"
				:shortcutBtn="false"
				@change="onKeyboardChange"
				@hide="onKeyboardHide"
			></itemNumberKeyboard>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import itemNumberKeyboard from '@/components/common/ItemNumberKeyboard.vue'
export default {
	name: 'scanEditComp',
	components: {
		itemNumberKeyboard
	},
	props: {
		visibleFlag: Boolean,
		store: {
			type: Object,
			default: () => {
				return {}
			}
		},
		initGoods: {
			type: Object,
			default: () => {
				return {}
			}
		},
		supplierId: {
			type: String,
			default: ''
		},
		shopId: {
			type: String,
			default: ''
		},
		orderItemList: {
			type: Array,
			default: () => {
				return []
			}
		}
	},
	data () {
		return {
			activeNames: [],
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			itemClassList: [],
			numberKeyboardShow: false,
			scanGoods: {},
			scanType: 'acc',
			scanItemList: []
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize',
			numberLength: 'numberLength',
			systemParams: 'systemParams',
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId
		}),
		keyboardTitleCompted () {
			return this.scanGoods.goodsDTO && this.scanGoods.goodsDTO.name
		},
		keyboardUnitCompted () {
			return this.scanGoods.unitDTO && this.scanGoods.unitDTO.name
		},
		keyboardAmountCompted () {
			return this.scanGoods.busUnitInAmount
		}
	},
	watch: {
		visibleFlag: {
			handler (val) {
				if (val) {
					this.refresh()
					this.scanItemList = JSON.parse(JSON.stringify(this.orderItemList))
					// 初始默认累加、数量为1
					this.setScanGoods(this.initGoods)
				}
			},
			immediate: true
		}
	},
	methods: {
		refresh () {
			this.resetHandler()
		},
		// {{{清空数据
		resetHandler () {
			this.scanType = 'acc'
		},
		// }}}
		onCloseClick () {
			this.$emit('update:visibleFlag', false)
		},
		onItemConfirm () {
			this.$nextTick(() => {
				this.setOrderItemList(this.scanGoods)
				this.$emit('on-confirm', [this.scanItemList, this.store])
				this.$emit('update:visibleFlag', false)
			})
		},
		onKeyboardChange (val) {
			this.scanGoods.busUnitInAmount = val
		},
		numberStringAmount () {
			let busUnitInAmount = this.scanGoods.busUnitInAmount
			this.scanGoods.busUnitInAmount = parseFloat(busUnitInAmount) + ''
		},
		onItemEdit () {
			this.numberKeyboardShow = true
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
				moneyWithTax = money * (1 + tax)
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
		onKeyboardHide () {
			this.numberStringAmount()
			this.numberKeyboardShow = false
		},
		editItem (item) {
			if (item.id) this.$set(item, 'changeType', 'edit')
		},
		// }}}
		onScanTypeClick (data) {
			this.scanGoods.scanType = data
		},
		onReScanClick () {
			this.$fxCordova.barcodeScan().then(barcode => {
			// 收起键盘，以后可优化
				this.numberKeyboardShow = false
				// 保存上一次扫码的结果
				this.setOrderItemList(this.scanGoods)
				this.getItemByTwoCode(barcode).then(result => {
					this.setScanGoods(result[0])
				})
			})
			// this.numberKeyboardShow = false
			// this.setOrderItemList(this.scanGoods)
			// this.getItemByTwoCode('6973893750052').then(result => {
			// 	this.setScanGoods(result[0])
			// })
		},
		setScanGoods (scanResult) {
			scanResult.busUnitInAmount = 1
			let currentStore = this.scanItemList.find(item => {
				return item.id === this.store.id
			})
			// 新增仓库，直接添加
			if (!currentStore) {
				scanResult.scanType = 'add'
				this.scanType = scanResult.scanType
				this.scanGoods = scanResult
				return true
			}
			let sameGoodList = currentStore.details.filter(item => {
				return item.goodsDTO.id === scanResult.goodsDTO.id && item.changeType !== 'del'
			})
			// 条件一: 当前已选品项 不存在 扫码品项 直接新增
			if (!sameGoodList.length) {
				scanResult.scanType = 'add'
			} else {
				let _unitIndex = sameGoodList.findIndex(sameItem => {
					return scanResult.goodsDTO.id === sameItem.goodsDTO.id && scanResult.unitDTO.id === sameItem.unitDTO.id && sameItem.changeType !== 'del'
				})
				// 条件二: 当前已选品项 存在 扫码品项 且允许品项重复，单位不同，直接新增
				if (this.systemParams.sysStockInSameGoods && !~_unitIndex) {
					scanResult.scanType = 'add'
				} else { // 不允许重复品项
					// 条件三：当前已选品项 存在 扫码品项 单位不一定相同（1，单位相同，允许/不允许品项重复；2，单位不同, 不允许品项重复），选择累加或者覆盖
					scanResult.scanType = 'acc'
				}
			}
			this.scanType = scanResult.scanType
			this.scanGoods = scanResult
		},
		setOrderItemList (scanResult) {
			let currentStore = this.scanItemList.find(item => {
				return item.id === this.store.id
			})
			// 新增仓库，直接添加
			if (!currentStore) {
				let newStoreObj = this.store
				scanResult.scanType = 'add'
				scanResult.changeType = 'add'
				scanResult.inHouseDTO = JSON.parse(JSON.stringify(this.store))
				// 设置金额
				this.calcMoney('amount', scanResult.busUnitInAmount, scanResult)
				newStoreObj.details = [scanResult]
				this.scanItemList.push(newStoreObj)
				return true
			}
			let sameGoodList = currentStore.details.filter(item => {
				return item.goodsDTO.id === scanResult.goodsDTO.id && item.changeType !== 'del'
			})
			// 条件一: 当前已选品项 不存在 扫码品项 直接新增
			if (!sameGoodList.length) {
				scanResult.scanType = 'add'
				scanResult.changeType = 'add'
				// 设置金额
				let pricePlanDTO = scanResult.pricePlanDTO
				scanResult.price = this.toFixedNumberSize(pricePlanDTO.price)
				scanResult.tax = this.toFixedNumberSize(pricePlanDTO.taxes)
				scanResult.taxPrice = this.toFixedNumberSize(pricePlanDTO.priceWithTax)
				this.calcMoney('amount', scanResult.busUnitInAmount, scanResult)
				scanResult.inHouseDTO = JSON.parse(JSON.stringify(this.store))
				currentStore.details.push(scanResult)
			} else {
				let _unitIndex = currentStore.details.findIndex(sameItem => {
					return scanResult.goodsDTO.id === sameItem.goodsDTO.id && scanResult.unitDTO.id === sameItem.unitDTO.id && sameItem.changeType !== 'del'
				})
				// 条件二: 当前已选品项 存在 扫码品项 且允许品项重复，单位不同，直接新增
				if (this.systemParams.sysStockInSameGoods && !~_unitIndex) {
					scanResult.scanType = 'add'
					scanResult.changeType = 'add'
					// 设置金额
					let pricePlanDTO = scanResult.pricePlanDTO
					scanResult.price = this.toFixedNumberSize(pricePlanDTO.price)
					scanResult.tax = this.toFixedNumberSize(pricePlanDTO.taxes)
					scanResult.taxPrice = this.toFixedNumberSize(pricePlanDTO.priceWithTax)
					this.calcMoney('amount', scanResult.busUnitInAmount, scanResult)
					this.currentStore.details.push(scanResult)
				} else { // 不允许重复品项
					// 条件三：当前已选品项 存在 扫码品项 单位不一定相同（1，单位相同，允许/不允许品项重复；2，单位不同, 不允许品项重复），选择累加或者覆盖
					if (!~_unitIndex) {
						_unitIndex = 0
					}
					let oldUnitRate = currentStore.details[_unitIndex].unitDTO.value // 新增的品项明细获取之前单位换算值方式
					let newUnit = scanResult.unitDTO.value // 新增的品项明细获取之后单位换算值方式
					let amount = 0
					let oldAmount = currentStore.details[_unitIndex].busUnitInAmount
					currentStore.details[_unitIndex].changeType = (currentStore.details[_unitIndex].changeType === 'add') ? 'add' : 'edit'
					if (scanResult.scanType === 'cover') {
						if (this.systemParams.sysStockInChangeUnit) { // 系统设置允许修改单位,改为新单位
							amount = parseFloat(scanResult.busUnitInAmount) * oldUnitRate / newUnit
							currentStore.details[_unitIndex].unitDTO = scanResult.unitDTO
						} else { // 系统设置不允许修改单位，改为旧单位
							amount = parseFloat(scanResult.busUnitInAmount) * newUnit / oldUnitRate
						}
						currentStore.details[_unitIndex].busUnitInAmount = this.toFixedNumberSize(amount)
					} else {
						if (this.systemParams.sysStockInChangeUnit) { // 系统设置允许修改单位,改为新单位
							amount = parseFloat(oldAmount) * oldUnitRate / newUnit + this.toFixedNumberSize(scanResult.busUnitInAmount)
							currentStore.details[_unitIndex].unitDTO = scanResult.unitDTO
						} else { // 系统设置不允许修改单位，改为旧单位
							amount = parseFloat(scanResult.busUnitInAmount) * newUnit / oldUnitRate + this.toFixedNumberSize(currentStore.details[_unitIndex].busUnitInAmount)
						}
						currentStore.details[_unitIndex].busUnitInAmount = this.toFixedNumberSize(amount)
					}
					// 设置金额
					this.calcMoney('amount', amount, currentStore.details[_unitIndex])
				}
			}
		},
		// {{{ 扫二维码
		getItemByTwoCode (barcode) {
			let params = {
				shopId: this.shopId,
				query: {
					barCode: barcode,
					houseId: this.store.id,
					supplierId: this.supplierId
				}
			}
			return this.$fxApi('z5common.getScanCodeBySM', params)().then(res => {
				return res.billAndDetails
			})
		}
		// }}}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.item-edit {
	height: 100%
	width: 100%
	display: flex
	flex-direction: column
	font-size: 15px
	color: $fxWhite
	.edit-head {
		text-align: right
		padding: 20px
	}
	.item-edit-content {
		flex: 1
		color: $fxWhite
		position: relative
	}
	/deep/.van-radio__label {
		color: $fxWhite
	}
	.edit-content-wrap {
		position: absolute
		bottom: 0
		margin-bottom: 50px
		margin-left: 45px
	}
	.details-number-keyboard {
		z-index: 20
		color: $fxBlack
	}
	.item-amount {
		width: 124px
		display: inline-block
		background-color: $fxWhite
		height: 23px
		vertical-align: middle
		color: $fxBlack
		text-align: center
	}
	.content-row {
		display: flex
		padding: 5px 0 6px 0
		.row-title {
			padding-right: 20px
		}
		.radio-group {
			display: flex
		}
		.radio-item {
			margin-right: 15px
		}
	}
	.item-bottom {
		display: flex
		.bottom-btn {
			flex: 1
		}
	}
}
</style>

