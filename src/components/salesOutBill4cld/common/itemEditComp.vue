<template>
	<w-app-page class="item-edit">
		<w-header title="选择品项" :leftOptions="leftOptions" @on-click-back="onCloseClick">
			<van-icon slot="header-right" name="success" class="header-confirm-btn" @click="onItemConfirm" />
			<!-- <van-icon slot="header-right" name="success" class="header-confirm-btn" @click="getItemByRedCode" /> -->
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
						@on-item-click="onItemEdit"
					></addItemCell>
				</template>
			</addItemList>
		</div>
		<fx-item-number-keyboard
			v-show="numberKeyboardShow"
			amountKey="busUnitOutAmount"
			:data="currentSelectItem"
			:unitEdit="true"
			:pointSize="sysPointSize"
			:intLength="numberLength"
			@change="onKeyboardChange"
			@pre="onKeyboardPre"
			@next="onKeyboardNext"
			@hide="onKeyboardHide"
			@on-unit-select="onUnitSelect"
		></fx-item-number-keyboard>
		<w-action-sheet
			v-fx-history-back="scanActionShow"
			ref="scanActionSheet"
			v-model="scanActionShow"
			:actions="scanActions"
		></w-action-sheet>
	</w-app-page>
</template>

<script>
import { mapState } from 'vuex'
import addItemClassList from '@/components/common/AddItemClassList.vue'
import addItemList from '@/components/common/AddItemList.vue'
import addItemCell from '@/components/common/AddItemCell.vue'
const ITEM_SIZE = 10
export default {
	name: 'itemEditComp',
	components: {
		addItemClassList,
		addItemList,
		addItemCell
	},
	props: {
		visibleFlag: Boolean,
		outHouse: {
			type: Object,
			default: () => {
				return {}
			}
		},
		inShopId: {
			type: String,
			default: ''
		},
		rdcId: {
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
			query: this.$route.query,
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
			numberLength: 'numberLength'
		}),
		currentSelectItem () {
			return this.rowActive === '' ? {} : this.itemList[this.rowActive]
		}
	},
	watch: {
		visibleFlag: {
			handler (val) {
				if (val) {
					if (this.$fxAuth('salesOutBill4cld.inputMultipleDetails')) {
						this.selectedItemArr = []
					} else {
						this.selectedItemArr = JSON.parse(JSON.stringify(this.parentStoreItem))
					}
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
	created () {
		this.$fxEventBus.initEvent(this, 'redCode', this.getItemByRedCode)
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
					if (!item.outHouseDTO) {
						item.outHouseDTO = this.outHouse
					}
				})
				this.$emit('on-confirm', [this.selectedItemArr, this.outHouse])
				this.$emit('update:visibleFlag', false)
			})
		},
		search () {
			this.getItemByClass()
		},
		getItemClass () {
			return this.$fxApi('common.getItemClass', this.inShopId)
		},
		getItem () {
			const params = {
				start: this.itemListStart,
				size: ITEM_SIZE,
				paged: true,
				goodsTypeId: this.currentClass || null,
				customerId: this.inShopId,
				rdcId: this.rdcId,
				outHouseId: this.outHouse.id,
				workDate: this.businessDate,
				searchText: this.searchKey || ''
			}
			return this.$fxApi('salesOutBill4cld.getItemByClass', this.inShopId)({ data: params })
		},
		getItemByClass () {
			this.itemListStart = 0
			this.getItem().then(res => {
				let billAndDetails = this.setDataMoneyAndPrice(res)
				this.itemList = this.setResItem(billAndDetails)
				this.setListLoading(billAndDetails.length)
				this.$nextTick(() => {
					this.$refs.addItemList && this.$refs.addItemList.onSelectLetter(0, 5)
				})
			})
		},
		onLoadMore () {
			this.getItem().then(res => {
				let billAndDetails = this.setDataMoneyAndPrice(res)
				this.itemList.push(...this.setResItem(billAndDetails))
				this.setListLoading(billAndDetails.length)
			})
		},
		setDataMoneyAndPrice (data) {
			data.forEach(item => {
				item.goodsDTO = {
					id: item.goodsId,
					imageUrls: item.goodsImgUrl ? [item.goodsImgUrl] : [],
					name: item.goodsName,
					spec: item.goodsSpec,
					code: item.goodsCode,
					pinYin: item.goodsSign
				}
				item.unitDTO = {
					id: item.unitId,
					name: item.unitName,
					value: item.unitValue
				}
				// 赠品
				item.giftFlag = false
				// 非税单价
				item.price = item.salePrice
				// 含税单价
				item.taxPrice = item.taxesPrice
				// 非税金额
				item.outMoney = 0
				// 含税金额
				item.outMoneyWithTax = 0
				// 税率
				item.tax = item.taxes
				// 税额
				item.taxOutMoney = 0
				// 成本价配送
				item.costDispach = false
			})
			return data
		},
		setResItem (itemDetails) {
			itemDetails.forEach((item, index) => {
				let _index = this.selectedItemArr.findIndex(selectItem => {
					return item.goodsDTO.id === selectItem.goodsDTO.id && selectItem.changeType !== 'del'
				})
				if (~_index) {
					itemDetails[index] = this.$fxUtils.JSONcopy(this.selectedItemArr[_index])
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
			this.computedAssistAmount(this.itemList[this.rowActive])
		},
		numberStringAmount (rowActive) {
			let busUnitOutAmount = this.itemList[rowActive].busUnitOutAmount
			this.itemList[rowActive].busUnitOutAmount = parseFloat(busUnitOutAmount)
		},
		pushSelectedItem (item) {
			let index = this.selectedItemArr.findIndex(selectItem => {
				return item.goodsDTO.id === selectItem.goodsDTO.id
			})
			if (!~index) {
				if (item.busUnitOutAmount > 0) {
					item.uuid = this.$fxUtils.createUUID()
					this.$fxCommon.addEditItem(this.selectedItemArr, item)
					this.computedItemByAmount(this.selectedItemArr, this.selectedItemArr.length - 1)
				}
			} else {
				if (!item.id && item.busUnitOutAmount === 0) {
					this.$fxCommon.delEditItem(this.selectedItemArr, item, index)
				} else {
					if (item.id) {
						if (item.busUnitOutAmount === 0) {
							if (this.$fxAuth('salesOutBill4cld.delDetail')) {
								this.$fxCommon.delEditItem(this.selectedItemArr, item, index)
							} else {
								item.busUnitOutAmount = 1
								this.$fxCommon.editItem(item)
								this.$fxToast({
									message: `当前没有删除品项权限`,
									position: 'top'
								})
							}
						} else {
							this.$fxCommon.editItem(item)
						}
					}
					this.$fxCommon.replaceItem(this.selectedItemArr, item, index)
					this.computedItemByAmount(item, index)
				}
			}
		},
		computedItemByAmount (item, index) {
			this.$fxCalculation('salesOutBill4cld').changeAmount(this.selectedItemArr[index])
		},
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
		onUnitSelect (unit, item) {
			this.$fxCalculation('salesOutBill4cld').changeUnit(this.itemList[this.rowActive], unit)
		},
		computedAssistAmount (item) {
			if (item.assistUnitFlag) {
				item.outAssistAmount = item.busUnitOutAmount
			}
		},
		getItemByRedCode (redCode) {
			// redCode = '0000000123321'
			if (!this.visibleFlag) {
				return false
			}
			this.getItemByCode(redCode).then(goods => {
				if (goods.length === 0) {
					this.$fxToast.top('当前仓库无此品项!')
					return false
				}
				this.getScanGoodData(goods)
			})
		},
		getItemByCode (barcode) {
			const params = {
				billId: this.query.orderId || '',
				shopId: this.inShopId,
				rdcId: this.rdcId,
				outHouseId: this.outHouse.id,
				workDate: this.businessDate,
				barcode
			}
			return this.$fxApi('salesOutBill4cld.scanCode')({ data: params })
		},
		getScanGoodData (goods) {
			let [good] = this.setDataMoneyAndPrice(goods)
			good.busUnitOutAmount = good.adviseAmount
			this.computedAssistAmount(good)
			this.setScanGood(good)
		},
		setScanGood (good) {
			let orderItemArr = []
			if (this.$fxAuth('salesOutBill4cld.inputMultipleDetails')) {
				orderItemArr = this.selectedItemArr.concat(this.parentStoreItem)
			} else {
				orderItemArr = this.selectedItemArr
			}
			let _index = orderItemArr.findIndex(selectItem => {
				return good.goodsDTO.id === selectItem.goodsDTO.id
			})
			// 条件一: 当前已选品项 不存在 扫码品项
			if (!~_index) {
				this.itemList = [good]
				this.pushSelectedItem(good)
				this.$fxToast.success('扫码添加品项成功！')
			} else {
				let _unitIndex = orderItemArr.findIndex(selectItem => {
					return good.goodsDTO.id === selectItem.goodsDTO.id && good.unitDTO.id === selectItem.unitDTO.id
				})
				// 条件二: 当前已选品项 存在 扫码品项 但是 单位不同
				if (!~_unitIndex) {
					this.$fxToast.fail('不能重复添加品项！')
					return false
				} else {
					const selectGood = orderItemArr[_index]
					let scanGood = this.copyScanGood(good, selectGood)
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
						this.pushSelectedItem(scanGood)
						this.itemList = [scanGood]
					})
				}
			}
		},
		copyScanGood (scanItem, selectGood) {
			const { busUnitOutAmount, batchCode } = scanItem
			let _good = this.$fxUtils.JSONcopy(selectGood)
			_good.busUnitOutAmount = busUnitOutAmount
			_good.batchCode = batchCode
			this.computedAssistAmount(_good)
			this.$fxCalculation('salesOutBill4cld').changeAmount(_good)
			return _good
		},
		computedScanItemAmount (scanItem, selectGood) {
			const _amount = this.$fxUtils.toFixedParseNumber(scanItem.busUnitOutAmount + selectGood.busUnitOutAmount, this.sysPointSize)
			scanItem.busUnitOutAmount = this.$fxCommon.checkAmountRange(_amount)
			this.$fxCalculation('salesOutBill4cld').changeAmount(scanItem)
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.item-edit {
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
}
</style>

