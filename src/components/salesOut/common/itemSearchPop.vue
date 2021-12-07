<template>
	<div class="item-search-block">
		<w-header title="搜索品项" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<searchHead :initSearch="visibleFlag" :searchKey.sync="searchKey" :selectActive="isSelectAll" @on-select-click="onSelectAllClick" @on-confirm-key="onConfirmKey"></searchHead>
		<!--<input type="text" v-model="redCode">-->
		<div class="item-list" ref="details-content">
			<van-collapse v-model="activeStoreNames" :border="false">
				<van-collapse-item name="1"
					v-for="storeItem in data"
					:key="`${storeItem.id}`"
					class="store-row"
					v-show="storeShowComputed(storeItem)"
				>
					<div slot="title" class="item-store-title-container">
						<w-icon v-show="!isDisabled" type='camera' @click="onCameraClick(storeItem)"></w-icon>
						<div class="item-store-title">
							<span class="fx-ellipsis">{{storeItem.name}}</span>
						</div>
					</div>
					<van-swipe-cell
						v-show="item.changeType !== 'del' && item.showFlag"
						v-for="(item, index) in detailFilter(storeItem.details)"
						:ref="`details-row-${item.goodsDTO.id}-${item.goodsUUid}`"
						:key="`${item.goodsDTO.id}-${item.goodsUUid}`"
						:right-width="80"
						:disabled="isDisabled || focusing"
						class="item-row"
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
								:disabledEditBtn="focusing"
								@on-item-edit="onSearchItemEdit"
								@on-unit-edit="onUnitEdit"
								@on-item-focus="onItemFocus(arguments, `${item.goodsDTO.id}-${item.goodsUUid}`)"
								@on-item-blur="onItemBlur"
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
				:isDisabled="isDisabled"
				@on-Confirm="onEditRowConfirm"
			></itemRowEditPop>
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
import itemInfoCell from '@/components/salesOut/common/ItemInfoCell.vue'
import itemRowEditPop from '@/components/salesOut/common/ItemRowEditPop.vue'
import searchHead from '@/components/common/searchHead.vue'
import checkBox from '@/components/common/CheckBox.vue'
export default {
	name: 'itemSearchPop',
	components: {
		itemInfoCell,
		itemRowEditPop,
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
		shopId: {
			type: String,
			default: ''
		},
		customerId: {
			type: String,
			default: ''
		},
		isDisabled: Boolean,
		visibleFlag: Boolean
	},
	data () {
		return {
			focusing: false,
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			searchKey: '',
			itemRowEditPopShow: false,
			itemEditRowData: {},
			unitActions: [],
			unitActionShow: false,
			activeStoreNames: ['1'],
			scanActionShow: false,
			scanActions: [
				{ name: '累加数量' },
				{ name: '覆盖数量' }
			],
			scanStoreItem: {}
			// redCode: ''
		}
	},
	watch: {
		visibleFlag: {
			handler (val) {
				if (val) {
					this.searchKey = ''
					this.showData(this.data)
					this.setDetailGoodsUUid(this.data)
				}
			},
			immediate: true
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize',
			sysMoneyPointSize: 'sysMoneyPointSize',
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId
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
		// {{{外销出库单分批之后可以生成相同仓库下相同品项，故设置uuid，唯一标示key值
		setDetailGoodsUUid (data) {
			data.forEach(dataItem => {
				dataItem.details.forEach(item => {
					item.goodsUUid = this.$fxUtils.createUUID()
				})
			})
		},
		// }}}
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
			let detailsIndex = this.data[0].details.findIndex(detailsItem => {
				return detailsItem.goodsDTO.id === item.goodsDTO.id && detailsItem.changeType !== 'del'
			})
			if (~detailsIndex) {
				this.data[0].details[detailsIndex] = item
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
			let amount = parseFloat(item.busUnitOutAmount)
			if (amount > 0) {
				amount = amount * oldUnitRate / newUnit.value
				item.busUnitOutAmount = parseFloat(this.$fxUtils.toFixedSHW(amount, this.sysPointSize))
				this.calcMoney('moneyWithTax', item.sendMoneyWithTax, item)
			} else {
				item.taxPrice = parseFloat(item.taxPrice) * newUnit.value / oldUnitRate
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
			let { taxPrice, busUnitOutAmount, price, sendTaxes } = itemData
			let money = 0
			let moneyWithTax = 0
			let itemPrice = 0
			let itemTaxPrice = 0
			let amountOrMoneyFixedNum = this.toFixedNumberSize(amountOrMoney)
			if (itemData.giftFlag || (target === 'money' && amountOrMoneyFixedNum === 0)) {
				// 赠送、数量为0
				itemData.sendMoney = 0
				itemData.sendMoneyWithTax = 0
				itemData.sendTaxMoney = 0
				return true
			}
			if (target === 'money') {
				money = amountOrMoneyFixedNum
				itemPrice = this.toFixedNumberSize(money / busUnitOutAmount)
				moneyWithTax = money * (1 + sendTaxes)
				itemTaxPrice = this.toFixedNumberSize(moneyWithTax / busUnitOutAmount)
			} else if (target === 'amount') {
				itemData.busUnitOutAmount = this.toFixedNumberSize(amountOrMoney, this.sysPointSize)
				itemPrice = price
				itemTaxPrice = taxPrice
				money = this.toFixedNumberSize(price * amountOrMoneyFixedNum)
				moneyWithTax = this.toFixedNumberSize(taxPrice * amountOrMoneyFixedNum)
			} else if (target === 'moneyWithTax') {
				moneyWithTax = amountOrMoneyFixedNum
				itemTaxPrice = this.toFixedNumberSize(moneyWithTax / busUnitOutAmount)
				money = this.toFixedNumberSize(moneyWithTax / (1 + sendTaxes))
				itemPrice = this.toFixedNumberSize(money / busUnitOutAmount)
			} else if (target === 'taxPrice') {
				itemTaxPrice = amountOrMoneyFixedNum
				moneyWithTax = this.toFixedNumberSize(busUnitOutAmount * itemTaxPrice)
				itemPrice = this.toFixedNumberSize(itemTaxPrice / (1 + sendTaxes))
				money = this.toFixedNumberSize(itemPrice * busUnitOutAmount)
			} else if (target === 'price') {
				itemPrice = amountOrMoneyFixedNum
				money = this.toFixedNumberSize(itemPrice * busUnitOutAmount)
				itemTaxPrice = this.toFixedNumberSize(itemPrice * (1 + sendTaxes))
				moneyWithTax = this.toFixedNumberSize(busUnitOutAmount * itemTaxPrice)
			}
			itemData.sendMoney = money
			itemData.sendMoneyWithTax = moneyWithTax
			itemData.sendTaxMoney = this.toFixedNumberSize(this.toFixedNumberSize(moneyWithTax) - this.toFixedNumberSize(money))
			itemData.price = itemPrice
			itemData.taxPrice = itemTaxPrice
		},
		// }}}
		toFixedNumberSize (data, pointSize = this.sysMoneyPointSize) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, pointSize))
		},
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
		// {{{扫码
		onCameraClick (storeItem) {
			this.scanStoreItem = storeItem
			this.$fxEventBus.initEvent(this, 'redCode', this.getItemByRedCode)
			this.$dialog.alert({
				title: '请扫码',
				message: `当前出库仓库：${storeItem.name}`,
				confirmButtonText: '取消扫码',
				beforeClose (action, done) {
					this.$fxEventBus.$off('redCode', this.getItemByRedCode)
					done()
				}
				// overlay: false
			})
			// this.getItemByRedCode()
		},
		getItemByRedCode (redCode) {
			// redCode = '235369875212300000140000201015154707444672220201019202020'
			// redCode = this.redCode
			if (!this.visibleFlag) {
				return false
			}
			if (redCode.length <= 24) {
				this.onRedCodeHandler(redCode)
			} else { // 扫描二维码
				this.onRedTwoCodeHandler(redCode)
			}
		},
		onRedCodeHandler (redCode) {
			if (!this.visibleFlag) {
				return false
			}
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
		onRedTwoCodeHandler (redCode) {
			// redCode = '2020831165303000001000002008311626247571522'
			this.getItemByTwoCode(redCode, false).then(res => {
				if (res.errorCode === '100' || res.errorCode === '101') {
					this.$dialog.confirm({
						title: '提示',
						message: res.message
					}).then(() => {
						if (res.errorCode === '100') {
							this.createBreakBill(res.storeBillDetailDTO)
							return true
						}
						this.getItemByTwoCode(redCode, true).then(res => {
							this.getScanGoodData(res.storeBillDetailDTO)
						})
					}).catch(() => {
						return false
					})
				} else {
					this.getScanGoodData(res.storeBillDetailDTO)
				}
			})
		},
		getItemByTwoCode (barcode, nextFlag = false) {
			return new Promise(resolve => {
				let params = {
					qrCodeContent: barcode,
					houseId: this.scanStoreItem.id,
					customerId: this.customerId,
					billType: 30,
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
		getScanGoodData (goods) {
			this.setScanGood(goods)
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
				let _unitIndex = this.scanStoreItem.details.findIndex(selectItem => {
					return scanGood.goodsDTO.id === selectItem.goodsDTO.id && scanGood.unitDTO.id === selectItem.unitDTO.id && selectItem.changeType !== 'del'
				})
				// 条件二: 当前已选品项 存在 扫码品项 但是 单位不同
				if (!~_unitIndex) {
					this.$fxToast.fail('不能重复添加品项！')
					return false
				} else {
					const selectGood = this.scanStoreItem.details[_unitIndex]
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
					})
				}
			}
		},
		computedScanItemAmount (scanItem, selectGood) {
			const _amount = this.toFixedNumberSize(scanItem.busUnitOutAmount + selectGood.busUnitOutAmount)
			scanItem.busUnitOutAmount = this.$fxCommon.checkAmountRange(_amount)
		},
		refreshSelectItem (scanItem, selectGood) {
			selectGood.busUnitOutAmount = scanItem.busUnitOutAmount
			selectGood.batchCode = scanItem.batchCode
			this.editItem(selectGood)
			// 修改金额
			this.calcMoney('amount', selectGood.busUnitOutAmount, selectGood)
		},
		editItem (item) {
			if (item.id) this.$set(item, 'changeType', 'edit')
		},
		// }}}
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
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.item-search-block {
	height: 100%;
	background:$fxWhite
	display: flex
	flex-direction: column
	overflow-x: hidden
	.item-list {
		flex:1
		overflow:scroll
		position: relative
		text-align: left
		padding: 0 13px
		width: 350px
		.item-store-title-container {
			display:flex
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
		.store-right-name{
			display:inline-block
			height:40px
			line-height:40px
			width: 141px
			text-align: right
			text-align: right
			float: right
		}
		.item-row {
			border-bottom:1px solid $fxBorder
			.item-row-delete {
				background-color:$fxRed
				color:$fxWhite
				font-size: 15px
				width: 80px;
				height: 100%
				line-height: 80px;
				display: inline-block;
				text-align: center;
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
		width:100%
		display: flex
		flex-direction: row
		.bottom-btn {
			flex:1
			padding:0
			overflow:hidden
		}
	}
}
</style>
