<template>
	<w-app-page class="item-edit">
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
						:itemAmoutName="'busUnitInAmount'"
						@on-item-click="onItemEdit"
					></addItemCell>
				</template>
			</addItemList>
		</div>
		<fx-item-number-keyboard
			v-show="numberKeyboardShow"
			amountKey="busUnitInAmount"
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
	</w-app-page>
</template>

<script>
import { mapState } from 'vuex'
import addItemClassList from '@/components/common/AddItemClassList'
import addItemList from '@/components/common/AddItemList'
import addItemCell from '@/components/common/AddItemCell'
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
		rdcId: {
			type: String,
			default: ''
		},
		supplierId: {
			type: String,
			default: ''
		},
		inHouse: {
			type: Object,
			default: () => {
				return {}
			}
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
			isErrorActive: ''
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
					if (this.$fxAuth('stockInBill4cld.inputMultipleDetails')) {
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
					if (!item.inHouseDTO) {
						item.inHouseDTO = this.inHouse
					}
				})
				this.$emit('on-confirm', [this.selectedItemArr, this.inHouse])
				this.$emit('update:visibleFlag', false)
			})
		},
		search () {
			this.getItemByClass()
		},
		getItemClass () {
			return this.$fxApi('common.getItemClass', this.supplierId)
		},
		getItem () {
			const params = {
				start: this.itemListStart,
				size: ITEM_SIZE,
				paged: true,
				goodsTypeId: this.currentClass || null,
				supplierId: this.supplierId,
				rdcId: this.rdcId,
				inHouseId: this.inHouse.id,
				workDate: this.businessDate,
				searchText: this.searchKey || ''
			}
			return this.$fxApi('stockInBill4cld.getItemByClass', this.supplierId)({ data: params })
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
				// 非税单价
				item.price = item.busPrice
				// 含税单价
				item.taxPrice = item.taxesPrice
				// 非税金额
				item.inMoney = 0
				// 含税金额
				item.inMoneyWithTax = 0
				// 税率
				item.tax = item.taxes
				// 税额
				item.taxInMoney = 0
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
					item.busUnitInAmount = '0'
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
			this.itemList[this.rowActive].busUnitInAmount = val
			this.computedAssistAmount(this.itemList[this.rowActive])
		},
		numberStringAmount (rowActive) {
			let busUnitInAmount = this.itemList[rowActive].busUnitInAmount
			this.itemList[rowActive].busUnitInAmount = parseFloat(busUnitInAmount)
		},
		pushSelectedItem (item) {
			let index = this.selectedItemArr.findIndex(selectItem => {
				return item.goodsDTO.id === selectItem.goodsDTO.id
			})
			if (!~index) {
				if (item.busUnitInAmount > 0) {
					item.uuid = this.$fxUtils.createUUID()
					this.$fxCommon.addEditItem(this.selectedItemArr, item)
					this.computedItemByAmount(this.selectedItemArr, this.selectedItemArr.length - 1)
				}
			} else {
				if (!item.id && item.busUnitInAmount === 0) {
					this.$fxCommon.delEditItem(this.selectedItemArr, item, index)
				} else {
					if (item.id) {
						if (item.busUnitInAmount === 0) {
							if (this.$fxAuth('stockInBill4cld.delDetail')) {
								this.$fxCommon.delEditItem(this.selectedItemArr, item, index)
							} else {
								item.busUnitInAmount = 1
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
			this.$fxCalculation('stockInBill4cld').changeAmount(this.selectedItemArr[index])
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
			this.$fxCalculation('stockInBill4cld').changeUnit(this.itemList[this.rowActive], unit)
		},
		computedAssistAmount (item) {
			if (item.assistUnitFlag) {
				item.inAssistAmount = item.busUnitInAmount
			}
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

