<template>
	<div class="item-search-block">
		<w-header title="搜索品项" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<searchHead :initSearch="visibleFlag" :searchKey.sync="searchKey" :selectActive="isSelectAll" @on-select-click="onSelectAllClick" @on-confirm-key="onConfirmKey"></searchHead>
		<div class="item-list" ref="details-content">
			<van-collapse v-model="activeStoreNames" :border="false">
				<van-collapse-item :name="storeItem.id"
                   v-for="storeItem in data"
                   :key="storeItem.id"
                   class="store-row"
                   v-show="storeShowComputed(storeItem)"
				>
					<div slot="title" class="item-store-title-container">
						<w-icon v-show="!isDisabled" type='camera' @click="onCameraClick(storeItem)"></w-icon>
						<div class="item-store-title">
							<div class="fx-ellipsis">{{storeItem.name}}</div>
						</div>
					</div>
					<van-swipe-cell
						v-for="(item, index) in detailFilter(storeItem.details)"
						:key="`${storeItem.id}-${item.goodsDTO.id}-${index}`"
						class="item-row"
						:right-width="80"
						v-show="item.changeType !== 'del' && item.showFlag"
						:ref="`details-row-${storeItem.id}-${item.goodsDTO.id}`"
						:disabled="isDisabled || focusing"
					>
						<div class="item-cell">
							<checkBox
								:visibleFlag="!isDisabled"
								:checked="item.checked"
								class="search-checkbox"
								@on-checkbox-click="onCheckBoxClick(item)"
							></checkBox>
							<itemInfoCell
								:itemData="item"
								:isDisabled="isDisabled"
								:sysStockInChangeUnit="sysStockInChangeUnit"
								:disabledEditBtn="focusing"
								@on-item-focus="onItemFocus(arguments, `${storeItem.id}-${item.goodsDTO.id}`)"
								@on-item-blur="onItemBlur"
								@on-unit-edit="onUnitEdit"
								@on-item-edit="onSearchItemEdit"
								class="search-info"
							></itemInfoCell>
						</div>
						<div slot="right" class="item-row-delete" @click="onDeleteClick(item, index, storeItem.details)">删除</div>
					</van-swipe-cell>
				</van-collapse-item>
			</van-collapse>
		</div>
		<div class="search-bottom">
			<van-button
				v-show="!isDisabled"
				class="bottom-btn fx-no-radius"
				type="primary"
				@click="onSearchConfirm"
			>保存</van-button>
			<van-button
				v-show="!isDisabled"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onSelectConfirm"
			>删除</van-button>
			<van-button
				v-show="!isDisabled && $fxAuth('shopStockInBill.batchSetProducedate')"
				class="bottom-btn fx-no-radius"
				type="info"
				@click="onSetProduceDate"
			>批量设置</van-button>
		</div>
		<van-popup
			v-model="itemRowEditPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<itemRowEditPop
				:visibleFlag.sync="itemRowEditPopShow"
				:itemData="itemEditRowData"
				:selcetPictureMode="selcetPictureMode"
				@on-selcet-iamge="selcetPictureActionsheet=true"
				@on-Confirm="onEditRowConfirm"
			></itemRowEditPop>
		</van-popup>
		<van-actionsheet
			v-model="selcetPictureActionsheet"
			:actions="actions"
			cancel-text="取消"
			@select="onSelect"
		/>
		<van-popup
			v-model="showBatchProduceDate"
			class="center-popup"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<batchProduceDate
				:visibleFlag.sync="showBatchProduceDate"
				@on-Confirm="onBatchProduceDate"
			></batchProduceDate>
		</van-popup>
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
import itemInfoCell from '@/components/stockInBill/common/ItemInfoCell.vue'
import itemRowEditPop from '@/components/stockInBill/common/ItemRowEditPop.vue'
import batchProduceDate from '@/components/stockInBill/common/batchProduceDate.vue'
import searchHead from '@/components/common/searchHead.vue'
import checkBox from '@/components/common/CheckBox.vue'
export default {
	name: 'itemSearchPop',
	components: {
		itemInfoCell,
		itemRowEditPop,
		batchProduceDate,
		searchHead,
		checkBox
	},
	props: {
		data: {
			type: Array,
			default: () => {
				return []
			}
		},
		sysStockInChangeUnit: Boolean,
		isDisabled: Boolean,
		visibleFlag: Boolean,
		supplierId: String,
		billId: {
			type: String,
			default: () => {
				return ''
			}
		}
	},
	data () {
		return {
			focusing: false,
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			searchKey: '',
			unitActions: [],
			unitActionShow: false,
			itemRowEditPopShow: false,
			itemEditRowData: {},
			activeStoreNames: [],
			showBatchProduceDate: false,
			currentDate: new Date(),
			datePickerShow: false,
			scanActionShow: false,
			scanActions: [
				{ name: '累加数量' },
				{ name: '覆盖数量' }
			],
			scanStoreItem: {},
			selcetPictureActionsheet: false,
			selcetPictureMode: {},
			actions: [{
				name: '拍摄',
				value: 'Camera'
			}, {
				name: '从手机相册选择',
				value: 'Library'
			}]
		}
	},
	watch: {
		visibleFlag: {
			handler (val) {
				if (val) {
					this.searchKey = ''
					this.showData(this.data)
					// 展开折叠
					this.data.forEach(storeItem => {
						let hasDetails = storeItem.details.filter(item => {
							return item.changeType !== 'del'
						}).length
						if (hasDetails > 0) {
							this.activeStoreNames.push(storeItem.id)
						}
					})
				}
			},
			immediate: true
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize'
		}),
		isSelectAll () {
			// 单据下发称重或者单据审核全选按钮隐藏
			if (this.isDisabled) {
				return ''
			}
			let selectItemL = 0
			let dataL = 0
			this.data.forEach(storeItem => {
				let searchItems = this.detailFilter(storeItem.details)
				selectItemL += searchItems.filter(item => {
					return item.changeType !== 'del' && item.showFlag && item.checked
				}).length
				dataL += searchItems.length
			})
			if (selectItemL === 0) {
				return false
			} else if (selectItemL === dataL) {
				return true
			} else {
				return false
			}
		}
	},
	methods: {
		onSelect (item) {
			this.selcetPictureMode = {
				...item,
				random: Math.random()
			}
			this.selcetPictureActionsheet = false
		},
		storeShowComputed (store) {
			return this.detailFilter(store.details).length > 0
		},
		detailFilter (items, searchKeywords = 'code,name,pinYin') {
			return items.filter(item => {
				return item.changeType !== 'del' && item.showFlag && !!searchKeywords.split(',').find(itemKey => {
					if (item.goodsDTO[itemKey].toLowerCase().includes(this.searchKey.toLowerCase())) {
						return true
					}
				})
			})
		},
		onCloseClick () {
			if (this.focusing) { // input不符合验证规则
				return false
			}
			this.$emit('update:visibleFlag', false)
		},
		onDeleteClick (item, index, details) {
			if (item.id) {
				this.$set(item, 'changeType', 'del')
			} else {
				details.splice(index, 1)
			}
		},
		onItemFocus (arg, uuid) {
			this.focusing = true
		},
		onItemBlur () {
			this.focusing = false
		},
		// {{{ 编辑行其他数据
		onSearchItemEdit (itemData) {
			this.itemEditRowData = itemData
			this.itemRowEditPopShow = true
		},
		onEditRowConfirm (item) {
			let storeIndex = this.data.findIndex(storeItem => {
				return storeItem.id === item.inHouseDTO.id
			})
			if (~storeIndex) {
				let detailsIndex = this.data[storeIndex].details.findIndex(detailsItem => {
					return detailsItem.goodsDTO.id === item.goodsDTO.id
				})
				if (~detailsIndex) {
					this.data[storeIndex].details[detailsIndex] = item
				}
			}
		},
		// }}}
		// {{{切换单位
		onUnitEdit (item) {
			this.itemEditRowData = item
			this.getItemUnit(item.goodsDTO.id).then(res => {
				this.unitActions = res
				this.unitActionShow = true
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
			item.unitDTO = unit
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
		// }}}
		onSearchConfirm () {
			if (this.focusing) { // input不符合验证规则
				return false
			}
			// 去除被选状态
			this.data.forEach(storeItem => {
				storeItem.details.forEach(item => {
					delete item.checked
				})
			})
			this.$emit('on-search-confirm', this.data)
			this.$emit('update:visibleFlag', false)
		},
		// {{{ 删除
		onCheckBoxClick (item) {
			if (this.focusing) { // input不符合验证规则
				return false
			}
			this.$set(item, 'checked', !item.checked)
		},
		onSelectAllClick () {
			let flag = !this.isSelectAll
			this.data.forEach(storeItem => {
				let searchItem = this.detailFilter(storeItem.details)
				searchItem.forEach(item => {
					if (item.changeType !== 'del') {
						this.$set(item, 'checked', flag)
					}
				})
			})
		},
		onSelectConfirm () {
			let checkedItem = this.data.find(storeItem => {
				return storeItem.details.find(item => {
					return item.checked && item.changeType !== 'del'
				})
			})
			if (!checkedItem) {
				this.$fxToast.top('请先选择品项!')
				return true
			}
			this.$dialog.confirm({
				title: '提示',
				message: '是否删除？'
			}).then(() => {
				this.data.forEach(storeItem => {
					let details = storeItem.details
					for (let i = details.length - 1; i >= 0; i--) {
						let item = details[i]
						if (!item.checked) {
							continue
						}
						if (item.id) {
							this.$set(item, 'changeType', 'del')
						} else {
							storeItem.details.splice(i, 1)
						}
					}
				})
			})
		},
		// }}}
		// {{{扫码
		// {{{ 扫码
		onCameraClick (storeItem) {
			this.scanStoreItem = storeItem
			this.$fxEventBus.initEvent(this, 'redCode', this.getItemByRedCode)
			this.$dialog.alert({
				title: '请扫码',
				message: `当前入库仓库：${storeItem.name}`,
				confirmButtonText: '取消扫码',
				beforeClose (action, done) {
					this.$fxEventBus.$off('redCode', this.getItemByRedCode)
					done()
				}
				// overlay: false
			})
		},
		getItemByRedCode (redCode) {
			// redCode = '235369875212300000140000201015154707444672220201019202020'
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
					this.setScanGood(goods)
				})
			}
		},
		onRedCodeHandler (redCode) {
			this.getItemByCode(redCode).then(res => {
				let goods = res.billAndDetails[0]
				if (goods.length === 0) {
					this.$fxToast.top('当前仓库无此品项!')
					return false
				}
				this.hideItemData(this.data)
				let showItem = null
				for (let i = 0; i < this.data.length; i++) {
					showItem = this.data[i].details.find(item => {
						return item.goodsDTO.id === goods.goodsDTO.id && item.changeType !== 'del'
					})
					if (showItem) {
						break
					}
				}
				if (showItem) {
					this.itemUpdate(goods, showItem)
					this.$set(showItem, 'showFlag', true)
				} else {
					this.$fxToast.top('无此品项!')
				}
				this.searchKey = ''
			})
		},
		itemUpdate (codeItem, showItem) {
			const unitDTO = showItem.unitDTO
			const currentUnitDTO = codeItem.unitDTO
			const ratio = currentUnitDTO.value / unitDTO.value
			const countValue = codeItem.goodsDTO.countValue * ratio
			if (showItem.id) {
				this.$set(showItem, 'changeType', 'edit')
			}
			this.calcMoney('amount', countValue, showItem)
		},
		getItemByCode (barCodes) {
			return new Promise(resolve => {
				let params = {
					m: 'getGoodsByBarCode4Modify',
					barCodes: barCodes
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/goods`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		hideItemData (data) {
			data.forEach(storeItem => {
				storeItem.details.forEach(item => {
					this.$set(item, 'showFlag', false)
				})
			})
		},
		// 默认显示所有数据
		showData (data) {
			data.forEach(storeItem => {
				storeItem.details.forEach(item => {
					this.$set(item, 'showFlag', true)
				})
			})
		},
		onConfirmKey () {
			if (this.searchKey !== '') {
				return
			}
			this.showData(this.data)
		},
		// }}}
		// {{{ 扫二维码
		getItemByTwoCode (barcode) {
			return new Promise(resolve => {
				let params = {
					billId: this.billId,
					qrCodeContent: barcode,
					houseId: this.scanStoreItem.id,
					supplierId: this.supplierId,
					billType: '20'
				}
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/accounts/${this.shopId}/users/${this.loginerId}/getscancodedata`,
					query: params
				}).then(res => {
					resolve(res.storeBillDetailDTO)
				})
			})
		},
		setScanGood (scanGood) {
			let _index = this.scanStoreItem.details.findIndex(selectItem => {
				return scanGood.goodsDTO.id === selectItem.goodsDTO.id && selectItem.changeType !== 'del'
			})
			// 条件一: 当前已选品项 不存在 扫码品项
			if (!~_index) {
				this.$fxToast.fail('当前仓库无此品项！')
				return false
			} else {
				let _unitIndexs = this.$fxUtils.appointedMap(this.scanStoreItem.details, (selectItem, index) => {
					if (scanGood.goodsDTO.id === selectItem.goodsDTO.id && scanGood.unitDTO.id === selectItem.unitDTO.id && selectItem.changeType !== 'del') {
						return index
					}
				})
				// 条件二: 当前已选品项 存在 扫码品项 但是 单位不同
				if (!_unitIndexs.length) {
					this.$fxToast.fail('不能重复添加品项！')
					return false
				} else {
					// 条件三: 当前已选品项 存在 扫码品项 且 单位 一致 但是 批次号 在其他仓库存在
					let sameBatchCode = this.data.find(store => {
						return store.details.find(item => {
							return item.batchCode === scanGood.batchCode && item.changeType !== 'del'
						})
					})
					if (sameBatchCode && sameBatchCode.id !== this.scanStoreItem.id) {
						this.$fxToast.success('该批次号已存在,不能扫码入库！')
						return false
					}
					const selectGoodIndex = _unitIndexs.find(unitIndex => {
						return this.scanStoreItem.details[unitIndex].batchCode === scanGood.batchCode
					})
					let selectGood = {}
					if (selectGoodIndex) {
						selectGood = this.scanStoreItem.details[selectGoodIndex]
					} else {
						selectGood = this.scanStoreItem.details[_unitIndexs[0]]
					}
					// 条件四: 当前已选品项 存在 扫码品项 且 单位 一致 但是 批次号 不同
					if (selectGood.batchCode !== scanGood.batchCode && this.$fxUtils.isDef(selectGood.batchCode)) {
						this.refreshSelectItem(scanGood, selectGood)
						return false
					}
					// 条件五: 当前已选品项 存在 扫码品项 单位 一致 批次号 一致 或 扫码品项没有批次号
					this.$refs.scanActionSheet.doSelect().then(item => {
						if (item.name === '累加数量') {
							this.computedScanItemAmount(scanGood, selectGood)
						}
						this.refreshSelectItem(scanGood, selectGood)
					})
				}
			}
		},
		computedScanItemAmount (scanItem, selectGood) {
			const _amount = this.toFixedNumberSize(scanItem.busUnitInAmount + selectGood.busUnitInAmount)
			scanItem.busUnitInAmount = this.$fxCommon.checkAmountRange(_amount)
		},
		refreshSelectItem (scanItem, selectGood) {
			selectGood.busUnitInAmount = scanItem.busUnitInAmount
			selectGood.batchCode = scanItem.batchCode
			selectGood.productDate = scanItem.productDate
			selectGood.autoType = 3
			this.editItem(selectGood)
			// 修改金额
			this.calcMoney('amount', selectGood.busUnitInAmount, selectGood)
		},
		editItem (item) {
			if (item.id) this.$set(item, 'changeType', 'edit')
		},
		// }}}
		// {{{ 批量设置生产日期
		onSetProduceDate () {
			let checkedItem = this.data.find(storeItem => {
				return storeItem.details.find(item => {
					return item.checked && item.changeType !== 'del'
				})
			})
			if (!checkedItem) {
				this.$fxToast.top('请先选择品项!')
				return true
			}
			this.showBatchProduceDate = true
		},
		onBatchProduceDate (produceDate) {
			this.data.forEach(storeItem => {
				let details = storeItem.details
				for (let i = details.length - 1; i >= 0; i--) {
					let item = details[i]
					if (!item.checked) {
						continue
					}
					item.productDate = produceDate
					if (item.id) this.$set(item, 'changeType', 'edit')
				}
			})
		}
		// }}}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
@import '~$assets/stylus/extend.styl'
.item-search-block {
	height: 100%
	background: $fxWhite
	display: flex
	flex-direction: column
	overflow-x: hidden
	.item-list {
		flex: 1
		overflow: scroll
		position: relative
		text-align: left
		padding: 0 13px
		width: 350px
		.item-store-title-container {
			display: flex
			flex-direction: row
			align-items: center
			font-size: 12px
			height: 40px
			.item-store-title {
				display: flex
				flex-direction: row
				justify-content: space-between
				align-items: center
				flex: 1
				margin-left: 10px
			}
		}
		.item-row {
			border-bottom:1px solid $fxBorder
			.item-row-delete {
				background-color: $fxRed
				color: $fxWhite
				font-size: 15px
				width: 80px
				height: 100%
				line-height: 80px
				display: inline-block
				text-align: center
			}
		}
		.search-checkbox {
			width: 25px
		}
		.item-cell {
			display: flex
			flex-flow: row
			align-items: center
		}
		.search-info{
			flex: 1
			overflow: hidden
		}
	}
	.search-bottom {
		width: 100%
		display: flex
		flex-direction: row
		.bottom-btn {
			flex: 1
			padding: 0
			overflow: hidden
		}
	}
	.center-popup {
		width: 100%
		height: 100%
		background-color: rgba(0, 0, 0, 0.7)
	}
}
</style>
