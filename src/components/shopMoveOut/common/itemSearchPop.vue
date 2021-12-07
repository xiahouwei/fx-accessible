<template>
	<div class="item-search-block">
		<w-header title="搜索品项" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div class="item-search clearfix">
			<van-search
				v-model="searchKey"
				placeholder="请输入搜索关键词"
				shape="round"
				/>
		</div>
		<div class="item-list" ref="details-content">
			<div class="item-store-title-container">
				<w-icon v-show="!isDisabled" type='camera' @click="onCameraClick"></w-icon>
			</div>
			<van-swipe-cell
				v-for="item in $fxCommon.detailFilter(data, searchKey)"
				v-show="item.changeType !== 'del'"
				:ref="`details-row-${item.id}-${item.goodsDTO.id}`"
				:key="`${item.id}-${item.goodsDTO.id}`"
				:disabled="isDisabled || focusing"
				class="item-row"
			>
				<itemInfoCell
					:itemData="item"
					:isDisabled="isDisabled"
					:disabledEditBtn="focusing"
					@on-item-edit="onSearchItemEdit"
					@on-item-focus="onItemFocus(arguments, `${item.id}-${item.goodsDTO.id}`)"
					@on-item-blur="onItemBlur"
				></itemInfoCell>
			</van-swipe-cell>
		</div>
		<div class="search-bottom">
			<van-button
				v-show="!isDisabled"
				class="bottom-btn fx-no-radius"
				type="primary"
				@click="onSearchConfirm"
			>保存</van-button>
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
import itemInfoCell from '@/components/shopMoveOut/common/ItemInfoCell.vue'
import itemRowEditPop from '@/components/shopMoveOut/common/ItemRowEditPop.vue'
export default {
	name: 'itemSearchPop',
	components: {
		itemInfoCell,
		itemRowEditPop
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
		isDisabled: Boolean,
		visibleFlag: Boolean,
		house: {
			type: Object,
			default: () => {
				return {}
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
			itemRowEditPopShow: false,
			itemEditRowData: {},
			activeStoreNames: [],
			scanActionShow: false,
			scanActions: [
				{ name: '累加数量' },
				{ name: '覆盖数量' }
			],
			scanStoreItem: {}
		}
	},
	watch: {
		visibleFlag: {
			handler (val) {
				if (val) {
					this.searchKey = ''
				}
			},
			immediate: true
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize',
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId
		})
	},
	methods: {
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
			let detailsIndex = this.data.findIndex(detailsItem => {
				return detailsItem.goodsDTO.id === item.goodsDTO.id
			})
			if (~detailsIndex) {
				this.data[detailsIndex] = item
			}
		},
		// }}}
		onSearchConfirm () {
			if (this.focusing) { // input不符合验证规则
				return false
			}
			this.$emit('on-search-confirm', this.data)
			this.$emit('update:visibleFlag', false)
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
		onCameraClick () {
			this.scanStoreItem = this.data
			this.$fxEventBus.$on('redCode', this.getItemByRedCode)
			this.$dialog.alert({
				title: '请扫码',
				message: `当前出库仓库：${this.house.name}`,
				confirmButtonText: '取消扫码',
				beforeClose (action, done) {
					this.$fxEventBus.$off('redCode', this.getItemByRedCode)
					done()
				}
				// overlay: false
			})
		},
		getItemByRedCode (redCode) {
			// redCode = '1234567899874000001200001905231708140872104'
			// redCode = this.redcode
			this.$dialog.close()
			this.$fxEventBus.$off('redCode', this.getItemByRedCode)
			if (!this.visibleFlag) {
				return false
			}
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
		getItemByCode (barcode, nextFlag = false) {
			return new Promise(resolve => {
				let params = {
					billType: 36,
					qrCodeContent: barcode,
					houseId: this.house.id,
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
			let _index = this.scanStoreItem.findIndex(selectItem => {
				return scanGood.goodsDTO.id === selectItem.goodsDTO.id && selectItem.changeType !== 'del'
			})
			// 条件一: 当前已选品项 不存在 扫码品项
			if (!~_index) {
				this.$fxToast.fail('当前仓库无此品项！')
				return false
			} else {
				let _unitIndex = this.scanStoreItem.findIndex(selectItem => {
					return scanGood.goodsDTO.id === selectItem.goodsDTO.id && scanGood.unitDTO.id === selectItem.unitDTO.id && selectItem.changeType !== 'del'
				})
				// 条件二: 当前已选品项 存在 扫码品项 但是 单位不同
				if (!~_unitIndex) {
					this.$fxToast.fail('不能重复添加品项！')
					return false
				} else {
					const selectGood = this.scanStoreItem[_unitIndex]
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
					})
				}
			}
		},
		computedScanItemAmount (scanItem, selectGood) {
			const _amount = this.toFixedNumberSize(scanItem.busUnitApplyAmount + selectGood.busUnitOutAmount)
			scanItem.busUnitApplyAmount = this.$fxCommon.checkAmountRange(_amount)
		},
		refreshSelectItem (scanItem, selectGood) {
			selectGood.batchCode = scanItem.batchCode
			selectGood.busUnitOutAmount = scanItem.busUnitApplyAmount
			this.editItem(selectGood)
			// 修改金额
			this.calcMoney('amount', scanItem.busUnitApplyAmount, selectGood)
		},
		editItem (item) {
			if (item.id) this.$set(item, 'changeType', 'edit')
		},
		// }}}
		toFixedNumberSize (data) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysPointSize))
		},
		// {{{计算税额并渲染
		calcMoney (target, amountOrMoney, itemData) {
			let { taxPrice, busUnitOutAmount, price, sendTaxes } = itemData
			let money = 0
			let moneyWithTax = 0
			let itemPrice = 0
			let itemTaxPrice = 0
			amountOrMoney = this.toFixedNumberSize(amountOrMoney)
			if (itemData.giftFlag || (target === 'money' && amountOrMoney === 0)) {
				// 赠送、数量为0
				itemData.sendMoney = 0
				itemData.sendMoneyWithTax = 0
				itemData.sendTaxMoney = 0
				return true
			}
			if (target === 'money') {
				money = amountOrMoney
				itemPrice = this.toFixedNumberSize(money / busUnitOutAmount)
				moneyWithTax = this.toFixedNumberSize(money * (1 + sendTaxes))
				itemTaxPrice = this.toFixedNumberSize(moneyWithTax / busUnitOutAmount)
			} else if (target === 'amount') {
				itemData.busUnitOutAmount = amountOrMoney
				itemPrice = price
				itemTaxPrice = taxPrice
				money = this.toFixedNumberSize(price * amountOrMoney)
				moneyWithTax = this.toFixedNumberSize(taxPrice * amountOrMoney)
			} else if (target === 'moneyWithTax') {
				moneyWithTax = amountOrMoney
				itemTaxPrice = this.toFixedNumberSize(moneyWithTax / busUnitOutAmount)
				money = this.toFixedNumberSize(moneyWithTax / (1 + sendTaxes))
				itemPrice = this.toFixedNumberSize(money / busUnitOutAmount)
			} else if (target === 'taxPrice') {
				itemTaxPrice = amountOrMoney
				moneyWithTax = this.toFixedNumberSize(busUnitOutAmount * itemTaxPrice)
				itemPrice = this.toFixedNumberSize(itemTaxPrice / (1 + sendTaxes))
				money = this.toFixedNumberSize(itemPrice * busUnitOutAmount)
			} else if (target === 'price') {
				itemPrice = amountOrMoney
				money = this.toFixedNumberSize(itemPrice * busUnitOutAmount)
				itemTaxPrice = this.toFixedNumberSize(itemPrice * (1 + sendTaxes))
				moneyWithTax = this.toFixedNumberSize(busUnitOutAmount * itemTaxPrice)
			}
			itemData.sendMoney = money
			itemData.sendMoneyWithTax = moneyWithTax
			itemData.sendTaxMoney = this.toFixedNumberSize(this.toFixedNumberSize(moneyWithTax) - this.toFixedNumberSize(money))
			itemData.price = itemPrice
			itemData.taxPrice = itemTaxPrice
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
@import '~$assets/stylus/extend.styl'
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
		.item-store-title {
			height:40px
			line-height:40px
			font-size:12px
			text-indent:10px
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
