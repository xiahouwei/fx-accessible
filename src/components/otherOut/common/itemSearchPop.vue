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
			<van-collapse v-model="activeStoreNames" :border="false">
				<van-collapse-item :name="storeItem.id"
					v-for="storeItem in data"
					:key="storeItem.id"
					class="store-row"
					v-show="$fxCommon.storeFilter(storeItem, searchKey)"
				>
					<div slot="title" class="item-store-title-container">
						<w-icon v-show="!isDisabled" type='camera' @click="onCameraClick(storeItem)"></w-icon>
						<div class="item-store-title">
							<span class="fx-ellipsis">{{storeItem.name}}</span>
						</div>
					</div>
					<van-swipe-cell
						v-show="item.changeType !== 'del'"
						v-for="(item, index) in $fxCommon.detailFilter(storeItem.details, searchKey)"
						:ref="`details-row-${storeItem.id}-${item.goodsDTO.id}`"
						:key="`${storeItem.id}-${item.goodsDTO.id}`"
						:right-width="80"
						:disabled="isDisabled || focusing"
						class="item-row"
					>
						<itemInfoCell
							:itemData="item"
							:isDisabled="isDisabled"
							:disabledEditBtn="focusing"
							@on-item-focus="onItemFocus(arguments, `${storeItem.id}-${item.goodsDTO.id}`)"
							@on-item-blur="onItemBlur"
							@on-unit-edit="onUnitEdit"
							@on-item-edit="onSearchItemEdit"
						></itemInfoCell>
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
import itemInfoCell from '@/components/otherOut/common/ItemInfoCell.vue'
import itemRowEditPop from '@/components/otherOut/common/ItemRowEditPop.vue'
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
			unitActions: [],
			unitActionShow: false,
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
			let storeIndex = this.data.findIndex(storeItem => {
				return storeItem.id === item.houseDTO.id
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
		},
		getItemByRedCode (redCode) {
			// redCode = '2020831165303000001000002008311626247571522'
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
					qrCodeContent: barcode,
					houseId: this.scanStoreItem.id,
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
		toFixedNumberSize (data) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysPointSize))
		},
		// {{{计算税额
		calcMoney (target, amountOrMoney, itemData) {
			let { busUnitOutAmount, price, tax } = itemData
			let money = 0
			let moneyWithTax = 0
			let itemPrice = 0
			let itemTaxPrice = 0
			let amountOrMoneyFixedNum = this.toFixedNumberSize(amountOrMoney)
			if (itemData.giftFlag || (target === 'money' && amountOrMoneyFixedNum === 0)) {
				// 赠送、数量为0
				itemData.outMoney = 0
				return true
			}
			if (target === 'money') {
				money = amountOrMoneyFixedNum
				itemPrice = this.toFixedNumberSize(money / busUnitOutAmount)
				moneyWithTax = money * (1 + tax)
				itemTaxPrice = this.toFixedNumberSize(moneyWithTax / busUnitOutAmount)
			} else if (target === 'amount') {
				if (amountOrMoney !== '') {
					itemData.busUnitOutAmount = amountOrMoneyFixedNum
				}
				itemPrice = price
				// itemTaxPrice = taxPrice
				money = this.toFixedNumberSize(price * amountOrMoneyFixedNum)
				// moneyWithTax = this.toFixedNumberSize(taxPrice * amountOrMoneyFixedNum)
			} else if (target === 'moneyWithTax') {
				moneyWithTax = amountOrMoneyFixedNum
				itemTaxPrice = this.toFixedNumberSize(moneyWithTax / busUnitOutAmount)
				money = this.toFixedNumberSize(moneyWithTax / (1 + tax))
				itemPrice = this.toFixedNumberSize(money / busUnitOutAmount)
			} else if (target === 'taxPrice') {
				itemTaxPrice = amountOrMoneyFixedNum
				moneyWithTax = this.toFixedNumberSize(busUnitOutAmount * itemTaxPrice)
				itemPrice = this.toFixedNumberSize(itemTaxPrice / (1 + tax))
				money = this.toFixedNumberSize(itemPrice * busUnitOutAmount)
			} else if (target === 'price') {
				itemPrice = amountOrMoneyFixedNum
				money = this.toFixedNumberSize(itemPrice * busUnitOutAmount)
				itemTaxPrice = this.toFixedNumberSize(itemPrice * (1 + tax))
				moneyWithTax = this.toFixedNumberSize(busUnitOutAmount * itemTaxPrice)
			}
			itemData.outMoney = money
			itemData.price = itemPrice
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
		.item-row {
			border-bottom: 1px solid $fxBorder
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
}
</style>
