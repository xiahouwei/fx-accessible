<template>
	<w-app-page class="inteledi-shopOrder-details">
		<w-header :title="orderInfoData.sysbillCode" :border="true"></w-header>
		<orderInfo
			ref="orderInfo"
			:data="orderInfoData"
			:isDisabled="isBillState(1) || !$fxAuth('shopOrderBill.save')"
			:collapseDisabled="itemInputFocusing"
			@on-shop-click="onShopClick"
			@on-busdate-click="onBusinessDateClick"
			@on-arriveDate-click="onArriveDateClick"
			@on-billType-click="onBillTypeClick"
			@on-orderGoodsPlan-click="onOrderGoodsPlanClick"
			@on-item-clear="onItemClear"
			@on-billType-clear="onBillTypeClear"
		></orderInfo>
		<orderItem
			ref="orderItem"
			:data="orderItemList"
			:isDisabled="isBillState(1) || !$fxAuth('shopOrderBill.save')"
			:itemInputFocusing.sync="itemInputFocusing"
			:shopId="orderInfoData.shopDTO && orderInfoData.shopDTO.id"
			:orderPlanId="orderInfoData.orderGoodsPlanDTO && orderInfoData.orderGoodsPlanDTO.id"
			:autoType="orderInfoData.autoType"
			@on-add-click="onAddClick"
			@on-search-click="onSearchClick"
			@on-item-edit="onItemEdit"
			@on-item-focus="onItemFocus"
			@on-intellectorder-click="onIntellectOrderClick"
			@on-intellectbasis-click="onIntellectBasisClick"
		></orderItem>
		<w-bottom-btn-bar class="shopOrder-bottom">
			<van-button
				v-show="isBillState(0) && $fxAuth('shopOrderBill.del')"
				class="bottom-btn fx-no-radius fx-btn"
				type="danger"
				@click="onClickHandler('onDeleteClick')"
			>删除</van-button>
			<van-button
				v-show="$fxAuth('shopOrderBill.copy')"
				class="bottom-btn fx-no-radius fx-btn"
				type="primary"
				@click="onClickHandler('onCopyClick')"
			>复制</van-button>
			<van-button
				v-show="isBillState(0) && $fxAuth('shopOrderBill.check')"
				class="bottom-btn fx-no-radius fx-btn"
				type="info"
				@click="onClickHandler('onExpressClick')"
			>审核</van-button>
			<van-button
				v-show="isReCheckState([0, 2]) && isBillState(1) && $fxAuth('shopOrderBill.unCheck') && isAssignState(0)"
				class="bottom-btn fx-no-radius fx-btn"
				type="danger"
				@click="onClickHandler('onUnExpressClick')"
			>反审</van-button>
			<van-button
				v-show="isBillState(0) && $fxAuth('shopOrderBill.save')"
				class="bottom-btn fx-no-radius fx-btn"
				type="primary"
				@click="onClickHandler('onSaveClick')"
			>保存</van-button>
			<van-button
				v-show="isReCheckState(0) && isBillState(1) && $fxAuth('shopOrderBill.reCheck')"
				class="bottom-btn fx-no-radius fx-btn"
				type="info"
				@click="onClickHandler('onExpressAgainClick')"
			>复审</van-button>
			<van-button
				v-show="isReCheckState(1) && isBillState(1) && $fxAuth('shopOrderBill.unReCheck')"
				class="bottom-btn fx-no-radius fx-btn"
				type="danger"
				@click="onClickHandler('onUnExpressAgainClick')"
			>取消复审</van-button>
			<!-- <van-button
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onPayClick()"
			>支付</van-button> -->
		</w-bottom-btn-bar>
		<van-popup v-model="shopPopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="shopPopShow"
				:data="shopList"
				:loadFinished="true"
				title="请选择门店"
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
		<van-popup v-model="orderGoodsPlanPopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="orderGoodsPlanPopShow"
				:data="orderGoodsPlanList"
				:loadFinished="true"
				title="订货方案检索"
				@on-search="searchOrderGoodsPlan"
				@on-select="selectOrderGoodsPlan"
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
				:urgentFlag="orderInfoData.urgentFlag"
				:orderPlanId="orderInfoData.orderGoodsPlanDTO && orderInfoData.orderGoodsPlanDTO.id"
				@on-save="onStoreItemSave"
			></storeItemComp>
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
				:isDisabled="isBillState(1) || !$fxAuth('shopOrderBill.save')"
				:shopId="orderInfoData.shopDTO && orderInfoData.shopDTO.id"
				@on-Confirm="onEditRowConfirm"
			></itemRowEditPop>
		</van-popup>
		<van-popup
			v-model="attachListPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<attachListPop
				:attachPopTitle="orderInfoData.sysbillCode"
				:data="attachList"
				:visibleFlag.sync="attachListPopShow"
				@on-continue-check="expressHandler"
			></attachListPop>
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
				:isDisabled="isBillState(1) || !$fxAuth('shopOrderBill.save')"
				@on-search-confirm="onSearchConfirm"
			></itemSearchPop>
		</van-popup>
		<van-popup
			v-model="intellectOrderPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<intellectOrderPop
				:visibleFlag.sync="intellectOrderPopShow"
				:shopId="orderInfoData.shopDTO && orderInfoData.shopDTO.id"
				:orderPlanId="orderInfoData.orderGoodsPlanDTO && orderInfoData.orderGoodsPlanDTO.id"
				:urgentFlag="orderInfoData.urgentFlag"
				:businessDate="orderInfoData.businessDate"
				:arriveDate="orderInfoData.arriveDate"
				:orderInfoData="orderInfoData"
				@on-creat-detail="onCreatDetail"
			></intellectOrderPop>
		</van-popup>
		<van-popup
			v-model="intellectBasisPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<intellectBasisPop
				:visibleFlag.sync="intellectBasisPopShow"
				:data="intellectBasisData"
			></intellectBasisPop>
		</van-popup>
	</w-app-page>
</template>

<script>
import { mapState } from 'vuex'
import orderInfo from '@/components/shopOrder/createOrder/OrderInfo.vue'
import orderItem from '@/components/shopOrder/createOrder/OrderItem.vue'
import listComp from '@/components/common/ListComp.vue'
import storeItemComp from '@/components/shopOrder/common/StoreItemComp.vue'
import itemRowEditPop from '@/components/shopOrder/common/ItemRowEditPop.vue'
import attachListPop from '@/components/shopOrder/common/attachList.vue'
import itemSearchPop from '@/components/shopOrder/common/itemSearchPop.vue'
import intellectOrderPop from '@/components/shopOrder/intellectOrder/intellectOrderPop.vue'
import intellectBasisPop from '@/components/shopOrder/intellectOrder/intellectBasisPop.vue'
export default {
	name: 'shopOrderDetails',
	components: {
		orderInfo,
		orderItem,
		listComp,
		storeItemComp,
		itemRowEditPop,
		attachListPop,
		itemSearchPop,
		intellectOrderPop,
		intellectBasisPop
	},
	data () {
		return {
			oldDetails: '',
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
			orderGoodsPlanPopShow: false,
			orderGoodsPlanList: [],
			itemStorePopShow: false,
			storeItem: [],
			itemSearchPopShow: false,
			itemRowEditPopShow: false,
			itemEditRowData: {},
			attachListPopShow: false,
			attachList: [],
			itemInputFocusing: false,
			orderDeleteFlag: false,
			formatterSysPointKey: ['busUnitAmount', 'consultMoney', 'consultTaxMoney', 'consultTax'],
			searchItem: [],
			intellectOrderPopShow: false,
			intellectBasisPopShow: false,
			intellectBasisData: null
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
		if (to.path === '/shopOrder' && !this.orderDeleteFlag && this.orderInfoData.billState === 0) {
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
		isReCheckState (state) {
			return state => {
				if (Object.prototype.toString.call(state) === '[object Array]') {
					return state.includes(this.orderInfoData.reCheckState)
				} else {
					return this.orderInfoData.reCheckState === state
				}
			}
		},
		isAssignState (state) {
			return state => {
				if (Object.prototype.toString.call(state) === '[object Array]') {
					return state.includes(this.orderInfoData.assignState)
				} else {
					return this.orderInfoData.assignState === state
				}
			}
		}
	},
	methods: {
		createOrderDetails () {
			return new Promise(resolve => {
				this.getOrderDetails().then(res => {
					let orderDetailsData = res.shopOrderBills[0]
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
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/shoporders/${this.query.orderId}`
				}).then(res => {
					resolve(res)
				})
			})
		},
		formatterSysPoint (data) {
			data.forEach(item => {
				this.formatterSysPointKey.forEach(pointItem => {
					item[pointItem] = this.toFixedNumberSize(item[pointItem])
				})
			})
		},
		filterStoreItem (data) {
			data.forEach(dataItem => {
				let amount = parseFloat(dataItem.busUnitAmount)
				if (amount) {
					dataItem.consultPrice = this.toFixedNumberSize(dataItem.consultMoney / amount)
					dataItem.consultTaxPrice = this.toFixedNumberSize(dataItem.consultMoneyWithTax / amount)
				} else {
					dataItem.consultMoney = 0
					dataItem.consultMoneyWithTax = 0
					dataItem.consultPrice = 0
					dataItem.consultTaxPrice = 0
				}
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
		toFixedNumberSize (data) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysPointSize))
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
				this.clearItemConfim('更换门店会清空品项和订货方案,是否继续?').then(() => {
					this.orderInfoData.shopDTO = item
					this.orderInfoData.orderGoodsPlanDTO = {}
					this.getDistributionRelation().then(res => {
						this.orderInfoData.orderGoodsPlanDTO = res.distributionRelations[0].orderGoodsPlan
						this.getArrivalDate()
					}).catch(() => {
						this.getOrderGoodsPlanListData().then(res => {
							if (res.orderGoodsPlans.length) {
								this.orderInfoData.orderGoodsPlanDTO = res.orderGoodsPlans[0]
								this.getArrivalDate()
							}
						})
					})
				})
			})
		},
		getDistributionRelation () {
			return new Promise((resolve, reject) => {
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.orderInfoData.shopDTO.id}/distributionRelation`,
					autoErrorMsg: false
				}).then(res => {
					resolve(res)
				}).catch((error) => {
					reject(error)
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
					m: 'list4ShopOrderBill4Edit',
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
					m: 'list4ShopOrderBill',
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
		// {{{多方案
		onOrderGoodsPlanClick () {
			if (!this.orderInfoData.shopDTO.id) {
				this.$fxToast.top('请先选择门店!')
				return false
			}
			this.orderGoodsPlanRefresh()
		},
		searchOrderGoodsPlan (keyword) {
			this.orderGoodsPlanRefresh(keyword)
		},
		selectOrderGoodsPlan (item) {
			this.checkOrderGoodsPlan(item).then(() => {
				this.clearItemConfim('更换订货方案会清空品项,是否继续?').then(() => {
					this.orderInfoData.orderGoodsPlanDTO = item
					this.getArrivalDate()
				})
			})
		},
		checkOrderGoodsPlan (orderGoodsPlanDTO) {
			return new Promise(resolve => {
				let currentInOrderGoodsPlanDTO = this.orderInfoData.orderGoodsPlanDTO
				if (currentInOrderGoodsPlanDTO.id !== orderGoodsPlanDTO.id) {
					resolve()
				}
			})
		},
		orderGoodsPlanRefresh (keyword = null) {
			this.getOrderGoodsPlanListData(keyword).then(res => {
				this.orderGoodsPlanList = res.orderGoodsPlans
				this.orderGoodsPlanPopShow = true
			})
		},
		getOrderGoodsPlanListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					keyWord: keyword
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.orderInfoData.shopDTO.id}/users/${this.loginerId}/orderGoodPlans`,
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
				this.checkBusinessDate2Item(time).then(() => {
					this.orderInfoData.businessDate = time
					// this.orderInfoData.arriveDate = time + 24 * 60 * 60 * 1000
					this.getArrivalDate()
					// this.getMBDetailList4ModifyWorkDateURl()
				}).catch(() => {
					this.clearItemConfim('确定要更改业务日期吗?新业务日期不能订货的明细将会被删除!').then(() => {
						this.orderInfoData.businessDate = time
						// this.orderInfoData.arriveDate = time + 24 * 60 * 60 * 1000
						this.getMBDetailList4ModifyWorkDateURl()
						this.getArrivalDate()
					})
				})
			} else {
				this.orderInfoData.arriveDate = time
			}
			this.datePickerShow = false
		},
		getMBDetailList4ModifyWorkDateURl () {
			return new Promise((resolve, reject) => {
				const params = {
					businessDate: this.orderInfoData.businessDate,
					id: this.orderInfoData.id
				}
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.orderInfoData.shopDTO.id}/shoporders/${this.orderInfoData.id}/?userId=${this.loginerId}`,
					data: params,
					query: {
						m: 'getMBDetailList4ModifyWorkDate'
					}
				}).then(res => {
					this.oldDetails = this.orderInfoData.details
					let orderDetailsData = res.shopOrderBills[0]
					orderDetailsData.details.forEach(item => {
						item.changeType = 'add'
					})
					this.formatterSysPoint(orderDetailsData.details)
					this.orderInfoData = orderDetailsData
					this.orderItemList = this.filterStoreItem(orderDetailsData.details)
					resolve()
				}).catch((error) => {
					console.log(error)
					reject(error)
				})
			})
		},
		MBDetailList4ModifyWorkDate () {
			// let time = this.$fxUtils.setDateTime(new Date(this.orderInfoData.businessDate), '时分')
			const params = {
				businessDate: this.orderInfoData.businessDate,
				id: this.orderInfoData.id
			}
			return this.$fxApi('shopOrderBill.getMBDetailList4ModifyWorkDate')({ data: params })
		},
		getShopOrderBillDetailDTO () {
			let items = this.getValidItem()
			let shopOrderBillDetailDTO = Array.from(new Set(items.map(item => {
				return item.goodsDTO.id
			})))
			return shopOrderBillDetailDTO.map(item => {
				return {
					goodsDTO: {
						id: item
					}
				}
			})
		},
		checkBusinessDate2Item (time) {
			return new Promise((resolve, reject) => {
				if (this.getItemLength() === 0) {
					resolve()
				} else {
					const params = {
						businessDate: time,
						urgentFlag: this.orderInfoData.urgentFlag,
						details: this.getShopOrderBillDetailDTO(),
						orderGoodsPlanDTO: this.orderInfoData.orderGoodsPlanDTO
					}
					this.$fxHttp.requestPost({
						url: `${this.$fxBaseApi.url}/accounts/${this.orderInfoData.shopDTO.id}/users/${this.loginerId}/shoporderdetails`,
						data: params,
						query: {
							m: 'validBill'
						},
						autoErrorMsg: false
					}).then(res => {
						resolve()
					}).catch((error) => {
						if (error.entity === 'ShopOrderBillDetailDTO') {
							reject(error)
						} else {
							this.$dialog.alert({
								title: '提示',
								message: error.message
							}).then(() => {
								resolve()
							})
						}
					})
				}
			})
		},
		// {{{根据方案是否启用到货日期间隔，来设置到货日期
		getArrivalDate () {
			if (!this.orderInfoData.orderGoodsPlanDTO.id) {
				return false
			}
			let params = {
				businessDateStart: this.$fxUtils.setDateTime(new Date(this.orderInfoData.businessDate), '时分'),
				shopId: this.orderInfoData.shopDTO.id
			}
			return this.$fxApi('shopOrderBill.getArrivalDate', this.orderInfoData.orderGoodsPlanDTO.id)({ data: params }).then(res => {
				this.orderInfoData.arriveDate = res
				this.$fxToast.top('到货日期已按订货方案中设置的到货间隔日期重置到货日期默认值')
			})
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
				} else if (this.$fxUtils.isEmptyObjSHW(this.orderInfoData.orderGoodsPlanDTO)) {
					this.$toast.fail('请先选择订货方案!')
				} else if (!this.orderInfoData.arriveDate) {
					this.$toast.fail('请先选择到货日期!')
				} else {
					resolve()
				}
			})
		},
		// {{{ 智能订货
		onIntellectOrderClick () {
			this.checkOrderInfo().then(() => {
				this.clearItemConfim('智能订货会清空品项,是否继续?').then(() => {
					this.intellectOrderPopShow = true
				})
			})
		},
		onIntellectBasisClick () {
			if (this.orderInfoData.autoType === 2) {
				this.getIntellectBasis().then(res => {
					this.intellectBasisPopShow = true
					this.intellectBasisData = res.basis[0]
				})
			}
		},
		getIntellectBasis () {
			return new Promise(resolve => {
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/shoporders/orderId/${this.orderInfoData.id}`
				}).then(res => {
					resolve(res)
				})
			})
		},
		// }}}
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
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/shoporders/${this.query.orderId}`,
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
				if (this.$fxAuth('shopOrderBill.attachFlag') && this.$fxSysAuth('shopOrderBill.sysOrderGoodsAttachPlan') && this.orderInfoData.attachFlag === '0') {
					// 先保存单据，避免修改了单据信息与明细没有保存
					this.saveHandler().then(() => {
						this.createOrderDetails().then(() => {
							this.$fxHttp.requestGet({
								url: `${this.$fxBaseApi.url}/accounts/${this.orderInfoData.shopDTO.id}/shoporders/assistantGoods/${this.orderInfoData.id}/orderPlanId/${this.orderInfoData.orderGoodsPlanDTO.id}`
							}).then(res => {
								if (res.shopOrderBillDetails.length) {
									this.attachListPopShow = true
									this.attachList = [{
										sysbillCode: this.orderInfoData.sysbillCode,
										details: res.shopOrderBillDetails
									}]
								} else {
									this.$dialog.confirm({
										title: '提示',
										message: '无可导入的附属明细，确定要审核该单据吗？'
									}).then(() => {
										this.expressHandler()
									})
								}
							})
						})
					})
				} else {
					this.$dialog.confirm({
						title: '提示',
						message: '确定要审核该单据吗?'
					}).then(() => {
						this.expressHandler()
					})
				}
			})
		},
		expressHandler () {
			this.checkHasDetails().then(() => {
				let params = this.getSaveParams()
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/shoporders/${this.query.orderId}`,
					data: params,
					query: {
						userId: this.loginerId,
						m: 'editAndCheck'
					}
				}).then(res => {
					this.createOrderDetails().then(() => {
						this.$dialog.alert({
							title: '提示',
							message: res.message
						})
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
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/shoporders/${this.query.orderId}`,
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
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/shoporders/${this.query.orderId}`,
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
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/shoporders/${this.query.orderId}`,
					data: params,
					query: {
						userId: this.loginerId
					}
				}).then(res => {
					this.$fxToast.success({
						message: '删除成功',
						mask: true
					}).then(() => {
						this.orderDeleteFlag = true
						this.$router.go(-1)
					})
				})
			}).catch(() => {
			})
		},
		getSaveParams () {
			let itemDetails = []
			let delItemObj = []
			let delOld = []
			let old = this.oldDetails
			this.orderItemList.forEach(item => {
				itemDetails.push(...item.details)
			})
			if (old.length > 0) {
				delOld = old.filter(item => {
					return item.changeType === 'del'
				})
			}
			let addItems = itemDetails.filter(item => {
				return item.changeType === 'add'
			})
			let delItems = itemDetails.filter(item => {
				return item.changeType === 'del'
			})
			let editItems = itemDetails.filter(item => {
				return item.changeType === 'edit'
			})
			if (delItems.length > 0) {
				delItemObj = delItems
			} else if (delOld.length > 0) {
				delItemObj = delOld
			} else {
				delItemObj = null
			}
			let params = Object.assign({}, this.orderInfoData, {
				detailAdd: addItems.length > 0 ? addItems : null,
				detailDel: delItemObj,
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
		onExpressAgainClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要复审该单据吗?'
			}).then(() => {
				let params = this.getSaveParams()
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/shoporders/${this.query.orderId}`,
					data: params,
					query: {
						userId: this.loginerId,
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
		onUnExpressAgainClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要取消复审该单据吗?'
			}).then(() => {
				let params = this.getSaveParams()
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/shoporders/${this.query.orderId}`,
					data: params,
					query: {
						userId: this.loginerId,
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
			if (this.itemInputFocusing) {
				return false
			}
			this[method]()
		},
		onSearchConfirm (searchItemData) {
			this.orderItemList = searchItemData
		},
		onPayClick () {
			this.$fxPay({
				payTypes: ['alipay'],
				payer: '这是收款方',
				payee: '这是付款方',
				money: '200.10'
			}).then(() => {
			})
		},
		// {{{ 智能订货生成明细
		onCreatDetail () {
			/* data.details.forEach(item => {
				item.changeType = 'add'
			})
			this.orderItemList.push({
				id: data.basis.houseId,
				name: data.basis.houseName,
				details: data.details
			})
			let basis = data.basis
			this.orderInfoData.basis = basis
			this.orderInfoData.businessDate = data.checkDate
			this.orderInfoData.arriveDate = data.arriveDate
			if (data.memo) {
				this.orderInfoData.smartOrderMemo = data.memo
			} */
			this.createOrderDetails().then(() => {
				this.$fxToast.success('成功！')
			})
		}
		// }}}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.inteledi-shopOrder-details {
	.shopOrder-bottom {
		.bottom-btn {
			flex:1
			padding:0
			overflow:hidden
		}
	}
}
</style>


