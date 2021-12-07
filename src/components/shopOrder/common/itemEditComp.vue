<template>
	<div class="item-edit">
		<w-header title="选择品项" :leftOptions="leftOptions" @on-click-back="onCloseClick">
			<van-icon slot="header-right" name="success" class="header-confirm-btn" @click="onItemConfirm" />
		</w-header>
		<div class="item-search clearfix">
			<van-search
				class="fx-item-search"
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
						:showSpec="$fxAuth('shopOrderBill.goodsSize')"
						@on-item-click="onItemEdit"
					></addItemCell>
				</template>
			</addItemList>
		</div>
		<div v-show="numberKeyboardShow" class="details-number-keyboard">
			<itemNumberKeyboard
				:title="keyboardTitleCompted"
				:unit="keyboardUnitCompted"
				:amount="keyboardAmountCompted"
				:pointSize="sysPointSize"
				:intLength="numberLength"
				@change="onKeyboardChange"
				@pre="onKeyboardPre"
				@next="onKeyboardNext"
				@hide="onKeyboardHide"
			></itemNumberKeyboard>
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
		urgentFlag: {
			type: Boolean,
			default: false
		},
		orderPlanId: {
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
			isErrorActive: ''
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
			this.onCheckAmount(this.rowActive).then(() => {
				this.rowActive = ''
				this.$emit('update:visibleFlag', false)
			})
		},
		onItemConfirm () {
			this.onCheckAmount(this.rowActive).then(() => {
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
					expressFlag: this.urgentFlag ? 1 : 0,
					goodsSmallTypeId: this.currentClass || null,
					inId: this.store.id,
					orgId: this.shopId,
					orderPlanId: this.orderPlanId,
					workDate: this.$fxUtils.setDateTime(new Date(this.businessDate)),
					searchText: this.searchKey || null,
					isFlag: true
				}
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/accounts/${this.shopId}/users/${this.loginerId}/shoporderdetails`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		getItemByClass () {
			this.itemListStart = 0
			this.getItem().then(res => {
				this.itemList = this.setResItem(res.shopOrderBillDetails)
				this.setListLoading(res.shopOrderBillDetails.length)
				this.$nextTick(() => {
					this.$refs.addItemList.onSelectLetter(0, 5)
				})
			})
		},
		onLoadMore () {
			this.getItem().then(res => {
				this.itemList.push(...this.setResItem(res.shopOrderBillDetails))
				this.setListLoading(res.shopOrderBillDetails.length)
			})
		},
		setResItem (itemDetails) {
			itemDetails.forEach(item => {
				let index = this.selectedItemArr.findIndex(selectItem => {
					return item.goodsDTO.id === selectItem.goodsDTO.id
				})
				if (~index) {
					if (this.selectedItemArr[index].changeType !== 'del') {
						item.busUnitAmount = this.selectedItemArr[index].busUnitAmount
					} else if (item.must) {
						item.busUnitAmount = this.selectedItemArr[index].busUnitAmount
						this.selectedItemArr[index].changeType = 'edit'
					} else {
						item.busUnitAmount = '0'
					}
					this.selectedItemArr[index].must = item.must
					this.selectedItemArr[index].maxOrder = item.maxOrder
					this.selectedItemArr[index].minOrder = item.minOrder
					this.selectedItemArr[index].rounding = item.rounding
				} else {
					if (item.must) {
						item.changeType = 'add'
						item.busUnitAmount = '0'
						this.selectedItemArr.push(item)
					} else {
						item.busUnitAmount = '0'
					}
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
			this.onCheckAmount(this.rowActive).then(() => {
				this.searchKey = ''
				this.onKeyboardHide()
				this.getItemByClass()
			}).catch(() => {
				this.currentClass = preClass
			})
		},
		onItemEdit (index) {
			this.onCheckAmount(this.rowActive).then(() => {
				this.rowActive = index
				this.numberKeyboardShow = true
			})
		},
		onKeyboardChange (val) {
			this.itemList[this.rowActive].busUnitAmount = val
		},
		numberStringAmount (rowActive) {
			let busUnitAmount = this.itemList[rowActive].busUnitAmount
			this.itemList[rowActive].busUnitAmount = parseFloat(busUnitAmount)
			this.itemList[rowActive].consultMoney = this.toFixedNumberSize(busUnitAmount * this.itemList[rowActive].consultPrice)
			this.itemList[rowActive].consultMoneyWithTax = this.toFixedNumberSize(busUnitAmount * this.itemList[rowActive].consultTaxPrice)
			this.itemList[rowActive].consultTaxMoney = this.toFixedNumberSize(this.itemList[rowActive].consultMoneyWithTax - this.itemList[rowActive].consultMoney)
		},
		toFixedNumberSize (data) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysPointSize))
		},
		pushSelectedItem (item) {
			let index = this.selectedItemArr.findIndex(selectItem => {
				return item.goodsDTO.id === selectItem.goodsDTO.id
			})
			if (!~index) {
				if (item.busUnitAmount > 0 || item.must) {
					item.changeType = 'add'
					this.selectedItemArr.push(item)
				}
			} else {
				if (item.must) {
					if (this.selectedItemArr[index].id) {
						this.selectedItemArr[index].changeType = 'edit'
					}
					this.selectedItemArr[index].busUnitAmount = item.busUnitAmount
					this.selectedItemArr[index].consultMoney = item.consultMoney
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
						this.selectedItemArr[index].busUnitAmount = item.busUnitAmount
						this.selectedItemArr[index].consultMoney = item.consultMoney
					}
				}
			}
		},
		onKeyboardPre () {
			if (!this.rowActive) {
				return false
			}
			this.onCheckAmount(this.rowActive).then(() => {
				this.rowActive--
			})
		},
		onKeyboardNext () {
			if (this.rowActive === '' || this.rowActive === this.itemList.length - 1) {
				return false
			}
			this.onCheckAmount(this.rowActive).then(() => {
				this.rowActive++
			})
		},
		onKeyboardHide () {
			this.onCheckAmount(this.rowActive).then(() => {
				this.rowActive = ''
			})
		},
		onCheckAmount (rowIndex) {
			return new Promise((resolve, reject) => {
				if (rowIndex === '') {
					resolve()
				} else {
					let currentAmount = parseFloat(this.itemList[rowIndex].busUnitAmount)
					let { must, maxOrder, minOrder, rounding } = this.itemList[rowIndex]
					let maxMessage = maxOrder ? `订货数量不能大于最大数量${maxOrder}\n` : ''
					let minMessage = minOrder ? `订货数量不能小于最小数量${minOrder}\n` : ''
					let roundMessage = rounding ? `订货数量必须是${rounding}的倍数` : ''
					let message = maxMessage + minMessage + roundMessage
					this.isErrorActive = ''
					if (currentAmount === 0 && !must) {
						resolve()
					} else if (
						(maxOrder && currentAmount > maxOrder) ||
						(minOrder && currentAmount < minOrder) ||
						(this.checkRoundingError(rounding, currentAmount))
					) {
						this.$fxNotify.fail(message)
						this.isErrorActive = rowIndex
						this.scrollToActive(rowIndex)
						reject(rowIndex)
					} else {
						resolve()
					}
				}
			})
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
			this.onCheckAmount(this.rowActive).then(() => {
				this.rowActive = ''
			}).catch(() => {
				document.activeElement.blur()
			})
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
	.fx-item-search {
		>>>.van-cell {
			$fx-dynamic-font-size(14px)
		}
	}
}
</style>

