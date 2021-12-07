<template>
	<w-app-page>
		<w-header :title="orderInfoData.sysbillCode" titleFontSize="3.733vw" :border="true"></w-header>
		<orderInfo
			ref="orderInfo"
			:data="orderInfoData"
			isDisabled
		></orderInfo>
		<orderItem
			ref="orderItem"
			:data="orderItemList"
			:isDisabled="isBillState(['unCheck', 'checked']) || !$fxAuth('centerCheckBill4cld.save')"
			:itemInputFocusing.sync="itemInputFocusing"
			showAddItemBtn
			:inShopId="orderInfoData.inShopDTO && orderInfoData.inShopDTO.id"
			:rdcId="orderInfoData.rdcDTO && orderInfoData.rdcDTO.id"
			@on-search-click="onSearchClick"
			@on-item-edit="onItemEdit"
		></orderItem>
		<w-bottom-btn-bar>
			<w-button
				size="large"
				type="primary"
				@click="goToCheckBill"
			>去盘点单</w-button>
		</w-bottom-btn-bar>
		<van-popup
			v-fx-history-back="itemRowEditPopShow"
			v-model="itemRowEditPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<itemRowEditPop
				:visibleFlag.sync="itemRowEditPopShow"
				:itemData="itemEditRowData"
				:isDisabled="isBillState(['unCheck', 'checked']) || !$fxAuth('centerCheckBill4cld.save')"
			></itemRowEditPop>
		</van-popup>
		<van-popup
			v-fx-history-back="itemSearchPopShow"
			v-model="itemSearchPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<itemSearchPop
				:visibleFlag.sync="itemSearchPopShow"
				:data="searchItem"
				:inShopId="orderInfoData.inShopDTO && orderInfoData.inShopDTO.id"
				:rdcId="orderInfoData.rdcDTO && orderInfoData.rdcDTO.id"
				:isDisabled="isBillState(['unCheck', 'checked']) || !$fxAuth('centerCheckBill4cld.save')"
				showScanCode
				:businessDate="orderInfoData.businessDate"
			></itemSearchPop>
		</van-popup>
	</w-app-page>
</template>

<script>
import orderInfo from '@/components/centerCheckOut4cld/createOrder/OrderInfo.vue'
import orderItem from '@/components/centerCheckOut4cld/createOrder/OrderItem.vue'
import itemRowEditPop from '@/components/centerCheckOut4cld/common/ItemRowEditPop.vue'
import itemSearchPop from '@/components/centerCheckOut4cld/common/itemSearchPop.vue'
export default {
	name: 'centerCheckOut4cldDetails',
	components: {
		orderInfo,
		orderItem,
		itemRowEditPop,
		itemSearchPop
	},
	data () {
		return {
			query: this.$route.query,
			orderInfoData: {},
			orderItemList: [],
			itemSearchPopShow: false,
			itemRowEditPopShow: false,
			itemEditRowData: {},
			searchItem: [],
			itemInputFocusing: false
		}
	},
	created () {
		this.refreshOrderDetails()
	},
	computed: {
		isBillState (state) {
			return state => {
				return this.$fxStateMiddleware.stateIs('stateAndRecheckSingleCld')(state)(this.orderInfoData.billStateFlag)
			}
		}
	},
	methods: {
		refreshOrderDetails () {
			return this.$fxApi('centerCheckOut4cld.getOrderDetails', this.query.orderId).then(this.initOrderDetails)
		},
		initOrderDetails (res) {
			let orderDetailsData = res.storeBills[0]
			this.orderInfoData = orderDetailsData
			this.orderItemList = orderDetailsData.details
			this.setDataUUID(this.orderItemList)
			return Promise.resolve()
		},
		setDataUUID (data) {
			data.forEach(dataItem => {
				dataItem.uuid = this.$fxUtils.createUUID()
			})
		},
		// {{{ 搜索界面
		onSearchClick () {
			this.itemSearchPopShow = true
			this.searchItem = this.$fxUtils.deepClone(this.orderItemList)
		},
		// }}}
		onItemEdit (itemData) {
			this.itemEditRowData = itemData
			this.itemRowEditPopShow = true
		},
		goToCheckBill () {
			this.$router.replace({
				path: 'centerCheckBill4cldDetails',
				query: {
					orderId: this.orderInfoData.fatherId
				}
			})
		}
	}
}
</script>
