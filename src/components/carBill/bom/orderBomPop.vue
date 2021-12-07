<template>
	<div class="inteledi-carBill-details">
		<w-header title="查看BOM明细" titleFontSize="3.733vw" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div class="goods-title">成品品项：{{itemData.goodsDTO.name}}</div>
		<orderBom
			:data="orderBomList"
			:isDisabled="!$fxAuth('carBill.save') || isBillState(1) || isWeightState(1) || isWeightState(2) || currentItemData.bomDTO.lockFlag"
			:bomInputFocusing.sync="bomInputFocusing"
			@on-add-click="onAddClick"
			@on-search-click="onSearchClick"
			@on-unit-edit="onUnitEdit"
			@on-bom-edit="onBomEdit"
			@on-bom-focus="onBomFocus"
			@on-bom-blur="onBomBlur"
		></orderBom>
		<div class="carBill-bottom">
			<van-button
				v-show="!isDisabled"
				class="bottom-btn fx-no-radius"
				type="primary"
				@click="onClickHandler('onSaveClick')"
			>保存</van-button>
		</div>
		<van-actionsheet
			v-model="unitActionShow"
			:actions="unitActions"
			cancel-text="取消"
			@select="onUnitSelect"
		/>
		<van-popup
			v-model="bomPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<bomEditComp
				:visibleFlag.sync="bomPopShow"
				:itemId="itemData.goodsDTO.id"
				:outHouseId="orderInfoData.outHouseDTO && orderInfoData.outHouseDTO.id"
				:shopId="orderInfoData.shopDTO && orderInfoData.shopDTO.id"
				:parentStoreBom="orderBomList"
				@on-confirm="onBomEditConfirm"
			></bomEditComp>
		</van-popup>
		<van-popup
			v-model="bomRowEditPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<bomRowEditPop
				:visibleFlag.sync="bomRowEditPopShow"
				:bomData="bomEditRowData"
				:isDisabled="isDisabled"
				v-bind="$attrs"
				@on-Confirm="onEditRowConfirm"
			></bomRowEditPop>
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
				:isDisabled="isDisabled"
				@on-search-confirm="onSearchConfirm"
			></bomSearchPop>
		</van-popup>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import orderBom from '@/components/carBill/bom/OrderBom.vue'
import bomEditComp from '@/components/carBill/bom/bomEditComp.vue'
import bomRowEditPop from '@/components/carBill/bom/bomRowEditPop.vue'
import bomSearchPop from '@/components/carBill/bom/bomSearchPop.vue'
export default {
	name: 'carBillDetails',
	components: {
		orderBom,
		bomEditComp,
		bomRowEditPop,
		bomSearchPop
	},
	props: {
		visibleFlag: Boolean,
		itemData: {
			type: Object,
			default: () => {
				return {}
			}
		},
		orderInfoData: {
			type: Object,
			default: () => {
				return {}
			}
		},
		isDisabled: Boolean
	},
	data () {
		return {
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			focusing: false,
			query: this.$route.query,
			orderBomList: [],
			bomPopShow: false,
			bomEditRowData: {},
			unitActionShow: false,
			unitActions: [],
			bomRowEditPopShow: false,
			bomInputFocusing: false,
			formatterSysPointKey: ['factCount', 'factMoney', 'theoryMoney', 'planMoney', 'planCount', 'theoryCount'],
			bomSearchPopShow: false,
			searchBom: [],
			currentItemData: {}
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize',
			loginerShopId: state => state.loginer.loginerShopId,
			loginerShopName: state => state.loginer.loginerShopName,
			loginerOrganType: state => state.loginer.loginerOrganType,
			loginerId: state => state.loginer.loginerId,
			sysDZCManyLower: state => state.systemParams.sysDZCManyLower
		}),
		isBillState (state) {
			return (state) => {
				if (Object.prototype.toString.call(state) === '[object Array]') {
					return state.includes(this.orderInfoData.billState)
				} else {
					return this.orderInfoData.billState === state
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
	watch: {
		visibleFlag: {
			handler (val) {
				if (val) {
					this.currentItemData = JSON.parse(JSON.stringify(this.itemData))
					this.createOrderDetails()
				}
			},
			immediate: true
		}
	},
	methods: {
		onCloseClick () {
			if (this.focusing) { // input不符合验证规则
				return false
			}
			this.$emit('update:visibleFlag', false)
		},
		createOrderDetails () {
			this.orderBomList = this.currentItemData.bomDetail
			this.orderBomList = this.filterStoreBom(this.orderBomList)
			this.formatterSysPoint(this.orderBomList)
		},
		filterStoreBom (data) {
			data.forEach(dataItem => {
				let amount = dataItem.factCount
				// 金额和单价，在审核和未审核时不一样，需求单独处理，如未审核取参考
				if (this.isBillState(1)) {
					dataItem.price = this.toFixedNumberSize(dataItem.factMoney / amount)
				} else {
					dataItem.price = this.toFixedNumberSize(dataItem.referencePrice)
					dataItem.factMoney = this.toFixedNumberSize(dataItem.referencePrice * amount)
					dataItem.theoryMoney = this.toFixedNumberSize(dataItem.referencePrice * dataItem.theoryCount)
					dataItem.planMoney = this.toFixedNumberSize(dataItem.referencePrice * dataItem.planCount)
				}
			})
			return data
		},
		formatterSysPoint (data) {
			data.forEach(item => {
				this.formatterSysPointKey.forEach(pointItem => {
					item[pointItem] = this.toFixedNumberSize(item[pointItem])
				})
			})
		},
		toFixedNumberSize (data) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysPointSize))
		},
		onUnitEdit (item) {
			this.bomEditRowData = item
			this.getBomUnit(item.goodsDTO.id).then(res => {
				this.unitActions = res
				this.unitActionShow = true
			})
		},
		getBomUnit (goodsId) {
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
			let bom = this.bomEditRowData
			let tempUnit = bom.unitDTO
			let rate = tempUnit.value / unit.value
			let factCount = parseFloat(this.$fxUtils.toFixedSHW(bom.factCount * rate, this.sysPointSize))
			bom.unitDTO = unit
			bom.factCount = factCount
			bom.crude = bom.crude * rate
			if (bom.id) {
				bom.changeType = 'edit'
			}
		},
		onAddClick () {
			this.bomPopShow = true
		},
		onBomEditConfirm (bomData) {
			bomData.forEach(bom => {
				bom.bomDTO = {
					id: this.currentItemData.bomDTO.id
				}
			})
			this.orderBomList = bomData
		},
		onSaveClick () {
			this.checkHasDetails().then(() => {
				this.saveHandler(this.getSaveParams())
			})
		},
		saveHandler (param) {
			if (this.focusing) { // input不符合验证规则
				return false
			}
			this.$emit('update:visibleFlag', false)
			this.$emit('on-bom-save', param)
		},
		getSaveParams () {
			let params = Object.assign({}, this.currentItemData, {
				bomDetail: this.orderBomList
			})
			return params
		},
		checkHasDetails () {
			return new Promise(resolve => {
				let items = this.orderBomList.filter(item => {
					return item.changeType !== 'del'
				})
				if (items.length === 0) {
					this.$fxToast.fail('单据明细不能为空')
				} else {
					resolve()
				}
			})
		},
		onBomEdit (itemData) {
			this.bomEditRowData = itemData
			this.bomRowEditPopShow = true
		},
		onEditRowConfirm (item) {
			let index = this.orderBomList.findIndex(detailsItem => {
				return detailsItem.id === item.id
			})
			if (~index) {
				this.orderBomList[index] = item
			}
		},
		onClickHandler (method) {
			if (this.bomInputFocusing) {
				return false
			}
			this[method]()
		},
		onBomFocus (arg, uuid) {
			this.focusing = true
		},
		onBomBlur () {
			this.focusing = false
		},
		// {{{ 搜索界面
		onSearchClick () {
			this.bomSearchPopShow = true
			this.searchBom = JSON.parse(JSON.stringify(this.orderBomList))
		},
		// }}}
		onSearchConfirm (searchBomData) {
			this.orderBomList = searchBomData
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.inteledi-carBill-details {
	height:100%
	background:$fxWhite
	display: flex
	flex-direction: column
	.goods-title {
		text-align: left
		padding: 10px 20px
		font-size: 14px
	}
	.carBill-bottom {
		width:100%
		display: flex
		flex-direction: row
		.bottom-btn {
			flex:1
		}
	}
}
</style>
