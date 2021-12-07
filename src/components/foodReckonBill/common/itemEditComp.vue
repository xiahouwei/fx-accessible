<template>
	<div class="item-edit">
		<w-header title="选择菜品" :leftOptions="leftOptions" @on-click-back="onCloseClick">
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
				:classTitle="`全部菜品`"
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
						:itemAmoutName="'foodCount'"
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
import addItemList from '@/components/foodReckonBill/common/AddItemList.vue'
import addItemCell from '@/components/foodReckonBill/common/AddItemCell.vue'
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
		shopId: {
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
			loadFinished: true
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
				return row.foodName
			}
		},
		keyboardUnitCompted () {
			if (this.rowActive === '') {
				return ''
			} else {
				let row = this.itemList[this.rowActive]
				return row.foodUnitName
			}
		},
		keyboardAmountCompted () {
			if (this.rowActive === '') {
				return '0'
			} else {
				let row = this.itemList[this.rowActive]
				return row.foodCount
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
			// 不允许同一单据同一品项多次录入
			this.getItemClass().then(res => {
				this.itemClassList = res.foodsTypes
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
				this.$emit('on-confirm', [this.selectedItemArr])
				this.$emit('update:visibleFlag', false)
			})
		},
		search () {
			this.getItemByClass()
		},
		getItemClass () {
			return new Promise(resolve => {
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/food`,
					data: {
						m: 'getFoodTypelist'
					}
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
					foodsSmallType: this.currentClass || null,
					shopId: this.shopId,
					searchText: this.searchKey || ''
				}
				this.$fxApi('foodReckonBill.selFoodList')({ data: params }).then(res => {
					resolve(res)
				})
			})
		},
		getItemByClass () {
			this.itemListStart = 0
			this.getItem().then(res => {
				this.itemList = this.setResItem(res.foodDTOData)
				this.setListLoading(res.foodDTOData.length)
				this.$nextTick(() => {
					this.$refs.addItemList && this.$refs.addItemList.onSelectLetter(0, 5)
				})
			})
		},
		onLoadMore () {
			this.getItem().then(res => {
				this.itemList.push(...this.setResItem(res.foodDTOData))
				this.setListLoading(res.foodDTOData.length)
			})
		},
		setResItem (itemDetails) {
			itemDetails.forEach(item => {
				let index = this.selectedItemArr.findIndex(selectItem => {
					return item.foodUnitId === selectItem.foodUnitId
				})
				if (~index) {
					if (this.selectedItemArr[index].changeType !== 'del') {
						item.foodCount = this.selectedItemArr[index].foodCount
					} else {
						item.foodCount = '0'
					}
				} else {
					item.foodCount = '0'
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
			this.itemList[this.rowActive].foodCount = val
		},
		numberStringAmount (rowActive) {
			let foodCount = this.itemList[rowActive].foodCount
			this.itemList[rowActive].foodCount = parseFloat(foodCount)
		},
		pushSelectedItem (item) {
			let index = this.selectedItemArr.findIndex(selectItem => {
				return item.foodUnitId === selectItem.foodUnitId
			})
			if (!~index) {
				if (item.foodCount > 0) {
					item.changeType = 'add'
					this.selectedItemArr.push(item)
					this.changeSelectedItem(item, this.selectedItemArr.length - 1)
				}
			} else {
				if (item.foodCount === 0) {
					if (this.selectedItemArr[index].changeType !== 'del') {
						this.selectedItemArr[index].changeType = 'del'
						this.$fxToast({
							message: `删除已选品项${item.foodName}`,
							position: 'top'
						})
					}
				} else {
					if (this.selectedItemArr[index].id) {
						this.selectedItemArr[index].changeType = 'edit'
					}
				}
				this.changeSelectedItem(item, index)
			}
		},
		// {{{修改对应选中item
		changeSelectedItem (item, index) {
			// 修改数量
			this.selectedItemArr[index].foodCount = item.foodCount
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

