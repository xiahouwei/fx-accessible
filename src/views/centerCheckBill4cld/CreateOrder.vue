<template>
	<w-app-page>
		<w-header title="中心盘点单" :border="true"></w-header>
		<orderInfo
			ref="orderInfo"
			:data="orderInfoData"
			@on-rdc-click="onRdcClick"
			@on-house-click="onHouseClick"
			@on-checkType-click="onCheckTypeClick"
			@on-busdate-click="onBusinessDateClick"
			@on-notCheckType-click="onNotCheckTypeClick"
			@on-groupFlag-click="onGroupFlagClick"
			@on-costType-click="onCostTypeClick"
			@on-businessType-click="onBillTypeClick"
		></orderInfo>
		<w-bottom-btn-bar>
			<w-button
				size="large"
				type="primary"
				@click="onCreateClick"
			>生成单据
			</w-button>
		</w-bottom-btn-bar>
		<van-popup v-fx-history-back="rdcPopShow" v-model="rdcPopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="rdcPopShow"
				:data="rdcList"
				:loadFinished="true"
				title="请选择配送中心"
				@on-search="searchRdc"
				@on-select="selectRdc"
			></listComp>
		</van-popup>
		<van-popup v-fx-history-back="housePopShow" v-model="housePopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="housePopShow"
				:data="houseList"
				:loadFinished="true"
				title="请选择盘点仓库"
				@on-search="searchHouse"
				@on-select="selectHouse"
			></listComp>
		</van-popup>
		<van-popup v-fx-history-back="checkTypePopShow" v-model="checkTypePopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="checkTypePopShow"
				:data="checkTypeList"
				:loadFinished="true"
				title="请选择盘点分类"
				@on-search="searchCheckType"
				@on-select="selectCheckType"
			></listComp>
		</van-popup>
		<van-popup v-fx-history-back="datePickerShow" v-model="datePickerShow" position="bottom">
			<w-date-picker
				:visibleFlag.sync="datePickerShow"
				:currentDate="currentDate"
				@confirm="dateConfirmhandle"
			></w-date-picker>
		</van-popup>
		<van-popup v-fx-history-back="billTypePopShow" v-model="billTypePopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="billTypePopShow"
				:data="billTypeList"
				:loadFinished="true"
				title="单据类型检索"
				@on-search="searchBillType"
				@on-select="selectBillType"
			></listComp>
		</van-popup>
		<w-action-sheet
			v-fx-history-back="notCheckTypeActionShow"
			ref="notCheckTypeActionSheet"
			v-model="notCheckTypeActionShow"
			:actions="notCheckTypeList"
		></w-action-sheet>
		<w-action-sheet
			v-fx-history-back="groupFlagActionShow"
			ref="groupFlagActionSheet"
			v-model="groupFlagActionShow"
			:actions="groupFlagList"
		></w-action-sheet>
		<w-action-sheet
			v-fx-history-back="costTypeActionShow"
			ref="costTypeActionSheet"
			v-model="costTypeActionShow"
			:actions="costTypeList"
		></w-action-sheet>
	</w-app-page>
</template>

<script>
import { mapState } from 'vuex'
import orderInfo from '@/components/centerCheckBill4cld/createOrder/CreateOrderInfo.vue'
import listComp from '@/components/common/ListComp.vue'
export default {
	name: 'createUniformDistributionOut',
	components: {
		orderInfo,
		listComp
	},
	data () {
		return {
			query: this.$route.query,
			orderInfoData: {},
			currentDate: new Date(),
			rdcPopShow: false,
			rdcList: [],
			housePopShow: false,
			houseList: [],
			checkTypePopShow: false,
			checkTypeList: [],
			datePickerShow: false,
			notCheckTypeActionShow: false,
			notCheckTypeList: this.$fxTypeMiddleware.getCommonTypeList('notCheckType'),
			groupFlagActionShow: false,
			groupFlagList: this.$fxTypeMiddleware.getCommonTypeList('checkWay'),
			costTypeActionShow: false,
			costTypeList: this.$fxTypeMiddleware.getCommonTypeList('costType'),
			billTypePopShow: false,
			billTypeList: []
		}
	},
	computed: {
		...mapState({
			loginerShopId: state => state.loginer.loginerShopId,
			loginerShopName: state => state.loginer.loginerShopName,
			loginerId: state => state.loginer.loginerId,
			loginerName: state => state.loginer.loginerName,
			centerCheck_defaultCurrentTime: state => state.systemParamsCld.centerCheck_defaultCurrentTime,
			centerCheck_defaultCurrentDay: state => state.systemParamsCld.centerCheck_defaultCurrentDay,
			centerCheck_unCheckDoWay: state => state.systemParamsCld.centerCheck_unCheckDoWay
		})
	},
	created () {
		this.getSystemParams().then(this.initDefaultOrderData)
	},
	methods: {
		getSystemParams () {
			return this.$fxApi('centerCheckBill4cld.getSystemParams').then(res => {
				const params = {}
				const baseDataVO = res.baseDataVO
				baseDataVO.forEach(item => {
					params[item.key] = item.value
				})
				this.$store.commit({
					type: 'ADD_SYSTEM_PARAMS_CLD',
					state: {
						centerCheck_defaultCurrentTime: params.defaultCurrentTime,
						centerCheck_defaultCurrentDay: params.defaultCurrentDay,
						centerCheck_unCheckDoWay: params.unCheckDoWay,
						centerCheck_showAllCheckType: params.showAllCheckType,
						centerCheck_enableItemPack: params.enableItemPack
					}
				})
				return Promise.resolve(res)
			})
		},
		initDefaultOrderData () {
			// const unCheckItemDoType = this.centerCheck_unCheckDoWay === '0' ? 1 : 2
			let unCheckItemDoType = 1
			let unCheckItemDoTypeEnable = false
			switch (this.centerCheck_unCheckDoWay) {
			case '0':
				unCheckItemDoType = 1
				unCheckItemDoTypeEnable = true
				break
			case '1':
				unCheckItemDoType = 2
				unCheckItemDoTypeEnable = true
				break
			case '2':
				unCheckItemDoType = 1
				unCheckItemDoTypeEnable = false
				break
			case '3':
				unCheckItemDoType = 2
				unCheckItemDoTypeEnable = false
				break
			}

			const businesstTime = this.centerCheck_defaultCurrentTime === '0' ? '23:59:59' : this.$fxUtils.getCurrentTime()
			const businessDay = this.centerCheck_defaultCurrentDay === '0' ? this.$fxUtils.setDate(this.$fxUtils.getCustomDate(-1)) : this.$fxUtils.setDate()
			this.orderInfoData = {
				rdcDTO: {
					id: this.loginerShopId,
					name: this.loginerShopName
				},
				houseDTO: {},
				checkTypeDTO: {},
				busUser: {
					id: this.loginerId,
					name: this.loginerName
				},
				manualCode: '',
				businessDate: this.$fxUtils.newDate(`${businessDay} ${businesstTime}`).getTime(),
				billMemo: '',
				unCheckItemDoType,
				unCheckItemDoTypeEnable,
				groupFlag: 1,
				costType: null,
				businessTypeDTO: {
					id: '0430_0100_0100',
					name: '中心盘点单'
				},
				accountDTO: {},
				billState: 0,
				details: [],
				updateIndicator: 'Append',
				expressFlag: false,
				freight: 0
			}
		},
		// {{{ 配送中心
		onRdcClick () {
			this.getRdcListData().then(res => {
				this.rdcList = res.shops
				this.rdcPopShow = true
			})
		},
		searchRdc (keyword) {
			this.getRdcListData(keyword).then(res => {
				this.rdcList = res.shops
			})
		},
		selectRdc (item) {
			this.checkRdc(item).then(() => {
				this.$dialog.confirm({
					title: '提示',
					message: '修改配送中心将清空盘点仓库，是否继续?'
				}).then(() => {
					this.orderInfoData.rdcDTO = item
					this.orderInfoData.houseDTO = {}
				})
			})
		},
		checkRdc (rdcDTO) {
			return new Promise(resolve => {
				let current = this.orderInfoData.rdcDTO
				if (current.id !== rdcDTO.id) {
					resolve()
				}
			})
		},
		getRdcListData (keyword = null) {
			const params = {
				keyword: keyword
			}
			return this.$fxApi('common.getRdcListData')({ data: params })
		},
		// }}}
		// {{{ 盘点仓库
		onHouseClick () {
			if (!this.orderInfoData.rdcDTO.id) {
				this.$fxToast.fail('请先选择配送中心!')
				return false
			}
			this.getHouseListData().then(res => {
				this.houseList = res.shops
				this.housePopShow = true
			})
		},
		searchHouse (keyword) {
			this.getHouseListData(keyword).then(res => {
				this.houseList = res.shops
			})
		},
		selectHouse (item) {
			this.orderInfoData.houseDTO = item
		},
		getHouseListData (keyword = null) {
			const params = {
				keyword: keyword
			}
			return this.$fxApi('common.getStoreListData', this.orderInfoData.rdcDTO.id)({ data: params })
		},
		// {{{ 盘点分类
		onCheckTypeClick () {
			this.getCheckTypeListData().then(res => {
				this.checkTypeList = res.baseDataVO
				this.checkTypePopShow = true
			})
		},
		searchCheckType (keyword) {
			this.getCheckTypeListData(keyword).then(res => {
				this.checkTypeList = res.baseDataVO
			})
		},
		selectCheckType (item) {
			this.orderInfoData.checkTypeDTO = item
		},
		getCheckTypeListData (keyword = null) {
			const params = {
				keyword: keyword
			}
			return this.$fxApi('centerCheckBill4cld.getCheckTypeList', this.orderInfoData.rdcDTO.id)({ data: params })
		},
		// }}}
		// {{{ 业务日期
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
		// {{{ 未盘品项处理方式
		onNotCheckTypeClick () {
			this.$refs.notCheckTypeActionSheet.doSelect().then(item => {
				this.orderInfoData.unCheckItemDoType = item.id
			})
		},
		// }}}
		// {{{ 盘点方式
		onGroupFlagClick () {
			this.$refs.groupFlagActionSheet.doSelect().then(item => {
				this.orderInfoData.groupFlag = item.id
			})
		},
		// }}}
		// {{{ 成本类型
		onCostTypeClick () {
			this.$refs.costTypeActionSheet.doSelect().then(item => {
				this.orderInfoData.costType = item.id
			})
		},
		// }}}
		// {{{ 业务类型
		onBillTypeClick () {
			this.getBillTypeListData().then(res => {
				this.billTypeList = res.businessTypes
				this.billTypePopShow = true
			})
		},
		selectBillType (item) {
			this.billType = item
		},
		searchBillType (keyword) {
			this.getBillTypeListData(keyword).then(res => {
				this.billTypeList = res.businessTypes
			})
		},
		getBillTypeListData (keyword = null) {
			const params = {
				m: 'list4CenterCheck',
				keyword: keyword
			}
			return this.$fxApi('common.getBusinessTypeListData')({ data: params })
		},
		// }}}
		checkOrderInfo () {
			return new Promise((resolve, reject) => {
				if (!this.orderInfoData.rdcDTO.id) {
					this.$fxToast.top('请先选择配送中心!')
				} else if (!this.orderInfoData.houseDTO.id) {
					this.$fxToast.top('请先选择盘点仓库!')
				} else if (!this.orderInfoData.checkTypeDTO.id) {
					this.$fxToast.top('请先选择盘点分类!')
				} else if (!this.orderInfoData.businessDate) {
					this.$fxToast.top('请先选择业务日期!')
				} else {
					resolve()
				}
			})
		},
		onCreateClick () {
			this.checkOrderInfo().then(() => {
				this.$dialog.confirm({
					title: '提示',
					message: '确定生成单据吗?'
				}).then(() => {
					this.createHandler(this.orderInfoData)
				})
			})
		},
		createHandler (params) {
			this.$fxApi('centerCheckBill4cld.createOrder')({ data: params }).then(res => {
				this.$fxToast.success('生成单据成功').then(() => {
					this.$router.replace({
						path: 'centerCheckBill4cldDetails',
						query: {
							orderId: res.storeBills[0].id
						}
					})
				})
			})
		}
	}
}
</script>
