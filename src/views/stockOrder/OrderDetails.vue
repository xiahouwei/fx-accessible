<template>
	<div class="inteledi-shopOrder-details">
		<w-header :title="orderInfoData.sysbillCode" titleFontSize="3.733vw" :border="true"></w-header>
		<orderInfo
			ref="orderInfo"
			:data="orderInfoData"
			:isDisabled="isBillState(1) || !$fxAuth('stockOrderBill.save')"
			:collapseDisabled="itemInputFocusing"
			@on-shop-click="onShopClick"
			@on-busdate-click="onBusinessDateClick"
			@on-arriveDate-click="onArriveDateClick"
			@on-billType-click="onBillTypeClick"
			@on-supplier-click="onSupplierClick"
			@on-item-clear="onItemClear"
			@on-billType-clear="onBillTypeClear"
		></orderInfo>
		<orderItem
			ref="orderItem"
			:data="orderItemList"
			:isDisabled="isBillState(1) || !$fxAuth('stockOrderBill.save') || isStockType(2)"
			:itemInputFocusing.sync="itemInputFocusing"
			:shopId="orderInfoData.shopDTO && orderInfoData.shopDTO.id"
			:supplierId="orderInfoData.supplierDTO && orderInfoData.supplierDTO.id"
			:couldChangePrice="orderInfoData.supplierDTO && orderInfoData.supplierDTO.couldChangePrice"
			:stockType="orderInfoData.stockType"
			:fatherId="orderInfoData.fatherId ? true : false"
			@on-add-click="onAddClick"
			@on-unit-edit="onUnitEdit"
			@on-search-click="onSearchClick"
			@on-item-edit="onItemEdit"
			@on-item-focus="onItemFocus"
		></orderItem>
		<div class="shopOrder-bottom">
			<van-button
				v-show="isBillState(0) && $fxAuth('stockOrderBill.del')"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onDeleteClick"
			>删除</van-button>
			<van-button
				v-show="$fxAuth('stockOrderBill.copy') && !isStockType([1,2])"
				class="bottom-btn fx-no-radius"
				type="primary"
				@click="onClickHandler('onCopyClick')"
			>复制</van-button>
			<van-button
				v-show="isBillState(0) && $fxAuth('stockOrderBill.check')"
				class="bottom-btn fx-no-radius"
				type="info"
				@click="onClickHandler('onExpressClick')"
			>审核</van-button>
			<van-button
				v-show="isBillState(1) && $fxAuth('stockOrderBill.unCheck')"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onClickHandler('onUnExpressClick')"
			>反审</van-button>
			<van-button
				v-show="isBillState(0) && $fxAuth('stockOrderBill.save')"
				class="bottom-btn fx-no-radius"
				type="primary"
				@click="onClickHandler('onSaveClick')"
			>保存</van-button>
			<van-button
				v-show="isEdiState(['0', '4', '9']) && isBillState(1) && $fxAuth('stockOrderBill.sendbilltosupplieredi')"
				class="bottom-btn fx-no-radius"
				type="info"
				@click="onClickHandler('onSendEdiClick')"
			>发送EDI</van-button>
			<van-button
				v-show="isEdiState(['1', '2', '3']) && isBillState(1) && $fxAuth('stockOrderBill.recallbillfromedi')"
				class="bottom-btn fx-no-radius"
				type="info"
				@click="onClickHandler('onSendEdiBackClick')"
			>撤销发单</van-button>
		</div>
		<van-popup v-model="shopPopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="shopPopShow"
				:data="shopList"
				:loadFinished="true"
				title="请选择机构"
				@on-search="searchShop"
				@on-select="selectShop"
			></listComp>
		</van-popup>
		<van-popup v-model="datePickerShow" position="bottom">
			<w-date-picker
				:visibleFlag.sync="datePickerShow"
				:currentDate="currentDate"
				@confirm="dateConfirmhandle"
			></w-date-picker>
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
		<van-popup v-model="supplierPopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="supplierPopShow"
				:data="supplierList"
				:loadFinished="true"
				title="供货商检索"
				@on-search="searchSupplier"
				@on-select="selectSupplier"
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
				:shopId="orderInfoData.shopDTO && orderInfoData.shopDTO.id"
				:businessDate="orderInfoData.businessDate"
				:supplierId="orderInfoData.supplierDTO && orderInfoData.supplierDTO.id"
				@on-save="onStoreItemSave"
				@on-select-store="onStoreItemSelect"
			></storeItemComp>
		</van-popup>
		<van-popup
			v-model="itemPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<itemEditComp
				:visibleFlag.sync="itemPopShow"
				:businessDate="orderInfoData.businessDate"
				:shopId="orderInfoData.shopDTO && orderInfoData.shopDTO.id"
				:store="currentStoreObj"
				:supplierId="orderInfoData.supplierDTO && orderInfoData.supplierDTO.id"
				:parentStoreItem="getStoreItem()"
				@on-confirm="onItemEditConfirm"
			></itemEditComp>
		</van-popup>
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
				:isDisabled="isBillState(1) || !$fxAuth('stockOrderBill.save') || isStockType(2)"
				:stockType="orderInfoData.stockType"
				:couldChangePrice="orderInfoData.supplierDTO && orderInfoData.supplierDTO.couldChangePrice"
				@on-Confirm="onEditRowConfirm"
			></itemRowEditPop>
		</van-popup>
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
				:isDisabled="isBillState(1) || !$fxAuth('stockOrderBill.save') || isStockType(2)"
				:couldChangePrice="orderInfoData.supplierDTO && orderInfoData.supplierDTO.couldChangePrice"
				:stockType="orderInfoData.stockType"
				@on-search-confirm="onSearchConfirm"
			></itemSearchPop>
		</van-popup>
		<van-actionsheet
			v-model="unitActionShow"
			:actions="unitActions"
			cancel-text="取消"
			@select="onUnitSelect"
		/>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import orderInfo from '@/components/stockOrder/createOrder/OrderInfo.vue'
import orderItem from '@/components/stockOrder/createOrder/OrderItem.vue'
import listComp from '@/components/common/ListComp.vue'
import storeItemComp from '@/components/stockOrder/common/StoreItemComp.vue'
import itemRowEditPop from '@/components/stockOrder/common/ItemRowEditPop.vue'
import itemSearchPop from '@/components/stockOrder/common/itemSearchPop.vue'
import itemEditComp from '@/components/stockOrder/common/itemEditComp.vue'
export default {
	name: 'stockOrderDetails',
	components: {
		orderInfo,
		orderItem,
		listComp,
		storeItemComp,
		itemRowEditPop,
		itemSearchPop,
		itemEditComp
	},
	data () {
		return {
			query: this.$route.query,
			activeNames: ['1'],
			tabActive: '选项1',
			orderInfoData: {},
			orderItemList: [],
			dateType: 'business',
			currentDate: new Date(),
			shopPopShow: false,
			shopList: [],
			datePickerShow: false,
			billTypePopShow: false,
			billTypeList: [],
			supplierPopShow: false,
			supplierList: [],
			itemStorePopShow: false,
			storeItem: [],
			itemSearchPopShow: false,
			itemRowEditPopShow: false,
			itemEditRowData: {},
			unitActionShow: false,
			unitActions: [],
			itemInputFocusing: false,
			orderDeleteFlag: false,
			formatterSysPointKey: ['busUnitAmount'],
			searchItem: [],
			currentStoreObj: {},
			itemPopShow: false
		}
	},
	created () {
		this.createOrderDetails()
	},
	beforeRouteLeave (to, from, next) {
		if (this.itemInputFocusing) {
			this.$router.go(1)
			return false
		}
		if (to.path === '/stockOrder' && !this.orderDeleteFlag && this.orderInfoData.billState === 0) {
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
			sysStockOrderPriceIsZeroPrompt: state => state.systemParams.sysStockOrderPriceIsZeroPrompt,
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId
		}),
		isBillState (state) {
			return state => {
				if (Object.prototype.toString.call(state) === '[object Array]') {
					return state.includes(this.orderInfoData.billState)
				} else {
					return this.orderInfoData.billState === state
				}
			}
		},
		// 0未发单 1已发单 2已同意 3已发货 4已收货 9被退回 049可点击
		isEdiState (state) {
			return state => {
				if (Object.prototype.toString.call(state) === '[object Array]') {
					return state.includes(this.orderInfoData.ediInteractionFlag)
				} else {
					return this.orderInfoData.ediInteractionFlag === state
				}
			}
		},
		// 生成方式 0自采 1直配 2外销 0可编辑
		// 直配、外销不能复制
		isStockType (state) {
			return state => {
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
					let orderDetailsData = res.stockOrderBills[0]
					this.formatterSysPoint(orderDetailsData.details)
					this.orderInfoData = orderDetailsData
					this.orderItemList = this.filterStoreItem(orderDetailsData.details)
					resolve()
				})
			})
		},
		getOrderDetails () {
			return new Promise(resolve => {
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/stockOrder/${this.query.orderId}`
				}).then(res => {
					resolve(res)
				})
			})
		},
		formatterSysPoint (data) {
			let toFixedNumberSize = (data) => {
				return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysPointSize))
			}
			data.forEach(item => {
				this.formatterSysPointKey.forEach(pointItem => {
					item[pointItem] = toFixedNumberSize(item[pointItem])
				})
			})
		},
		filterStoreItem (data) {
			// 重新计算金额
			data.forEach(dataItem => {
				let amount = parseFloat(dataItem.busUnitAmount)
				if (dataItem.money !== 0) { // 采购订货单数量大于0
					// 价格不为0，反算单价
					dataItem.price = this.toFixedNumberSize(dataItem.money / amount)
					dataItem.taxPrice = this.toFixedNumberSize(dataItem.moneyWithTax / amount)
				} else {
					// 价格为0，不反算单价
					dataItem.price = this.toFixedNumberSize(dataItem.price)
					dataItem.taxPrice = this.toFixedNumberSize(dataItem.taxPrice)
				}
				dataItem.busUnitAmount = this.toFixedNumberSize(amount)
				dataItem.money = this.toFixedNumberSize(dataItem.money)
				dataItem.taxMoney = this.toFixedNumberSize(dataItem.taxMoney)
				dataItem.moneyWithTax = this.toFixedNumberSize(dataItem.moneyWithTax)
			})
			let stores = Array.from(new Set(data.map(item => {
				return item.houseDTO.id
			})))
			let StoreItem = stores.map(item => {
				let storeObj = data.find(dataItem => {
					return dataItem.houseDTO.id === item
				}).houseDTO
				storeObj = JSON.parse(JSON.stringify(storeObj))
				storeObj.details = data.filter(dataItem => {
					return dataItem.houseDTO.id === item
				})
				return storeObj
			})
			return StoreItem
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
		// {{{ 门店
		onShopClick () {
			this.onShopRefresh()
		},
		searchShop (keyword) {
			this.onShopRefresh(keyword)
		},
		selectShop (item) {
			this.checkShop(item).then(() => {
				this.clearItemConfim('更换机构会清空品项,是否继续?').then(() => {
					this.orderInfoData.shopDTO = item
					this.orderInfoData.supplierDTO = {}
				})
			})
		},
		checkShop (shopDTO) {
			return new Promise(resolve => {
				let currentInShopDTO = this.orderInfoData.shopDTO
				if (currentInShopDTO.id !== shopDTO.id) {
					resolve()
				}
			})
		},
		onShopRefresh (keyword = null) {
			this.getShopListData(keyword).then(res => {
				this.shopList = res.shops
				this.shopPopShow = true
			})
		},
		getShopListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					m: 'list4ShopOtherOrderBill4Edit',
					keyword: keyword
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/shops`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		// }}}
		// {{{ 单据类型
		onBillTypeClick () {
			this.onBillTYpeRefresh()
		},
		searchBillType (keyword) {
			this.onBillTYpeRefresh(keyword)
		},
		selectBillType (item) {
			this.orderInfoData.businessTypeDTO = item
		},
		onBillTypeClear () {
			this.orderInfoData.businessTypeDTO = {}
		},
		onBillTYpeRefresh (keyword = null) {
			this.getBillTypeListData(keyword).then(res => {
				this.billTypeList = res.businessTypes
				this.billTypePopShow = true
			})
		},
		getBillTypeListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					billType: '7_1',
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
		// }}}
		// {{{供货商
		onSupplierClick () {
			if (!this.orderInfoData.shopDTO.id) {
				this.$fxToast.fail('请选择入库机构！')
				return false
			}
			this.supplierRefresh()
		},
		searchSupplier (keyword) {
			this.supplierRefresh(keyword)
		},
		selectSupplier (item) {
			this.checkSupplier(item).then(() => {
				this.clearItemConfim('更换供货商会清空品项,是否继续?').then(() => {
					this.orderInfoData.supplierDTO = item
				})
			})
		},
		checkSupplier (supplierDTO) {
			return new Promise(resolve => {
				let currentInSupplierDTO = this.orderInfoData.supplierDTO
				if (currentInSupplierDTO.id !== supplierDTO.id) {
					resolve()
				}
			})
		},
		supplierRefresh (keyword = null) {
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
					keyword: keyword,
					m: 'getListByKeywordToPlan',
					sType: this.orderInfoData.stockType
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.orderInfoData.shopDTO.id}/users/${this.loginerId}/suppliers`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		// }}}
		onBusinessDateClick () {
			this.dateType = 'business'
			if (this.orderInfoData.businessDate) this.currentDate = new Date(this.orderInfoData.businessDate)
			this.datePickerShow = true
		},
		onArriveDateClick () {
			this.dateType = 'arrive'
			if (this.orderInfoData.arriveDate) this.currentDate = new Date(this.orderInfoData.arriveDate)
			this.datePickerShow = true
		},
		dateConfirmhandle (date) {
			let time = date.getTime()
			if (this.dateType === 'business') {
				this.orderInfoData.businessDate = time
			} else {
				this.orderInfoData.arriveDate = time
			}
			this.datePickerShow = false
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
			let amount = parseFloat(item.busUnitAmount)
			if (amount > 0) {
				amount = amount * oldUnitRate / newUnit.value
				item.busUnitAmount = parseFloat(this.$fxUtils.toFixedSHW(amount, this.sysPointSize))
				this.calcMoney('moneyWithTax', item.moneyWithTax, item)
			} else {
				item.taxPrice = parseFloat(item.taxPrice) * newUnit.value / oldUnitRate
				this.calcMoney('taxPrice', item.taxPrice, item)
			}
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
			let { taxPrice, busUnitAmount, price, tax } = itemData
			let money = 0
			let moneyWithTax = 0
			let itemPrice = 0
			let itemTaxPrice = 0
			amountOrMoney = this.toFixedNumberSize(amountOrMoney)
			if (itemData.giftFlag || (target === 'money' && amountOrMoney === 0)) {
				// 赠送、数量为0
				itemData.money = 0
				itemData.moneyWithTax = 0
				itemData.taxMoney = 0
				return true
			}
			if (target === 'money') {
				money = amountOrMoney
				itemPrice = this.toFixedNumberSize(money / busUnitAmount)
				moneyWithTax = money * (1 + tax)
				itemTaxPrice = this.toFixedNumberSize(moneyWithTax / busUnitAmount)
			} else if (target === 'amount') {
				itemData.busUnitAmount = amountOrMoney
				itemPrice = price
				itemTaxPrice = taxPrice
				money = this.toFixedNumberSize(price * amountOrMoney)
				moneyWithTax = this.toFixedNumberSize(taxPrice * amountOrMoney)
			} else if (target === 'moneyWithTax') {
				moneyWithTax = amountOrMoney
				itemTaxPrice = this.toFixedNumberSize(moneyWithTax / busUnitAmount)
				money = this.toFixedNumberSize(moneyWithTax / (1 + tax))
				itemPrice = this.toFixedNumberSize(money / busUnitAmount)
			} else if (target === 'taxPrice') {
				itemTaxPrice = amountOrMoney
				moneyWithTax = this.toFixedNumberSize(busUnitAmount * itemTaxPrice)
				itemPrice = this.toFixedNumberSize(itemTaxPrice / (1 + tax))
				money = this.toFixedNumberSize(itemPrice * busUnitAmount)
			} else if (target === 'price') {
				itemPrice = amountOrMoney
				money = this.toFixedNumberSize(itemPrice * busUnitAmount)
				itemTaxPrice = this.toFixedNumberSize(itemPrice * (1 + tax))
				moneyWithTax = this.toFixedNumberSize(busUnitAmount * itemTaxPrice)
			}
			itemData.money = money
			itemData.moneyWithTax = moneyWithTax
			itemData.taxMoney = this.toFixedNumberSize(this.toFixedNumberSize(moneyWithTax) - this.toFixedNumberSize(money))
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
		checkOrderInfo () {
			return new Promise((resolve, reject) => {
				if (!this.orderInfoData.businessDate) {
					this.$toast.fail('请先选择业务日期!')
				} else if (!this.orderInfoData.shopDTO.id) {
					this.$toast.fail('请先选择门店!')
				} else if (!this.orderInfoData.supplierDTO.id) {
					this.$toast.fail('请先选择供货商!')
				} else if (!this.orderInfoData.arriveDate) {
					this.$toast.fail('请先选择到货日期!')
				} else {
					resolve()
				}
			})
		},
		// {{{ 搜索界面
		onSearchClick () {
			this.itemSearchPopShow = true
			this.searchItem = JSON.parse(JSON.stringify(this.orderItemList))
		},
		// }}}
		onStoreItemSave (storeItemData) {
			this.orderItemList = storeItemData
		},
		onSaveClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要保存该单据吗?'
			}).then(() => {
				this.checkHasDetails().then(() => {
					this.saveHandler().then(res => {
						this.createOrderDetails().then(() => {
							this.$fxToast.success(res.message)
						})
					})
				})
			}).catch(() => {
			})
		},
		saveHandler () {
			return new Promise(resolve => {
				let params = this.getSaveParams()
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/stockOrder/${this.query.orderId}/users/${this.loginerId}`,
					data: params,
					query: {
						userId: this.loginerId,
						m: 'modify'
					}
				}).then(res => {
					resolve(res)
				})
			})
		},
		onExpressClick () {
			this.checkHasDetails().then(() => {
				let msg = ''
				if (this.sysStockOrderPriceIsZeroPrompt) {
					let hasZeroMoney = this.orderItemList.find(item => {
						return item.details.find(detailItem => {
							if (this.orderInfoData.stockType === 1 && !detailItem.giftFlag && (detailItem.money === 0 || detailItem.noTaxCostMoney === 0)) {
								return true
							} else if ((this.orderInfoData.stockType === 0 || this.orderInfoData.stockType === 2) && !detailItem.giftFlag && detailItem.money === 0) {
								return true
							}
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
			this.checkHasDetails().then(() => {
				let params = this.getSaveParams()
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/stockOrder/${this.query.orderId}/users/${this.loginerId}`,
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
				this.checkHasDetails().then(() => {
					let params = this.getSaveParams()
					this.unExpressHandler(params)
				})
			}).catch(() => {
			})
		},
		unExpressHandler (params) {
			this.$fxHttp.requestPut({
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/stockOrder/${this.query.orderId}/users/${this.loginerId}`,
				data: params,
				query: {
					userId: this.loginerId,
					m: 'unCheck'
				}
			}).then(res => {
				this.createOrderDetails().then(() => {
					this.$fxToast.success('反审成功')
				})
			})
		},
		onCopyClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要复制该单据吗?'
			}).then(() => {
				this.checkHasDetails().then(() => {
					let params = this.getSaveParams()
					this.copyHandler(params)
				})
			}).catch(() => {
			})
		},
		copyHandler (params) {
			this.$fxHttp.requestPut({
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/stockOrder/${this.query.orderId}/users/${this.loginerId}`,
				data: params,
				query: {
					userId: this.loginerId,
					m: 'copy'
				}
			}).then(res => {
				this.createOrderDetails().then(() => {
					this.$fxToast.success('复制成功')
				})
			})
		},
		onDeleteClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要删除该单据吗?'
			}).then(() => {
				let params = this.getSaveParams()
				this.$fxHttp.requestDel({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/stockOrder/${this.query.orderId}/users/${this.loginerId}`,
					data: params,
					query: {
						userId: this.loginerId
					}
				}).then(res => {
					this.$fxToast.success({
						message: '删除成功',
						mask: true
					}).then(() => {
						this.itemInputFocusing = false
						this.orderDeleteFlag = true
						this.$router.go(-1)
					})
				})
			}).catch(() => {
			})
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
			let params = Object.assign({}, this.orderInfoData, {
				detailAdd: addItems.length > 0 ? addItems : null,
				detailDel: delItems.length > 0 ? delItems : null,
				detailMdf: editItems.length > 0 ? editItems : null,
				details: []
			})
			return params
		},
		getValidItem () {
			let itemDetails = []
			this.orderItemList.forEach(item => {
				itemDetails.push(...item.details)
			})
			return itemDetails.filter(item => {
				return item.changeType !== 'del'
			})
		},
		getItemLength () {
			return this.getValidItem().length
		},
		checkHasDetails () {
			return new Promise(resolve => {
				if (this.getItemLength() === 0) {
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
				return storeItem.id === item.houseDTO.id
			})
			if (~storeIndex) {
				let detailsIndex = this.orderItemList[storeIndex].details.findIndex(detailsItem => {
					return detailsItem.goodsDTO.id === item.goodsDTO.id
				})
				if (~detailsIndex) {
					this.orderItemList[storeIndex].details[detailsIndex] = item
				}
			}
		},
		onSendEdiClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要发送到EDI吗?'
			}).then(() => {
				let params = this.getSaveParams()
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/stockOrder/${this.query.orderId}/users/${this.loginerId}`,
					data: params,
					query: {
						userId: this.loginerId,
						m: 'sendBill'
					}
				}).then(res => {
					this.createOrderDetails().then(() => {
						this.$fxToast.success('发送成功')
					})
				})
			}).catch(() => {
			})
		},
		onSendEdiBackClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定将订货单从供货商EDI上撤回吗?'
			}).then(() => {
				let params = this.getSaveParams()
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/stockOrder/${this.query.orderId}/users/${this.loginerId}`,
					data: params,
					query: {
						userId: this.loginerId,
						m: 'ediBackBill'
					}
				}).then(res => {
					this.createOrderDetails().then(() => {
						this.$fxToast.success('撤回成功')
					})
				})
			}).catch(() => {
			})
		},
		onItemClear () {
			let details = this.orderInfoData.details.filter(item => {
				return !!item.id
			})
			details.forEach(item => {
				item.changeType = 'del'
			})
			this.orderInfoData.details = details
			this.orderItemList = this.filterStoreItem(details)
		},
		onItemFocus () {
			this.$refs.orderInfo.closeCollapse()
		},
		onClickHandler (method) {
			this.checkOrderInfo().then(() => {
				if (this.itemInputFocusing) {
					return false
				}
				this[method]()
			})
		},
		onSearchConfirm (searchItemData) {
			this.orderItemList = searchItemData
		},
		// {{{增加品项
		onStoreItemSelect (currentStoreObj) {
			this.currentStoreObj = currentStoreObj
			this.itemPopShow = true
		},
		getStoreItem () {
			if (this.$fxUtils.isEmptyObjSHW(this.currentStoreObj)) {
				return []
			} else {
				let currentStore = this.orderItemList.find(item => {
					return item.id === this.currentStoreObj.id
				})
				if (currentStore) {
					return currentStore.details
				} else {
					return []
				}
			}
		},
		onItemEditConfirm ([selectedItemArr, store]) {
			let currentStore = this.orderItemList.find(item => {
				return item.id === store.id
			})
			if (currentStore) {
				currentStore.details = selectedItemArr
			} else {
				let _store = Object.assign({}, store)
				_store.details = selectedItemArr
				this.orderItemList.push(_store)
			}
		}
		// }}}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.inteledi-shopOrder-details {
	height:100%
	background:$fxWhite
	display: flex
	flex-direction: column
	.shopOrder-bottom {
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


