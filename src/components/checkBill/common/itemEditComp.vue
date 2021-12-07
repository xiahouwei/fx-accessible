<template>
	<div class="item-edit">
		<w-header title="选择品项" :leftOptions="leftOptions" @on-click-back="onCloseClick">
			<van-icon slot="header-right" name="success" class="header-confirm-btn" @click="onItemConfirm" />
		</w-header>
		<div class="item-search clearfix">
			<van-search v-model="searchKey" placeholder="请输入搜索关键词" shape="round" @search="search"/>
			<van-switch-cell v-model="isUnCheckZero" v-show="createBillFlag" class="info-item" title="未盘品项自动清零" />
		</div>
		<div class="item-edit-content">
			<addItemClassList
				v-model="currentClass"
				:itemClassList="itemClassList"
				@on-change-class="changeClass"
			></addItemClassList>
			<div class="item-details-content" ref="details-content">
				<van-list
					v-model="listLoading"
					:finished="loadFinished"
					finished-text="没有更多了"
					error-text="请求失败，点击重新加载"
					@load="onLoadMore"
				>
					<div
						v-for="item in itemList"
						:key="item.id"
						:ref="`details-row-${item.id}`"
						class="item-detail"
					>
						<div class="item-details-img">
							<img :src="comptedItemImgSrc(item.imageUrls)" :onerror="$fxCommon.errorImg('item')">
						</div>
						<div class="item-details-params">
							<div class="item-details-name fx-ellipsis">{{item.name}}</div>
							<div class="item-details-spec fx-ellipsis">{{item.spec}}</div>
						</div>
						<van-checkbox
							v-model="item.checked"
							class="item-checkbox"
							@change="clickCheckBoxes(item)"
						></van-checkbox>
					</div>
				</van-list>
			</div>
		</div>
		<div v-show="createBillFlag" class="item-edit-bottom">
			<van-button
				v-show="!selectAllFlag && !hasInventoryFlag"
				class="bottom-btn fx-no-radius"
				type="info"
				@click="onSelectAllClick"
			>全选</van-button>
			<van-button
				v-show="selectAllFlag || hasInventoryFlag"
				class="bottom-btn fx-no-radius"
				type="info"
				@click="onCancelAllClick"
			>取消全选</van-button>
			<van-button
				v-show="createBillFlag"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onSelectInventoryClick"
			>有库存</van-button>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import addItemClassList from '@/components/common/AddItemClassList.vue'
const ITEM_SIZE = 10
export default {
	name: 'itemEditComp',
	components: {
		addItemClassList
	},
	props: {
		visibleFlag: Boolean,
		store: {
			type: Object,
			default: () => {
				return {}
			}
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
		createBillFlag: {
			type: Boolean,
			default: false
		},
		unCheckZero: Boolean,
		hasSumBatch: Boolean
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
			itemClassList: [],
			itemList: [],
			rowActive: '',
			selectedItemArr: [],
			listLoading: false,
			loadFinished: true,
			itemListStart: 0,
			selectAllFlag: false,
			hasInventoryFlag: false,
			isUnCheckZero: false
		}
	},
	computed: {
		...mapState({
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId
		}),
		comptedItemImgSrc (imageUrls) {
			return (imageUrls) => {
				return imageUrls.length === 0 ? '' : imageUrls[0]
			}
		}
	},
	created () {
		this.$fxEventBus.initEvent(this, 'redCode', this.getItemByRedCode)
	},
	watch: {
		visibleFlag: {
			handler (val) {
				if (val) {
					this.isUnCheckZero = this.unCheckZero
					this.refresh()
				}
			},
			immediate: true
		}
	},
	methods: {
		// {{{重新请求数据
		refresh () {
			this.resetHandler()
			this.getItemClass().then(res => {
				this.itemClassList = res.goodsTypes
				this.getItemByClass()
			})
		},
		// }}}
		// {{{清空数据
		resetHandler () {
			this.currentClass = ''
			this.searchKey = ''
			this.selectedItemArr = []
			this.itemList = []
			this.selectAllFlag = false
			this.hasInventoryFlag = false
		},
		// }}}
		// {{{返回
		onCloseClick () {
			this.$emit('update:visibleFlag', false)
		},
		// }}}
		// {{{确认
		onItemConfirm () {
			if (!this.selectedItemArr || this.selectedItemArr.length === 0) {
				this.$fxToast.fail('请选择品项!')
				return false
			}
			this.$emit('on-confirm', this.selectedItemArr, this.isUnCheckZero)
		},
		// }}}
		// {{{选择类别
		changeClass (classId) {
			this.searchKey = ''
			this.getItemByClass()
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
		getItemByClass (keywords) {
			this.itemListStart = 0
			this.getItem(keywords).then(res => {
				this.itemList = res.goods
				this.setListLoading(res.goods.length)
				// 设置选中项
				if (this.selectedItemArr.length) {
					this.checkItem(this.itemList)
				}
			})
		},
		// }}}
		getItem (keywords = this.searchKey) {
			// 保存选中品项
			let selectedItemArr = this.itemList.filter(item => {
				let index = this.selectedItemArr.findIndex(selectedItem => {
					return selectedItem.id === item.id
				})
				if (~index) {
					return false
				}
				return item.checked
			})
			this.selectedItemArr = this.selectedItemArr.concat(selectedItemArr)
			return new Promise(resolve => {
				let params = {
					houseId: this.store.id,
					paged: true,
					start: this.itemListStart,
					size: ITEM_SIZE,
					removeIds: this.parentStoreItem.reduce((ids, cur) => { return cur.changeType !== 'del' ? ids.concat(cur.goodsDTO.id) : ids }, []),
					workDate: new Date(this.businessDate).getTime(),
					searchText: keywords,
					goodsTypeId: this.currentClass || null
				}
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/accounts/${this.shopId}/users/${this.loginerId}/goods?`,
					data: params,
					query: {
						m: this.createBillFlag ? 'list4CheckBill' : 'list4AddCheckDetail'
					}
				}).then(res => {
					res.goods.forEach(item => {
						item.checked = false
					})
					resolve(res)
				})
			})
		},
		// {{{设置选中【有库存】或者【全选】的品项--‘checked’
		checkItem (itemData) {
			itemData.forEach((item, index) => {
				let itemHasInventory = this.selectedItemArr.find(inventoryData => {
					return inventoryData.id === item.id
				})
				item.checked = !!itemHasInventory
			})
		},
		// }}}
		// {{{下拉刷新
		search (searchKey) {
			this.searchKey = searchKey
			this.getItemByClass()
		},
		onLoadMore () {
			this.getItem().then(res => {
				this.itemList.push(...res.goods)
				this.setListLoading(res.goods.length)
				// 设置选中项
				if (this.selectedItemArr.length) {
					this.checkItem(res.goods)
				}
			})
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
		// }}}
		// {{{按钮
		onSelectInventoryClick () {
			let params = {
				houseId: this.store.id,
				paged: true,
				start: 0,
				size: 0,
				removeIds: [],
				workDate: new Date(this.businessDate).getTime()
			}
			this.$fxHttp.requestPost({
				url: `${this.$fxBaseApi.url}/accounts/${this.shopId}/users/${this.loginerId}/goods?`,
				data: params,
				query: {
					m: 'list4CheckBillInventory'
				}
			}).then(res => {
				this.hasInventoryFlag = true
				this.selectedItemArr = res.goods
				// 设置选中项
				if (this.selectedItemArr.length) {
					this.checkItem(this.itemList)
				}
			})
		},
		onSelectAllClick () {
			let params = {
				houseId: this.store.id,
				paged: true,
				start: 0,
				size: 0,
				removeIds: [],
				workDate: new Date(this.businessDate).getTime(),
				searchText: this.searchKey,
				goodsTypeId: this.currentClass || null
			}
			this.$fxHttp.requestPost({
				url: `${this.$fxBaseApi.url}/accounts/${this.shopId}/users/${this.loginerId}/goods?`,
				data: params,
				query: {
					m: 'list4CheckBill'
				}
			}).then(res => {
				this.selectAllFlag = true
				this.selectedItemArr = res.goods
				// 设置选中项
				if (this.selectedItemArr.length) {
					this.checkItem(this.itemList)
				}
			})
		},
		onCancelAllClick () {
			this.hasInventoryFlag = false
			this.selectAllFlag = false
			// 取消选中项
			this.selectedItemArr = []
			this.itemList.forEach((item, index) => {
				if (item.checked) {
					item.checked = false
				}
			})
		},
		// }}}
		// {{{选中品项加入到selectedItemArr中
		clickCheckBoxes (itemData) {
			if (itemData.checked) {
				if (!~this.getSelectItemIndex(itemData)) {
					this.selectedItemArr.push(itemData)
				}
			} else {
				this.selectedItemArr.splice(this.getSelectItemIndex(itemData), 1)
			}
		},
		getSelectItemIndex (itemData) {
			return this.selectedItemArr.findIndex(item => item.id === itemData.id)
		},
		// }}}
		getItemByRedCode (redCode) {
			// redCode = '2020091410052000003480002009031358402398921'
			if (!this.visibleFlag) {
				return false
			}
			if (redCode.length <= 24) {
				this.getItemByBarRedCode(redCode)
			} else if (!this.hasSumBatch) {
				// 分批才能扫二维码
				this.getItemByCode(redCode).then(goods => {
					if (goods.length === 0) {
						this.$fxToast.top('当前仓库无此品项!')
						return false
					}
					this.getScanGoodData(goods.checkDetailDTO)
				})
			}
		},
		getItemByCode (barcode) {
			return new Promise(resolve => {
				let params = {
					qrCodeContent: barcode,
					houseId: this.store.id,
					billType: 2
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
			let orderItemArr = []
			orderItemArr = this.selectedItemArr
			let _index = orderItemArr.findIndex(selectItem => {
				return scanGood.goodsDTO.id === selectItem.goodsDTO.id
			})
			// 条件一: 当前已选品项 不存在 扫码品项
			if (!~_index) {
				this.scanPushItem(scanGood)
				this.$fxToast.success('扫码添加品项成功！')
			} else {
				this.$fxToast.fail('不能重复添加品项！')
				/* 盘点单 新增和 可以新增明细 的情况没有批次号，故注释下面逻辑，如后期需求有修改可放开
				const selectGood = orderItemArr[_index]
				// 条件三: 当前已选品项 存在 扫码品项 但是 批次号 不同
				if (selectGood.batchCode !== scanGood.batchCode && this.$fxUtils.isDef(selectGood.batchCode)) {
					this.$fxToast.fail('不能重复添加品项！')
					return false
				}
				// 条件四: 当前已选品项 存在 扫码品项 批次号 一致 或 扫码品项没有批次号 添加批次号
				selectGood.batchCode = scanGood.batchCode */
			}
		},
		scanPushItem (goods) {
			this.itemList = [goods.goodsDTO]
			let itemData = this.itemList[0]
			itemData.checked = true
			this.clickCheckBoxes(itemData)
		},
		toFixedNumberSize (data) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysPointSize))
		},
		getItemByBarRedCode (redCode) {
			let { itemCode } = this.$fxCommon.redCode2Item(redCode)
			if (itemCode.length < 13) {
				this.$fxToast.top('此条码无对应品项!')
				return false
			}
			this.currentClass = ''
			this.itemListStart = 0
			this.getItem(itemCode).then(res => {
				let goods = res.goods
				this.itemList = goods
				if (goods.length === 0) {
					this.$fxToast.top('当前仓库无此品项!')
					return false
				}
				let itemData = this.itemList[0]
				itemData.checked = true
				this.clickCheckBoxes(itemData)
			})
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
		.item-class-content {
			// height:100%
			width:120px
			overflow:scroll
			border-right:1px solid $fxBorder
			.all-class {
				height:44px
				line-height:44px
				font-size:12px
				text-indent:14px
				&.is-active {
					background-color:$fxDefaultColor
					color:$fxWhite
				}
			}
			.big-class {
				width:100%
				font-size:12px
				overflow: hidden;
				text-overflow : ellipsis
				white-space: nowrap;
			}
			.small-class {
				width:100%
				font-size:12px
				overflow: hidden;
				&.is-active {
					background-color:$fxDefaultColor
					color:$fxWhite
				}
			}
		}
		.item-details-content {
			flex:1
			overflow:scroll
			position: relative;
			.item-detail {
				width:100%
				height:80px
				display: flex
				flex-direction: row
				.item-details-img {
					width:80px
					height:100%
					padding:5px
					box-sizing:border-box
					&>img {
						width:100%
						height:100%
					}
				}
				.item-details-params {
					flex:1
					overflow:hidden
					position:relative
					.item-details-name {
						width:100%
						height:30px
						line-height:30px
						font-size:12px
					}
					.item-details-spec {
						height:30px
						line-height:30px
						font-size:10px
					}
				}
				.item-checkbox {
					display: flex;
					justify-content: center;
					align-items: Center;
					padding-right: 26px;
				}
			}
		}
	}
	.item-edit-bottom {
		width:100%
		.bottom-btn {
			width:50%
		}
	}
}
</style>

