<template>
	<div class="inteledi-stockApplySend-details">
		<w-header title="订货减单" :leftOptions="leftOptions" titleFontSize="3.733vw" :border="true" @on-click-back="onCloseClick">
		</w-header>
		<orderItem
			ref="orderItem"
			:data="orderItemList"
			:isInit="initItemCom"
			:itemInputFocusing.sync="itemInputFocusing"
		></orderItem>
		<div class="stockApplySend-bottom">
			<div class="send-btn-wrap">
				<van-button
					class="bottom-btn fx-no-radius minus-records"
					type="danger"
					@click="onClickHandler('onMinusRecordClick')"
				>减单记录</van-button>
				<van-button
					class="bottom-btn fx-no-radius minus-btn"
					type="primary"
					@click="onClickHandler('onMinusClick')"
				>减单</van-button>
			</div>
		</div>
		<van-popup
			v-model="minusRecordPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<minusRecord
				:visibleFlag.sync="minusRecordPopShow"
				:minusData="recordData"
				:isDisabled="false"
			></minusRecord>
		</van-popup>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import orderItem from '@/components/stockApply/minusBill/OrderItem.vue'
import minusRecord from '@/components/stockApply/minusRecord/MinusPop.vue'
export default {
	name: 'minusBillPop',
	components: {
		orderItem,
		minusRecord
	},
	props: {
		visibleFlag: Boolean,
		minusData: {
			type: Object,
			default: () => {
				return {}
			}
		}
	},
	data () {
		return {
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			orderInfoData: {},
			orderItemList: [],
			itemInputFocusing: false,
			initItemCom: false,
			saveReduceBillFlag: false,
			minusRecordPopShow: false,
			recordData: []
		}
	},
	watch: {
		visibleFlag: {
			handler (val) {
				this.orderInfoData = JSON.parse(JSON.stringify(this.minusData))
				this.orderItemList = JSON.parse(JSON.stringify(this.minusData.details))
				this.initItemCom = val
				this.saveReduceBillFlag = false
				this.recordData = this.minusData.reduce ? JSON.parse(JSON.stringify(this.minusData.reduce)) : []
			},
			immediate: true
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize',
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId
		})
	},
	methods: {
		onCloseClick () {
			if (this.itemInputFocusing) {
				return false
			}
			this.$emit('update:visibleFlag', false)
			this.$emit('on-confirm', this.saveReduceBillFlag)
		},
		onClickHandler (method) {
			if (this.itemInputFocusing) {
				return false
			}
			this[method]()
		},
		getSaveParams () {
			return new Promise(resolve => {
				let items = this.orderItemList.filter(item => {
					return item.reduceAmount > 0
				})
				if (items.length > 0) {
					let params = Object.assign({}, this.orderInfoData, {
						details: items
					})
					resolve(params)
				} else {
					this.$fxToast.fail('请填写至少一条减单品项!')
				}
			})
		},
		onMinusClick () {
			this.getSaveParams().then(data => {
				this.$fxApi('stockApplyOrder.reduceBill', this.orderInfoData.id)({ data: data }).then(res => {
					this.refreshDetails().then(() => {
						this.$fxToast.success(res.message)
						this.saveReduceBillFlag = true
					})
				})
			})
		},
		onMinusRecordClick () {
			this.minusRecordPopShow = true
		},
		refreshDetails () {
			return new Promise(resolve => {
				this.getOrderDetails().then(res => {
					let orderDetailsData = res.stockApplyBills[0]
					this.formatterSysPoint(orderDetailsData.details)
					this.formatterSysPoint(orderDetailsData.reduce)
					this.orderInfoData = JSON.parse(JSON.stringify(orderDetailsData))
					this.orderItemList = JSON.parse(JSON.stringify(orderDetailsData.details))
					this.recordData = JSON.parse(JSON.stringify(orderDetailsData.reduce))
					resolve()
				})
			})
		},
		formatterSysPoint (data) {
			let toFixedNumberSize = (data) => {
				return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysPointSize))
			}
			data.forEach(item => {
				['busUnitAmount', 'originalAmount', 'reduceAmount'].forEach(pointItem => {
					item[pointItem] = toFixedNumberSize(item[pointItem])
				})
			})
		},
		getOrderDetails () {
			return new Promise(resolve => {
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/stockApplies/${this.orderInfoData.id}`
				}).then(res => {
					resolve(res)
				})
			})
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.inteledi-stockApplySend-details {
	height:100%
	background:$fxWhite
	display: flex
	flex-direction: column
	.stockApplySend-bottom {
		display: flex
		flex-direction: row
		.send-btn-wrap {
			width:100%
			display: flex
			flex-direction: row
			.bottom-btn {
				flex:1
				padding:0
				overflow:hidden
			}
			.minus-btn {
				background-color: $fxBlueBtn
			}
			.minus-records {
				background-color: $fxRedBtn
			}
		}
	}
}
</style>
