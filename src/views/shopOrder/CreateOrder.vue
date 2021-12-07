<template>
	<w-app-page class="inteledi-shopOrder-create">
		<w-header title="新增门店订货单" :border="true"></w-header>
		<orderInfo
			ref="orderInfo"
			:data="orderInfoData"
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
			:data="orderItemList"
			:itemInputFocusing.sync="itemInputFocusing"
			:shopId="orderInfoData.shopDTO && orderInfoData.shopDTO.id"
			:orderPlanId="orderInfoData.orderGoodsPlanDTO && orderInfoData.orderGoodsPlanDTO.id"
			@on-add-click="onAddClick"
			@on-search-click="onSearchClick"
			@on-item-edit="onItemEdit"
			@on-item-focus="onItemFocus"
			@on-intellectorder-click="onIntellectOrderClick"
			@on-intellectbasis-click="onIntellectBasisClick"
		></orderItem>
		<w-bottom-btn-bar class="shopOrder-bottom">
			<van-button class="add-btn fx-no-radius fx-btn" type="primary" @click="onCreateClick">生成单据</van-button>
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
				:isDisabled="!$fxAuth('shopOrderBill.save')"
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
import itemSearchPop from '@/components/shopOrder/common/itemSearchPop.vue'
import intellectOrderPop from '@/components/shopOrder/intellectOrder/intellectOrderPop.vue'
import intellectBasisPop from '@/components/shopOrder/intellectOrder/intellectBasisPop.vue'
export default {
	name: 'createShopOrder',
	components: {
		orderInfo,
		orderItem,
		listComp,
		storeItemComp,
		itemRowEditPop,
		itemSearchPop,
		intellectOrderPop,
		intellectBasisPop
	},
	data () {
		return {
			query: this.$route.query,
			activeNames: ['1'],
			tabActive: '选项1',
			orderInfoData: {
				oldDetails: '',
				accountDTO: {},
				arriveDate: this.$fxUtils.getCustomDate(1).getTime(),
				assignState: 0,
				billEmp: '',
				billMemo: '',
				billState: 0,
				businessDate: new Date().getTime(),
				businessTypeDTO: {},
				orderGoodsPlanDTO: {},
				shopDTO: {},
				details: [],
				updateIndicator: 'Append',
				urgentFlag: false,
				attachFlag: '0'
			},
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
			itemRowEditPopShow: false,
			itemEditRowData: {},
			itemInputFocusing: false,
			itemSearchPopShow: false,
			searchItem: [],
			intellectOrderPopShow: false,
			intellectBasisPopShow: false
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize',
			loginerShopId: state => state.loginer.loginerShopId,
			loginerShopName: state => state.loginer.loginerShopName,
			loginerOrganType: state => state.loginer.loginerOrganType,
			loginerId: state => state.loginer.loginerId
		})
	},
	created () {
		if (this.loginerShopId && this.$fxStateMiddleware.stateIs('loginerOrganType')('shop')(this.loginerOrganType)) {
			this.orderInfoData.shopDTO = {
				id: this.loginerShopId,
				name: this.loginerShopName
			}
			this.getDistributionRelation().then(res => {
				this.orderInfoData.orderGoodsPlanDTO = res.distributionRelations[0].orderGoodsPlan
			}).catch(() => {
				this.getOrderGoodsPlanListData().then(res => {
					if (res.orderGoodsPlans.length) {
						this.orderInfoData.orderGoodsPlanDTO = res.orderGoodsPlans[0]
					}
				})
			})
		}
		if (this.$fxAuth('shopOrderBill.sysArriveDateNull')) {
			this.orderInfoData.arriveDate = ''
		}
	},
	beforeRouteLeave (to, from, next) {
		if (this.itemInputFocusing) {
			this.$router.go(1)
			return false
		}
		if (to.path === '/shopOrder') {
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
	methods: {
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
					console.log(this.orderItemList)
					console.log(this.orderInfoData)
					this.oldDetails = this.orderInfoData.details
					let orderDetailsData = res.shopOrderBills[0]
					orderDetailsData.details.forEach(item => {
						item.changeType = 'add'
					})
					// this.formatterSysPoint(orderDetailsData.details)
					this.orderInfoData = orderDetailsData
					this.orderItemList = orderDetailsData.details
					resolve()
				}).catch((error) => {
					console.log(error)
					reject(error)
				})
			})
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
					this.$fxToast.top('请先选择业务日期!')
				} else if (!this.orderInfoData.shopDTO.id) {
					this.$fxToast.top('请先选择门店!')
				} else if (this.$fxUtils.isEmptyObjSHW(this.orderInfoData.orderGoodsPlanDTO)) {
					this.$toast.fail('请先选择订货方案!')
				} else if (!this.orderInfoData.arriveDate) {
					this.$toast.fail('请先选择到货日期!')
				} else {
					resolve()
				}
			})
		},
		onStoreItemSave (storeItemData) {
			this.orderInfoData.details = storeItemData
			this.orderItemList = this.orderInfoData.details
		},
		onCreateClick () {
			if (this.itemInputFocusing) {
				return false
			}
			this.$dialog.confirm({
				title: '提示',
				message: '确定生成单据吗?'
			}).then(() => {
				this.checkHasDetails().then(() => {
					let params = this.getSaveParams()
					this.createHandler(params)
				})
			}).catch(() => {
			})
		},
		createHandler (params) {
			this.$fxHttp.requestPost({
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/shoporders`,
				data: params
			}).then(res => {
				this.$fxToast.success('生成单据成功').then(() => {
					this.$router.replace({
						path: 'shopOrderDetails',
						query: {
							orderId: res.shopOrderBills[0].id
						}
					})
				})
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
			let params = Object.assign({}, this.orderInfoData, {
				detailAdd: addItems,
				accountDTO: {
					id: this.loginerId
				}
			})
			return params
		},
		getValidItem () {
			let itemDetails = []
			this.orderItemList.forEach(item => {
				itemDetails.push(...item.details)
			})
			return itemDetails
		},
		getItemLength () {
			return this.getValidItem().length
		},
		checkHasDetails () {
			return new Promise((resolve) => {
				if (this.getItemLength() === 0) { // 单据明细为空，弹出新增明细页
					this.onAddClick()
				} else {
					resolve()
				}
			})
		},
		onItemClear () {
			this.orderInfoData.details = []
			this.orderItemList = this.orderInfoData.details
		},
		onItemFocus () {
			this.$refs.orderInfo.closeCollapse()
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
		// {{{ 智能订货
		onIntellectOrderClick () {
			this.checkOrderInfo().then(() => {
				this.clearItemConfim('智能订货会清空品项,是否继续?').then(() => {
					this.intellectOrderPopShow = true
				})
			})
		},
		onIntellectBasisClick () {
			// if (this.orderInfoData.autoType === 2) {
			this.intellectBasisPopShow = true
			// }
		},
		// }}}
		// {{{ 搜索界面
		onSearchClick () {
			this.itemSearchPopShow = true
			this.searchItem = JSON.parse(JSON.stringify(this.orderItemList))
		},
		// }}}
		onSearchConfirm (searchItemData) {
			this.orderItemList = searchItemData
		},
		// {{{ 智能订货生成明细
		onCreatDetail (data) {
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
			this.$fxToast.success('生成单据成功').then(() => {
				this.$router.replace({
					path: 'shopOrderDetails',
					query: {
						orderId: data.id
					}
				})
			})
		}
		// }}}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.inteledi-shopOrder-create {
	.shopOrder-bottom {
		.add-btn {
			width:100%
		}
	}
}
</style>

