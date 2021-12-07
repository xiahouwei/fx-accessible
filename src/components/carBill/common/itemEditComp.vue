<template>
	<div class="item-edit">
		<w-header title="选择成品" :leftOptions="leftOptions" @on-click-back="onCloseClick">
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
						:itemAmoutName="'factCount'"
						:showBom="true"
						@on-item-click="onItemEdit"
					></addItemCell>
				</template>
			</addItemList>
		</div>
		<div v-show="numberKeyboardShow" class="details-number-keyboard">
			<BomNumberKeyboard
				:title="keyboardTitleCompted"
				:otherTitle="keyboardBomTitleCompted"
				:unit="keyboardUnitCompted"
				:unitEdit="true"
				:amount="keyboardAmountCompted"
				:pointSize="sysPointSize"
				:intLength="numberLength"
				@change="onKeyboardChange"
				@on-othertitle-edit="onOtherTitleClick"
				@pre="onKeyboardPre"
				@next="onKeyboardNext"
				@hide="onKeyboardHide"
				@on-unit-unitEdit="onUnitEdit"
			></BomNumberKeyboard>
		</div>
		<van-actionsheet
			v-model="unitActionShow"
			:actions="unitActions"
			cancel-text="取消"
			@select="onUnitSelect"
		/>
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
import addItemList from '@/components/common/AddItemList.vue'
import addItemCell from '@/components/common/AddItemCell.vue'
import BomNumberKeyboard from '@/components/common/BomNumberKeyboard.vue'
const ITEM_SIZE = 10
export default {
	name: 'itemEditComp',
	components: {
		addItemClassList,
		addItemList,
		addItemCell,
		BomNumberKeyboard
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
			bomActionShow: false,
			bomActions: []
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
		keyboardBomTitleCompted () {
			if (this.rowActive === '') {
				return ''
			} else {
				let row = this.itemList[this.rowActive]
				return row.bomDTO.name
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
				return row.factCount
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
					shopId: this.shopId,
					goodsTypeId: this.currentClass || null,
					inId: this.inHouseId,
					outId: this.outHouseId,
					searchText: this.searchKey || null
				}
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/accounts/${this.shopId}/carBill`,
					data: params,
					query: {
						m: 'getFinishGoodsList'
					}
				}).then(res => {
					resolve(res)
				})
			})
		},
		getItemByClass () {
			this.itemListStart = 0
			this.getItem().then(res => {
				this.itemList = this.setResItem(res.finishGoods)
				this.setListLoading(res.finishGoods.length)
				this.$nextTick(() => {
					this.$refs.addItemList && this.$refs.addItemList.onSelectLetter(0, 5)
				})
			})
		},
		onLoadMore () {
			this.getItem().then(res => {
				this.itemList.push(...this.setResItem(res.finishGoods))
				this.setListLoading(res.finishGoods.length)
			})
		},
		setResItem (itemDetails) {
			itemDetails.forEach(item => {
				let index = this.selectedItemArr.findIndex(selectItem => {
					return item.goodsDTO.id === selectItem.goodsDTO.id
				})
				if (~index) {
					if (this.selectedItemArr[index].changeType !== 'del') {
						item.factCount = this.selectedItemArr[index].factCount
						item.unitDTO = this.selectedItemArr[index].unitDTO
						item.bomDetail = this.selectedItemArr[index].bomDetail
						item.bomDTO = this.selectedItemArr[index].bomDTO
					} else {
						item.factCount = '0'
					}
				} else {
					item.factCount = '0'
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
		selectClass () {
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
			this.itemList[this.rowActive].factCount = val
		},
		numberStringAmount (rowActive) {
			let factCount = this.itemList[rowActive].factCount
			this.itemList[rowActive].factCount = parseFloat(factCount)
			this.calcMoneyByCount(factCount, this.itemList[rowActive])
		},
		calcMoneyByCount (factCount, itemData) {
			itemData.factMoney = this.toFixedNumberSize(itemData.price * factCount, this.sysPointSize)
			itemData.taxInMoney = this.toFixedNumberSize(itemData.factMoney * itemData.tax, this.sysPointSize)
			itemData.bomDetail.forEach(bom => {
				let crude = bom.crude
				if (this.$fxSysAuth('carBill.sysCarBillChangeAmount')) {
					bom.factCount = this.toFixedNumberSize(factCount * crude)
				}
				bom.theoryCount = this.toFixedNumberSize(factCount * crude)
				if (bom.id && bom.changeType !== 'del') {
					bom.changeType = 'edit'
				}
			})
		},
		toFixedNumberSize (data) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysPointSize))
		},
		pushSelectedItem (item) {
			let index = this.selectedItemArr.findIndex(selectItem => {
				return item.goodsDTO.id === selectItem.goodsDTO.id
			})
			if (!~index) {
				if (item.factCount > 0) {
					item.changeType = 'add'
					if (this.$fxSysAuth('carBill.SysDefaultDate')) {
						item.produceDate = new Date().getTime()
					}
					this.selectedItemArr.push(item)
				}
			} else {
				if (!this.selectedItemArr[index].id && item.factCount === 0) {
					this.selectedItemArr.splice(index, 1)
				} else {
					if (this.selectedItemArr[index].id && item.factCount === 0) {
						this.selectedItemArr[index].changeType = 'del'
					} else {
						if (this.selectedItemArr[index].id) {
							this.selectedItemArr[index].changeType = 'edit'
						}
					}
					this.selectedItemArr[index].factCount = item.factCount
					this.selectedItemArr[index].unitDTO = item.unitDTO
					this.selectedItemArr[index].bomDTO = item.bomDTO
					this.selectedItemArr[index].bomDetail = item.bomDetail
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
			let factCount = parseFloat(this.$fxUtils.toFixedSHW(item.factCount * rate, this.sysPointSize))
			item.unitDTO = unit
			item.factCount = factCount
		},
		// {{{ 切换bom
		onOtherTitleClick () {
			let goodsId = this.itemList[this.rowActive].goodsDTO.id
			this.getBom(goodsId).then(res => {
				this.bomActions = this.resetBomList(res.carBomGoods)
				this.bomActionShow = true
			})
		},
		resetBomList (data) {
			return data.map(item => {
				item.bomDTO.bomDetail = item.bomDetail
				item.bomDTO.unitDTO = item.unitDTO
				return item.bomDTO
			})
		},
		getBom (goodsId) {
			return new Promise(resolve => {
				let params = {
					shopId: this.shopId,
					goodsId: goodsId
				}
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/accounts/${this.shopId}/carBill`,
					data: params,
					query: {
						m: 'getBomList'
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
			bom.bomDetail.forEach(bomItem => {
				let crude = bom.crude
				if (this.$fxSysAuth('carBill.sysCarBillChangeAmount')) {
					bomItem.factCount = this.toFixedNumberSize(item.factCount * crude)
				}
				bomItem.theoryCount = this.toFixedNumberSize(item.factCount * crude)
				if (bomItem.id) {
					bomItem.changeType = 'edit'
				}
			})
			let bomDetail = item.bomDetail
			bom.bomDetail.forEach(bomItem => {
				bomItem.changeType = 'add'
			})
			for (let i = bomDetail.length - 1; i > -1; i--) {
				let bom = bomDetail[i]
				if (bom.id) {
					bom.changeType = 'del'
				} else {
					bomDetail.splice(i, 1)
				}
			}
			item.bomDTO = bom
			item.bomDetail.push(...bom.bomDetail)
			item.unitDTO = bom.unitDTO
		}
		// }}}

	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.item-edit {
	height: 100%
	width: 100%
	text-align: left
	display: flex
	flex-direction: column
	.header-confirm-btn {
		color: $fxDefaultColor
		width: 40px
		font-size: 20px
		line-height: header-height
	}
	.item-edit-content {
		flex: 1
		display: flex
		flex-direction: row
		overflow: hidden
	}
	.details-number-keyboard {
		z-index: 20
	}
}
</style>
