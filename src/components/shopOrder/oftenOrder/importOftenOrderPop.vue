<template>
	<div class="ofterOrder-wrap">
		<w-header title="导入常订品项" :leftOptions="leftOptions" :border="true" @on-click-back="onCloseClick"></w-header>
		<div class="order-info-block fx-shadow-block">
			<van-cell-group>
				<van-cell title="常订品项方案" :value="ofterOrderPlan" value-class="info-item-value" is-link @click="onOfterOrderPlanClick" class="fx-info-title"/>
			</van-cell-group>
		</div>
		<div class="order-item-block fx-shadow-block">
			<div class="item-title fx-title">
				<span class="title-name">单据明细</span>
				<span class="title-count">明细：</span>
				<span>{{detailsLength}}</span>
				<i class="title-search-icon title-icon fl-r" @click="onSearchClick"></i>
			</div>
			<oftenItemList
				ref="addItemList"
				:data="data"
				:rowActive="rowActive"
				:amount.sync="amount"
				@on-item-click="onItemClick"
			></oftenItemList>
			<div class="import-bill-bottom">
				<van-button
					class="add-btn fx-no-radius fx-btn"
					type="primary"
					@click="onImportConfirm"
				>导入</van-button>
			</div>
		</div>
		<van-popup v-model="ofterOrderPlanPopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<checkboxListComp
				:visibleFlag.sync="ofterOrderPlanPopShow"
				:data="ofterOrderPlansList"
				:loadFinished="true"
				title="常订方案检索"
				@on-search="searchOfterOrderPlan"
				@on-select="selectOfterOrderPlan"
			></checkboxListComp>
		</van-popup>
		<van-popup
			v-model="oftenItemSearchPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<oftenItemSearchPop
				:visibleFlag.sync="oftenItemSearchPopShow"
				:data="data"
				:isDisabled="false"
				@on-search-confirm="onSearchConfirm"
			></oftenItemSearchPop>
		</van-popup>
		<div v-show="numberKeyboardShow" class="details-number-keyboard">
			<itemNumberKeyboard
				:title="keyboardTitleCompted"
				:amount="keyboardAmountCompted"
				:pointSize="sysPointSize"
				:intLength="numberLength"
				:unit="keyboardUnitCompted"
				:unitEdit="false"
				@change="onKeyboardChange"
				@pre="onKeyboardPre"
				@next="onKeyboardNext"
				@hide="onKeyboardHide"
			></itemNumberKeyboard>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import checkboxListComp from '@/components/shopOrder/oftenOrder/CheckboxListComp.vue'
import oftenItemSearchPop from '@/components/shopOrder/oftenOrder/oftenItemSearchPop.vue'
import itemNumberKeyboard from '@/components/common/ItemNumberKeyboard.vue'
import oftenItemList from '@/components/shopOrder/oftenOrder/oftenItemList.vue'
export default {
	name: 'orderItem',
	components: {
		checkboxListComp,
		oftenItemSearchPop,
		itemNumberKeyboard,
		oftenItemList
	},
	props: {
		visibleFlag: Boolean,
		isDisabled: {
			type: Boolean,
			default: false
		},
		shopId: {
			type: String,
			default: ''
		},
		workDate: {
			type: [String, Number],
			default: ''
		},
		urgentFlag: {
			type: Boolean,
			default: false
		},
		orderPlanId: {
			type: String,
			default: ''
		},
		houseGoodsArray: {
			type: Array,
			default: () => {
				return []
			}
		}
	},
	inheritAttrs: false,
	data () {
		return {
			data: [],
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			ofterOrderPlansList: [],
			ofterOrderPlan: '',
			ofterOrderPlanPopShow: false,
			oftenItemSearchPopShow: false,
			numberKeyboardShow: false,
			rowActive: [], // 0:仓库index 1:品项index
			amount: 0
		}
	},
	watch: {
		visibleFlag: {
			handler (val) {
				if (val) {
					this.resetHandler()
				}
			},
			immediate: true
		},
		rowActiveData: {
			handler (val, oldVal) {
				if (!this.data.length) {
					return true
				}
				if (oldVal.length) {
					this.data[oldVal[0]].details[oldVal[1]].busUnitAmount = parseFloat(this.data[oldVal[0]].details[oldVal[1]].busUnitAmount)
					if (!val.length) { // 收起键盘
						this.numberKeyboardShow = false
					} else {
						this.scrollToActive(val)
					}
				} else {
					this.scrollToActive(val)
				}
			},
			deep: true
		}
	},
	computed: {
		...mapState({
			loginerId: state => state.loginer.loginerId,
			numberLength: 'numberLength',
			sysPointSize: 'sysPointSize'
		}),
		detailsLength (arg) {
			return this.data.reduce((pre, cur) => {
				let arr = cur.details.filter(item => {
					return item.changeType !== 'del'
				})
				return pre + arr.length
			}, 0)
		},
		keyboardTitleCompted () {
			if (!this.rowActive.length || !this.data.length) {
				return ''
			} else {
				let row = this.data[this.rowActive[0]].details[this.rowActive[1]]
				return row.goodsDTO.name
			}
		},
		keyboardUnitCompted () {
			if (!this.rowActive.length || !this.data.length) {
				return ''
			} else {
				let row = this.data[this.rowActive[0]].details[this.rowActive[1]]
				return row.unitDTO.name
			}
		},
		keyboardAmountCompted () {
			if (!this.rowActive.length || !this.data.length) {
				return '0'
			} else {
				let row = this.data[this.rowActive[0]].details[this.rowActive[1]]
				return row.busUnitAmount
			}
		},
		rowActiveData () {
			return [...this.rowActive]
		}
	},
	methods: {
		onCloseClick () {
			this.$emit('update:visibleFlag', false)
		},
		// {{{ 常订品项方案
		getOrderPlansListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					m: 'getOrderPlans',
					keyWord: keyword
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.shopId}/users/${this.loginerId}/oftenOrderGoodPlans`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		ofterOrderPlansRefresh (keyword = null) {
			this.getOrderPlansListData(keyword).then(res => {
				this.ofterOrderPlansList = res.orderGoodsPlans
				this.ofterOrderPlanPopShow = true
			})
		},
		onOfterOrderPlanClick () {
			this.numberKeyboardShow = false
			this.clearItemConfim('更换常订方案清空常订品项,是否继续?').then(() => {
				this.data = []
				this.ofterOrderPlansList = []
				this.ofterOrderPlan = ''
				this.ofterOrderPlansRefresh()
			})
		},
		clearItemConfim (message) {
			return new Promise(resolve => {
				if (this.data.length === 0) {
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
		searchOfterOrderPlan (keyword) {
			this.ofterOrderPlansRefresh(keyword)
		},
		selectOfterOrderPlan (selectData) {
			this.ofterOrderPlan = selectData.names.join(',')
			this.getOrderGoodsListData(selectData).then(res => {
				let data = res.shopOrderBillDetails
				let stores = Array.from(new Set(data.map(item => {
					return item.houseDTO.id
				})))
				let StoreItem = stores.map(item => {
					let storeObj = data.find(dataItem => {
						return dataItem.houseDTO.id === item
					}).houseDTO
					storeObj = JSON.parse(JSON.stringify(storeObj))
					storeObj.details = data.filter(dataItem => {
						if (dataItem.must) {
							dataItem.checked = true
						}
						dataItem.consultPrice = this.toFixedNumberSize(dataItem.consultPrice)
						dataItem.consultMoney = 0
						dataItem.consultTaxPrice = this.toFixedNumberSize(dataItem.consultTaxPrice)
						dataItem.consultTax = this.toFixedNumberSize(dataItem.consultTax)
						dataItem.consultMoneyWithTax = 0
						return dataItem.houseDTO.id === item
					})
					return storeObj
				})
				this.data = StoreItem
			})
		},
		// }}}
		// {{{ 方案请求
		getOrderGoodsListData (selectData) {
			return new Promise(resolve => {
				const params = {
					shopId: this.shopId,
					workDate: this.$fxUtils.setDateTime(new Date(this.workDate), '时分'),
					expressFlag: this.urgentFlag,
					orderPlanId: this.orderPlanId,
					delIds: this.houseGoodsArray.join(','),
					oftenOrderIds: selectData.ids.join(',')
				}
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/accounts/${this.shopId}/users/${this.loginerId}/shoporderdetails`,
					data: params,
					query: {
						m: 'getOftenOrderGoods'
					}
				}).then(res => {
					resolve(res)
				})
			})
		},
		toFixedNumberSize (data) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysPointSize))
		},
		// }}}
		// {{{ 导入
		onImportConfirm () {
			this.resetKeyBoard()
			let selectItem = this.findSelectItem()
			if (selectItem.length === 0) {
				this.$fxToast.fail('请选择常订品项，并填写订货数量')
				return false
			}
			this.$nextTick(() => {
				this.$emit('on-item-import-confirm', selectItem)
				this.$emit('update:visibleFlag', false)
			})
		},
		findSelectItem () {
			let importData = []
			this.data.forEach(dataItem => {
				let selects = dataItem.details.filter(item => {
					if (item.checked === true) {
						item.changeType = 'add'
						return true
					} else {
						return false
					}
				})
				if (selects.length) {
					let selectData = JSON.parse(JSON.stringify(dataItem))
					selectData.details = selects
					importData.push(selectData)
				}
			})
			return importData
		},
		// }}}
		// {{{ 搜索
		onSearchClick () {
			this.resetKeyBoard()
			this.oftenItemSearchPopShow = true
		},
		onSearchConfirm (searchItemData) {
			this.data = JSON.parse(JSON.stringify(searchItemData))
		},
		// }}}
		resetHandler () {
			this.data = []
			this.ofterOrderPlansList = []
			this.ofterOrderPlan = ''
			this.ofterOrderPlanPopShow = false
			this.resetKeyBoard()
		},
		// {{{ 编辑
		onItemClick (indexs) {
			this.rowActive = indexs
			this.numberKeyboardShow = true
		},
		// }}}
		// {{{ 键盘
		resetKeyBoard () {
			this.rowActive = []
			this.numberKeyboardShow = false
		},
		onKeyboardChange (val) {
			this.amount = val
		},
		onKeyboardPre () {
			let rowActive = this.rowActive
			if (!rowActive.length || (rowActive[0] === 0 && rowActive[1] === 0)) {
				return false
			}
			if (rowActive[1] === 0) { // 仓库里第一个
				rowActive[0]--
				rowActive[1] = this.data[rowActive[0]].details.length - 1
			} else {
				rowActive[1]--
			}
			this.$set(this.rowActive, 0, rowActive[0])
			this.$set(this.rowActive, 1, rowActive[1])
		},
		onKeyboardNext () {
			let data = this.data
			let rowActive = this.rowActive
			if (!rowActive.length || (rowActive[0] === data.length - 1 && rowActive[1] === data[data.length - 1].details.length - 1)) {
				return false
			}
			if (rowActive[1] + 1 === data[rowActive[0]].details.length) { // 仓库里最后一个
				rowActive[0]++
				rowActive[1] = 0
			} else {
				rowActive[1]++
			}
			this.$set(this.rowActive, 0, rowActive[0])
			this.$set(this.rowActive, 1, rowActive[1])
		},
		onKeyboardHide () {
			this.rowActive = []
		},
		scrollToActive (indexs) {
			this.$nextTick(() => {
				this.$refs.addItemList.onSelectLetter(indexs, 20)
			})
		}
		// }}}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
@import '~$assets/stylus/extend.styl'
.ofterOrder-wrap {
	height: 100%
	background: #fff
	display: -webkit-box
	display: -ms-flexbox
	display: flex
	-webkit-box-orient: vertical
	-webkit-box-direction: normal
	-ms-flex-direction: column
	flex-direction: column
	.order-info-block {
		width:340px
		margin:10px auto
		padding:5px
		text-align:left
		.van-cell-group::after {
			border-width: 0 0
		}
	}
	.order-item-block {
		@extend .fx-order-item-block_extend
		.item-title {
			height:40px
			line-height:40px
			border-bottom:1px solid $fxBorder
			.title-name {
				margin-left:10px
			}
			.title-count {
				margin-left:20px
			}
			.title-icon {
				width:16px
				height:40px
				background-repeat:no-repeat
				background-position: center
				background-size: 100%
				display:inline-block
			}
			.title-search-icon {
				background-image:url('~images/icon/icon-search.png')
				margin-right:10px
			}
		}
	}
	.import-bill-bottom {
		width:100%
		display: flex
		flex-direction: row
		.add-btn {
			width:100%
		}
	}
	.info-item-value {
		text-overflow: ellipsis;
		white-space: nowrap;
	}
}
</style>
