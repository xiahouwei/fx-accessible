<template>
	<div class="inteledi-shopOrder-create">
		<w-header title="新增盘点单" :border="true"></w-header>
		<createBillInfo
			:data="orderInfoData"
			@on-shop-click="onShopClick"
			@on-house-click="onHouseClick"
			@on-date-click="onDateClick"
			@on-plan-click="onPlanClick"
			@on-plan-clear="onPlanClear"
			@on-batchType-click="onBatchTypeClick"
		></createBillInfo>
		<div class="shopOrder-bottom">
			<van-button class="bottom-btn fx-no-radius" type="info" @click="onCancelClick">取消</van-button>
			<van-button class="bottom-btn fx-no-radius" type="primary" @click="onAddItemClick">生成</van-button>
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
				title="请选择机构"
				@on-search="searchShop"
				@on-select="selectShop"
				@on-load="onShopLoad"
			></listComp>
		</van-popup>
		<van-popup v-model="housePopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="housePopShow"
				:data="houseList"
				:loadFinished="true"
				title="盘点仓库检索"
				@on-search="searcHouse"
				@on-select="selectHouse"
			></listComp>
		</van-popup>
		<van-popup v-model="planPopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="planPopShow"
				:data="planList"
				:loadFinished="true"
				title="盘点方案"
				@on-search="searcPlan"
				@on-select="selectPlan"
			></listComp>
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
				:store="orderInfoData.houseDTO"
				:businessDate="orderInfoData.businessDate"
				:createBillFlag="true"
				:unCheckZero="sysCheckClearZero"
				@on-confirm="onConfirm"
			></itemEditComp>
		</van-popup>
		<van-popup v-model="batchTypePopShow" position="right" class="fx-list-popup-300">
			<listComp
				:visibleFlag.sync="batchTypePopShow"
				:data="batchTypeList"
				title="合批分批检索"
				:loadFinished="true"
				@on-select="selectBatchType"
				@on-search="searchBatchType"
			></listComp>
		</van-popup>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import createBillInfo from '@/components/checkBill/orderDetails/createBillInfo.vue'
import listComp from '@/components/common/ListComp.vue'
import itemEditComp from '@/components/checkBill/common/itemEditComp.vue'
const ITEM_SIZE = 50
export default {
	name: 'creatCheckBill',
	components: {
		createBillInfo,
		listComp,
		itemEditComp
	},
	data () {
		return {
			query: this.$route.query,
			activeNames: ['1'],
			tabActive: '选项1',
			orderInfoData: {
				accountDTO: {},
				businessDate: '',
				shopDTO: {
					name: '请选择',
					id: ''
				},
				houseDTO: {
					name: '请选择',
					id: ''
				},
				planDTO: null,
				updateIndicator: 'Append',
				unCheckZero: false,
				batchTypeName: '合批',
				batchType: 1
			},
			orderItemList: [],
			itemStorePopShow: false,
			housePopShow: false,
			houseList: [],
			planPopShow: false,
			planList: [],
			datePickerShow: false,
			currentDate: new Date(),
			itemPopShow: false,
			// {{机构
			shopList: [],
			shopPopShow: false,
			shopListStart: 0,
			onShopLoading: false,
			shopListLoadFinished: false,
			// }}
			// {{{ 合批分批
			batchTypeData: [
				{ id: false, name: '分批' },
				{ id: true, name: '合批' }
			],
			batchTypePopShow: false,
			batchTypeList: []
			// }}}
		}
	},
	created () {
		// 将登录人所属机构默认置到调入方机构上,该机构下有一个仓库，仓库默认显示该仓库
		// 如果存在多个仓库，则随机显示一个仓库
		// 企业人员默认显示配送中心的机构和仓库，管理多个配送中心和仓库时，随机选择一个显示
		this.getDefaultShopListData().then(res => {
			let ShopData = { ...res }
			if (!ShopData.shops) {
				return false
			}
			this.orderInfoData.shopDTO = ShopData.shops[0]
			// 新增需要取得机构下默认仓库
			this.getHouseListData().then(res => {
				let HouseData = { ...res }
				if (!HouseData.shops.length) {
					return false
				}
				this.orderInfoData.houseDTO = HouseData.shops[0]
				if (!this.$fxSysAuth('shopCheckBill.defaultPlan')) {
					return true
				}
				// 新增需要取得机构下默认方案
				this.getPlanListData(null, false).then(sres => {
					let PlanData = { ...sres }
					if (!PlanData.checkPlans) {
						return false
					}
					this.orderInfoData.planDTO = PlanData.checkPlans[0]
				})
			})
		})
		if (this.sysCheckDateFormat === 1) {
			// 盘点单盘点日期格式 1:当前日期时分秒； 2：当前日期 23时59分59秒
			this.orderInfoData.businessDate = this.$fxUtils.getCustomerDateAndCurrentTime(new Date()).getTime()
		} else {
			this.orderInfoData.businessDate = this.$fxUtils.getCustomerDateAndTime(new Date(), '23:59:59').getTime()
		}
	},
	computed: {
		...mapState({
			loginerId: state => state.loginer.loginerId,
			sysCheckDateFormat: state => state.systemParams.sysCheckDateFormat,
			sysCheckClearZero: state => state.systemParams.sysCheckClearZero,
			loginerShopId: state => state.loginer.loginerShopId,
			loginerShopName: state => state.loginer.loginerShopName,
			loginerOrganType: state => state.loginer.loginerOrganType
		})
	},
	methods: {
		// {{{获取默认机构
		getDefaultShopListData () {
			return new Promise(resolve => {
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/inshopDefault`
				}).then(res => {
					resolve(res)
				})
			})
		},
		// }}}
		// {{{选择仓库
		onHouseClick () {
			this.onHouseRefresh()
		},
		searcHouse (keyword) {
			this.onHouseRefresh(keyword)
		},
		onHouseRefresh (keyword = null) {
			this.getHouseListData(keyword).then(res => {
				this.housePopShow = true
				this.houseList = res.shops
			})
		},
		getHouseListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					searchText: keyword,
					disableFalg: 0
				}
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/accounts/${this.orderInfoData.shopDTO.id}/users/${this.loginerId}/houses`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		selectHouse (item) {
			this.orderInfoData.houseDTO = item
			if (!this.$fxSysAuth('shopCheckBill.defaultPlan')) {
				this.orderInfoData.planDTO = ''
				return true
			}
			this.getPlanListData(null, false).then(res => {
				let PlanData = { ...res }
				if (!PlanData.checkPlans) {
					return false
				}
				this.orderInfoData.planDTO = PlanData.checkPlans[0]
			})
		},
		// }}}
		// {{机构
		onShopClick () {
			this.shopListStart = 0
			this.shopListLoadFinished = false
			this.getShopListData().then(res => {
				this.shopList = res.shops
				this.shopPopShow = true
			})
		},
		searchShop (keyword) {
			this.shopListStart = 0
			this.getShopListData(keyword).then(res => {
				this.shopList = res.shops
			})
		},
		onShopLoad (keyword = null) {
			this.getShopListData(keyword).then(res => {
				this.shopList.push(...res.shops)
			})
		},
		getShopListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					start: this.shopListStart,
					size: ITEM_SIZE,
					keyword: keyword,
					m: 'getShopListForUserhouse'
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
		checkShop (shopDTO) {
			return new Promise(resolve => {
				let currentInShopDTO = this.orderInfoData.shopDTO || {}
				if (currentInShopDTO.id !== shopDTO.id) {
					resolve()
				}
			})
		},
		selectShop (item) {
			this.checkShop(item).then(() => {
				this.clearItemConfim('更换机构清空仓库，是否确认修改?').then(() => {
					this.orderInfoData.houseDTO = {}
					this.orderInfoData.shopDTO = item
					this.houseList = []
					this.orderInfoData.planDTO = null
					// 新增需要取得机构下默认仓库
					this.getHouseListData().then(res => {
						if (!res.shops.length) {
							return false
						}
						this.orderInfoData.houseDTO = res.shops[0]
						if (!this.$fxSysAuth('shopCheckBill.defaultPlan')) {
							return true
						}
						// 新增需要取得机构下默认方案
						this.getPlanListData(null, false).then(res => {
							if (!res.checkPlans) {
								return false
							}
							this.orderInfoData.planDTO = res.checkPlans[0]
						})
					})
				})
			})
		},
		// }}
		clearItemConfim (message) {
			return new Promise(resolve => {
				if (!this.orderInfoData.houseDTO.id) {
					resolve()
				} else {
					this.$dialog.confirm({
						title: '提示',
						message: message
					}).then(() => {
						resolve()
					}).catch(() => {
					})
				}
			})
		},
		// {{{选择方案
		onPlanClick () {
			this.onPlanRefresh()
		},
		searcPlan (keyword) {
			this.onPlanRefresh(keyword)
		},
		onPlanRefresh (keyword = null) {
			this.getPlanListData(keyword, true).then(res => {
				this.planPopShow = true
				this.planList = res.checkPlans
			})
		},
		getPlanListData (keyword = null, isPid) {
			let pid
			if (isPid) {
				pid = ''
			} else {
				pid = this.orderInfoData.planDTO ? this.orderInfoData.planDTO.id : ''
			}
			return new Promise(resolve => {
				let params = {
					workDate: this.$fxUtils.setDate(new Date(this.orderInfoData.businessDate)) + ' 23:59:59',
					keyWord: keyword,
					houseId: this.orderInfoData.houseDTO.id,
					planId: pid
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.orderInfoData.shopDTO.id}/users/${this.loginerId}/checkplans`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		selectPlan (item) {
			this.orderInfoData.planDTO = item
		},
		// }}}
		// {{{时间
		onDateClick () {
			if (!this.$fxAuth('shopCheckBill.modifyCheckDate')) {
				this.$toast({
					message: '当前没有修改盘点日期权限!',
					position: 'top'
				})
				return false
			}
			this.datePickerShow = true
		},
		dateConfirmhandle (date) {
			let time = 0
			if (this.sysCheckDateFormat === 1) {
				// 盘点单盘点日期格式 1:当前日期时分秒； 2：当前日期 23时59分59秒
				time = this.$fxUtils.getCustomerDateAndCurrentTime(date).getTime()
			} else {
				time = this.$fxUtils.getCustomerDateAndTime(date, '23:59:59').getTime()
			}
			if (this.orderInfoData.businessDate !== time) {
				if (!this.$fxSysAuth('shopCheckBill.defaultPlan')) {
					if (this.orderInfoData.planDTO) {
						this.$dialog.confirm({
							title: '提示',
							message: '更改盘点日期将清空盘点方案，是否确认修改?'
						}).then(() => {
							this.orderInfoData.businessDate = time
							this.orderInfoData.planDTO = null
						})
					} else {
						this.orderInfoData.businessDate = time
						this.orderInfoData.planDTO = null
					}
				} else {
					this.orderInfoData.businessDate = time
					// 新增需要取得机构下默认方案
					this.getPlanListData(false).then(res => {
						if (!res.checkPlans) {
							return false
						}
						this.orderInfoData.planDTO = res.checkPlans[0]
					})
				}
			} else {
				this.orderInfoData.businessDate = time
			}
			this.datePickerShow = false
		},
		// }}}
		onCancelClick () {
			this.$router.go(-1)
		},
		onAddItemClick () {
			if (this.orderInfoData.houseDTO.id === '') {
				this.$fxToast.fail('请先选择仓库!')
				return false
			}
			if (this.orderInfoData.businessDate === '') {
				this.$fxToast.fail('请先选择盘点日期!')
				return false
			}
			this.createdByPlan().catch(() => {
				this.openItemPop()
			})
		},
		createdByPlan () {
			return new Promise((resolve, reject) => {
				if (!this.orderInfoData.planDTO) {
					reject(this.orderInfoData.planDTO)
					return false
				}
				let params = Object.assign(this.orderInfoData, {
					details: [],
					planId: this.orderInfoData.planDTO.id,
					sumAccountMoney: 0,
					sumActualMoney: 0,
					sumPLMoney: 0,
					unCheckZero: false,
					businessDate: new Date(this.orderInfoData.businessDate).getTime(),
					accountDTO: {
						id: this.loginerId
					},
					hasSumBatch: this.orderInfoData.batchType
				})
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/checkbills`,
					data: params
				}).then(res => {
					this.$fxToast.success('创建盘点单成功').then(() => {
						this.$router.replace({
							path: 'checkBillDetails',
							query: {
								orderId: res.checkBills[0].id
							}
						})
					})
				})
			})
		},
		openItemPop () {
			// 请求品项列表list，无品项则不需打开品项列表页面
			let params = {
				houseId: this.orderInfoData.houseDTO.id,
				paged: true,
				start: 0,
				size: ITEM_SIZE,
				removeIds: [],
				workDate: new Date(this.orderInfoData.businessDate).getTime(),
				searchText: ''
			}
			this.$fxHttp.requestPost({
				url: `${this.$fxBaseApi.url}/accounts/${this.shopId}/users/${this.loginerId}/goods?`,
				data: params,
				query: {
					m: 'list4CheckBill'
				}
			}).then(res => {
				// 存在品项，打开列表
				if (res.goods.length) {
					this.itemPopShow = true
				} else {
					this.$fxToast.fail('没有品项!')
				}
			})
		},
		onConfirm (selectItems, unCheckZero = false) {
			let goodsIdList = this.$fxUtils.arrDedup(selectItems.map(item => {
				return item.id
			}))
			let params = Object.assign(this.orderInfoData, {
				goodsIdList: goodsIdList,
				details: [],
				sumAccountMoney: 0,
				sumActualMoney: 0,
				sumPLMoney: 0,
				unCheckZero: unCheckZero,
				businessDate: new Date(this.orderInfoData.businessDate).getTime(),
				accountDTO: {
					id: this.loginerId
				},
				houseDTO: {
					id: this.orderInfoData.houseDTO.id,
					name: this.orderInfoData.houseDTO.name
				},
				shopDTO: {
					id: this.orderInfoData.shopDTO.id,
					name: this.orderInfoData.shopDTO.name
				},
				hasSumBatch: this.orderInfoData.batchType
			})
			this.$fxHttp.requestPost({
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/checkbills`,
				data: params
			}).then(res => {
				this.$fxToast.success('创建盘点单成功').then(() => {
					this.itemPopShow = false
					this.$nextTick(() => {
						this.$router.replace({
							path: 'checkBillDetails',
							query: {
								orderId: res.checkBills[0].id
							}
						})
					})
				})
			})
		},
		getSelectItemUnit (selectItems) {
			let params = []
			selectItems.forEach(item => {
				let itemObj = {
					billId: this.query.orderId,
					goodsDTO: {
						id: item.id
					},
					houseId: this.orderInfoData.houseDTO.id,
					workDate: this.orderInfoData.businessDate
				}
				params.push(itemObj)
			})
			return new Promise(resolve => {
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/checkbills/${this.query.orderId}/details`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		onPlanClear () {
			this.orderInfoData.planDTO = null
		},
		// {{{ 分批合批
		onBatchTypeClick () {
			this.batchTypeList = this.batchTypeData
			this.batchTypePopShow = true
		},
		selectBatchType (item) {
			this.orderInfoData.batchTypeName = item.name
			this.orderInfoData.batchType = item.id
		},
		searchBatchType (keyword) {
			this.batchTypeList = this.batchTypeData.filter(item => {
				return item['name'].includes(keyword)
			})
		}
		// }}}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.inteledi-shopOrder-create {
	height:100%
	background:$fxWhite
	display: flex
	flex-direction: column
	.shopOrder-bottom {
		width:100%
		.bottom-btn {
			width:50%
		}
	}
}
</style>

