<template>
	<div class="inteledi-stockInBill-details">
		<w-header :title="orderInfoData.sysbillCode" titleFontSize="3.733vw" :border="true"></w-header>
		<orderInfo
			ref="orderInfo"
			:data="orderInfoData"
			:isDisabled="isBillState(1) || isWeightState(1) || isWeightState(2) || !$fxAuth('shopStockInBill.save')"
			:collapseDisabled="itemInputFocusing"
			:modifyBusinessDateFlag="modifyBusinessDateFlag"
			@on-shop-click="onShopClick"
			@on-supplier-click="onSupplierClick"
			@on-busdate-click="onBusinessDateClick"
			@on-orderDate-click="onOrderDateClick"
			@on-billType-click="onBillTypeClick"
			@on-billType-clear="onBillTypeClear"
			@on-uploader-click="onUploaderClick"
		></orderInfo>
		<orderItem
			:data="orderItemList"
			:isDisabled="isBillState(1) || isWeightState(1) || isWeightState(2) || !$fxAuth('shopStockInBill.save')"
			:sysStockInChangeUnit="systemParams.sysStockInChangeUnit"
			:itemInputFocusing.sync="itemInputFocusing"
			:hasFatherBillFlag="orderInfoData.fatherId ? true : false"
			@on-add-click="onAddClick"
			@on-scan-click="onScanClick"
			@on-search-click="onSearchClick"
			@on-item-edit="onItemEdit"
			@on-unit-edit="onUnitEdit"
			@on-item-focus="onItemFocus"
		></orderItem>
		<div class="stockInBill-bottom">
			<van-button
				v-show="$fxAuth('shopStockInBill.del') && isBillState(0) && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onDeleteClick">
				删除
			</van-button>
			<van-button
				v-show="$fxAuth('shopStockInBill.save') && isBillState(0) && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius"
				type="info"
				@click="onClickHandler('onSaveClick')">
				保存
			</van-button>
			<van-button
				v-show="$fxAuth('shopStockInBill.check') && isBillState(0) && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius"
				type="primary"
				@click="onClickHandler('onExpressClick')"
			>审核</van-button>
			<van-button
				v-show="$fxAuth('shopStockInBill.unCheck') && isBillState(1) && isBillReState(0) && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onClickHandler('onUnExpressClick')"
			>反审</van-button>
			<van-button
				v-show="$fxAuth('shopStockInBill.reCheck') && isBillState(1) && isBillReState(0)"
				class="bottom-btn fx-no-radius"
				type="primary"
				@click="onClickHandler('onBillReStateClick')"
			>复审</van-button>
			<van-button
				v-show="$fxAuth('shopStockInBill.unReCheck') && isBillReState(1)"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onClickHandler('onUnBillReStateClick')"
			>取消复审</van-button>
			<van-button
				v-show="$fxAuth('shopStockInBill.agree') && isBillState(0) && (isWeightState(0) || isWeightState(3)) && isEdiSendStateFlag(3) && isEdiPriceFlag('0') && (isStockType(0) || isStockType(2))"
				class="fx-no-radius"
				type="info"
				@click="onClickHandler('onAgreeEDIClick')"
			>同意EDI价格</van-button>
			<van-button
				v-show="$fxAuth('shopStockInBill.agree') && isBillState(0) && (isWeightState(0) || isWeightState(3)) && isEdiSendStateFlag(3) && isEdiPriceFlag('1') && (isStockType(0) || isStockType(2))"
				class="fx-no-radius"
				type="info"
				@click="onClickHandler('onRefuseEDIClick')"
			>拒绝EDI价格</van-button>
			<van-button
				v-show="$fxAuth('shopStockInBill.weighState') && isBillState(0) && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius yellow-btn"
				type="info"
				@click="onClickHandler('onWeightClick')"
			>下发称重</van-button>
			<van-button
				v-show="$fxAuth('shopStockInBill.weighState') && isBillState(0) && (isWeightState(1) || isWeightState(2))"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onClickHandler('onUnWeightClick')"
			>取消称重</van-button>
			<van-button
				v-show="$fxAuth('shopStockInBill.weighState') && isBillState(0) && isWeightState(2) && sysDZCManyLower"
				class="bottom-btn fx-no-radius"
				type="info"
				@click="onClickHandler('onEndWeightClick')"
			>结束称重</van-button>
			<van-button
				v-show="$fxAuth('shopStockInBill.quickAccess') && isBillState(1) && isStockType(0)"
				class="bottom-btn fx-no-radius"
				type="info"
				@click="onClickHandler('onQuickAccessClick')"
			>快速领用</van-button>
		</div>
		<van-popup v-model="datePickerShow" position="bottom">
			<w-date-picker :visibleFlag.sync="datePickerShow" :currentDate="currentDate" @confirm="dateConfirmhandle"></w-date-picker>
		</van-popup>
		<van-popup v-model="shopPopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="shopPopShow"
				:data="shopList"
				:loadFinished="shopListLoadFinished"
				:loading.sync="onShopLoading"
				title="请选择门店"
				@on-search="searchShop"
				@on-select="selectShop"
				@on-load="onShopLoad"
			></listComp>
		</van-popup>
		<van-popup v-model="supplierPopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="supplierPopShow"
				:data="supplierList"
				:loadFinished="true"
				title="请选择供货商"
				@on-search="searchSupplier"
				@on-select="selectSupplier"
			></listComp>
		</van-popup>
		<van-popup v-model="billTypePopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="billTypePopShow"
				:data="billTypeList"
				:loadFinished="true"
				title="单据类型检索"
				@on-search="searchBillType"
				@on-select="selectBillType"
			></listComp>
		</van-popup>
		<van-popup
			v-model="itemStorePopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<storeItemComp
				:visibleFlag.sync="itemStorePopShow"
				:storeItemData="storeItem"
				:orderItemList="orderItemList"
				:shopId="orderInfoData.shopDTO && orderInfoData.shopDTO.id"
				:supplierId="orderInfoData.supplierDTO && orderInfoData.supplierDTO.id"
				:businessDate="orderInfoData.businessDate"
				:sysStockInSameGoods="systemParams.sysStockInSameGoods"
				:sysStockInChangeUnit="systemParams.sysStockInChangeUnit"
				:billId="orderInfoData.id"
				@on-save="onStoreItemSave"
			></storeItemComp>
		</van-popup>
			<van-popup
			v-model="storeScanPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<scanStoreComp
				:visibleFlag.sync="storeScanPopShow"
				:storeItemData="storeItem"
				:orderItemList="orderItemList"
				:shopId="orderInfoData.shopDTO && orderInfoData.shopDTO.id"
				:supplierId="orderInfoData.supplierDTO && orderInfoData.supplierDTO.id"
				@on-save="onStoreItemSave"
			></scanStoreComp>
		</van-popup>
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
				:selcetPictureMode="selcetPictureMode"
				@on-selcet-iamge="selcetPictureActionsheet=true"
				:hasFatherBillFlag="orderInfoData.fatherId ? true : false"
				:isDisabled="isBillState(1) || isWeightState(1) || isWeightState(2) || !$fxAuth('shopStockInBill.save')"
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
			v-model="itemSearchPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<itemSearchPop
				:visibleFlag.sync="itemSearchPopShow"
				:data="searchItem"
				:supplierId="orderInfoData.supplierDTO && orderInfoData.supplierDTO.id"
				:isDisabled="isBillState(1) || isWeightState(1) || isWeightState(2) || !$fxAuth('shopStockInBill.save')"
				:sysStockInChangeUnit="systemParams.sysStockInChangeUnit"
				:billId="orderInfoData.id"
				@on-search-confirm="onSearchConfirm"
			></itemSearchPop>
		</van-popup>
		<van-popup
			v-model="quickAccessPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<quickAccessPop
				:visibleFlag.sync="quickAccessPopShow"
				:data="searchItem"
				:shopId="orderInfoData.shopDTO && orderInfoData.shopDTO.id"
				:isDisabled="isBillState(1) || isWeightState(1) || isWeightState(2) || !$fxAuth('shopStockInBill.save')"
				:billId="orderInfoData.id"
				@on-search-confirm="onSearchConfirm"
			></quickAccessPop>
		</van-popup>
		<van-popup
			v-model="uploaderPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<uploaderEditPop
				:visibleFlag.sync="uploaderPopShow"
				:billId="orderInfoData.id"
			></uploaderEditPop>
		</van-popup>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import orderInfo from '@/components/stockInBill/createBill/OrderInfo.vue'
import orderItem from '@/components/stockInBill/createBill/OrderItem.vue'
import listComp from '@/components/common/ListComp.vue'
import storeItemComp from '@/components/stockInBill/common/StoreItemComp.vue'
import itemRowEditPop from '@/components/stockInBill/common/ItemRowEditPop.vue'
import itemSearchPop from '@/components/stockInBill/common/itemSearchPop.vue'
import quickAccessPop from '@/components/stockInBill/common/quickAccessPop.vue'
import uploaderEditPop from '@/components/stockInBill/common/uploaderEditPop.vue'
import scanStoreComp from '@/components/stockInBill/common/ScanStoreComp.vue'
const ITEM_SIZE = 50
export default {
	name: 'stockInBillDetails',
	components: {
		orderInfo,
		orderItem,
		listComp,
		storeItemComp,
		itemRowEditPop,
		itemSearchPop,
		quickAccessPop,
		uploaderEditPop,
		scanStoreComp
	},
	data () {
		return {
			query: this.$route.query,
			orderInfoData: {},
			orderItemList: [],
			dateType: 'business',
			currentDate: new Date(),
			shopPopShow: false,
			shopList: [],
			searchShopKey: null,
			onShopLoading: false,
			shopListLoadFinished: false,
			datePickerShow: false,
			supplierPopShow: false,
			supplierList: [],
			billTypePopShow: false,
			billTypeList: [],
			itemStorePopShow: false,
			storeScanPopShow: false,
			storeItem: [],
			itemEditRowData: {},
			itemRowEditPopShow: false,
			unitActions: [],
			unitActionShow: false,
			itemInputFocusing: false,
			orderDeleteFlag: false,
			modifyBusinessDateFlag: false,
			itemSearchPopShow: false,
			searchItem: [],
			uploaderPopShow: false,
			selcetPictureActionsheet: false,
			selcetPictureMode: {},
			quickAccessPopShow: false,
			actions: [{
				name: '拍摄',
				value: 'Camera'
			}, {
				name: '从手机相册选择',
				value: 'Library'
			}]
		}
	},
	created () {
		this.createOrderDetails().then(() => {
			// 采购入库单业务日期系统设置 0:自定义(可修改); 1:采购订货单审核日期； 2：采购入库单审核日期（Z5新增单据时，去采购机构当前会计期开始日期） 3：采购订货单到货日期
			if (this.systemParams.sysShopInWorkDate === 0) {
				this.modifyBusinessDateFlag = true
			} else {
				this.modifyBusinessDateFlag = false
			}
			if (this.orderInfoData.autoType === 1) { // 手动新增的可以编辑业务日期
				this.modifyBusinessDateFlag = true
			}
		})
	},
	beforeRouteLeave (to, from, next) {
		if (this.itemInputFocusing) {
			this.$router.go(1)
			return false
		}
		if (to.path === '/stockInBill' && !this.orderDeleteFlag && this.orderInfoData.billState === 0) {
			this.$dialog.confirm({
				title: '提示',
				message: '若已修改,请先保存单据<br/>是否关闭页面?'
			}).then(() => {
				next()
			}).catch(() => {
				this.$router.go(1)
				return false
			})
		} else {
			next()
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize',
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId,
			sysDZCManyLower: state => state.systemParams.sysDZCManyLower,
			sysStockInPriceIsZeroPrompt: state => state.systemParams.sysStockInPriceIsZeroPrompt,
			systemParams: 'systemParams'
		}),
		// {{{能否编辑
		/**
		 * 按钮可显示的前提是拥有权限
		 * 0：未审核； 1：已审核
		 * 0：未称重； 1：待称重； 2：称重中； 3：已称重
		 * ediSendState：供货商EDI交互标识；0-未发单；1-已发单；2-已同意；3-已发货；4-已收货；9-被退回
		 * ediPriceFlag：入库单显示同意与拒绝标识；0-拒绝; 1-同意
		 * stockType: 采购类型 0:自采,1:直配 (外销属性 2:代发 3: 直发)
		 * 审核：未称重或已称重并且未审核
		 * 保存：未称重或已称重并且未审核
		 * 反审：未称重或已称重并且已审核、未复审
		 * 复审：已审核（未称重或已称重）
		 * 编辑主单据信息与明细：未称重或已称重并且未审核、未复审
		 * 同意EDI价格：未称重或已称重、未审核、供货商EDI已发货、入库单拒绝、采购类型：自采或外销代发
		 * 拒绝EDI价格：未称重或已称重、未审核、供货商EDI已发货、入库单同意、采购类型：自采或外销代发
		 **/
		isBillState (state) {
			return (state) => {
				if (Object.prototype.toString.call(state) === '[object Array]') {
					return state.includes(this.orderInfoData.billState)
				} else {
					return this.orderInfoData.billState === state
				}
			}
		},
		isBillReState (state) {
			return (state) => {
				if (Object.prototype.toString.call(state) === '[object Array]') {
					return state.includes(this.orderInfoData.billReState)
				} else {
					return this.orderInfoData.billReState === state
				}
			}
		},
		isWeightState (state) {
			return (state) => {
				if (Object.prototype.toString.call(state) === '[object Array]') {
					return state.includes(this.orderInfoData.weightState)
				} else {
					return this.orderInfoData.weightState === state
				}
			}
		},
		isEdiSendStateFlag (state) {
			return (state) => {
				if (Object.prototype.toString.call(state) === '[object Array]') {
					return state.includes(this.orderInfoData.ediSendState)
				} else {
					return this.orderInfoData.ediSendState === state
				}
			}
		},
		isEdiPriceFlag (state) {
			return (state) => {
				if (Object.prototype.toString.call(state) === '[object Array]') {
					return state.includes(this.orderInfoData.ediPriceFlag)
				} else {
					return this.orderInfoData.ediPriceFlag === state
				}
			}
		},
		isStockType (state) {
			return (state) => {
				if (Object.prototype.toString.call(state) === '[object Array]') {
					return state.includes(this.orderInfoData.stockType)
				} else {
					return this.orderInfoData.stockType === state
				}
			}
		}
	},
	methods: {
		createOrderDetails () {
			return new Promise(resolve => {
				this.getOrderDetails().then(res => {
					let orderDetailsData = res.storeBills[0]
					this.orderInfoData = orderDetailsData
					this.orderItemList = this.filterStoreItem(orderDetailsData.details)
					this.setDetailGoodsUUid(this.orderItemList)
					resolve()
				})
			})
		},
		getOrderDetails () {
			return new Promise(resolve => {
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/stockinbills/${this.query.orderId}/users/${this.loginerId}`
				}).then(res => {
					resolve(res)
				})
			})
		},
		filterStoreItem (data) {
			data.forEach(dataItem => {
				let amount = parseFloat(dataItem.busUnitInAmount)
				if (amount && !dataItem.giftFlag) {
					// 数量不为0，且不是赠送，反算单价，便于后期计算
					dataItem.price = this.toFixedNumberSize(dataItem.inMoney / amount)
					dataItem.taxPrice = this.toFixedNumberSize(dataItem.inMoneyWithTax / amount)
				} else {
					// 数量为0，反算单价，便于后期计算
					dataItem.price = this.toFixedNumberSize(dataItem.price)
					dataItem.taxPrice = this.toFixedNumberSize(dataItem.taxPrice)
				}
				dataItem.busUnitInAmount = this.toFixedNumberSize(amount)
				dataItem.inMoney = this.toFixedNumberSize(dataItem.inMoney)
				dataItem.rawAmount = this.toFixedNumberSize(dataItem.rawAmount)
				dataItem.taxInMoney = this.toFixedNumberSize(dataItem.taxInMoney)
				dataItem.inMoneyWithTax = this.toFixedNumberSize(dataItem.inMoneyWithTax)
			})
			let stores = Array.from(new Set(data.map(item => {
				return item.inHouseDTO.id
			})))
			let StoreItem = stores.map(item => {
				let storeObj = data.find(dataItem => {
					return dataItem.inHouseDTO.id === item
				}).inHouseDTO
				storeObj = JSON.parse(JSON.stringify(storeObj))
				storeObj.details = data.filter(dataItem => {
					return dataItem.inHouseDTO.id === item
				})
				return storeObj
			})
			return StoreItem
		},
		setDetailGoodsUUid (data) { // 存在重复品项，故设置UUId
			data.forEach(dataItem => {
				dataItem.details.forEach(item => {
					item.goodsUUid = this.$fxUtils.createUUID()
				})
			})
		},
		// {{{ 入库机构
		onShopClick () {
			if (this.$fxStateMiddleware.stateIs('loginerOrganType')('shop')(this.loginerOrganType)) {
				return true
			}
			this.shopListStart = 0
			this.searchShopKey = null
			this.shopListLoadFinished = false
			this.onShopRefresh()
		},
		searchShop (keyword) {
			this.shopListStart = 0
			this.searchShopKey = keyword
			this.onShopRefresh()
		},
		onShopLoad () {
			this.getShopListData().then(res => {
				this.shopList.push(...res.shops)
			})
		},
		onShopRefresh () {
			this.getShopListData().then(res => {
				this.shopList = res.shops
				this.shopPopShow = true
			})
		},
		getShopListData () {
			return new Promise(resolve => {
				let params = {
					start: this.shopListStart,
					size: ITEM_SIZE,
					m: 'list4ShopOtherOrderBill4Edit',
					keyword: this.searchShopKey
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/shops`,
					data: params
				}).then(res => {
					this.onShopLoading = false
					this.shopListStart += ITEM_SIZE
					if (res.shops.length < ITEM_SIZE) {
						this.shopListLoadFinished = true
					} else {
						this.shopListLoadFinished = false
					}
					resolve(res)
				})
			})
		},
		selectShop (item) {
			this.checkShop(item).then(() => {
				this.clearItemConfim('更换入库机构清空供货商和明细,是否继续?').then(() => {
					this.orderInfoData.shopDTO = item
					this.orderInfoData.supplierDTO = {}
					if (this.systemParams.sysShopInWorkDate === 2) {
						this.$fxHttp.requestGet({
							url: `${this.$fxBaseApi.url}/accounts/${item.id}/users/${this.loginerId}/nextaccountperiod`
						}).then(res => {
							if (res.shopAccountPeriods.length) {
								this.orderInfoData.businessDate = res.shopAccountPeriods[0].beginDate
							}
						})
					}
				})
			})
		},
		checkShop (shop) {
			return new Promise(resolve => {
				let currentShop = this.orderInfoData.shopDTO || {}
				if (currentShop.id !== shop.id) {
					resolve()
				}
			})
		},
		// }}}
		// {{{供货商类型
		onSupplierClick () {
			if (!this.orderInfoData.shopDTO.id) {
				this.$fxToast.fail('请选择入库机构！')
				return false
			}
			this.getSupplierListData().then(res => {
				this.supplierList = res.suppliers
				this.supplierPopShow = true
			})
		},
		searchSupplier (keyword) {
			this.getSupplierListData(keyword).then(res => {
				this.supplierList = res.suppliers
				this.supplierPopShow = true
			})
		},
		getSupplierListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					paged: true,
					size: 50,
					start: 0,
					searchText: keyword
				}
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/accounts/${this.orderInfoData.shopDTO.id}/users/${this.loginerId}/suppliers`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		selectSupplier (item) {
			this.checkSupplier(item).then(() => {
				this.clearItemConfim('更换供货商清空明细，是否确认修改?').then(() => {
					this.orderInfoData.supplierDTO = item
				})
			})
		},
		checkSupplier (supplier) {
			return new Promise(resolve => {
				let currentSupplier = this.orderInfoData.supplierDTO || {}
				if (currentSupplier.id !== supplier.id) {
					resolve()
				}
			})
		},
		// }}}
		onBusinessDateClick () {
			this.dateType = 'business'
			this.datePickerShow = true
		},
		onOrderDateClick () {
			this.dateType = 'order'
			this.datePickerShow = true
		},
		dateConfirmhandle (date) {
			let time = date.getTime()
			if (this.dateType === 'business') {
				this.orderInfoData.businessDate = time
			} else {
				this.orderInfoData.orderDate = time
			}
			this.datePickerShow = false
		},
		getBillTypeListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					m: 'list4ShopStockInBillEdit',
					keyword: keyword
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/businessTypes`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		onBillTypeClick () {
			this.getBillTypeListData().then(res => {
				this.billTypeList = res.businessTypes
				this.billTypePopShow = true
			})
		},
		searchBillType (keyword) {
			this.getBillTypeListData(keyword).then(res => {
				this.billTypeList = res.businessTypes
				this.billTypePopShow = true
			})
		},
		selectBillType (item) {
			this.orderInfoData.businessTypeDTO = item
		},
		onBillTypeClear () {
			this.orderInfoData.businessTypeDTO = {}
		},
		clearItemConfim (message) {
			return new Promise(resolve => {
				let items = this.orderItemList.filter(item => {
					let details = item.details.filter(details => {
						return details.changeType !== 'del'
					})
					if (details.length === 0) {
						return false
					} else {
						return true
					}
				})
				if (items.length === 0) {
					resolve()
				} else {
					this.$dialog.confirm({
						title: '提示',
						message: message
					}).then(() => {
						this.onItemClear()
						resolve()
					}).catch(() => {
					})
				}
			})
		},
		onItemClear () {
			this.orderInfoData.details = []
			this.orderItemList = this.orderInfoData.details
		},
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
		onAddClick () {
			this.checkOrderInfo().then(() => {
				this.storeItem = JSON.parse(JSON.stringify(this.orderItemList))
				this.itemStorePopShow = true
			})
		},
		onScanClick () {
			this.checkOrderInfo().then(() => {
				this.storeItem = JSON.parse(JSON.stringify(this.orderItemList))
				this.storeScanPopShow = true
			})
		},
		checkOrderInfo () {
			return new Promise((resolve, reject) => {
				if (!this.orderInfoData.businessDate) {
					this.$toast.fail('请先选择业务日期!')
				} else {
					resolve()
				}
			})
		},
		onStoreItemSave (storeItemData) {
			this.orderItemList = storeItemData
			this.setDetailGoodsUUid(this.orderItemList)
		},
		onSaveClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要保存该单据吗?'
			}).then(() => {
				this.checkDetails().then(() => {
					let params = this.getSaveParams()
					this.saveHandler(params)
				})
			}).catch(() => {
			})
		},
		saveHandler (params) {
			this.$fxHttp.requestPut({
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/stockinbills/${this.query.orderId}/users/${this.loginerId}`,
				data: params,
				query: {
					m: 'modify'
				}
			}).then(res => {
				this.createOrderDetails().then(() => {
					this.$fxToast.success('保存成功')
				})
			})
		},
		onExpressClick () {
			this.checkDetails().then(() => {
				let msg = ''
				if (this.sysStockInPriceIsZeroPrompt) {
					let hasZeroMoney = this.orderItemList.find(item => {
						return item.details.find(detailItem => {
							return detailItem.inMoneyWithTax === 0 && !detailItem.giftFlag
						})
					})
					if (hasZeroMoney) {
						msg = '存在非赠品价格为0的品项，是否继续审核?'
					} else {
						msg = '确定要审核该单据吗?'
					}
				} else {
					msg = '确定要审核该单据吗?'
				}
				this.$dialog.confirm({
					title: '提示',
					message: msg
				}).then(() => {
					this.expressHandler()
				})
			})
		},
		expressHandler () {
			this.checkDetails().then(() => {
				let params = this.getSaveParams()
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/stockinbills/${this.query.orderId}/users/${this.loginerId}`,
					data: params,
					query: {
						userId: this.loginerId,
						m: 'editAndCheck'
					}
				}).then(res => {
					this.createOrderDetails().then(() => {
						this.$fxToast.success('审核成功')
					})
				}).catch(error => {
					if (error.errorCode === '1') {
						this.createOrderDetails()
					}
				})
			})
		},
		onUnExpressClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要反审该单据吗?'
			}).then(() => {
				let params = this.getSaveParams()
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/stockinbills/${this.query.orderId}/users/${this.loginerId}`,
					data: params,
					query: {
						m: 'unCheck'
					}
				}).then(res => {
					this.createOrderDetails().then(() => {
						this.$fxToast.success('反审成功')
					})
				})
			}).catch(() => {
			})
		},
		onDeleteClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要删除该单据吗?'
			}).then(() => {
				let params = this.getSaveParams()
				this.$fxHttp.requestDel({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/stockinbills/${this.query.orderId}/users/${this.loginerId}`,
					data: params
				}).then(res => {
					this.$fxToast.success('删除成功').then(() => {
						this.itemInputFocusing = false
						this.orderDeleteFlag = true
						this.$router.go(-1)
					})
				})
			}).catch(() => {
			})
		},
		onBillReStateClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要复审该单据吗?'
			}).then(() => {
				let params = this.getSaveParams()
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/stockinbills/${this.query.orderId}/users/${this.loginerId}`,
					data: params,
					query: {
						m: 'reCheck'
					}
				}).then(res => {
					this.createOrderDetails().then(() => {
						this.$fxToast.success('复审成功')
					})
				})
			}).catch(() => {
			})
		},
		onUnBillReStateClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要取消复审该单据吗?'
			}).then(() => {
				let params = this.getSaveParams()
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/stockinbills/${this.query.orderId}/users/${this.loginerId}`,
					data: params,
					query: {
						m: 'unReCheck'
					}
				}).then(res => {
					this.createOrderDetails().then(() => {
						this.$fxToast.success('取消复审成功')
					})
				})
			}).catch(() => {
			})
		},
		onAgreeEDIClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定同意EDI价格吗？'
			}).then(() => {
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/stockinbills/${this.query.orderId}/users/${this.loginerId}`,
					query: {
						m: 'ediAgree'
					}
				}).then(res => {
					this.createOrderDetails().then(() => {
						this.$fxToast.success('同意EDI价格成功')
					})
				})
			}).catch(() => {
			})
		},
		onRefuseEDIClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定拒绝EDI价格吗？'
			}).then(() => {
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/stockinbills/${this.query.orderId}/users/${this.loginerId}`,
					query: {
						m: 'ediReturn'
					}
				}).then(res => {
					this.createOrderDetails().then(() => {
						this.$fxToast.success('拒绝EDI价格成功')
					})
				})
			}).catch(() => {
			})
		},
		// {{{称重
		onWeightClick () {
			this.checkDetails().then(() => {
				this.$dialog.confirm({
					title: '提示',
					message: '确定要下发称重吗?'
				}).then(() => {
					let params = this.getSaveParams()
					if (!params) {
						return false
					}
					this.$fxHttp.requestPut({
						url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/stockinbills/${this.query.orderId}/users/${this.loginerId}`,
						data: params,
						query: {
							userId: this.loginerId,
							m: 'weighBill'
						}
					}).then(res => {
						this.createOrderDetails().then(() => {
							this.$fxToast.success('下发称重成功')
						})
					})
				}).catch(() => {
				})
			})
		},
		onUnWeightClick () {
			this.checkDetails().then(() => {
				let msg = '确定要取消称重吗?'
				if (this.orderInfoData.weighState === 2) {
					msg = '称重中的单据，取消称重后电子秤可以继续称重并传回数据！确定要取消称重吗'
				}
				this.$dialog.confirm({
					title: '提示',
					message: msg
				}).then(() => {
					this.$fxHttp.requestPut({
						url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/stockinbills/${this.query.orderId}/users/${this.loginerId}`,
						query: {
							userId: this.loginerId,
							m: 'unWeighBill'
						}
					}).then(res => {
						this.createOrderDetails().then(() => {
							this.$fxToast.success('取消称重成功')
						})
					})
				}).catch(() => {
				})
			})
		},
		onEndWeightClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '结束称重后将不再接收此单据的称重数据'
			}).then(() => {
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/stockinbills/${this.query.orderId}/users/${this.loginerId}`,
					query: {
						userId: this.loginerId,
						m: 'endWeighBill'
					}
				}).then(res => {
					this.createOrderDetails().then(() => {
						this.$fxToast.success('结束称重成功')
					})
				})
			}).catch(() => {
			})
		},
		// }}}
		/// {{{快速领用
		onQuickAccessClick () {
			this.quickAccessPopShow = true
			this.searchItem = JSON.parse(JSON.stringify(this.orderItemList))
		},
		// }}}
		onClickHandler (method) {
			if (this.itemInputFocusing) {
				return false
			}
			this[method]()
		},
		getSaveParams () {
			let itemDetails = []
			this.orderItemList.forEach(item => {
				itemDetails.push(...item.details)
			})
			let addItems = itemDetails.filter(item => {
				return item.changeType === 'add'
			})
			let delItems = itemDetails.filter(item => {
				return item.changeType === 'del'
			})
			let editItems = itemDetails.filter(item => {
				return item.changeType === 'edit'
			})
			let params = Object.assign(this.orderInfoData, {
				detailAdd: addItems.length > 0 ? addItems : null,
				detailDel: delItems.length > 0 ? delItems : null,
				detailMdf: editItems.length > 0 ? editItems : null,
				details: []
			})
			return params
		},
		checkDetails () {
			return new Promise(resolve => {
				let itemDetails = []
				this.orderItemList.forEach(item => {
					itemDetails.push(...item.details)
				})
				if (this.$fxSysAuth('shopStockInBill.sysStockProductionDate')) {
					let produceDateItem = itemDetails.reduce((pre, cur) => {
						let arr = ''
						if (!cur.productDate && cur.goodsDTO.periodFlag && cur.changeType !== 'del') {
							arr = pre === '' ? pre + cur.goodsDTO.name : pre + '<br/>' + cur.goodsDTO.name
						} else {
							arr = pre
						}
						return arr
					}, '')
					if (produceDateItem !== '') {
						this.$dialog.alert({
							title: '提示',
							message: produceDateItem + '生产日期不能为空！'
						})
						return false
					}
				}
				let items = itemDetails.filter(item => {
					return item.changeType !== 'del'
				})
				// 47102 zj
				if (this.orderInfoData.autoType === 0 || this.orderInfoData.autoType === 7) {
				} else {
					if (this.$fxAuth('shopStockInBill.billMemoRequired') && !this.orderInfoData.billMemo) {
						this.$fxToast.fail('请填写备注!')
						return false
					}
				}
				if (items.length === 0) {
					this.$fxToast.fail('单据明细不能为空')
				} else {
					resolve()
				}
			})
		},
		onItemEdit (itemData) {
			this.itemEditRowData = itemData
			this.itemRowEditPopShow = true
		},
		onEditRowConfirm (item) {
			let storeIndex = this.orderItemList.findIndex(storeItem => {
				return storeItem.id === item.inHouseDTO.id
			})
			if (~storeIndex) {
				let detailsIndex = this.orderItemList[storeIndex].details.findIndex(detailsItem => {
					return detailsItem.goodsUUid === item.goodsUUid
				})
				if (~detailsIndex) {
					this.orderItemList[storeIndex].details[detailsIndex] = item
				}
			}
		},
		onItemFocus () {
			this.$refs.orderInfo.closeCollapse()
		},
		// {{{ 搜索界面
		onSearchClick () {
			this.itemSearchPopShow = true
			this.searchItem = JSON.parse(JSON.stringify(this.orderItemList))
		},
		// }}}
		onSearchConfirm (searchItemData) {
			this.orderItemList = searchItemData
		},
		onUploaderClick () {
			this.uploaderPopShow = true
		},
		onSelect (item) {
			this.selcetPictureMode = {
				...item,
				random: Math.random()
			}
			this.selcetPictureActionsheet = false
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.inteledi-stockInBill-details {
	height:100%
	background:$fxWhite
	display: flex
	flex-direction: column
	.stockInBill-bottom {
		width:100%
		display: flex
		flex-direction: row
		.bottom-btn {
			flex:1
			padding: 0px
		}
		.yellow-btn {
			background-color: $fxYellow
			border: 1px solid $fxYellow
		}
	}
}
</style>

