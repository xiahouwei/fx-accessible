<template>
	<div class="inteledi-departmentReceive-details">
		<w-header :title="orderInfoData.sysbillCode" titleFontSize="3.733vw" :border="true"></w-header>
		<orderInfo
			ref="orderInfo"
			:data="orderInfoData"
			:isDisabled="isBillState(1) || !$fxAuth('departmentReceiveBill.save') || isWeightState(1) || isWeightState(2)"
			:collapseDisabled="itemInputFocusing"
			@on-shop-click="onShopClick"
			@on-department-click="onDepartmentClick"
			@on-employee-click="onEmployeeClick"
			@on-employee-clear="onEmployeeClear"
			@on-busdate-click="onBusinessDateClick"
			@on-item-clear="onItemClear"
			@on-billType-click="onBillTypeClick"
			@on-billType-clear="onBillTypeClear"
			@on-subject-click="onSubjectClick"
			@on-subject-clear="onSubjectClear"
		></orderInfo>
		<orderItem
			ref="orderItem"
			:data="orderItemList"
			:isDisabled="isBillState(1) || !$fxAuth('departmentReceiveBill.save') || isWeightState(1) || isWeightState(2)"
			:itemInputFocusing.sync="itemInputFocusing"
			:shopId="orderInfoData.shopDTO && orderInfoData.shopDTO.id"
			:autoType="orderInfoData.autoType"
			@on-search-click="onSearchClick"
			@on-add-click="onAddClick"
			@on-item-edit="onItemEdit"
			@on-unit-edit="onUnitEdit"
			@on-item-focus="onItemFocus"
			@on-selectbom-click="onSelectBomClick"
			@on-viewbom-click="onViewBomClick"
		></orderItem>
		<div class="departmentReceive-bottom">
			<van-button
				v-show="isBillState(0) && $fxAuth('departmentReceiveBill.del') && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onClickHandler('onDeleteClick')"
			>删除</van-button>
			<van-button
				v-show="isBillState(0) && $fxAuth('departmentReceiveBill.check') && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius"
				type="info"
				@click="onClickHandler('onExpressClick')"
			>审核</van-button>
			<van-button
				v-show="isBillReState([0, 2]) && isBillState(1) && $fxAuth('departmentReceiveBill.unCheck') && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onClickHandler('onUnExpressClick')"
			>反审</van-button>
			<van-button
				v-show="isBillState(0) && $fxAuth('departmentReceiveBill.save') && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius"
				type="primary"
				@click="onClickHandler('onSaveClick')"
			>保存</van-button>
			<van-button
				v-show="isBillReState(0) && isBillState(1) && $fxAuth('departmentReceiveBill.reCheck')"
				class="bottom-btn fx-no-radius"
				type="info"
				@click="onClickHandler('onExpressAgainClick')"
			>复审</van-button>
			<van-button
				v-show="isBillReState(1) && isBillState(1) && $fxAuth('departmentReceiveBill.unReCheck')"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onClickHandler('onUnExpressAgainClick')"
			>取消复审</van-button>
			<van-button
				v-show="$fxAuth('departmentReceiveBill.weighState') && isBillState(0) && (isWeightState(0) || isWeightState(3))"
				class="bottom-btn fx-no-radius yellow-btn"
				type="info"
				@click="onClickHandler('onWeightClick')"
			>下发称重</van-button>
			<van-button
				v-show="$fxAuth('departmentReceiveBill.weighState') && isBillState(0) && (isWeightState(1) || isWeightState(2))"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onClickHandler('onUnWeightClick')"
			>取消称重</van-button>
			<van-button
				v-show="$fxAuth('departmentReceiveBill.weighState') && isBillState(0) && isWeightState(2) && sysDZCManyLower"
				class="bottom-btn fx-no-radius"
				type="info"
				@click="onClickHandler('onEndWeightClick')"
			>结束称重</van-button>
		</div>
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
		<van-popup v-model="subjectPopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="subjectPopShow"
				:data="subjectList"
				:loadFinished="true"
				title="科目检索"
				@on-search="searchSubject"
				@on-select="selectSubject"
			></listComp>
		</van-popup>
		<van-popup v-model="shopPopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="shopPopShow"
				:data="shopList"
				:loadFinished="shopListLoadFinished"
				:loading.sync="onShopLoading"
				title="请选择出库机构"
				@on-search="searchShop"
				@on-select="selectShop"
				@on-load="onShopLoad"
			></listComp>
		</van-popup>
		<filterListPopup
			v-model="departmentPopShow"
			title="请选择部门"
			:rollingLoad="true"
			:getDataApi="getDepartmentListData"
			@on-select="selectDepartment(arguments)"
		></filterListPopup>
		<van-popup v-model="employeePopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="employeePopShow"
				:data="employeeList"
				:loadFinished="employeeListLoadFinished"
				:loading.sync="onEmployeeLoading"
				title="请选择业务人"
				@on-search="searchEmployee"
				@on-select="selectEmployee"
				@on-load="onEmployeeLoad"
			></listComp>
		</van-popup>
		<van-popup v-model="datePickerShow" position="bottom">
			<w-date-picker
				:visibleFlag.sync="datePickerShow"
				:currentDate="currentDate"
				@confirm="dateConfirmhandle"
			></w-date-picker>
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
				:shopId="orderInfoData.shopDTO && orderInfoData.shopDTO.id"
				:store="currentStoreObj"
				:parentStoreItem="getStoreItem()"
				:businessDate="orderInfoData.businessDate"
				@on-confirm="onItemEditConfirm"
			></itemEditComp>
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
				:isDisabled="isBillState(1) || !$fxAuth('departmentReceiveBill.save') || isWeightState(1) || isWeightState(2)"
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
				:searchKeywords="'code,name,pinYin'"
				:isDisabled="isBillState(1) || !$fxAuth('departmentReceiveBill.save') || isWeightState(1) || isWeightState(2)"
				:autoType="orderInfoData.autoType"
				@on-search-confirm="onSearchConfirm"
			></itemSearchPop>
		</van-popup>
		<van-popup
			v-model="bomStorePopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<storeBomComp
				:visibleFlag.sync="bomStorePopShow"
				:storeItemData="storeBom"
				:shopId="orderInfoData.shopDTO && orderInfoData.shopDTO.id"
				@on-save="onStoreBomSave"
				@on-select-store="onStoreBomSelect"
			></storeBomComp>
		</van-popup>
		<van-popup
			v-model="bomPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<bomEditComp
				:visibleFlag.sync="bomPopShow"
				:shopId="orderInfoData.shopDTO && orderInfoData.shopDTO.id"
				@on-bom-confirm="onBomConfirm"
			></bomEditComp>
		</van-popup>
		<van-popup
			v-model="bomSearchPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<bomSearchPop
				:visibleFlag.sync="bomSearchPopShow"
				:data="searchBom"
				:searchKeywords="'code,name,pinYin'"
			></bomSearchPop>
		</van-popup>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import orderInfo from '@/components/departmentReceive/createOrder/OrderInfo.vue'
import orderItem from '@/components/departmentReceive/createOrder/OrderItem.vue'
import listComp from '@/components/common/ListComp.vue'
import storeItemComp from '@/components/departmentReceive/common/StoreItemComp.vue'
import itemRowEditPop from '@/components/departmentReceive/common/ItemRowEditPop.vue'
import itemSearchPop from '@/components/departmentReceive/common/itemSearchPop.vue'
import itemEditComp from '@/components/departmentReceive/common/itemEditComp.vue'
import storeBomComp from '@/components/departmentReceive/bomImport/StoreBomComp.vue'
import bomEditComp from '@/components/departmentReceive/bomImport/bomEditComp.vue'
import bomSearchPop from '@/components/departmentReceive/bomImport/bomSearchPop.vue'
import filterListPopup from '@/components/common/FilterListPopup.vue'
const ITEM_SIZE = 50
export default {
	name: 'departmentReceiveDetails',
	components: {
		orderInfo,
		orderItem,
		listComp,
		storeItemComp,
		itemRowEditPop,
		itemSearchPop,
		itemEditComp,
		storeBomComp,
		bomEditComp,
		bomSearchPop,
		filterListPopup
	},
	data () {
		return {
			query: this.$route.query,
			activeNames: ['1'],
			tabActive: '选项1',
			orderInfoData: {},
			orderItemList: [],
			currentDate: new Date(),
			shopPopShow: false,
			shopList: [],
			shopListStart: 0,
			searchShopKey: null,
			shopListLoadFinished: false,
			onShopLoading: false,
			departmentPopShow: false,
			employeePopShow: false,
			employeeList: [],
			employeeListStart: 0,
			searchEmployeeKey: null,
			employeeListLoadFinished: false,
			onEmployeeLoading: false,
			datePickerShow: false,
			itemStorePopShow: false,
			storeItem: [],
			itemRowEditPopShow: false,
			itemEditRowData: {},
			unitActions: [],
			unitActionShow: false,
			itemInputFocusing: false,
			orderDeleteFlag: false,
			formatterSysPointKey: ['busUnitOutAmount'],
			itemSearchPopShow: false,
			searchItem: [],
			currentStoreObj: {},
			itemPopShow: false,
			orderBomList: [],
			storeBom: [],
			bomStorePopShow: false,
			currentBomStoreObj: {},
			bomPopShow: false,
			bomSearchPopShow: false,
			searchBom: [],
			billTypePopShow: false,
			billTypeList: [],
			subjectList: [],
			subjectPopShow: false
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
		if (to.path === '/departmentReceive' && !this.orderDeleteFlag && this.orderInfoData.billState === 0) {
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
			loginerName: state => state.loginer.loginerName,
			loginerOrganType: state => state.loginer.loginerOrganType,
			sysDZCManyLower: state => state.systemParams.sysDZCManyLower
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
		isBillReState (state) {
			return state => {
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
		}
	},
	methods: {
		createOrderDetails () {
			return new Promise(resolve => {
				this.getOrderDetails().then(res => {
					let orderDetailsData = res.storeBills[0]
					this.formatterSysPoint(orderDetailsData.details)
					this.orderInfoData = orderDetailsData
					this.orderItemList = this.filterStoreItem(orderDetailsData.details)
					if (orderDetailsData.billBom && orderDetailsData.billBom.length) {
						this.orderBomList = this.filterStoreBom(orderDetailsData.billBom)
					}
					resolve()
				})
			})
		},
		getOrderDetails () {
			return new Promise(resolve => {
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/departmentReceive/${this.query.orderId}`
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
			data.forEach(dataItem => {
				let amount = parseFloat(dataItem.busUnitOutAmount)
				if (amount) {
					// 数量不为0，反算单价，便于后期计算
					dataItem.price = this.toFixedNumberSize(dataItem.outMoney / amount)
					dataItem.taxPrice = this.toFixedNumberSize(dataItem.outMoneyWithTax / amount)
				} else {
					// 数量为0，取单价，便于后期计算
					dataItem.price = this.toFixedNumberSize(dataItem.price)
					dataItem.taxPrice = this.toFixedNumberSize(dataItem.taxPrice)
				}
				dataItem.busUnitOutAmount = this.toFixedNumberSize(amount)
				dataItem.outMoney = this.toFixedNumberSize(dataItem.outMoney)
				dataItem.outMoneyWithTax = this.toFixedNumberSize(dataItem.outMoneyWithTax)
				dataItem.taxOutMoney = this.toFixedNumberSize(dataItem.taxOutMoney)
			})
			let stores = Array.from(new Set(data.map(item => {
				return item.outHouseDTO.id
			})))
			let StoreItem = stores.map(item => {
				let storeObj = data.find(dataItem => {
					return dataItem.outHouseDTO.id === item
				}).outHouseDTO
				storeObj = JSON.parse(JSON.stringify(storeObj))
				storeObj.details = data.filter(dataItem => {
					return dataItem.outHouseDTO.id === item
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
		// {{{ 入库机构
		onShopClick () {
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
		onShopRefresh () {
			this.getShopListData().then(res => {
				this.onShopLoading = false
				this.shopList = res.shops
				this.shopPopShow = true
			})
		},
		onShopLoad () {
			this.getShopListData().then(res => {
				this.onShopLoading = false
				this.shopList.push(...res.shops)
			})
		},
		getShopListData () {
			return new Promise(resolve => {
				let params = {
					start: this.shopListStart,
					size: ITEM_SIZE,
					keyword: this.searchShopKey,
					m: 'list4ShopOtherOrderBill4Edit'
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/shops`,
					data: params
				}).then(res => {
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
				this.clearItemConfim('更换出库机构清空明细,是否继续?').then(() => {
					this.orderInfoData.shopDTO = item
					this.orderInfoData.employeeDTO = {}
					// 默认业务为登录人
					this.orderInfoData.employeeDTO = {
						id: this.loginerId,
						name: this.loginerName
					}
					// 只有一个所属部门默认展示，多个所属部门为空
					this.getDepartmentListData(null, 0, 2).then(data => {
						if (data.length === 1) {
							this.orderInfoData.departmentDTO = data[0]
						} else {
							this.orderInfoData.departmentDTO = {}
						}
					})
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
		// {{{ 部门
		onDepartmentClick () {
			if (!this.orderInfoData.shopDTO.id) {
				this.$fxToast.fail('请先选择出库机构!')
				return false
			}
			this.departmentPopShow = true
		},
		getDepartmentListData (keyword = null, start, size) {
			let params = {
				keyword: keyword,
				start: start,
				size: size
			}
			let data = {
				id: this.orderInfoData.shopDTO.id
			}
			return this.$fxApi('z5common.getDepartment', data)({ data: params }).then(res => {
				return res.departmentDTOData
			})
		},
		selectDepartment ([item]) {
			this.checkDepartment(item).then(() => {
				this.clearItemConfim('更换部门清空明细,是否继续?').then(() => {
					this.orderInfoData.departmentDTO = item
				})
			})
		},
		checkDepartment (department) {
			return new Promise(resolve => {
				let currentDepartment = this.orderInfoData.departmentDTO || {}
				if (currentDepartment.id !== department.id) {
					resolve()
				}
			})
		},
		// }}}
		// {{{ 业务人
		onEmployeeClick () {
			this.employeeListStart = 0
			this.searchEmployeeKey = null
			this.employeeListLoadFinished = false
			this.onEmployeeRefresh()
		},
		searchEmployee (keyword) {
			this.employeeListStart = 0
			this.searchEmployeeKey = keyword
			this.onEmployeeRefresh()
		},
		onEmployeeRefresh () {
			this.getEmployeeListData().then(res => {
				this.onEmployeeLoading = false
				this.employeeList = res.employeeDTOData
				this.employeePopShow = true
			})
		},
		onEmployeeLoad () {
			this.getEmployeeListData().then(res => {
				this.onEmployeeLoading = false
				this.employeeList.push(...res.employeeDTOData)
			})
		},
		getEmployeeListData () {
			return new Promise(resolve => {
				let params = {
					start: this.employeeListStart,
					size: ITEM_SIZE,
					keyword: this.searchEmployeeKey
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/employee/report/${this.orderInfoData.shopDTO.id}`,
					data: params
				}).then(res => {
					this.employeeListStart += ITEM_SIZE
					if (res.employeeDTOData.length < ITEM_SIZE) {
						this.employeeListLoadFinished = true
					} else {
						this.employeeListLoadFinished = false
					}
					resolve(res)
				})
			})
		},
		selectEmployee (item) {
			this.orderInfoData.employeeDTO = item
		},
		onEmployeeClear () {
			this.orderInfoData.employeeDTO = {}
		},
		// }}}
		// {{{更换时间
		onBusinessDateClick () {
			if (this.orderInfoData.businessDate) this.currentDate = new Date(this.orderInfoData.businessDate)
			this.datePickerShow = true
		},
		dateConfirmhandle (date) {
			let time = date.getTime()
			this.orderInfoData.businessDate = time
			this.datePickerShow = false
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
			let oldUnitRate = item.unitDTO.value // 新增的品项明细获取之前单位换算值方式
			let newUnit = unit // 新增的品项明细获取之后单位换算值方式
			let amount = parseFloat(item.storeAmount)
			if (amount > 0) {
				// 只有手动生成单据可以修改单位，手动生成单据，未审核金额为0，无需换算，只需要换算库存数量，单据数量不变
				amount = amount * oldUnitRate / newUnit.value
				item.storeAmount = parseFloat(this.$fxUtils.toFixedSHW(amount, this.sysPointSize))
			}
			// 数量为 0 时不反算单价
			if (item.busUnitOutAmount === 0) {
				item.price = parseFloat(this.$fxUtils.toFixedSHW(item.price * newUnit.value / oldUnitRate, this.sysPointSize))
				item.taxPrice = parseFloat(this.$fxUtils.toFixedSHW(item.taxPrice * newUnit.value / oldUnitRate, this.sysPointSize))
			} else {
				item.price = parseFloat(this.$fxUtils.toFixedSHW(item.outMoney / item.busUnitOutAmount, this.sysPointSize))
				item.taxPrice = parseFloat(this.$fxUtils.toFixedSHW(item.outMoneyWithTax / item.busUnitOutAmount, this.sysPointSize))
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
					this.$fxToast.top('请先选择出库机构!')
				} else if (!this.orderInfoData.departmentDTO.id) {
					this.$fxToast.top('请先选择部门!')
				} else if (this.$fxSysAuth('departmentReceiveBill.viewSubject') && (!this.orderInfoData.subjectDTO || !this.orderInfoData.subjectDTO.id)) {
					this.$fxToast.top('请先选择科目!')
				} else if (this.$fxSysAuth('departmentReceiveBill.viewSubject') && (!this.orderInfoData.businessTypeDTO || !this.orderInfoData.businessTypeDTO.id)) {
					this.$fxToast.top('请先选择单据类型!')
				} else {
					resolve()
				}
			})
		},
		onStoreItemSave (storeItemData) {
			this.orderItemList = storeItemData
		},
		onSaveClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要保存该单据吗?'
			}).then(() => {
				this.checkOrderInfo().then(this.checkHasDetails).then(() => {
					let params = this.getSaveParams()
					this.saveHandler(params)
				})
			}).catch(() => {
			})
		},
		saveHandler (params) {
			this.$fxHttp.requestPut({
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/departmentReceive/${this.query.orderId}`,
				data: params,
				query: {
					userId: this.loginerId,
					m: 'modify'
				}
			}).then(res => {
				this.createOrderDetails().then(() => {
					this.$fxToast.success(res.message)
				})
			})
		},
		onExpressClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要审核该单据吗?'
			}).then(() => {
				this.checkOrderInfo().then(this.checkHasDetails).then(() => {
					let params = this.getSaveParams()
					this.expressHandler(params)
				})
			}).catch(() => {
			})
		},
		expressHandler (params) {
			this.$fxHttp.requestPut({
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/departmentReceive/${this.query.orderId}/users/${this.loginerId}`,
				data: params,
				query: {
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
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/departmentReceive/${this.query.orderId}`,
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
		onDeleteClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要删除该单据吗?'
			}).then(() => {
				let params = this.getSaveParams()
				this.$fxHttp.requestDel({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/departmentReceive/${this.query.orderId}`,
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
		onExpressAgainClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要复审该单据吗?'
			}).then(() => {
				let params = this.getSaveParams()
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/departmentReceive/${this.query.orderId}/users/${this.loginerId}`,
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
		onUnExpressAgainClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要取消复审该单据吗?'
			}).then(() => {
				let params = this.getSaveParams()
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/departmentReceive/${this.query.orderId}/users/${this.loginerId}`,
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
		// {{{称重
		onWeightClick () {
			this.checkOrderInfo().then(this.checkHasDetails).then(() => {
				this.$dialog.confirm({
					title: '提示',
					message: '确定要下发称重吗?'
				}).then(() => {
					let params = this.getSaveParams()
					if (!params) {
						return false
					}
					this.$fxHttp.requestPut({
						url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/departmentReceive/${this.query.orderId}/users/${this.loginerId}`,
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
			this.checkHasDetails().then(() => {
				let msg = '确定要取消称重吗?'
				if (this.orderInfoData.weighState === 2) {
					msg = '称重中的单据，取消称重后电子秤可以继续称重并传回数据！确定要取消称重吗'
				}
				this.$dialog.confirm({
					title: '提示',
					message: msg
				}).then(() => {
					this.$fxHttp.requestPut({
						url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/departmentReceive/${this.query.orderId}/users/${this.loginerId}`,
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
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/departmentReceive/${this.query.orderId}/users/${this.loginerId}`,
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
		getSaveParams () {
			let itemDetails = []
			let bomDetails = []
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
			this.orderBomList.forEach(item => {
				bomDetails.push(...item.details)
			})
			let params = Object.assign({}, this.orderInfoData, {
				detailAdd: addItems.length > 0 ? addItems : null,
				detailDel: delItems.length > 0 ? delItems : null,
				detailMdf: editItems.length > 0 ? editItems : null,
				billBom: bomDetails,
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
				return storeItem.id === item.outHouseDTO.id
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
		// {{{ 搜索界面
		onSearchClick () {
			this.itemSearchPopShow = true
			this.searchItem = JSON.parse(JSON.stringify(this.orderItemList))
		},
		// }}}
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
		},
		// }}}
		// {{{bom
		onSelectBomClick () {
			this.checkOrderInfo().then(() => {
				this.storeBom = JSON.parse(JSON.stringify(this.orderBomList))
				this.bomStorePopShow = true
			})
		},
		onStoreBomSelect (currentStoreObj) {
			this.currentBomStoreObj = currentStoreObj
			this.bomPopShow = true
		},
		onStoreBomSave (storeBomData) {
			this.orderBomList = storeBomData
		},
		// 查看已选bom
		onViewBomClick () {
			if (!this.orderBomList.length) {
				this.$fxToast.top('没有已导入的BOM数据！')
				return
			}
			this.searchBom = JSON.parse(JSON.stringify(this.orderBomList))
			this.bomSearchPopShow = true
		},
		// 导入bom
		onBomConfirm (selectItems) {
			this.bomPopShow = false
			this.getBomItem(selectItems).then(res => {
				let resDetails = res.billBom[0].details
				resDetails.forEach(resItem => {
					let storeIndex = this.orderItemList.findIndex(storeItem => {
						return storeItem.id === resItem.outHouseDTO.id
					})
					if (~storeIndex) {
						let detailsIndex = this.orderItemList[storeIndex].details.findIndex(detailsItem => {
							return detailsItem.goodsDTO.id === resItem.goodsDTO.id
						})
						if (~detailsIndex) {
							let sameOrderItem = this.orderItemList[storeIndex].details[detailsIndex]
							/* 已有的明细并且编辑后数量不为0将改为edit */
							if (sameOrderItem.changeType !== 'add' && resItem.busUnitOutAmount) {
								this.$set(sameOrderItem, 'changeType', 'edit')
							}
							sameOrderItem.busUnitOutAmount = resItem.busUnitOutAmount
						} else {
							resItem.changeType = 'add'
							this.orderItemList[storeIndex].details.push(resItem)
						}
					} else {
						let _store = Object.assign({}, resItem.outHouseDTO)
						resItem.changeType = 'add'
						_store.details = [resItem]
						this.orderItemList.push(_store)
					}
				})
				this.orderBomList = this.filterStoreBom(res.billBom[0].billBom)
			})
		},
		filterStoreBom (data) {
			let stores = Array.from(new Set(data.map(item => {
				return item.house.id
			})))
			let StoreItem = stores.map(item => {
				let storeObj = data.find(dataItem => {
					return dataItem.house.id === item
				}).house
				storeObj = JSON.parse(JSON.stringify(storeObj))
				storeObj.details = data.filter(dataItem => {
					return dataItem.house.id === item
				})
				return storeObj
			})
			return StoreItem
		},
		getBomItem (selectItems) {
			return new Promise(resolve => {
				selectItems.forEach(item => {
					item.bomId = item.id
					item.bomName = item.name
					delete item.checked
				})
				let details = this.orderItemList.reduce((pre, cur) => {
					let arr = cur.details.length ? pre.concat(cur.details) : pre
					return arr
				}, [])
				let bom = this.orderBomList.reduce((pre, cur) => {
					let arr = cur.details.length ? pre.concat(cur.details) : pre
					return arr
				}, [])
				let params = {
					houseId: this.currentBomStoreObj.id,
					workDate: this.orderInfoData.businessDate,
					bom: selectItems,
					details: details,
					billBom: bom
				}
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/accounts/${this.orderInfoData.shopDTO.id}/users/${this.loginerId}/departmentreceivedetails`,
					data: params,
					query: {
						m: 'departmentBillBom'
					}
				}).then(res => {
					resolve(res)
				}).catch(res => { // 品项与盘点仓库包装盘点仓库 未关联或已被停用，仍然需要更新数据
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
					m: 'list4DepartmentReceiveBillEdit',
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
		// {{{ 单据类型
		onSubjectClick () {
			this.onSubjectRefresh()
		},
		searchSubject (keyword) {
			this.onSubjectRefresh(keyword)
		},
		selectSubject (item) {
			this.orderInfoData.subjectDTO = item
		},
		onSubjectClear () {
			this.orderInfoData.subjectDTO = {}
		},
		onSubjectRefresh (keyword = null) {
			this.getSubjectListData(keyword).then(res => {
				this.subjectList = res.subjectData
				this.subjectPopShow = true
			})
		},
		getSubjectListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					keyword: keyword
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/subject`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		}
		// }}}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.inteledi-departmentReceive-details {
	height:100%
	background:$fxWhite
	display: flex
	flex-direction: column
	.departmentReceive-bottom {
		width:100%
		display: flex
		flex-direction: row
		.bottom-btn {
			flex:1
			padding:0
			overflow:hidden
		}
		.yellow-btn {
			background-color: $fxYellow
			border: 1px solid $fxYellow
		}
	}
}
</style>


