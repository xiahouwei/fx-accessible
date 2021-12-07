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
			<!--<input type="text" v-model="redCode">
			<button @click="getItemByRedCode">aa</button>-->
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
		house: {
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
		customerId: {
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
			unitActions: [],
			scanActionShow: false,
			scanActions: [
				{ name: '累加数量' },
				{ name: '覆盖数量' }
			]
			// redCode: ''
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize',
			sysMoneyPointSize: 'sysMoneyPointSize',
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
	watch: {
		visibleFlag: {
			handler (val) {
				if (val) {
					this.selectedItemArr = JSON.parse(JSON.stringify(this.parentStoreItem))
					this.refresh()
					this.$fxEventBus.$on('redCode', this.getItemByRedCode)
				} else {
					this.$fxEventBus.$off('redCode', this.getItemByRedCode)
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
			// 不允许同一单据同一品项多次录入
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
				this.$emit('on-confirm', [this.selectedItemArr, this.house])
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
					shopId: this.shopId,
					houseId: this.house.id,
					workDate: this.businessDate,
					searchText: this.searchKey || ''
				}
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/accounts/${this.shopId}/users/${this.loginerId}/salesoutbilldetails/${this.customerId}`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		getItemByClass () {
			this.itemListStart = 0
			this.getItem().then(res => {
				this.itemList = this.setResItem(res.billAndDetails)
				this.setListLoading(res.billAndDetails.length)
				this.$nextTick(() => {
					this.$refs.addItemList && this.$refs.addItemList.onSelectLetter(0, 5)
				})
			})
		},
		onLoadMore () {
			this.getItem().then(res => {
				this.itemList.push(...this.setResItem(res.billAndDetails))
				this.setListLoading(res.billAndDetails.length)
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
			this.itemList[this.rowActive].busUnitOutAmount = val
		},
		numberStringAmount (rowActive) {
			let busUnitOutAmount = this.itemList[rowActive].busUnitOutAmount
			this.itemList[rowActive].busUnitOutAmount = parseFloat(busUnitOutAmount)
		},
		pushSelectedItem (item) {
			let index = this.selectedItemArr.findIndex(selectItem => {
				return item.goodsDTO.id === selectItem.goodsDTO.id && selectItem.changeType !== 'del'
			})
			if (!~index) {
				if (item.busUnitOutAmount > 0) {
					item.changeType = 'add'
					this.selectedItemArr.push(item)
					this.changeSelectedItem(item, this.selectedItemArr.length - 1)
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
							this.selectedItemArr[index].changeType = 'edit'
						}
					}
					this.changeSelectedItem(item, index)
				}
			}
		},
		// {{{修改对应选中item
		changeSelectedItem (item, index) {
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
				amount = amount * oldUnitRate / newUnit.value
				item.busUnitOutAmount = this.toFixedNumberSize(amount, this.sysPointSize)
				this.calcMoney('moneyWithTax', item.sendMoneyWithTax, item)
			} else {
				item.taxPrice = parseFloat(item.taxPrice) * newUnit.value / oldUnitRate
				this.calcMoney('taxPrice', item.taxPrice, item)
			}
			// 订货数量
			let outOrderAmount = parseFloat(item.outOrderAmount)
			outOrderAmount = outOrderAmount * oldUnitRate / newUnit.value
			item.outOrderAmount = this.toFixedNumberSize(outOrderAmount)
			// 设置单位
			item.unitDTO = unit
		},
		// }}}
		// {{{计算税额并渲染
		calcMoney (target, amountOrMoney, itemData) {
			let { taxPrice, busUnitOutAmount, price, sendTaxes } = itemData
			let money = 0
			let moneyWithTax = 0
			let itemPrice = 0
			let itemTaxPrice = 0
			let amountOrMoneyFixedNum = this.toFixedNumberSize(amountOrMoney)
			if (itemData.giftFlag || (target === 'money' && amountOrMoneyFixedNum === 0)) {
				// 赠送、数量为0
				itemData.sendMoney = 0
				itemData.sendMoneyWithTax = 0
				itemData.sendTaxMoney = 0
				return true
			}
			if (target === 'money') {
				money = amountOrMoneyFixedNum
				itemPrice = this.toFixedNumberSize(money / busUnitOutAmount)
				moneyWithTax = money * (1 + sendTaxes)
				itemTaxPrice = this.toFixedNumberSize(moneyWithTax / busUnitOutAmount)
			} else if (target === 'amount') {
				itemData.busUnitOutAmount = this.toFixedNumberSize(amountOrMoney, this.sysPointSize)
				itemPrice = price
				itemTaxPrice = taxPrice
				money = this.toFixedNumberSize(price * amountOrMoneyFixedNum)
				moneyWithTax = this.toFixedNumberSize(taxPrice * amountOrMoneyFixedNum)
			} else if (target === 'moneyWithTax') {
				moneyWithTax = amountOrMoneyFixedNum
				itemTaxPrice = this.toFixedNumberSize(moneyWithTax / busUnitOutAmount)
				money = this.toFixedNumberSize(moneyWithTax / (1 + sendTaxes))
				itemPrice = this.toFixedNumberSize(money / busUnitOutAmount)
			} else if (target === 'taxPrice') {
				itemTaxPrice = amountOrMoneyFixedNum
				moneyWithTax = this.toFixedNumberSize(busUnitOutAmount * itemTaxPrice)
				itemPrice = this.toFixedNumberSize(itemTaxPrice / (1 + sendTaxes))
				money = this.toFixedNumberSize(itemPrice * busUnitOutAmount)
			} else if (target === 'price') {
				itemPrice = amountOrMoneyFixedNum
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
		toFixedNumberSize (data, pointSize = this.sysMoneyPointSize) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, pointSize))
		},
		// {{{扫码
		createBreakBill (data) {
			return new Promise(resolve => {
				let params = {
					billEmp: '',
					billMemo: '',
					billState: 0,
					businessDate: new Date().getTime(),
					businessTypeDTO: {},
					shopDTO: {
						id: this.shopId
					},
					details: [],
					updateIndicator: 'Append',
					autoType: 1,
					reckonBreak: '0',
					detailAdd: [data],
					accountDTO: {
						id: this.loginerId
					}
				}
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/breakBills`,
					data: params,
					query: {
						m: 'addAndCheckBill'
					}
				}).then(res => {
					resolve()
					this.$fxToast.success('报损成功！')
				})
			})
		},
		// }}}
		getItemByRedCode (redCode) {
			// redCode = '2020831165303000001000002008311626247571522'
			// redCode = this.redCode
			if (!this.visibleFlag) {
				return false
			}
			if (redCode.length <= 24) {
				this.onRedCodeHandler(redCode)
			} else { // 扫描二维码
				this.getItemByTwoCode(redCode, false).then(res => {
					if (res.errorCode === '100' || res.errorCode === '101') {
						this.$dialog.confirm({
							title: '提示',
							message: res.message
						}).then(() => {
							if (res.errorCode === '100') {
								this.createBreakBill(res.storeBillDetailDTO)
								return true
							}
							this.getItemByTwoCode(redCode, true).then(res => {
								this.getScanGoodData(res.storeBillDetailDTO)
							})
						})
					} else {
						this.getScanGoodData(res.storeBillDetailDTO)
					}
				})
			}
		},
		onRedCodeHandler (redCode) {
			// redCode = '0115000200001006000'
			this.rowActive = ''
			this.getItemByRedCodeHandler(redCode).then(res => {
				let item = this.itemUpdate(res.billAndDetails[0])
				let amount = item.goodsDTO.countValue
				this.calcMoney('amount', amount, item)
				this.pushSelectedItem(item)
				this.itemList = [item]
				this.setListLoading(1)
				this.$nextTick(() => {
					this.$refs.addItemList.onSelectLetter(0, 5)
				})
			})
		},
		itemUpdate (item) {
			const indexs = this.$fxUtils.appointedMap(this.selectedItemArr, (storeItem, index) => {
				if (storeItem.goodsDTO.id === item.goodsDTO.id && storeItem.changeType !== 'del') {
					return index
				}
			})
			if (indexs.length === 1 && this.selectedItemArr[indexs[0]].id) {
				const parentStoreItem = this.selectedItemArr[indexs[0]]
				const unitDTO = parentStoreItem.unitDTO
				const currentUnitDTO = item.unitDTO
				const ratio = currentUnitDTO.value / unitDTO.value
				const countValue = item.goodsDTO.countValue * ratio
				parentStoreItem.goodsDTO.countValue = countValue
				item = this.$fxUtils.JSONcopy(parentStoreItem)
			}
			return item
		},
		getItemByRedCodeHandler (redCode) {
			return new Promise(resolve => {
				let params = {
					goodsTypeId: this.currentClass || null,
					shopId: this.shopId,
					houseId: this.house.id,
					workDate: this.businessDate
				}
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/accounts/${this.shopId}/users/${this.loginerId}/salesoutbilldetails/${this.customerId}/barCode/${redCode}`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		// }}}
		getItemByTwoCode (barcode, nextFlag = false) {
			return new Promise(resolve => {
				let params = {
					qrCodeContent: barcode,
					houseId: this.house.id,
					customerId: this.customerId,
					billType: 56,
					nextFlag: nextFlag
				}
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/accounts/${this.shopId}/users/${this.loginerId}/getscancodedata`,
					query: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		getScanGoodData (goods) {
			// 标记掌中宝扫码生成
			goods.autoType = 3
			goods.costPrice = 0
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
						this.itemList = [scanGood]
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
		// }}}
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

