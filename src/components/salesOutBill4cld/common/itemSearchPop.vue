<template>
	<w-app-page class="item-search-block">
		<w-header title="搜索品项" :leftOptions="leftOptions" @on-click-back="onCloseClick">
			<!-- <van-icon slot="header-right" name="success" class="header-confirm-btn" @click="getItemByRedCode" /> -->
		</w-header>
		<fx-search-bar
			v-model="searchKey"
			:isSelectAll="isSelectAll"
			:showSelectAllBtn="!isDisabled"
			@on-select-click="onSelectAllClick"
		></fx-search-bar>
		<div class="item-list" ref="details-content">
			<van-collapse v-model="activeStoreNames" :border="false">
				<van-collapse-item :name="storeItem.id"
					v-for="storeItem in data"
					:key="storeItem.id"
					class="store-row"
					v-show="storeShowComputed(storeItem)"
				>
					<div slot="title" class="item-store-title-container">
						<w-icon v-show="!isDisabled && showScanCode" type='camera' @click="onCameraClick(storeItem)"></w-icon>
						<div class="item-store-title">
							<span class="item-out-store-title fx-ellipsis">出库仓库：{{storeItem.name}}</span>
						</div>
					</div>
					<van-swipe-cell
						v-show="item.changeType !== 'del'"
						v-for="(item, index) in detailFilter(storeItem.details)"
						ref="details-row"
						:key="`${item.goodsDTO.id}-${index}`"
						:right-width="80"
						:disabled="isDisabled || focusing || !$fxAuth('salesOutBill4cld.delDetail')"
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
								@on-item-focus="onItemFocus"
								@on-item-blur="onItemBlur"
								class="search-info"
							></itemInfoCell>
						</div>
						<div slot="right" class="item-row-delete" @click="onDeleteClick(item, index, storeItem.details)">删除</div>
					</van-swipe-cell>
				</van-collapse-item>
			</van-collapse>
		</div>
		<w-bottom-btn-bar>
			<w-button
				v-show="!isDisabled"
				size="large"
				type="primary"
				@click="onSearchConfirm"
			>保存</w-button>
			<w-button
				v-show="!isDisabled"
				size="large"
				type="danger"
				@click="onSelectConfirm"
			>删除</w-button>
		</w-bottom-btn-bar>
		<van-popup
			v-fx-history-back="itemRowEditPopShow"
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
			></itemRowEditPop>
		</van-popup>
		<w-action-sheet
			v-fx-history-back="unitActionShow"
			ref="unitActionSheet"
			v-model="unitActionShow"
			:actions="unitActions"
		></w-action-sheet>
		<w-action-sheet
			v-fx-history-back="scanActionShow"
			ref="scanActionSheet"
			v-model="scanActionShow"
			:actions="scanActions"
		></w-action-sheet>
	</w-app-page>
</template>

<script>
import { mapState } from 'vuex'
import itemInfoCell from './ItemInfoCell.vue'
import itemRowEditPop from './ItemRowEditPop.vue'
import checkBox from '@/components/common/CheckBox.vue'
const SEARCH_KEY_LOCAL = ['code', 'name', 'pinYin']
export default {
	name: 'itemSearchPop',
	components: {
		itemInfoCell,
		itemRowEditPop,
		checkBox
	},
	props: {
		data: {
			type: Array,
			default: () => {
				return []
			}
		},
		isDisabled: Boolean,
		visibleFlag: Boolean,
		inShopId: {
			type: String,
			default: ''
		},
		rdcId: {
			type: String,
			default: ''
		},
		businessDate: {
			type: [String, Number],
			default: ''
		},
		showScanCode: Boolean
	},
	data () {
		return {
			query: this.$route.query,
			focusing: false,
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			searchKey: '',
			searchKeywords: SEARCH_KEY_LOCAL,
			itemRowEditPopShow: false,
			itemEditRowData: {},
			unitActions: [],
			unitActionShow: false,
			activeStoreNames: [],
			scanActionShow: false,
			scanActions: [
				{ name: '累加数量' },
				{ name: '覆盖数量' },
				{ name: '追加' }
			],
			scanStoreItem: {}
		}
	},
	beforeDestroy () {
		this.$fxEventBus.$off('redCode', this.getItemByRedCode)
	},
	watch: {
		visibleFlag: {
			handler (val) {
				if (val) {
					this.searchKey = ''
					this.data.forEach(storeItem => {
						let hasDetails = storeItem.details.filter(item => {
							return item.changeType !== 'del'
						}).length
						if (hasDetails > 0) {
							this.activeStoreNames.push(storeItem.id)
						}
					})
				} else {
					this.$dialog.close()
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
			let selectItemL = 0
			let dataL = 0
			this.data.forEach(storeItem => {
				let searchItems = this.detailFilter(storeItem.details)
				selectItemL += searchItems.filter(item => {
					return item.changeType !== 'del' && item.checked
				}).length
				dataL += searchItems.length
			})
			return selectItemL !== 0 && selectItemL === dataL
		}
	},
	methods: {
		storeShowComputed (store) {
			return this.detailFilter(store.details).length > 0
		},
		detailFilter (items) {
			return items.filter(item => {
				return item.changeType !== 'del' && !!this.searchKeywords.find(itemKey => {
					return this.$fxUtils.fuzzyQueryString(item.goodsDTO[itemKey], this.searchKey)
				})
			})
		},
		onCloseClick () {
			if (this.focusing) {
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
		onItemFocus () {
			this.focusing = true
		},
		onItemBlur () {
			this.focusing = false
		},
		onSearchItemEdit (itemData) {
			this.itemEditRowData = itemData
			this.itemRowEditPopShow = true
		},
		onUnitEdit (item) {
			this.$fxApi('common.getItemUnit', item.goodsDTO.id).then(res => {
				this.unitActions = res.units
				this.$refs.unitActionSheet.doSelect(item.unitDTO.id).then(unitItem => {
					this.$fxCalculation('salesOutBill4cld').changeUnit(item, unitItem)
				})
			})
		},
		onSearchConfirm () {
			if (this.focusing) {
				return false
			}
			this.data.forEach(storeItem => {
				storeItem.details.forEach(item => {
					delete item.checked
				})
			})
			this.$emit('on-search-confirm', this.data)
			this.$emit('update:visibleFlag', false)
		},
		onCheckBoxClick (item) {
			if (this.focusing) {
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
		onCameraClick (storeItem) {
			this.scanStoreItem = storeItem
			this.$fxEventBus.$on('redCode', this.getItemByRedCode)
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
			// redCode = '00000006543210000003000000100100100100220052611384099548'
			this.$dialog.close()
			this.$fxEventBus.$off('redCode', this.getItemByRedCode)
			if (!this.visibleFlag) {
				return false
			}
			this.getItemByCode(redCode).then(goods => {
				if (goods.length === 0) {
					this.$fxToast.top('当前仓库无此品项!')
					return false
				}
				this.getScanGoodData(goods)
			})
		},
		getItemByCode (barcode) {
			const params = {
				billId: this.query.orderId || '',
				shopId: this.inShopId,
				rdcId: this.rdcId,
				outHouseId: this.scanStoreItem.id,
				workDate: this.businessDate,
				barcode
			}
			return this.$fxApi('salesOutBill4cld.scanCode')({ data: params })
		},
		getScanGoodData (goods) {
			let [good] = this.setDataMoneyAndPrice(goods)
			good.busUnitOutAmount = good.adviseAmount
			this.computedAssistAmount(good)
			this.setScanGood(good)
		},
		computedAssistAmount (item) {
			if (item.assistUnitFlag) {
				item.outAssistAmount = item.busUnitOutAmount
			}
		},
		setDataMoneyAndPrice (data) {
			data.forEach((item, index) => {
				item.goodsDTO = {
					id: item.goodsId,
					imageUrls: item.goodsImgUrl ? [item.goodsImgUrl] : [],
					name: item.goodsName,
					spec: item.goodsSpec,
					code: item.goodsCode,
					pinYin: item.goodsSign
				}
				item.unitDTO = {
					id: item.unitId,
					name: item.unitName,
					value: item.unitValue
				}
				// 赠品
				item.giftFlag = false
				// 非税单价
				item.price = item.salePrice
				// 含税单价
				item.taxPrice = item.taxesPrice
				// 非税金额
				item.outMoney = 0
				// 含税金额
				item.outMoneyWithTax = 0
				// 税率
				item.tax = item.taxes
				// 税额
				item.taxOutMoney = 0
				// 成本价配送
				item.costDispach = false
			})
			return data
		},
		setScanGood (good) {
			let _index = this.scanStoreItem.details.findIndex(selectItem => {
				return good.goodsDTO.id === selectItem.goodsDTO.id
			})
			// 条件一: 当前已选品项 不存在 扫码品项
			if (!~_index) {
				this.$fxToast.fail('当前仓库无此品项！')
				return false
			} else {
				let _unitIndex = this.scanStoreItem.details.findIndex(selectItem => {
					return good.goodsDTO.id === selectItem.goodsDTO.id && good.unitDTO.id === selectItem.unitDTO.id
				})
				// 条件二: 当前已选品项 存在 扫码品项 但是 单位不同
				if (!~_unitIndex) {
					this.$fxToast.fail('当前仓库无此品项！')
					return false
				} else {
					const selectGood = this.scanStoreItem.details[_unitIndex]
					let scanGood = this.copyScanGood(good, selectGood)
					if (selectGood.batchCode !== scanGood.batchCode && this.$fxUtils.isDef(selectGood.batchCode)) {
						// 条件三: 当前已选品项 存在 扫码品项 且 单位 一致 但是 批次号 不同
						this.scanActions = [
							{ name: '覆盖数量' },
							{ name: '追加' }
						]
					} else {
						// 条件四: 当前已选品项 存在 扫码品项 单位 一致 批次号 一致 或 扫码品项没有批次号
						this.scanActions = [
							{ name: '累加数量' },
							{ name: '覆盖数量' }
						]
					}
					this.$refs.scanActionSheet.doSelect().then(item => {
						switch (item.name) {
						case '累加数量':
							this.computedScanItemAmount(scanGood, selectGood)
							this.changeScanItem(scanGood, _unitIndex)
							break
						case '覆盖数量':
							this.changeScanItem(scanGood, _unitIndex)
							break
						case '追加':
							this.addScanItem(scanGood)
							break
						}
					})
				}
			}
		},
		copyScanGood (scanItem, selectGood) {
			const { busUnitOutAmount, batchCode } = scanItem
			let _good = this.$fxUtils.JSONcopy(selectGood)
			_good.busUnitOutAmount = busUnitOutAmount
			_good.batchCode = batchCode
			this.computedAssistAmount(_good)
			this.$fxCalculation('salesOutBill4cld').changeAmount(_good)
			return _good
		},
		computedScanItemAmount (scanItem, selectGood) {
			const _amount = this.$fxUtils.toFixedParseNumber(scanItem.busUnitOutAmount + selectGood.busUnitOutAmount, this.sysPointSize)
			scanItem.busUnitOutAmount = this.$fxCommon.checkAmountRange(_amount)
			this.$fxCalculation('salesOutBill4cld').changeAmount(scanItem)
		},
		addScanItem (scanItem) {
			scanItem.id = ''
			this.setChangeType(scanItem)
			this.scanStoreItem.details.push(scanItem)
		},
		changeScanItem (scanItem, index) {
			this.setChangeType(scanItem)
			this.scanStoreItem.details.splice(index, 1, scanItem)
		},
		setChangeType (item) {
			item.changeType = item.id ? 'edit' : 'add'
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.item-search-block {
	.item-list {
		flex:1
		overflow:scroll
		position: relative
		text-align: left
		padding: 0 13px
		width: 350px
		.item-store-title-container {
			display:flex
			flex-direction: row;
			align-items: center;
			font-size:12px
			height:40px
			.item-store-title {
				display:flex
				flex-direction: row;
				justify-content: space-between;
				align-items: center;
				flex:1
				margin-left: 10px;
			}
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
}
</style>
