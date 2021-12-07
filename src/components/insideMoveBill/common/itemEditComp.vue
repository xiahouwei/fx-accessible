<template>
	<div class="item-edit">
		<w-header title="选择品项" :leftOptions="leftOptions" @on-click-back="onCloseClick">
			<van-icon slot="header-right" name="success" class="header-confirm-btn" @click="onItemConfirm" />
		</w-header>
		<div class="item-search clearfix">
			<van-search v-model="searchKey" placeholder="请输入搜索关键词" shape="round" @search="search"/>
		</div>
		<div class="item-edit-content">
			<addItemClassList
				v-model="currentClass"
				:itemClassList="itemClassList"
				@on-select-class="selectClass"
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
		<div v-show="numberKeyboardShow" class="details-number-keyboard">
			<itemNumberKeyboard
				:title="keyboardTitleCompted"
				:unit="keyboardUnitCompted"
				:amount="keyboardAmountCompted"
				:unitEdit="$fxAuth('insideMoveBill.modifyUnit')"
				:pointSize="sysPointSize"
				:intLength="numberLength"
				@change="onKeyboardChange"
				@pre="onKeyboardPre"
				@next="onKeyboardNext"
				@hide="onKeyboardHide"
				@on-unit-unitEdit="onUnitEdit"
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
		shopId: String,
		inHouseId: String,
		outHouseId: String,
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
				return row.busUnitInAmount
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
				}
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
				this.$emit('on-confirm', this.selectedItemArr)
				this.$emit('update:visibleFlag', false)
			})
		},
		search () {
			this.getItemByClass()
		},
		getItemClass () {
			return new Promise(resolve => {
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.inHouseId}/users/${this.loginerId}/goodTypes`
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
					m: 'getGoodsForInshop',
					goodsSmallTypeId: this.currentClass || null,
					inHouseId: this.inHouseId,
					outHouseId: this.outHouseId,
					searchText: this.searchKey || null
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.shopId}/users/${this.loginerId}/insideMoveBillDetails`,
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
						item.busUnitInAmount = this.selectedItemArr[index].busUnitInAmount
						item.unitDTO = this.selectedItemArr[index].unitDTO
					}
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
		selectClass (classId) {
			this.searchKey = ''
			this.onKeyboardHide()
			this.getItemByClass()
		},
		onItemEdit (index) {
			this.rowActive = index
			this.numberKeyboardShow = true
			this.$refs.addItemList.onSelectLetter(this.rowActive, 20)
		},
		onKeyboardChange (val) {
			this.itemList[this.rowActive].busUnitInAmount = val
		},
		numberStringAmount (rowActive) {
			let busUnitInAmount = this.itemList[rowActive].busUnitInAmount
			this.itemList[rowActive].busUnitInAmount = parseFloat(busUnitInAmount)
			this.itemList[rowActive].price = 0
			this.itemList[rowActive].inMoney = 0
		},
		pushSelectedItem (item) {
			let index = this.selectedItemArr.findIndex(selectItem => {
				return item.goodsDTO.id === selectItem.goodsDTO.id && selectItem.changeType !== 'del'
			})
			if (!~index) {
				if (item.busUnitInAmount > 0) {
					item.changeType = 'add'
					this.selectedItemArr.push(item)
				}
			} else {
				if (!this.selectedItemArr[index].id && item.busUnitInAmount === 0) {
					this.selectedItemArr.splice(index, 1)
				} else {
					if (this.selectedItemArr[index].id && item.busUnitInAmount === 0) {
						this.selectedItemArr[index].changeType = 'del'
					} else {
						if (this.selectedItemArr[index].id) {
							this.selectedItemArr[index].changeType = 'edit'
						}
					}
					this.selectedItemArr[index].busUnitInAmount = item.busUnitInAmount
					this.selectedItemArr[index].unitDTO = item.unitDTO
				}
			}
		},
		onKeyboardPre () {
			if (!this.rowActive) {
				return false
			}
			this.rowActive--
			this.$refs.addItemList.onSelectLetter(this.rowActive, 5)
		},
		onKeyboardNext () {
			if (this.rowActive === '' || this.rowActive === this.itemList.length - 1) {
				return false
			}
			this.rowActive++
			this.$refs.addItemList.onSelectLetter(this.rowActive, 5)
		},
		onKeyboardHide () {
			this.rowActive = ''
		},
		onUnitEdit () {
			if (!this.$fxAuth('insideMoveBill.modifyUnit')) {
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
			let tempUnit = item.unitDTO
			let rate = tempUnit.value / unit.value
			let busUnitInAmount = parseFloat(this.$fxUtils.toFixedSHW(item.busUnitInAmount * rate, this.sysPointSize))
			item.unitDTO = unit
			item.busUnitInAmount = busUnitInAmount
		},
		// {{{
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
		// {{{ 扫码
		getItemByRedCode (redCode) {
			// redCode = '2020831165303000001000002008311626247571522'
			// redCode = this.redCode
			if (!this.visibleFlag) {
				return false
			}
			this.onRedTwoCodeHandler(redCode)
		},
		onRedTwoCodeHandler (redCode) {
			this.getItemByCode(redCode, false).then(res => {
				if (res.errorCode === '100' || res.errorCode === '101') {
					this.$dialog.confirm({
						title: '提示',
						message: res.message
					}).then(() => {
						if (res.errorCode === '100') {
							this.createBreakBill(res.storeBillDetailDTO)
							return true
						}
						this.getItemByCode(redCode, true).then(res => {
							this.setScanGood(res.storeBillDetailDTO)
						})
					})
				} else {
					this.setScanGood(res.storeBillDetailDTO)
				}
			})
		},
		getItemByCode (barcode, nextFlag = false) {
			return new Promise(resolve => {
				let params = {
					qrCodeContent: barcode,
					houseId: this.inHouseId,
					outHouseId: this.outHouseId,
					billType: 23,
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
			const _amount = this.toFixedNumberSize(scanItem.busUnitInAmount + selectGood.busUnitInAmount)
			scanItem.busUnitInAmount = this.$fxCommon.checkAmountRange(_amount)
		},
		refreshSelectItem (scanGood, selectGood) {
			selectGood.busUnitInAmount = scanGood.busUnitInAmount
			selectGood.batchCode = scanGood.batchCode
			this.editItem(selectGood)
		},
		toFixedNumberSize (data) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysPointSize))
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
