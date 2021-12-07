<template>
	<div class="item-search-block">
		<w-header title="搜索品项" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div class="item-search clearfix">
			<van-search
				v-model="searchKey"
				placeholder="请输入搜索关键词"
				shape="round"
				@search="onConfirmKey"
				/>
			<!--<input type="text" v-model="redCode">
			<button @click="getItemByRedCode">aa</button>-->
		</div>
		<div class="item-list item-search-list" ref="details-content">
<!--			<div class="item-store-title-container">-->
<!--				<w-icon v-show="!isDisabled" type='camera' @click="onCameraClick"></w-icon>-->
<!--			</div>-->
			<van-swipe-cell
				v-for="item in filteScroll(detailFilter(dataList))"
				v-show="item.changeType !== 'del'"
				:ref="`details-row-${item.goodsUUid}`"
				:key="item.id"
				:right-width="80"
				:disabled="!showAddBtn() || focusing"
				class="item-row"
			>
				<itemInfoCell
					:itemData="item"
					:isDisabled="isDisabled"
					:disabledEditBtn="focusing"
					:isPlan="planId ? true : false"
					@on-item-edit="onSearchItemEdit"
					@on-item-focus="onItemFocus(arguments, `${item.goodsUUid}`)"
					@on-item-blur="onItemBlur"
				></itemInfoCell>
				<div slot="right" class="item-row-delete" @click="onDeleteClick(item, data)">删除</div>
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
				:isCheckedBill="isCheckedBill"
				:isDisabled="isDisabled"
				:hasSumBatch="hasSumBatch"
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
import itemInfoCell from '@/components/checkBill/common/ItemInfoCell.vue'
import itemRowEditPop from '@/components/checkBill/common/ItemRowEditPop.vue'
const SCROLL_SIZE = 10 // 加载的数量
const SHOW_ITEM_SIZE = 20 // 缓存的数量
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
		planId: String,
		isDisabled: Boolean,
		visibleFlag: Boolean,
		house: {
			type: Object,
			default: () => {
				return {}
			}
		},
		hasSumBatch: Boolean,
		isCheckedBill: Boolean
	},
	data () {
		return {
			focusing: false,
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			dataList: [],
			searchKey: '',
			searchScanItem: null, // 扫码结果筛选条件
			itemRowEditPopShow: false,
			itemEditRowData: {},
			unitActions: [],
			unitActionShow: false,
			scrollDataEnd: 0,
			scrollThrottle: this.$fxUtils.throttle(),
			dataLength: -1,
			scanActionShow: false,
			scanActions: [
				{ name: '累加数量' },
				{ name: '覆盖数量' }
			],
			scanStoreItem: {}
			// redCode: ''
		}
	},
	created () {
		if (this.isDisabled) {
			return
		}
		this.$fxEventBus.$on('redCode', this.getItemByRedCode)
	},
	mounted () {
		document.querySelector('.item-search-list').addEventListener('scroll', this.scrollHandle, true)
	},
	beforeDestroy () {
		this.$fxEventBus.$off('redCode', this.getItemByRedCode)
		document.querySelector('.item-search-list').removeEventListener('scroll', this.scrollHandle)
	},
	watch: {
		visibleFlag: {
			handler (val) {
				if (val) {
					this.dataList = JSON.parse(JSON.stringify(this.data))
					this.dataLength = this.dataList.length
					this.setGoodsUUid(this.dataList)
					this.resetHandler()
				}
			},
			immediate: true
		},
		searchKey: {
			handler (val) {
				if (val) {
					this.initScrollData()
				}
			},
			immediate: true
		},
		searchScanItem: {
			handler (val) {
				if (val) {
					this.initScrollData()
				}
			},
			immediate: true
		},
		dataList () {
			let data = this.dataList
			if (this.dataLength !== data.length) { // 删除品项，重新定位scrollDataEnd
				let dataEnd
				if (data.length > this.scrollDataEnd + SHOW_ITEM_SIZE) {
					dataEnd = this.scrollDataEnd + SHOW_ITEM_SIZE
				} else {
					dataEnd = data.length
				}
				if (dataEnd !== this.scrollDataEnd) {
					this.scrollDataEnd = dataEnd
				}
				this.dataLength = data.length
			}
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize',
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId
		}),
		showAddBtn () {
			return () => {
				if ((!this.isDisabled && this.planId) || this.isDisabled) {
					return false
				}
				return true
			}
		}
	},
	methods: {
		detailFilter (items, searchKeywords = 'code,name,pinYin') {
			let searchScanItem = this.searchScanItem
			return items.filter(item => {
				return item.changeType !== 'del' && !!searchKeywords.split(',').find(itemKey => {
					if (item.goodsDTO[itemKey].toLowerCase().includes(this.searchKey.toLowerCase())) {
						// 搜索针对扫描情况：如果扫出结果有批次号，必须批次号和品项id一致，分批会出现同品项多条数据
						if (searchScanItem && (item.goodsDTO.id !== searchScanItem.goodsDTO.id || (searchScanItem.batchCode && searchScanItem.batchCode !== item.batchCode))) {
							return false
						} else {
							return true
						}
					}
				})
			})
		},
		resetHandler () {
			this.searchKey = ''
			this.searchScanItem = null
			this.initScrollData()
		},
		// {{{分批下存在相同品项，故设置uuid，唯一标示key值
		setGoodsUUid (data) {
			data.forEach(dataItem => {
				dataItem.goodsUUid = this.$fxUtils.createUUID()
			})
		},
		// }}}
		initScrollData () {
			let data = this.detailFilter(this.dataList)
			if (data.length > this.scrollDataEnd + SHOW_ITEM_SIZE) {
				this.scrollDataEnd = this.scrollDataEnd + SHOW_ITEM_SIZE
			} else {
				this.scrollDataEnd = data.length
			}
			this.dataLength = this.dataList.length
		},
		filteScroll (data) {
			let scrollDataEnd = this.scrollDataEnd
			return data.filter((item, index) => {
				if (index < scrollDataEnd) {
					if (scrollDataEnd > SHOW_ITEM_SIZE) {
						if (scrollDataEnd - SHOW_ITEM_SIZE - 1 < index) {
							return true
						}
					} else {
						return true
					}
				}
			})
		},
		onCloseClick () {
			if (this.focusing) { // input不符合验证规则
				return false
			}
			this.$emit('update:visibleFlag', false)
		},
		onDeleteClick (item, details) {
			if (item.id) {
				this.$set(item, 'changeType', 'del')
			} else {
				let index = this.dataList.indexOf(item)
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
			let index = this.dataList.findIndex(detailsItem => {
				return detailsItem.id === item.id
			})
			if (~index) {
				this.dataList[index] = item
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
			let tempUnit = item.unitDTO
			let rate = tempUnit.value / unit.value
			let busUnitAmount = parseFloat(this.$fxUtils.toFixedSHW(item.busUnitAmount * rate, this.sysPointSize))
			item.unitDTO = unit
			item.busUnitAmount = busUnitAmount
			if (item.id) {
				item.changeType = 'edit'
			}
		},
		// }}}
		onSearchConfirm () {
			if (this.focusing) { // input不符合验证规则
				return false
			}
			this.$emit('on-search-confirm', this.dataList)
			this.$emit('update:visibleFlag', false)
		},
		// {{{扫码
		/* onCameraClick () {
			this.scanStoreItem = this.dataList
			this.$fxEventBus.initEvent(this, 'redCode', this.getItemByRedCode)
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
			this.getItemByRedCode()
		}, */
		getItemByRedCode (redCode) {
			// redCode = '0000000000000000000200002012281406284473320'
			// redCode = '2020112090452'
			// redCode = this.redCode
			// this.$dialog.close()
			// this.$fxEventBus.$off('redCode', this.getItemByRedCode)
			if (!this.visibleFlag) {
				return false
			}
			if (redCode.length <= 24) {
				this.onRedCodeHandler(redCode)
			} else if (!this.hasSumBatch) {
				// 分批才能扫二维码
				this.getItemByCode(redCode).then(goods => {
					if (!goods) {
						this.$fxToast.top('当前仓库无此品项!')
						return false
					}
					this.scanStoreItem = this.dataList
					this.getScanGoodData(goods)
				})
			}
		},
		getItemByCode (barcode) {
			return new Promise(resolve => {
				let params = {
					qrCodeContent: barcode,
					houseId: this.house.id,
					billType: 2,
					planId: this.planId
				}
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/accounts/${this.shopId}/users/${this.loginerId}/getscancodedata`,
					query: params
				}).then(res => {
					resolve(res.checkDetailDTO)
				})
			})
		},
		getScanGoodData (goods) {
			// 将账存数量置0，否则保存之后查询报错
			goods.accountMoney = 0
			this.setScanGood(goods)
		},
		setScanGood (scanGood) {
			let _index = this.scanStoreItem.findIndex(selectItem => {
				return scanGood.goodsDTO.id === selectItem.goodsDTO.id && selectItem.changeType !== 'del'
			})
			// 条件一: 当前已选品项 不存在 扫码品项
			if (!~_index) {
				this.scanPushItem(scanGood)
				this.showCodeItem(scanGood)
				this.$fxToast.success('扫码添加品项成功！')
			} else {
				let unitNames = ['unitDTO', 'checkUnitDTO', 'planUnitDTO']
				let scanUnitName = unitNames.find(unitItem => {
					return scanGood[unitItem] && scanGood[unitItem].id
				})
				let unitItemList = this.scanStoreItem.filter((selectItem, index) => {
					return scanGood.goodsDTO.id === selectItem.goodsDTO.id && selectItem.changeType !== 'del' && selectItem[scanUnitName] && scanGood[scanUnitName].id === selectItem[scanUnitName].id
				})
				// 条件二: 当前已选品项 存在 扫码品项 但是 单位不同
				if (!unitItemList.length) {
					this.$fxToast.fail('不能重复添加品项！')
					return false
				} else {
					let _batchCodeIndex = unitItemList.findIndex(unitItem => {
						return unitItem.batchCode === scanGood.batchCode && this.$fxUtils.isDef(unitItem.batchCode)
					})
					if (!~_batchCodeIndex) {
						// 条件三: 当前已选品项 存在 扫码品项 且 单位 一致 但是 批次号 不同 直接追加
						this.addScanItem(scanGood)
						this.showCodeItem(scanGood)
						this.$fxToast.success('追加成功！')
					} else {
						const selectGood = unitItemList[_batchCodeIndex]
						// 条件四: 当前已选品项 存在 扫码品项 单位 一致 批次号 一致 或 扫码品项没有批次号
						/* this.$refs.scanActionSheet.doSelect().then(item => {
							switch (item.name) {
							case '累加数量':
								this.computedScanItemAmount(scanGood, selectGood)
								this.changeScanItem(scanGood, selectGood)
								this.showCodeItem(selectGood)
								break
							case '覆盖数量':
								this.changeScanItem(scanGood, selectGood)
								this.showCodeItem(selectGood)
								break
							}
						}) */
						this.changeScanItem(scanGood, selectGood)
						this.showCodeItem(selectGood)
					}
				}
			}
		},
		computedScanItemAmount (scanItem, selectGood) {
			let amountNames = ['checkUnitAmount', 'planUnitAmount']
			let scanAmountName = amountNames.find(amountItem => {
				return scanItem[amountItem] !== null
			})
			const _amount = this.toFixedNumberSize(scanItem[scanAmountName] + selectGood[scanAmountName])
			scanItem[scanAmountName] = this.$fxCommon.checkAmountRange(_amount)
		},
		changeScanItem (scanItem, selectGood) {
			// 修改数量：除返回数量，其他数量均置为0，账存数量取二维码上数量
			/* let amountNames = ['checkUnitAmount', 'planUnitAmount']
			amountNames.forEach(amountItem => {
				if (scanItem[amountItem] !== null) {
					selectGood[amountItem] = scanItem[amountItem]
				} else {
					selectGood[amountItem] = 0
				}
			}) */
			selectGood.accountAmount = scanItem.accountAmount
			selectGood.accountMoney = 0
			selectGood.batchCode = scanItem.batchCode
			this.setChangeType(selectGood)
		},
		addScanItem (scanItem) {
			scanItem.id = ''
			this.setChangeType(scanItem)
			this.dataList.push(scanItem)
		},
		setChangeType (item) {
			if (item.id) {
				this.$set(item, 'changeType', 'edit')
			} else {
				this.$set(item, 'changeType', 'add')
			}
		},
		copyScanGood (scanItem, selectGood) {
			const { batchCode } = scanItem
			let _good = this.$fxUtils.JSONcopy(selectGood)
			_good.batchCode = batchCode
			return _good
		},
		scanPushItem (goods) {
			let itemData = goods
			this.dataList.push(itemData)
			this.setChangeType(itemData)
		},
		// }}}
		//  {{{
		onRedCodeHandler (redCode) {
			// redCode = 1234567899874336000
			if (!this.visibleFlag) {
				return false
			}
			this.getItemByRedCodeHandler(redCode).then(res => {
				let goods = res.billAndDetails[0]
				if (goods.length === 0) {
					this.$fxToast.top('当前仓库无此品项!')
					return false
				}
				let showItem = this.dataList.find(item => {
					return item.goodsDTO.id === goods.goodsDTO.id && item.changeType !== 'del'
				})
				if (showItem) {
					this.showCodeItem(goods)
					this.itemUpdate(goods, showItem)
				} else {
					this.$fxToast.top('无此品项!')
				}
			})
		},
		itemUpdate (codeItem, showItem) {
			if (!showItem) {
				const indexs = this.$fxUtils.appointedMap(this.dataList, (storeItem, index) => {
					if (storeItem.goodsDTO.id === codeItem.goodsDTO.id && storeItem.changeType !== 'del') {
						return index
					}
				})
				if (indexs.length === 1 && this.dataList[indexs[0]].id) {
					showItem = this.dataList[indexs[0]]
				} else {
					return false
				}
			}
			// const unitDTO = showItem.checkUnitDTO
			// const currentUnitDTO = codeItem.unitDTO
			// const ratio = currentUnitDTO.value / unitDTO.value
			// const countValue = codeItem.goodsDTO.countValue * ratio
			if (showItem.id) {
				this.$set(showItem, 'changeType', 'edit')
			}
			// showItem.checkUnitAmount = this.toFixedNumberSize(countValue)
		},
		getItemByRedCodeHandler (barCodes) {
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
		showCodeItem (showItem) {
			this.searchScanItem = showItem
		},
		// }}{
		onConfirmKey () {
			if (this.searchKey !== '') {
				return
			}
			this.resetHandler()
		},
		// }}}
		toFixedNumberSize (data, pointSize = this.sysPointSize) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, pointSize))
		},
		// {{{滚动加载
		scrollHandle () {
			if (this.detailFilter(this.dataList).length <= SHOW_ITEM_SIZE) {
				return
			}
			this.scrollThrottle(10).then(() => {
				this.setScrollHandle()
			})
		},
		setScrollHandle () {
			let endLoadIndex = 2 // 向下渲染的临界数
			let startLoadIndex = 3 // 向上渲染的临界数
			let scrollObj = document.getElementsByClassName('item-search-list')[0]// 滚动区域
			let clientHeight = scrollObj.clientHeight// 监听的元素的高度
			let scrollTop = scrollObj.scrollTop// div 到头部的距离
			// let scrollHeight = scrollObj.scrollHeight// 滚动区域的总高度
			let loadStartGoodsIdFlag = this.detailFilter(this.dataList)[this.scrollDataEnd - endLoadIndex].goodsUUid // 渲染数据向下滚动临界值id
			let startIndex = this.scrollDataEnd - SHOW_ITEM_SIZE + startLoadIndex
			let loadStartHigth = this.$refs[`details-row-${loadStartGoodsIdFlag}`][0].$el.offsetTop // 渲染数据向下滚动临界值
			let loadLastGoodsIdFlag = this.filteScroll(this.detailFilter(this.dataList))[endLoadIndex].goodsUUid // 渲染数据向上滚动临界值id
			let loadLastHigth = this.$refs[`details-row-${loadLastGoodsIdFlag}`][0].$el.offsetTop // 渲染数据向上滚动临界值id
			if (scrollTop + clientHeight >= loadStartHigth && this.scrollDataEnd !== this.detailFilter(this.dataList).length) {
				// 向下滚动：div 到头部的距离 + 屏幕高度 = 可滚动的总高度
				if (this.detailFilter(this.dataList).length > this.scrollDataEnd + SCROLL_SIZE) {
					this.scrollDataEnd = this.scrollDataEnd + SCROLL_SIZE
				} else {
					this.scrollDataEnd = this.detailFilter(this.dataList).length
				}
				// 滚动条位置(通过goodsid)回到之前位置
				this.$nextTick(() => {
					scrollObj.scrollTop = this.$refs[`details-row-${loadStartGoodsIdFlag}`][0].$el.offsetTop - (loadStartHigth - scrollTop)
				})
			} else if (scrollTop <= loadLastHigth && startIndex > startLoadIndex) { // 前3个数据不需向上或向下加载
				// 向上滚动
				this.scrollDataEnd = this.scrollDataEnd - SCROLL_SIZE
				// 滚动条位置(通过goodsid)回到之前位置
				this.$nextTick(() => {
					scrollObj.scrollTop = this.$refs[`details-row-${loadLastGoodsIdFlag}`][0].$el.offsetTop - (loadLastHigth - scrollTop)
				})
			}
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
		.item-row-load {
			text-align: center
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
