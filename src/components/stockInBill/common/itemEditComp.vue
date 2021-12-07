<template>
	<div class="item-edit">
		<w-header title="选择品项" :leftOptions="leftOptions" @on-click-back="onCloseClick">
			<van-icon slot="header-right" name="success" class="header-confirm-btn" @click="onItemConfirm" />
			<!-- <van-icon slot="header-right" name="success" class="header-confirm-btn" @click="onRedCodeHandler" /> -->
		</w-header>
		<div class="item-search clearfix">
			<van-search v-model="searchKey" placeholder="请输入搜索关键词" shape="round" @search="search"/>
		</div>
		<div class="item-edit-content">
			<div class="item-class-content fx-vant-class-collapse">
				<div
					class="all-class"
					:class="{'is-active': currentClass===''}"
					@click.stop="selectClass('')"
				>全部品项</div>
				<van-collapse v-model="activeNames" :accordion="true">
					<van-collapse-item
						v-for="item in itemClassList"
						:key="item.id"
						:name="item.id">
						<div slot="title" class="big-class" @click.stop="selectClass(item.id, 'bigType')">{{item.name}}</div>
						<van-cell
							v-for="smallItem in item.smallType"
							:key="smallItem.id"
							:title="smallItem.name"
							class="small-class"
							:class="{'is-active': currentClass===smallItem.id}"
							@click.stop="selectClass(smallItem.id, 'smallType')"
						/>
					</van-collapse-item>
				</van-collapse>
			</div>
			<div class="item-details-content" ref="details-content">
				<van-list
					v-model="listLoading"
					:finished="loadFinished"
					finished-text="没有更多了"
					error-text="请求失败，点击重新加载"
					@load="onLoadMore"
				>
					<div
						v-for="(item, index) in itemList"
						:key="item.goodsDTO.id"
						:ref="`details-row-${index}`"
						class="item-detail"
					>
						<div :class="{
							'is-active':rowActive===index
						}" class="item-detail-cell" @click="onItemEdit(index)">
							<div class="item-details-img">
								<img :src="comptedItemImgSrc(item.goodsDTO.imageUrls)" :onerror="$fxCommon.errorImg('item')">
							</div>
							<div class="item-details-params">
								<div class="item-details-name fx-ellipsis">{{item.goodsDTO.name}}</div>
								<div class="item-details-spec fx-ellipsis">{{item.goodsDTO.spec}}</div>
								<div class="item-details-amount">
									<span class="item-details-count">{{item.busUnitInAmount}}</span>
									<span class="item-details-unit" @click.stop="onUnitClick(item)">{{item.unitDTO.name}}</span>
									<van-icon v-show="sysStockInChangeUnit" name="arrow-down" />
								</div>
								<i v-show="rowActive===index" class="item-edit-icon"></i>
								<i v-show="rowActive!==index && item.busUnitInAmount>0" class="item-selected-icon"></i>
							</div>
						</div>
					</div>
				</van-list>
			</div>
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
import itemNumberKeyboard from '@/components/common/ItemNumberKeyboard.vue'
const ITEM_SIZE = 10
export default {
	name: 'itemEditComp',
	components: {
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
		supplierId: {
			type: String,
			default: ''
		},
		shopId: {
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
		},
		orderItemList: {
			type: Array,
			default: () => {
				return []
			}
		},
		sysStockInSameGoods: Boolean,
		sysStockInChangeUnit: Boolean,
		billId: {
			type: String,
			default: () => {
				return ''
			}
		}
	},
	data () {
		return {
			activeNames: [],
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			searchKey: '',
			currentClass: '',
			currentClassType: '',
			itemClassList: [],
			itemList: [],
			numberKeyboardShow: false,
			rowActive: '',
			selectedItemArr: [],
			itemListStart: 0,
			listLoading: false,
			loadFinished: true,
			listError: false,
			unitActions: [],
			unitActionShow: false,
			itemEditRowData: {},
			removeIds: [],
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
		comptedItemImgSrc (imageUrls) {
			return (imageUrls) => {
				return imageUrls === null ? '' : imageUrls[0]
			}
		},
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
					// this.selectedItemArr = JSON.parse(JSON.stringify(this.parentStoreItem))
					this.refresh()
					this.$fxEventBus.$on('redCode', this.getItemByRedCode)
				} else {
					this.$fxEventBus.$off('redCode', this.getItemByRedCode)
				}
			},
			immediate: true
		},
		rowActive (val, oldVal) {
			if (val === '') {
				this.numberKeyboardShow = false
			}
			if (oldVal !== '') {
				this.numberStringAmount(oldVal)
				this.pushSelectedItem(this.itemList[oldVal])
			}
		}
	},
	methods: {
		refresh () {
			this.resetHandler()
			// 是否允许同一单据同一品项多次录入
			// if (!this.sysStockInSameGoods) {
			// 	this.parentStoreItem.forEach(item => {
			// 		this.removeIds.push(item.goodsDTO.id)
			// 	})
			// }
			// this.removeIds = Array.from(new Set(this.removeIds))
			this.getItemClass().then(res => {
				this.itemClassList = res.goodsTypes
				this.getItemByClass()
			})
		},
		// {{{清空数据
		resetHandler () {
			this.currentClass = ''
			this.currentClassType = ''
			this.searchKey = ''
			this.selectedItemArr = []
			this.itemList = []
			this.removeIds = []
		},
		// }}}
		onCloseClick () {
			this.rowActive = ''
			this.$emit('update:visibleFlag', false)
		},
		onItemConfirm () {
			this.rowActive = ''
			this.$nextTick(() => {
				this.selectedItemArr.forEach(item => {
					if (!item.inHouseDTO) {
						item.inHouseDTO = this.store
					}
					item.giftFlag = false
				})
				this.$emit('on-confirm', [this.selectedItemArr, this.store])
				this.$emit('update:visibleFlag', false)
			})
		},
		// {{{搜素品项
		search (searchKey) {
			this.rowActive = ''
			this.searchKey = searchKey
			this.getItemByClass()
		},
		// }}}
		// {{{下拉刷新
		onLoadMore () {
			this.getItem().then(res => {
				let billAndDetails = this.setDataMoneyAndPrice(res.billAndDetails)
				this.itemList.push(...this.setResItem(billAndDetails))
				this.setListLoading(billAndDetails.length)
			})
		},
		setDataMoneyAndPrice (data) {
			data.forEach(item => {
				item.unitDTO = this.$fxUtils.JSONcopy(item.pricePlanDTO.unit)
				item.pricePlanDTO = this.$fxUtils.JSONcopy(item.pricePlanDTO)
				let pricePlanDTO = item.pricePlanDTO
				if (this.$fxUtils.isDef(pricePlanDTO)) { // 价格方案
					item.price = this.toFixedNumberSize(pricePlanDTO.price)
					item.tax = this.toFixedNumberSize(pricePlanDTO.taxes)
					item.taxPrice = this.toFixedNumberSize(pricePlanDTO.priceWithTax)
					if (item.getPriceWay === '1') {
						if (item.goodsDTO.barCodeFlag === '0') {
							item.taxPrice = this.toFixedNumberSize(item.taxPrice / pricePlanDTO.unit.value * item.goodsDTO.unitValue)
							item.unitDTO = {
								id: item.goodsDTO.unitsId,
								name: item.goodsDTO.unitName,
								value: item.goodsDTO.unitValue,
								codeFlag: item.goodsDTO.barCodeFlag
							}
						}
					}
				} else {
					item.price = 0
					item.tax = 0
					item.taxPrice = 0
				}
			})
			return data
		},
		// }}}
		setListLoading (itemCount) {
			this.listLoading = false
			this.itemListStart += ITEM_SIZE
			if (itemCount < ITEM_SIZE) {
				this.loadFinished = true
			} else {
				this.loadFinished = false
			}
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
					houseId: this.store.id,
					supplierId: this.supplierId,
					workDate: this.businessDate,
					searchText: this.searchKey,
					removeIds: this.removeIds
				}
				if (this.currentClassType === 'bigType') {
					params.goodsBigTypeId = this.currentClass
				} else if (this.currentClassType === 'smallType') {
					params.goodsTypeId = this.currentClass
				}
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/accounts/${this.shopId}/users/${this.loginerId}/stockindetails`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		getItemByClass () {
			this.itemListStart = 0
			this.getItem().then(res => {
				let billAndDetails = this.setDataMoneyAndPrice(res.billAndDetails)
				this.itemList = this.setResItem(billAndDetails)
				this.setListLoading(billAndDetails.length)
				this.$nextTick(() => {
					this.onSelectLetter(0, 5)
				})
			})
		},
		setResItem (itemDetails) {
			itemDetails.forEach(item => {
				let index = this.selectedItemArr.findIndex(selectItem => {
					return item.goodsDTO.id === selectItem.goodsDTO.id
				})
				if (~index) {
					item.busUnitInAmount = this.selectedItemArr[index].busUnitInAmount
					item.unitDTO = this.selectedItemArr[index].unitDTO
				} else {
					item.busUnitInAmount = '0'
				}
			})
			return itemDetails
		},
		selectClass (classId, type = '') {
			this.onKeyboardHide()
			this.currentClassType = type
			this.currentClass = classId
			this.searchKey = ''
			this.getItemByClass()
		},
		onItemEdit (index) {
			this.rowActive = index
			this.numberKeyboardShow = true
			this.onSelectLetter(this.rowActive, 20)
		},
		onKeyboardChange (val) {
			this.itemList[this.rowActive].busUnitInAmount = val
		},
		numberStringAmount (rowActive) {
			let busUnitInAmount = this.itemList[rowActive].busUnitInAmount
			this.itemList[rowActive].busUnitInAmount = parseFloat(busUnitInAmount) + ''
			// 设置金额
			this.calcMoney('amount', busUnitInAmount, this.itemList[rowActive])
		},
		// {{{计算税额并渲染
		calcMoney (target, amountOrMoney, itemData) {
			let { taxPrice, busUnitInAmount, price, tax } = itemData
			let money = 0
			let moneyWithTax = 0
			let itemPrice = 0
			let itemTaxPrice = 0
			amountOrMoney = this.toFixedNumberSize(amountOrMoney)
			if (itemData.giftFlag || (target === 'money' && amountOrMoney === 0)) {
				// 赠送、数量为0
				itemData.inMoney = 0
				itemData.inMoneyWithTax = 0
				itemData.taxInMoney = 0
				return true
			}
			if (target === 'money') {
				money = amountOrMoney
				itemPrice = this.toFixedNumberSize(money / busUnitInAmount)
				moneyWithTax = money * (1 + tax)
				itemTaxPrice = this.toFixedNumberSize(moneyWithTax / busUnitInAmount)
			} else if (target === 'amount') {
				itemData.busUnitInAmount = amountOrMoney
				itemPrice = price
				itemTaxPrice = taxPrice
				money = this.toFixedNumberSize(price * amountOrMoney)
				moneyWithTax = this.toFixedNumberSize(taxPrice * amountOrMoney)
			} else if (target === 'moneyWithTax') {
				moneyWithTax = amountOrMoney
				itemTaxPrice = this.toFixedNumberSize(moneyWithTax / busUnitInAmount)
				money = this.toFixedNumberSize(moneyWithTax / (1 + tax))
				itemPrice = this.toFixedNumberSize(money / busUnitInAmount)
			} else if (target === 'taxPrice') {
				itemTaxPrice = amountOrMoney
				moneyWithTax = this.toFixedNumberSize(busUnitInAmount * itemTaxPrice)
				itemPrice = this.toFixedNumberSize(itemTaxPrice / (1 + tax))
				money = this.toFixedNumberSize(itemPrice * busUnitInAmount)
			} else if (target === 'price') {
				itemPrice = amountOrMoney
				money = this.toFixedNumberSize(itemPrice * busUnitInAmount)
				itemTaxPrice = this.toFixedNumberSize(itemPrice * (1 + tax))
				moneyWithTax = this.toFixedNumberSize(busUnitInAmount * itemTaxPrice)
			}
			itemData.inMoney = money
			itemData.inMoneyWithTax = moneyWithTax
			itemData.taxInMoney = this.toFixedNumberSize(this.toFixedNumberSize(moneyWithTax) - this.toFixedNumberSize(money))
			itemData.price = itemPrice
			itemData.taxPrice = itemTaxPrice
		},
		// }}}
		toFixedNumberSize (data) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysPointSize))
		},
		pushSelectedItem (item) {
			let index = this.selectedItemArr.findIndex(selectItem => {
				return item.goodsDTO.id === selectItem.goodsDTO.id
			})
			if (!~index) {
				if (item.busUnitInAmount > 0) {
					item.changeType = 'add'
					this.selectedItemArr.push(item)
				}
			} else {
				this.selectedItemArr[index].busUnitInAmount = item.busUnitInAmount
			}
		},
		onKeyboardPre () {
			if (!this.rowActive) {
				return false
			}
			this.rowActive--
			this.onSelectLetter(this.rowActive, 5)
		},
		onKeyboardNext () {
			if (this.rowActive === '' || this.rowActive === this.itemList.length - 1) {
				return false
			}
			this.rowActive++
			this.onSelectLetter(this.rowActive, 5)
		},
		onKeyboardHide () {
			this.rowActive = ''
		},
		onSelectLetter (index, distance = 40) {
			let detailsRowRef = this.$refs[`details-row-${index}`]
			if (!detailsRowRef || detailsRowRef.length === 0) {
				return false
			}
			let offsetTop = detailsRowRef[0].offsetTop
			let $el = this.$refs['details-content']
			this.$fxUtils.scrollTopW({ offsetTop, $el, distance })
		},
		// {{{切换单位
		onUnitClick (item) {
			if (!this.sysStockInChangeUnit) {
				return false
			}
			this.itemEditRowData = item
			this.getItemUnit(item.goodsDTO.id).then(res => {
				this.unitActions = res
				this.unitActionShow = true
			})
		},
		getItemUnit (goodsId) {
			return new Promise(resolve => {
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/goods/${goodsId}/units`
				}).then(res => {
					resolve(res.units)
				})
			})
		},
		onUnitSelect (unit) {
			this.unitActionShow = false
			let item = this.itemEditRowData
			let oldUnitRate = item.unitDTO.value // 新增的品项明细获取之前单位换算值方式
			let newUnit = unit // 新增的品项明细获取之后单位换算值方式
			let amount = parseFloat(item.busUnitInAmount)
			if (amount > 0) {
				amount = amount * oldUnitRate / newUnit.value
				item.busUnitInAmount = parseFloat(this.$fxUtils.toFixedSHW(amount, this.sysPointSize))
				this.calcMoney('moneyWithTax', item.inMoneyWithTax, item)
			} else {
				item.taxPrice = parseFloat(item.taxPrice) * newUnit.value / oldUnitRate
				item.costTaxPrice = parseFloat(item.costTaxPrice) * newUnit.value / oldUnitRate
				this.calcMoney('taxPrice', item.taxPrice, item)
			}
			// 订货数量
			let outOrderAmount = parseFloat(item.outOrderAmount)
			outOrderAmount = outOrderAmount * oldUnitRate / newUnit.value
			item.outOrderAmount = outOrderAmount
			// 设置单位
			let index = this.selectedItemArr.findIndex(selectItem => {
				return item.goodsDTO.id === selectItem.goodsDTO.id
			})
			if (~index) {
				this.selectedItemArr[index].unitDTO = unit
			}
			item.unitDTO = unit
		},
		// }}}
		// {{{ 扫码
		getItemByRedCode (redCode) {
			// redCode = '2020831165303000001000002008311626247571522'
			if (!this.visibleFlag) {
				return false
			}
			if (redCode.length <= 24) {
				this.onRedCodeHandler(redCode)
			} else { // 扫描二维码
				this.getItemByTwoCode(redCode).then(goods => {
					if (goods.length === 0) {
						this.$fxToast.top('当前仓库无此品项!')
						return false
					}
					this.getScanGoodData(goods)
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
					this.onSelectLetter(0, 5)
				})
			})
		},
		itemUpdate (item) {
			if (!this.sysStockInSameGoods) {
				const indexs = this.$fxUtils.appointedMap(this.parentStoreItem, (storeItem, index) => {
					if (storeItem.goodsDTO.id === item.goodsDTO.id && storeItem.changeType !== 'del') {
						return index
					}
				})
				if (indexs.length === 1 && this.parentStoreItem[indexs[0]].id) {
					const parentStoreItem = this.parentStoreItem[indexs[0]]
					const unitDTO = parentStoreItem.unitDTO
					const currentUnitDTO = item.unitDTO
					const ratio = currentUnitDTO.value / unitDTO.value
					const countValue = item.goodsDTO.countValue * ratio
					parentStoreItem.goodsDTO.countValue = countValue
					item = this.$fxUtils.JSONcopy(parentStoreItem)
				}
			}
			return item
		},
		getItemByRedCodeHandler (redCode) {
			return new Promise(resolve => {
				let params = {
					workDate: this.businessDate,
					supplierId: this.supplierId,
					houseId: this.store.id,
					billType: '20_0'
				}
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/accounts/${this.shopId}/users/${this.loginerId}/goods/barCode/${redCode}`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		// }}}
		// {{{ 扫二维码
		getItemByTwoCode (barcode) {
			return new Promise(resolve => {
				let params = {
					qrCodeContent: barcode,
					houseId: this.store.id,
					supplierId: this.supplierId,
					billType: '20',
					billId: this.billId
				}
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/accounts/${this.shopId}/users/${this.loginerId}/getscancodedata`,
					query: params
				}).then(res => {
					resolve(res.storeBillDetailDTO)
				})
			})
		},
		getScanGoodData (goods) {
			// 标记掌中宝扫码生成
			goods.autoType = 3
			this.setScanGood(goods)
		},
		setScanGood (scanGood) {
			let orderItemArr = []
			orderItemArr = this.selectedItemArr
			let _index = orderItemArr.findIndex(selectItem => {
				return scanGood.goodsDTO.id === selectItem.goodsDTO.id && selectItem.changeType !== 'del'
			})
			let sameBatchCode = this.orderItemList.find(store => {
				return store.details.find(item => {
					return item.batchCode === scanGood.batchCode && item.changeType !== 'del'
				})
			})
			// 条件一: 当前已选品项 不存在 扫码品项
			if (!~_index) {
				if (sameBatchCode) {
					this.$fxToast.success('该批次号已存在,不能扫码入库！')
				} else {
					this.itemList = [scanGood]
					this.addScanGood(scanGood)
					this.$fxToast.success('扫码添加品项成功！')
				}
			} else {
				let _unitIndex = orderItemArr.findIndex(selectItem => {
					return scanGood.goodsDTO.id === selectItem.goodsDTO.id && scanGood.unitDTO.id === selectItem.unitDTO.id && selectItem.changeType !== 'del'
				})
				// 条件二: 当前已选品项 存在 扫码品项 但是 单位不同
				if (!~_unitIndex) {
					this.$fxToast.fail('不能重复添加品项！')
					return false
				} else {
					// 条件三: 当前已选品项 存在 扫码品项 且 单位 一致 但是 批次号 在其他仓库存在
					if (sameBatchCode && sameBatchCode.id !== this.store.id) {
						this.$fxToast.success('该批次号已存在,不能扫码入库！')
						return false
					}
					let selectGood = orderItemArr[_index]
					// 条件四: 当前已选品项 存在 扫码品项 且 单位 一致 但是 批次号 不同
					if (selectGood.batchCode !== scanGood.batchCode && this.$fxUtils.isDef(selectGood.batchCode)) {
						this.itemList = [scanGood]
						this.refreshSelectItem(scanGood, selectGood)
						return false
					}
					// 条件五: 当前已选品项 存在 扫码品项 单位 一致 批次号 一致 或 扫码品项没有批次号
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
		addScanGood (scanGood) {
			// 设置金额
			this.calcMoney('amount', scanGood.busUnitInAmount, scanGood)
			this.pushSelectedItem(scanGood)
		},
		computedScanItemAmount (scanItem, selectGood) {
			const _amount = this.toFixedNumberSize(scanItem.busUnitInAmount + selectGood.busUnitInAmount)
			scanItem.busUnitInAmount = this.$fxCommon.checkAmountRange(_amount)
		},
		refreshSelectItem (scanGood, selectGood) {
			selectGood.busUnitInAmount = scanGood.busUnitInAmount
			selectGood.batchCode = scanGood.batchCode
			selectGood.productDate = scanGood.productDate
			selectGood.autoType = 3
			this.editItem(selectGood)
			// 修改金额
			this.calcMoney('amount', selectGood.busUnitInAmount, selectGood)
		},
		editItem (item) {
			if (item.id) this.$set(item, 'changeType', 'edit')
		}
		// }}}
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
		.item-class-content {
			// height:100%
			width: 120px
			overflow: scroll
			border-right: 1px solid $fxBorder
			.all-class {
				height: 44px
				line-height: 44px
				font-size: 12px
				text-indent: 14px
				&.is-active {
					background-color: $fxDefaultColor
					color: $fxWhite
				}
			}
			.big-class {
				width: 100%
				font-size: 12px
				overflow: hidden
				text-overflow : ellipsis
				white-space: nowrap
			}
			.small-class {
				width: 100%
				font-size:12px
				overflow: hidden
				&.is-active {
					background-color: $fxDefaultColor
					color: $fxWhite
				}
			}
		}
	}
	.item-details-content {
		flex: 1
		overflow: scroll
		position: relative
		.item-detail {
			width: 100%
			height: 80px
			display: flex
			flex-direction: row
			.item-details-img {
				width: 80px
				height: 100%
				padding: 5px
				box-sizing: border-box
				&>img {
					width: 100%
					height: 100%
				}
			}
			.item-details-params {
				flex:1
				overflow:hidden
				position:relative
				.item-details-name {
					width: 100%
					height: 30px
					line-height: 30px
					font-size: 12px
				}
				.item-details-spec {
					height: 30px
					line-height: 30px
					font-size: 10px
				}
			}
		}
	}
	.details-number-keyboard {
		z-index: 20
	}
	.item-detail-cell {
		width: 100%
		height: 80px
		display: flex
		flex-direction: row
		box-sizing: border-box
		border: 2px solid transparent
		&.is-active {
			border-color: $fxDefaultColor
		}
		.item-details-img {
			width: 80px
			height: 100%
			padding: 5px
			box-sizing:border-box
			&>img {
				width: 100%
				height: 100%
			}
		}
		.item-details-params {
			flex: 1
			overflow: hidden
			position: relative
			.item-details-name {
				width: 100%
				height: 30px
				line-height: 30px
				font-size: 12px
			}
			.item-details-spec {
				height: 30px
				line-height: 30px
				font-size: 10px
			}
			.item-details-amount {
				.item-details-count {
					font-weight: bold
					margin-right: 10px
				}
			}
			.item-edit-icon, .item-selected-icon {
				position: absolute
				background-repeat: no-repeat
				background-position: center
				background-size: 100%
				width: 20px
				height: 20px
				bottom: 0
				right: 5px
			}
			.item-edit-icon {
				background-image: url('~images/icon/icon-item-edit.png')
			}
			.item-selected-icon {
				background-image: url('~images/icon/icon-item-selected.png')
			}
		}
	}
}
</style>

