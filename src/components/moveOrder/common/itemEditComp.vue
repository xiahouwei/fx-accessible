<template>
	<div class="item-edit">
		<w-header title="选择品项" :leftOptions="leftOptions" @on-click-back="onCloseClick">
			<van-icon slot="header-right" name="success" class="header-confirm-btn" @click="onItemConfirm" />
		</w-header>
		<div class="item-search clearfix">
			<van-search v-model="searchKey" placeholder="请输入搜索关键词"  shape="round" @search="search"/>
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
				:unitEdit="true"
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
		inShopDTO: String,
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
					goodsSmallTypeId: this.currentClass || null,
					inHouseId: this.inHouseId,
					outHouseId: this.outHouseId,
					searchText: this.searchKey || null
				}
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/accounts/${this.inShopDTO}/users/${this.loginerId}/shopmoveapplydetails`,
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
						item.busUnitAmount = this.selectedItemArr[index].busUnitAmount
						item.unitDTO = this.selectedItemArr[index].unitDTO
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
			this.itemList[this.rowActive].busUnitAmount = val
		},
		numberStringAmount (rowActive) {
			let busUnitAmount = this.itemList[rowActive].busUnitAmount
			this.itemList[rowActive].busUnitAmount = parseFloat(busUnitAmount)
		},
		pushSelectedItem (item) {
			let index = this.selectedItemArr.findIndex(selectItem => {
				return item.goodsDTO.id === selectItem.goodsDTO.id
			})
			if (!~index) {
				if (item.busUnitAmount > 0) {
					item.changeType = 'add'
					this.selectedItemArr.push(item)
				}
			} else {
				if (!this.selectedItemArr[index].id && item.busUnitAmount === 0) {
					this.selectedItemArr.splice(index, 1)
				} else {
					if (this.selectedItemArr[index].id) {
						if (this.selectedItemArr[index].id && item.busUnitAmount === 0) {
							this.selectedItemArr[index].changeType = 'del'
						} else {
							this.selectedItemArr[index].changeType = 'edit'
						}
					}
					this.selectedItemArr[index].busUnitAmount = item.busUnitAmount
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
			let busUnitAmount = parseFloat(this.$fxUtils.toFixedSHW(item.busUnitAmount * rate, this.sysPointSize))
			item.unitDTO = unit
			item.busUnitAmount = busUnitAmount
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
