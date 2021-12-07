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
						:itemAmoutName="'busUnitOutAmount'"
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
				:unitEdit="true"
				:amount="keyboardAmountCompted"
				:pointSize="sysPointSize"
				:intLength="numberLength"
				@change="onKeyboardChange"
				@on-unit-unitEdit="onUnitEdit"
				@pre="onKeyboardPre"
				@next="onKeyboardNext"
				@hide="onKeyboardHide"
			></itemNumberKeyboard>
		</div>
		<van-actionsheet
			v-model="unitActionShow"
			:actions="unitActions"
			cancel-text="取消"
			@select="onUnitSelect"
		/>
		<w-action-sheet
			v-fx-history-back="scanActionShow"
			ref="scanActionSheet"
			v-model="scanActionShow"
			:actions="scanActions"
		></w-action-sheet>
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
			unitActions: [],
			scanActionShow: false,
			scanActions: [
				{ name: '累加数量' },
				{ name: '覆盖数量' }
			]
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
				return row.busUnitOutAmount
			}
		}
	},
	created () {
		this.$fxEventBus.initEvent(this, 'redCode', this.getItemByRedCode)
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
					item.outHouseDTO = this.store
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
					goodsSmallTypeId: this.currentClass || null,
					inId: this.store.id,
					orgId: this.shopId,
					searchText: this.searchKey || null
				}
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/accounts/${this.shopId}/users/${this.loginerId}/stockApplyDetails`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		getItemByClass () {
			this.itemListStart = 0
			this.getItem().then(res => {
				this.itemList = this.setResItem(res.stockApplyBillDetails)
				this.setListLoading(res.stockApplyBillDetails.length)
				this.$nextTick(() => {
					this.$refs.addItemList.onSelectLetter(0, 5)
				})
			})
		},
		onLoadMore () {
			this.getItem().then(res => {
				this.itemList.push(...this.setResItem(res.stockApplyBillDetails))
				this.setListLoading(res.stockApplyBillDetails.length)
			})
		},
		setResItem (itemDetails) {
			itemDetails.forEach(item => {
				let index = this.selectedItemArr.findIndex(selectItem => {
					return item.goodsDTO.id === selectItem.goodsDTO.id
				})
				if (~index) {
					if (this.selectedItemArr[index].changeType !== 'del') {
						item.busUnitOutAmount = this.selectedItemArr[index].busUnitOutAmount
						item.unitDTO = this.selectedItemArr[index].unitDTO
					} else {
						item.busUnitOutAmount = '0'
					}
				} else {
					item.busUnitOutAmount = '0'
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
		changeClass () {
			this.searchKey = ''
			this.onKeyboardHide()
			this.getItemByClass()
		},
		onItemEdit (index) {
			this.rowActive = index
			this.numberKeyboardShow = true
		},
		onKeyboardChange (val) {
			this.itemList[this.rowActive].busUnitOutAmount = val
		},
		numberStringAmount (rowActive) {
			let busUnitOutAmount = this.itemList[rowActive].busUnitOutAmount
			this.itemList[rowActive].busUnitOutAmount = parseFloat(busUnitOutAmount)
		},
		// {{{计算税额并渲染
		calcMoney (target, amountOrMoney, itemData) {
			let { busUnitOutAmount, price, tax } = itemData
			let money = 0
			let moneyWithTax = 0
			let itemPrice = 0
			let itemTaxPrice = 0
			let amountOrMoneyFixedNum = this.toFixedNumberSize(amountOrMoney)
			if (itemData.giftFlag || (target === 'money' && amountOrMoneyFixedNum === 0)) {
				// 赠送、数量为0
				itemData.outMoney = 0
				return true
			}
			if (target === 'money') {
				money = amountOrMoneyFixedNum
				itemPrice = this.toFixedNumberSize(money / busUnitOutAmount)
				moneyWithTax = money * (1 + tax)
				itemTaxPrice = this.toFixedNumberSize(moneyWithTax / busUnitOutAmount)
			} else if (target === 'amount') {
				if (amountOrMoney !== '') {
					itemData.busUnitOutAmount = amountOrMoneyFixedNum
				}
				itemPrice = price
				// itemTaxPrice = taxPrice
				money = this.toFixedNumberSize(price * amountOrMoneyFixedNum)
				moneyWithTax = this.toFixedNumberSize(0 * amountOrMoneyFixedNum)
			} else if (target === 'moneyWithTax') {
				moneyWithTax = amountOrMoneyFixedNum
				itemTaxPrice = this.toFixedNumberSize(moneyWithTax / busUnitOutAmount)
				money = this.toFixedNumberSize(moneyWithTax / (1 + tax))
				itemPrice = this.toFixedNumberSize(money / busUnitOutAmount)
			} else if (target === 'taxPrice') {
				itemTaxPrice = amountOrMoneyFixedNum
				moneyWithTax = this.toFixedNumberSize(busUnitOutAmount * itemTaxPrice)
				itemPrice = this.toFixedNumberSize(itemTaxPrice / (1 + tax))
				money = this.toFixedNumberSize(itemPrice * busUnitOutAmount)
			} else if (target === 'price') {
				itemPrice = amountOrMoneyFixedNum
				money = this.toFixedNumberSize(itemPrice * busUnitOutAmount)
				itemTaxPrice = this.toFixedNumberSize(itemPrice * (1 + tax))
				moneyWithTax = this.toFixedNumberSize(busUnitOutAmount * itemTaxPrice)
			}
			// itemData.sendMoneyWithTax = moneyWithTax
			itemData.outMoney = money
			itemData.price = itemPrice
		},
		// }}}
		toFixedNumberSize (data) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysPointSize))
		},
		pushSelectedItem (item) {
			let index = this.selectedItemArr.findIndex(selectItem => {
				return item.goodsDTO.id === selectItem.goodsDTO.id && selectItem.changeType !== 'del'
			})
			if (!~index) {
				if (item.busUnitOutAmount > 0) {
					item.changeType = 'add'
					this.selectedItemArr.push(item)
					this.computedItemByAmount(item, this.selectedItemArr.length - 1)
				}
			} else {
				if (!this.selectedItemArr[index].id && item.busUnitOutAmount === 0) {
					this.selectedItemArr.splice(index, 1)
					this.$fxToast({
						message: `删除已选品项${item.goodsDTO.name}`,
						position: 'top'
					})
				} else {
					if (this.selectedItemArr[index].id) {
						if (item.busUnitOutAmount === 0) {
							if (this.selectedItemArr[index].changeType !== 'del') {
								this.selectedItemArr[index].changeType = 'del'
								this.$fxToast({
									message: `删除已选品项${item.goodsDTO.name}`,
									position: 'top'
								})
							}
						} else {
							this.$fxCommon.editItem(this.selectedItemArr[index])
						}
					}
					this.computedItemByAmount(item, index)
				}
			}
		},
		// {{{修改对应选中item
		computedItemByAmount (item, index) {
			// 修改单位
			this.selectedItemArr[index].unitDTO = item.unitDTO
			// 修改数量
			this.selectedItemArr[index].busUnitOutAmount = item.busUnitOutAmount
			// 修改金额
			this.calcMoney('amount', item.busUnitOutAmount, this.selectedItemArr[index])
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
		checkRoundingError (rounding, currentAmount) {
			return rounding && currentAmount % rounding !== 0
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
			let amount = parseFloat(item.busUnitOutAmount)
			if (amount > 0) {
				// 只有手动生成单据可以修改单位，手动生成单据，未审核金额为0，无需换算，只需要换算库存数量，单据数量不变
				amount = amount * oldUnitRate / newUnit.value
				item.busUnitOutAmount = this.toFixedNumberSize(amount)
			}
			// 数量为 0 时不反算单价
			if (item.busUnitOutAmount === 0) {
				item.price = parseFloat(this.$fxUtils.toFixedSHW(item.price * newUnit.value / oldUnitRate, this.sysPointSize))
				item.taxPrice = parseFloat(this.$fxUtils.toFixedSHW(item.taxPrice * newUnit.value / oldUnitRate, this.sysPointSize))
			} else {
				item.price = parseFloat(this.$fxUtils.toFixedSHW(item.outMoney / item.busUnitOutAmount, this.sysPointSize))
				item.taxPrice = parseFloat(this.$fxUtils.toFixedSHW(item.outMoneyWithTax / item.busUnitOutAmount, this.sysPointSize))
			}
			// 设置单位
			item.unitDTO = unit
		},
		// }}}
		getItemByRedCode (redCode) {
			// redCode = '2020904143209000000100002009071428253615683'
			if (!this.visibleFlag) {
				return false
			}
			this.getItemByCode(redCode).then(goods => {
				if (this.$fxUtils.isEmptyObjSHW(goods)) {
					this.$fxToast.top('当前仓库无此品项!')
					return false
				}
				this.getScanGoodData(goods)
			})
		},
		getItemByCode (barcode) {
			return new Promise(resolve => {
				let params = {
					qrCodeContent: barcode,
					houseId: this.store.id
				}
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/accounts/${this.shopId}/users/${this.loginerId}/getscancodedata`,
					query: params
				}).then(res => {
					resolve(res.storeBillDetailDTO)
				})
			})
		},
		getScanGoodData (goods) {
			// 标记掌中宝扫码生成
			goods.autoType = 3
			this.setScanGood(goods)
		},
		setScanGood (scanGood) {
			let orderItemArr = []
			orderItemArr = this.selectedItemArr
			let _index = orderItemArr.findIndex(selectItem => {
				return scanGood.goodsDTO.id === selectItem.goodsDTO.id && selectItem.changeType !== 'del'
			})
			// 条件一: 当前已选品项 不存在 扫码品项
			if (!~_index) {
				this.itemList = [scanGood]
				this.pushSelectedItem(scanGood)
				this.$fxToast.success('扫码添加品项成功！')
			} else {
				let _unitIndex = orderItemArr.findIndex(selectItem => {
					return scanGood.goodsDTO.id === selectItem.goodsDTO.id && scanGood.unitDTO.id === selectItem.unitDTO.id && selectItem.changeType !== 'del'
				})
				// 条件二: 当前已选品项 存在 扫码品项 但是 单位不同
				if (!~_unitIndex) {
					this.$fxToast.fail('不能重复添加品项！')
					return false
				} else {
					const selectGood = orderItemArr[_index]
					// 条件三: 当前已选品项 存在 扫码品项 且 单位 一致 但是 批次号 不同
					if (selectGood.batchCode !== scanGood.batchCode && this.$fxUtils.isDef(selectGood.batchCode)) {
						this.$fxToast.fail('不能重复添加品项！')
						return false
					}
					// 条件四: 当前已选品项 存在 扫码品项 单位 一致 批次号 一致 或 扫码品项没有批次号
					this.$refs.scanActionSheet.doSelect().then(item => {
						if (item.name === '累加数量') {
							this.computedScanItemAmount(scanGood, selectGood)
						}
						this.refreshSelectItem(scanGood, selectGood)
						this.itemList = [selectGood]
					})
				}
			}
		},
		computedScanItemAmount (scanItem, selectGood) {
			const _amount = this.toFixedNumberSize(scanItem.busUnitOutAmount + selectGood.busUnitOutAmount)
			scanItem.busUnitOutAmount = this.$fxCommon.checkAmountRange(_amount)
		},
		refreshSelectItem (scanGood, selectGood) {
			selectGood.busUnitOutAmount = scanGood.busUnitOutAmount
			selectGood.batchCode = scanGood.batchCode
			this.editItem(selectGood)
			// 修改金额
			this.calcMoney('amount', selectGood.busUnitOutAmount, selectGood)
		},
		editItem (item) {
			if (item.id) this.$set(item, 'changeType', 'edit')
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

