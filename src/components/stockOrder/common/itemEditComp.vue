<template>
	<div class="item-edit">
		<w-header title="选择品项" :leftOptions="leftOptions" @on-click-back="onCloseClick">
			<van-icon slot="header-right" name="success" class="header-confirm-btn" @click="onItemConfirm" />
		</w-header>
		<div class="item-search clearfix">
			<van-search
				v-model="searchKey"
				placeholder="请输入搜索关键词"
				shape="round"
				@search="search"
				@focus="onSearchFocus"/>
		</div>
		<div class="item-edit-content">
			<addItemClassList
				v-model="currentClass"
				:itemClassList="itemClassList"
				@on-change-class="changeClass"
			></addItemClassList>
			<addItemList
				ref="addItemList"
				v-model="rowActive"
				:listLoading.sync="listLoading"
				:loadFinished="loadFinished"
				:itemList="itemList"
				@on-load-more="onLoadMore"
			>
				<template slot="item-cell" slot-scope="scope">
					<addItemCell
						:itemData="scope.$item"
						:itemIndex="scope.$index"
						:rowActive="rowActive"
						:isActive="scope.$item.must"
						:isError="scope.$index === isErrorActive"
						@on-item-click="onItemEdit"
					></addItemCell>
				</template>
			</addItemList>
		</div>
		<div v-show="numberKeyboardShow" class="details-number-keyboard">
			<itemNumberKeyboard
				:title="keyboardTitleCompted"
				:unit="keyboardUnitCompted"
				:unitEdit="$fxSysAuth('stockOrderBill.sysstockordermodifyunit')"
				:amount="keyboardAmountCompted"
				:pointSize="sysPointSize"
				:intLength="numberLength"
				@change="onKeyboardChange"
				@on-unit-unitEdit="onUnitEdit"
				@pre="onKeyboardPre"
				@next="onKeyboardNext"
				@hide="onKeyboardHide"
			></itemNumberKeyboard>
			<van-actionsheet
				v-model="unitActionShow"
				:actions="unitActions"
				cancel-text="取消"
				@select="onUnitSelect"
			/>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import addItemClassList from '@/components/common/AddItemClassList.vue'
import addItemList from '@/components/common/AddItemList.vue'
import addItemCell from '@/components/common/AddItemCell.vue'
import itemNumberKeyboard from '@/components/common/ItemNumberKeyboard.vue'
const ITEM_SIZE = 10
export default {
	name: 'itemEditComp',
	components: {
		addItemClassList,
		addItemList,
		addItemCell,
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
		shopId: {
			type: String,
			default: ''
		},
		businessDate: {
			type: [String, Number],
			default: ''
		},
		supplierId: {
			type: String,
			default: ''
		},
		parentStoreItem: {
			type: Array,
			default: () => {
				return []
			}
		}
	},
	data () {
		return {
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			searchKey: '',
			currentClass: '',
			itemClassList: [],
			itemList: [],
			numberKeyboardShow: false,
			rowActive: '',
			selectedItemArr: [],
			itemListStart: 0,
			listLoading: false,
			loadFinished: true,
			listError: false,
			isErrorActive: '',
			unitActionShow: false,
			unitActions: []
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize',
			numberLength: 'numberLength',
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId
		}),
		keyboardTitleCompted () {
			if (this.rowActive === '') {
				return ''
			} else {
				let row = this.itemList[this.rowActive]
				return row.goodsDTO.name
			}
		},
		keyboardUnitCompted () {
			if (this.rowActive === '') {
				return ''
			} else {
				let row = this.itemList[this.rowActive]
				return row.unitDTO.name
			}
		},
		keyboardAmountCompted () {
			if (this.rowActive === '') {
				return '0'
			} else {
				let row = this.itemList[this.rowActive]
				return row.busUnitAmount
			}
		}
	},
	watch: {
		visibleFlag: {
			handler (val) {
				if (val) {
					this.selectedItemArr = JSON.parse(JSON.stringify(this.parentStoreItem))
					this.refresh()
				}
			},
			immediate: true
		},
		rowActive (val, oldVal) {
			if (oldVal !== '') {
				this.numberStringAmount(oldVal)
				this.pushSelectedItem(this.itemList[oldVal])
				if (val === '') {
					this.numberKeyboardShow = false
				} else {
					this.scrollToActive(val)
				}
			} else {
				this.scrollToActive(val)
			}
		}
	},
	methods: {
		refresh () {
			this.searchKey = ''
			this.getItemClass().then(res => {
				this.itemClassList = res.goodsTypes
				this.currentClass = ''
				this.getItemByClass()
			})
		},
		onCloseClick () {
			this.rowActive = ''
			this.$emit('update:visibleFlag', false)
		},
		onItemConfirm () {
			this.rowActive = ''
			this.$nextTick(() => {
				this.selectedItemArr.forEach(item => {
					if (!item.houseDTO) {
						item.houseDTO = this.store
					}
				})
				this.$emit('on-confirm', [this.selectedItemArr, this.store])
				this.$emit('update:visibleFlag', false)
			})
		},
		search () {
			this.getItemByClass()
		},
		getItemClass () {
			return new Promise(resolve => {
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.shopId}/users/${this.loginerId}/goodTypes`
				}).then(res => {
					resolve(res)
				})
			})
		},
		getItem () {
			return new Promise(resolve => {
				let params = {
					start: this.itemListStart,
					size: ITEM_SIZE,
					paged: true,
					goodsTypeId: this.currentClass || null,
					inHouseId: this.store.id,
					shopId: this.shopId,
					supplierId: this.supplierId,
					workDate: this.businessDate,
					searchText: this.searchKey || null
				}
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/accounts/${this.shopId}/users/${this.loginerId}/stockOrderDetails`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		getItemByClass () {
			this.itemListStart = 0
			this.getItem().then(res => {
				let billAndDetails = this.setDataMoneyAndPrice(res.stockOrderBillDetails)
				this.itemList = this.setResItem(billAndDetails)
				this.setListLoading(billAndDetails.length)
				this.$nextTick(() => {
					this.$refs.addItemList.onSelectLetter(0, 5)
				})
			})
		},
		onLoadMore () {
			this.getItem().then(res => {
				let billAndDetails = this.setDataMoneyAndPrice(res.stockOrderBillDetails)
				this.itemList.push(...this.setResItem(billAndDetails))
				this.setListLoading(billAndDetails.length)
			})
		},
		setDataMoneyAndPrice (data) {
			data.forEach(item => {
				item.unitDTO = this.$fxUtils.JSONcopy(item.pricePlanDTO.unit)
				item.pricePlanDTO = this.$fxUtils.JSONcopy(item.pricePlanDTO)
				let pricePlanDTO = item.pricePlanDTO
				if (this.$fxUtils.isDef(pricePlanDTO)) { // 价格方案
					item.price = this.toFixedNumberSize(pricePlanDTO.price)
					item.tax = this.toFixedNumberSize(pricePlanDTO.taxes)
					item.taxPrice = this.toFixedNumberSize(pricePlanDTO.priceWithTax)
					if (item.getPriceWay === '1') {
						if (item.goodsDTO.barCodeFlag === '0') {
							item.taxPrice = this.toFixedNumberSize(item.taxPrice / pricePlanDTO.unit.value * item.goodsDTO.unitValue)
							item.unitDTO = {
								id: item.goodsDTO.unitsId,
								name: item.goodsDTO.unitName,
								value: item.goodsDTO.unitValue,
								codeFlag: item.goodsDTO.barCodeFlag
							}
						}
					}
				} else {
					item.price = 0
					item.tax = 0
					item.taxPrice = 0
				}
			})
			return data
		},
		setResItem (itemDetails) {
			itemDetails.forEach(item => {
				let index = this.selectedItemArr.findIndex(selectItem => {
					return item.goodsDTO.id === selectItem.goodsDTO.id
				})
				if (~index) {
					if (this.selectedItemArr[index].changeType !== 'del') {
						item.busUnitAmount = this.selectedItemArr[index].busUnitAmount
						item.unitDTO = this.selectedItemArr[index].unitDTO
					} else {
						item.busUnitAmount = '0'
					}
				} else {
					item.busUnitAmount = '0'
				}
			})
			return itemDetails
		},
		setListLoading (itemCount) {
			this.listLoading = false
			this.itemListStart += ITEM_SIZE
			if (itemCount < ITEM_SIZE) {
				this.loadFinished = true
			} else {
				this.loadFinished = false
			}
		},
		changeClass ([classId, preClass]) {
			this.searchKey = ''
			this.onKeyboardHide()
			this.getItemByClass()
		},
		onItemEdit (index) {
			this.rowActive = index
			this.numberKeyboardShow = true
		},
		onKeyboardChange (val) {
			this.itemList[this.rowActive].busUnitAmount = val
		},
		numberStringAmount (rowActive) {
			let busUnitAmount = this.itemList[rowActive].busUnitAmount
			this.itemList[rowActive].busUnitAmount = parseFloat(busUnitAmount)
			// 设置金额
			this.calcMoney('amount', busUnitAmount, this.itemList[rowActive])
		},
		pushSelectedItem (item) {
			let index = this.selectedItemArr.findIndex(selectItem => {
				return item.goodsDTO.id === selectItem.goodsDTO.id
			})
			if (!~index) {
				if (item.busUnitAmount > 0) {
					item.changeType = 'add'
					this.selectedItemArr.push(item)
					this.changeSelectedItem(item, this.selectedItemArr.length - 1)
				}
			} else {
				if (!this.selectedItemArr[index].id && item.busUnitAmount === 0) {
					this.selectedItemArr.splice(index, 1)
					this.$fxToast({
						message: `删除已选品项${item.goodsDTO.name}`,
						position: 'top'
					})
				} else {
					if (this.selectedItemArr[index].id) {
						if (item.busUnitAmount === 0) {
							if (this.selectedItemArr[index].changeType !== 'del') {
								this.selectedItemArr[index].changeType = 'del'
								this.$fxToast({
									message: `删除已选品项${item.goodsDTO.name}`,
									position: 'top'
								})
							}
						} else {
							this.selectedItemArr[index].changeType = 'edit'
						}
					}
					this.changeSelectedItem(item, this.selectedItemArr.length - 1)
				}
			}
		},
		// {{{修改对应选中item
		changeSelectedItem (item, index) {
			// 修改单位
			this.selectedItemArr[index].unitDTO = item.unitDTO
			// 修改数量
			this.selectedItemArr[index].busUnitAmount = item.busUnitAmount
			// 修改金额
			this.calcMoney('amount', item.busUnitAmount, this.selectedItemArr[index])
		},
		// }}}
		onKeyboardPre () {
			if (!this.rowActive) {
				return false
			}
			this.rowActive--
		},
		onKeyboardNext () {
			if (this.rowActive === '' || this.rowActive === this.itemList.length - 1) {
				return false
			}
			this.rowActive++
		},
		onKeyboardHide () {
			this.rowActive = ''
		},
		scrollToActive (index) {
			this.$nextTick(() => {
				this.$refs.addItemList.onSelectLetter(index, 20)
			})
		},
		onSearchFocus () {
			this.rowActive = ''
		},
		// {{{修改单位
		onUnitEdit () {
			if (!this.$fxSysAuth('stockOrderBill.sysstockordermodifyunit')) {
				return false
			}
			let goodsId = this.itemList[this.rowActive].goodsDTO.id
			this.getItemUnit(goodsId).then(res => {
				this.unitActions = res
				this.unitActionShow = true
			})
		},
		getItemUnit (goodsId) {
			return new Promise(resolve => {
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/shopId/users/userId/goods/${goodsId}/units`,
					query: {
						userId: this.loginerId
					}
				}).then(res => {
					resolve(res.units)
				})
			})
		},
		onUnitSelect (unit) {
			this.unitActionShow = false
			let item = this.itemList[this.rowActive]
			let oldUnitRate = item.unitDTO.value // 新增的品项明细获取之前单位换算值方式
			let newUnit = unit // 新增的品项明细获取之后单位换算值方式
			let amount = parseFloat(item.busUnitAmount)
			let index = this.selectedItemArr.findIndex(selectItem => {
				return item.goodsDTO.id === selectItem.goodsDTO.id
			})
			if (amount > 0) {
				amount = parseFloat(this.$fxUtils.toFixedSHW(amount * oldUnitRate / newUnit.value, this.sysPointSize))
				item.busUnitAmount = amount
				if (~index) {
					this.selectedItemArr[index].busUnitAmount = amount
					this.calcMoney('moneyWithTax', this.selectedItemArr[index].moneyWithTax, this.selectedItemArr[index])
				}
			} else {
				item.taxPrice = parseFloat(item.taxPrice) * newUnit.value / oldUnitRate
				// this.calcMoney('taxPrice', item.taxPrice, item)
			}
			// 设置单位
			item.unitDTO = unit
			if (~index) {
				this.selectedItemArr[index].unitDTO = unit
			}
		},
		// }}}
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
				moneyWithTax = money * (1 + tax)
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
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.item-edit {
	height:100%
	width: 100%
	text-align:left
	display: flex
	flex-direction: column
	.header-confirm-btn {
		color:$fxDefaultColor
		width: 40px;
		font-size: 20px;
		line-height: header-height
	}
	.item-edit-content {
		flex:1
		display: flex
		flex-direction: row
		overflow:hidden
	}
	.details-number-keyboard {
		z-index:20
	}
}
</style>

