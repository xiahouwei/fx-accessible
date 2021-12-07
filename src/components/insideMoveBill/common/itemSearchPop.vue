<template>
	<div class="item-search-block">
		<w-header title="搜索品项" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<searchHead :initSearch="visibleFlag" :searchKey.sync="searchKey" :selectActive="isSelectAll" @on-select-click="onSelectAllClick"></searchHead>
    <!--<input type="text" v-model="redCode">-->
    <div class="item-list" ref="details-content">
			<div slot="title" class="item-store-title-container">
				<w-icon v-show="!isDisabled && data.length && !autoType8" type='camera' @click="onCameraClick()"></w-icon>
			</div>
			<van-swipe-cell
				v-for="(item, index) in $fxCommon.detailFilter(data, searchKey)"
				v-show="item.changeType !== 'del'"
				:ref="`details-row-${item.goodsDTO.id}`"
				:key="item.goodsDTO.id"
				class="item-row"
				:right-width="80"
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
						:disabledEditBtn="focusing"
						:autoType8="autoType8"
						@on-item-focus="onItemFocus(arguments, `${item.goodsDTO.id}`)"
						@on-item-blur="onItemBlur"
						@on-unit-edit="onUnitEdit"
						@on-item-edit="onSearchItemEdit"
						class="search-info"
					></itemInfoCell>
				</div>
				<div slot="right" class="item-row-delete" @click="onDeleteClick(item, index, data)">删除</div>
			</van-swipe-cell>
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
		<van-actionsheet
			v-model="unitActionShow"
			:actions="unitActions"
			cancel-text="取消"
			@select="onUnitSelect"
		/>
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
import itemInfoCell from '@/components/insideMoveBill/common/ItemInfoCell.vue'
import itemRowEditPop from '@/components/insideMoveBill/common/itemRowEditPop.vue'
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
		houseDTO: {
			type: Object,
			default: () => {
				return {}
			}
		},
		outHouseId: String,
		shopId: {
			type: String,
			default: ''
		},
		isDisabled: Boolean,
		visibleFlag: Boolean,
		autoType8: Boolean
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
			scanActionShow: false,
			scanActions: [
				{ name: '累加数量' },
				{ name: '覆盖数量' }
			]
			// redCode: ''
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
			sysPointSize: 'sysPointSize'
		}),
		isSelectAll () {
			// 单据下发称重或者单据审核全选按钮隐藏
			if (this.isDisabled) {
				return ''
			}
			let selectItemL = 0
			let dataL = 0
			let searchItems = this.$fxCommon.detailFilter(this.data, this.searchKey)
			selectItemL = searchItems.filter(item => {
				return item.changeType !== 'del' && item.checked
			}).length
			dataL = searchItems.length

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
		onCloseClick () {
			if (this.focusing) { // input不符合验证规则
				return false
			}
			this.$emit('update:visibleFlag', false)
		},
		onDeleteClick (item, index, details) {
			if (item.id) {
				this.$set(item, 'changeType', 'del')
				this.$set(item, 'busUnitInAmount', 0)
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
			let index = this.data.findIndex(detailsItem => {
				return detailsItem.id === item.id
			})
			if (~index) {
				this.data[index] = item
			}
		},
		// }}}
		// {{{ 修改单位
		onUnitEdit (item) {
			this.itemEditRowData = item
			this.getItemUnit(item.goodsDTO.id).then(res => {
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
			let item = this.itemEditRowData
			let oldUnitRate = item.unitDTO.value // 新增的品项明细获取之前单位换算值方式
			let newUnit = unit // 新增的品项明细获取之后单位换算值方式
			let rate = oldUnitRate / unit.value
			let busUnitInAmount = parseFloat(this.$fxUtils.toFixedSHW(item.busUnitInAmount * rate, this.sysPointSize))
			item.unitDTO = unit
			item.busUnitInAmount = busUnitInAmount
			// 数量为 0 时不反算单价
			if (item.busUnitInAmount === 0) {
				item.price = parseFloat(this.$fxUtils.toFixedSHW(item.price * newUnit.value / oldUnitRate, this.sysPointSize))
				item.taxPrice = parseFloat(this.$fxUtils.toFixedSHW(item.taxPrice * newUnit.value / oldUnitRate, this.sysPointSize))
			} else {
				item.price = parseFloat(this.$fxUtils.toFixedSHW(item.inMoney / item.busUnitInAmount, this.sysPointSize))
				item.taxPrice = parseFloat(this.$fxUtils.toFixedSHW(item.inMoneyWithTax / item.busUnitInAmount, this.sysPointSize))
			}
			if (item.id) {
				item.changeType = 'edit'
			}
		},
		// }}}
		onSearchConfirm () {
			if (this.focusing) { // input不符合验证规则
				return false
			}
			// 去除被选状态
			this.data.forEach(item => {
				delete item.checked
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
			let searchItem = this.$fxCommon.detailFilter(this.data, this.searchKey)
			searchItem.forEach(item => {
				if (item.changeType !== 'del') {
					this.$set(item, 'checked', flag)
				}
			})
		},
		onSelectConfirm () {
			let checkedItem = this.data.find(item => {
				return item.checked && item.changeType !== 'del'
			})
			if (!checkedItem) {
				this.$fxToast.top('请先选择品项!')
				return true
			}
			this.$dialog.confirm({
				title: '提示',
				message: '是否删除？'
			}).then(() => {
				let details = this.data
				for (let i = details.length - 1; i >= 0; i--) {
					let item = details[i]
					if (!item.checked) {
						continue
					}
					if (item.id) {
						this.$set(item, 'changeType', 'del')
					} else {
						this.data.splice(i, 1)
					}
				}
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
		onCameraClick () {
			this.scanStoreItem = this.data
			this.$fxEventBus.initEvent(this, 'redCode', this.getItemByRedCode)
			this.$dialog.alert({
				title: '请扫码',
				message: `当前入库仓库：${this.houseDTO.name}`,
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
			// redCode = 1234567899874336000
			// redCode = this.redCode
			if (!this.visibleFlag) {
				return false
			}
			// 扫描二维码
			this.onRedTwoCodeHandler(redCode)
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
					houseId: this.houseDTO.id,
					outHouseId: this.outHouseId,
					billType: 23,
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
			const _amount = this.toFixedNumberSize(scanItem.busUnitInAmount + selectGood.busUnitInAmount)
			scanItem.busUnitInAmount = this.$fxCommon.checkAmountRange(_amount)
		},
		refreshSelectItem (scanItem, selectGood) {
			selectGood.busUnitInAmount = scanItem.busUnitInAmount
			selectGood.batchCode = scanItem.batchCode
			this.editItem(selectGood)
		},
		toFixedNumberSize (data) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysPointSize))
		},
		editItem (item) {
			if (item.id) this.$set(item, 'changeType', 'edit')
		}
		// }}}
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
