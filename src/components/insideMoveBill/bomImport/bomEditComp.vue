<template>
	<div class="item-edit">
		<w-header title="选择成品BOM" :leftOptions="leftOptions" @on-click-back="onCloseClick">
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
					<addBomCell
						:itemData="scope.$item"
						:itemIndex="scope.$index"
						:rowActive="rowActive"
						:itemAmoutName="'bomAmount'"
						@on-item-click="onItemEdit"
						@on-checkbox-click="clickCheckBoxes"
					></addBomCell>
				</template>
			</addItemList>
		</div>
		<div v-show="numberKeyboardShow" class="details-number-keyboard">
			<itemNumberKeyboard
				:title="keyboardTitleCompted"
				:otherTitle="keyboardBomTitleCompted"
				:unit="keyboardUnitCompted"
				:unitEdit="false"
				:amount="keyboardAmountCompted"
				:pointSize="sysPointSize"
				:intLength="numberLength"
				@change="onKeyboardChange"
				@on-othertitle-edit="onOtherTitleClick"
				@pre="onKeyboardPre"
				@next="onKeyboardNext"
				@hide="onKeyboardHide"
			></itemNumberKeyboard>
		</div>
		<van-actionsheet
			v-model="bomActionShow"
			:actions="bomActions"
			cancel-text="取消"
			@select="onBomSelect"
		/>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import addItemClassList from '@/components/common/AddItemClassList.vue'
import addItemList from '@/components/common/AddBomList.vue'
import addBomCell from '@/components/common/AddBomCell.vue'
import itemNumberKeyboard from '@/components/common/BomNumberKeyboard.vue'
const ITEM_SIZE = 10
export default {
	name: 'bomEditComp',
	components: {
		addItemClassList,
		addItemList,
		addBomCell,
		itemNumberKeyboard
	},
	props: {
		visibleFlag: Boolean,
		shopId: {
			type: String,
			default: ''
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
			bomActionShow: false,
			bomActions: []
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize',
			numberLength: 'numberLength',
			loginerId: state => state.loginer.loginerId
		}),
		keyboardTitleCompted () {
			if (this.rowActive === '') {
				return ''
			} else {
				let row = this.itemList[this.rowActive]
				return row.goods.name
			}
		},
		keyboardBomTitleCompted () {
			if (this.rowActive === '') {
				return ''
			} else {
				let row = this.itemList[this.rowActive]
				return row.name
			}
		},
		keyboardUnitCompted () {
			if (this.rowActive === '') {
				return ''
			} else {
				let row = this.itemList[this.rowActive]
				return row.unit.name
			}
		},
		keyboardAmountCompted () {
			if (this.rowActive === '') {
				return '0'
			} else {
				let row = this.itemList[this.rowActive]
				return row.bomAmount
			}
		}
	},
	watch: {
		visibleFlag: {
			handler (val) {
				if (val) {
					this.refresh()
				}
			},
			immediate: true
		},
		rowActive (val, oldVal) {
			if (oldVal !== '') {
				this.numberStringAmount(oldVal)
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
			this.selectedItemArr = []
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
			let checkAmount = this.selectedItemArr.find(item => {
				return parseFloat(item.bomAmount) === 0
			})
			if (checkAmount) {
				this.$fxToast.top(`请填写数量!`)
				return false
			}
			if (!this.selectedItemArr || this.selectedItemArr.length === 0) {
				this.$fxToast.fail('请选择品项!')
				return false
			}
			this.rowActive = ''
			this.$nextTick(() => {
				this.$emit('on-bom-confirm', this.selectedItemArr)
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
					shopId: this.shopId,
					paged: true,
					start: this.itemListStart,
					size: ITEM_SIZE,
					searchText: this.searchKey || '',
					goodsTypeId: this.currentClass || null
				}
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/accounts/${this.shopId}/users/${this.loginerId}/insideMoveBillDetails`,
					data: params,
					query: {
						m: 'getProductBomList'
					}
				}).then(res => {
					res.productBom.forEach(item => {
						item.checked = false
					})
					resolve(res)
				})
			})
		},
		getItemByClass () {
			this.itemListStart = 0
			this.getItem().then(res => {
				this.itemList = this.setResItem(res.productBom)
				this.setListLoading(res.productBom.length)
				// 设置选中项
				if (this.selectedItemArr.length) {
					this.checkItem(this.itemList)
				}
				this.$nextTick(() => {
					this.$refs.addItemList && this.$refs.addItemList.onSelectLetter(0, 5)
				})
			})
		},
		onLoadMore () {
			this.getItem().then(res => {
				this.itemList.push(...this.setResItem(res.productBom))
				this.setListLoading(res.productBom.length)
				// 设置选中项
				if (this.selectedItemArr.length) {
					this.checkItem(res.productBom)
				}
			})
		},
		setResItem (itemDetails) {
			itemDetails.forEach(item => {
				let index = this.selectedItemArr.findIndex(selectItem => {
					return item.goods.id === selectItem.goods.id
				})
				if (~index) {
					item.bomAmount = this.selectedItemArr[index].bomAmount
					item.name = this.selectedItemArr[index].name
					item.id = this.selectedItemArr[index].id
				} else {
					item.bomAmount = '0'
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
		// {{{设置选中的品项--‘checked’
		checkItem (itemData) {
			itemData.forEach((item, index) => {
				let itemHasInventory = this.selectedItemArr.find(inventoryData => {
					return inventoryData.id === item.id
				})
				item.checked = !!itemHasInventory
			})
		},
		// }}}
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
			this.itemList[this.rowActive].bomAmount = val
			if (val > 0) {
				this.itemList[this.rowActive].checked = true
				this.clickCheckBoxes(this.itemList[this.rowActive])
			} else {
				this.itemList[this.rowActive].checked = false
			}
		},
		numberStringAmount (rowActive) {
			let bomAmount = parseFloat(this.itemList[rowActive].bomAmount)
			this.itemList[rowActive].bomAmount = bomAmount
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
		// {{{ 切换bom
		onOtherTitleClick () {
			let goodsId = this.itemList[this.rowActive].goods.id
			this.getBom(goodsId).then(res => {
				this.bomActions = res.productBom
				this.bomActionShow = true
			})
		},
		getBom (goodsId) {
			return new Promise(resolve => {
				let params = {
					shopId: this.shopId,
					goodsId: goodsId
				}
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/accounts/${this.shopId}/users/${this.loginerId}/insideMoveBillDetails`,
					data: params,
					query: {
						m: 'getProductBom'
					}
				}).then(res => {
					resolve(res)
				})
			})
		},
		onBomSelect (bom) {
			this.bomActionShow = false
			let item = this.itemList[this.rowActive]
			// 设置bom
			item.name = bom.name
			item.id = bom.id
			// 设置单位
			item.unit = bom.unit
		},
		// }}}
		// {{{选中品项加入到selectedItemArr中
		clickCheckBoxes (itemData) {
			if (itemData.checked) {
				if (!~this.getSelectItemIndex(itemData)) {
					this.selectedItemArr.push(itemData)
				}
			} else {
				this.selectedItemArr.splice(this.getSelectItemIndex(itemData), 1)
			}
		},
		getSelectItemIndex (itemData) {
			return this.selectedItemArr.findIndex(item => item.id === itemData.id)
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

