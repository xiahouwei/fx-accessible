<template>
	<w-app-page class="item-edit">
		<w-app-container>
			<w-header :title="`${superaddition ? '追加' : '选择'}品项`" :leftOptions="leftOptions" @on-click-back="onCloseClick">
				<van-icon slot="header-right" name="success" class="header-confirm-btn" @click="onItemConfirm" />
			</w-header>
			<div class="item-search clearfix">
				<van-search
					v-model="searchKey"
					placeholder="请输入搜索关键词"
					shape="round"
					@search="search"
				/>
			</div>
			<div class="item-edit-content">
				<addItemClassList
					v-model="currentClass"
					:itemClassList="itemClassList"
					@on-change-class="changeClass"
				></addItemClassList>
				<addItemList
					ref="addItemList"
					:listLoading.sync="listLoading"
					:loadFinished="loadFinished"
					:itemList="itemList"
					class="add-item-list"
					@on-load-more="onLoadMore"
				>
					<template slot="item-cell" slot-scope="scope">
						<addItemCell
							:itemData="scope.$item"
							:itemIndex="scope.$index"
							:isEdit="scope.$index===editIndex"
							:isLoaded="scope.$item.isLoaded"
							:editAmountType="editAmountType"
							@on-item-select-change="onItemSelectChange"
							@on-amount-edit="onAmountEdit"
						></addItemCell>
					</template>
				</addItemList>
			</div>
			<div v-show="showKeyboard" class="keyboard-masker" @click="onKeyboardClose"></div>
		</w-app-container>
		<itemNumberKeyboard
			ref="itemNumberKeyboard"
			v-model="showKeyboard"
			:busFactAmount1ChangeMethods="busFactAmount1ChangeMethods"
			:busFactAmount2ChangeMethods="busFactAmount2ChangeMethods"
			:assistFactAmountChangeMethods="assistFactAmountChangeMethods"
			@prev="onKeyboardPrev"
			@next="onKeyboardNext"
			@close="onKeyboardClose"
			@on-edit-amount-type-change="onEditAmountTypeChange"
		></itemNumberKeyboard>
	</w-app-page>
</template>

<script>
import { mapState } from 'vuex'
import addItemClassList from '@/components/common/AddItemClassList.vue'
import addItemList from '@/components/common/AddItemList.vue'
import addItemCell from './AddItemCell.vue'
import itemNumberKeyboard from '@/components/centerCheckBill4cld/common/ItemNumberKeyboard.vue'
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
		orderInfoData: {
			type: Object,
			default: () => {
				return {}
			}
		},
		orderItemList: {
			type: Array,
			default: () => {
				return []
			}
		},
		superaddition: Boolean,
		beforeConfirm: Function
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
			selectedItemArr: [],
			itemListStart: 0,
			listLoading: false,
			loadFinished: true,
			showKeyboard: false,
			editAmountType: '',
			editIndex: -1,
			fxCalculation: this.$fxCalculation('centerCheckBill4cld'),
			fxVerification: this.$fxUtils.fxDataVerification()
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize'
		})
	},
	watch: {
		visibleFlag: {
			handler (val) {
				if (val) {
					this.selectedItemArr = this.$fxUtils.deepClone(this.orderItemList)
					this.fxVerification.resetData(this.selectedItemArr)
					this.refresh()
				}
			},
			immediate: true
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
			this.$emit('update:visibleFlag', false)
		},
		onItemConfirm () {
			this.$nextTick(() => {
				if (this.fxVerification.checkData(this.selectedItemArr)) {
					this.$emit('update:visibleFlag', false)
				} else {
					if (typeof this.beforeConfirm === 'function') {
						this.beforeConfirm(this.selectedItemArr).then(() => {
							this.$emit('on-confirm', this.selectedItemArr)
							this.$emit('update:visibleFlag', false)
						})
					} else {
						this.$emit('on-confirm', this.selectedItemArr)
						this.$emit('update:visibleFlag', false)
					}
				}
			})
		},
		search () {
			this.getItemByClass()
		},
		getItemClass () {
			if (this.superaddition) {
				const params = {
					houseId: this.orderInfoData.houseDTO.id,
					billId: this.orderInfoData.id,
					checkWay: this.orderInfoData.groupFlag
				}
				return this.$fxApi('centerCheckBill4cld.getSuperadditionItemClass')({ data: params })
			} else {
				const params = {
					checkType: this.orderInfoData.checkTypeDTO.id,
					houseId: this.orderInfoData.houseDTO.id,
					rdcId: this.orderInfoData.rdcDTO.id,
					billId: this.orderInfoData.id
				}
				return this.$fxApi('centerCheckBill4cld.getItemClass')({ data: params })
			}
		},
		getItem () {
			const params = {
				start: this.itemListStart,
				size: ITEM_SIZE,
				paged: true,
				goodsTypeId: this.currentClass || null,
				checkType: this.orderInfoData.checkTypeDTO.id,
				checkWay: this.orderInfoData.groupFlag,
				houseId: this.orderInfoData.houseDTO.id,
				rdcId: this.orderInfoData.rdcDTO.id,
				billId: this.orderInfoData.id,
				searchText: this.searchKey || ''
			}
			if (this.superaddition) {
				return this.$fxApi('centerCheckBill4cld.getSuperadditionItemByClass')({ data: params })
			} else {
				return this.$fxApi('centerCheckBill4cld.getItemByClass')({ data: params })
			}
		},
		getItemByClass () {
			this.itemListStart = 0
			this.getItem().then(res => {
				this.itemList = this.setResItem(res)
				this.setListLoading(res.length)
				this.$nextTick(() => {
					this.$refs.addItemList && this.$refs.addItemList.onSelectLetter(0, 200)
				})
			})
		},
		onLoadMore () {
			this.getItem().then(res => {
				this.itemList.push(...this.setResItem(res))
				this.setListLoading(res.length)
			})
		},
		setResItem (itemDetails) {
			itemDetails.forEach((item, index) => {
				let _index = this.selectedItemArr.findIndex(selectItem => {
					return item.goodsDTO.id === selectItem.goodsDTO.id && selectItem.changeType !== 'del'
				})
				if (item.assistUnit) {
					item.assistFactAmount = 0
				}
				item.checked = !!~_index
				if (~_index) {
					const _item = this.selectedItemArr[_index]
					_item.isLoaded = true
					itemDetails.splice(index, 1, _item)
				} else {
					item.isLoaded = false
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
			this.getItemByClass()
		},
		onItemSelectChange (item) {
			if (item.checked) {
				if (!~this.getSelectItemIndex(item)) {
					this.getItemDetailData({ data: item }).then(({ data }) => {
						this.selectedItemArr.push(data)
					})
				}
			} else {
				this.selectedItemArr.splice(this.getSelectItemIndex(item), 1)
			}
		},
		getSelectItemIndex (itemData) {
			return this.selectedItemArr.findIndex(item => item.id === itemData.goodsDTO.id)
		},
		scrollToActive (index) {
			this.$nextTick(() => {
				this.$refs.addItemList.onSelectLetter(index, 20)
			})
		},
		onAmountEdit (type, itemData, itemIndex) {
			this.getItemDetailData({ data: itemData, index: itemIndex }).then(({ data, index }) => {
				this.editAmountType = type
				this.editIndex = itemIndex
				this.syncAccountDepositAmount(data)
				this.$refs.itemNumberKeyboard.open(type, data, itemIndex)
				this.$refs.addItemList.onSelectLetter(itemIndex)
			})
		},
		syncAccountDepositAmount (data) {
			if (data.busBillAmount1 > 0 && `${data.busFactAmount1}` === '0') {
				data.busFactAmount1 = data.busBillAmount1
				this.busFactAmount1ChangeMethods(data)
			}
			if (data.busBillAmount2 > 0 && `${data.busFactAmount2}` === '0') {
				data.busFactAmount2 = data.busBillAmount2
				this.busFactAmount2ChangeMethods(data)
			}
			if (data.assistBillAmount > 0 && `${data.assistFactAmount}` === '0') {
				data.assistFactAmount = data.assistBillAmount
			}
		},
		getItemDetailData ({ data, index }) {
			return new Promise(resolve => {
				if (data.isLoaded) {
					resolve({ data, index })
				} else {
					const params = {
						billId: this.orderInfoData.id,
						houseId: this.orderInfoData.houseDTO.id,
						itemId: data.goodsDTO.id
					}
					this.$fxApi('centerCheckBill4cld.getItemDetaiData')({ data: params }).then(([itemData]) => {
						data.isLoaded = true
						data = Object.assign(data, itemData)
						resolve({ data, index })
					})
				}
			})
		},
		onKeyboardPrev (itemIndex) {
			const type = 'busFactAmount1'
			this.$refs.addItemList.prev(itemIndex)
				.then(this.getItemDetailData)
				.then(({ data, index }) => {
					this.editAmountType = type
					this.editIndex = index
					this.$refs.itemNumberKeyboard.open(type, data, index)
				})
		},
		onKeyboardNext (itemIndex) {
			const type = 'busFactAmount1'
			this.$refs.addItemList.next(itemIndex)
				.then(this.getItemDetailData)
				.then(({ data, index }) => {
					this.editAmountType = type
					this.editIndex = index
					this.$refs.itemNumberKeyboard.open(type, data, index)
				})
		},
		onKeyboardClose () {
			this.editAmountType = ''
			this.editIndex = -1
			this.showKeyboard = false
		},
		onEditAmountTypeChange (type) {
			this.editAmountType = type
		},
		busFactAmount1ChangeMethods (row) {
			this.fxCalculation.computeDiffAmount(row)
			row.checked = true
		},
		busFactAmount2ChangeMethods (row) {
			this.fxCalculation.computeDiffAmount2(row)
			row.checked = true
		},
		assistFactAmountChangeMethods (row) {
			this.fxCalculation.computeDiffAssistAmount(row)
			row.checked = true
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
	.add-item-list>>>.item-detail {
		height: auto
	}
	.keyboard-masker {
		position: absolute
		top: 0
		left: 0
		right: 0
		bottom: 0
		z-index: 500
	}
}
</style>

