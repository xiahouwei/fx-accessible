<template>
	<div class="item-search-block">
		<w-header title="库存不足发货" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div class="item-title">
			<span class="title-count">明细：</span>
			<span>{{detailsLength}}</span>
		</div>
		<div class="item-title" @click="onAllCenterHouseClick" >
			<span class="fx-ellipsis title-house">发货仓库</span>
			<van-icon class="house-icon" name="arrow" />
		</div>
		<div class="item-list" ref="details-content">
			<van-collapse v-model="activeStoreNames" :border="false">
				<van-collapse-item :name="`${storeItem.id}`"
					v-for="storeItem in data"
					:key="`${storeItem.id}`"
					class="store-row"
					v-show="storeShowComputed(storeItem)"
				>
					<div slot="title" class="item-store-title-container">
						<div class="item-store-title">
							<span class="store-left-name fx-ellipsis">收货仓库：{{storeItem.name}}</span>
						</div>
					</div>
					<div
						v-show="item.changeType !== 'del'"
						v-for="item in detailFilter(storeItem.details)"
						:ref="`details-row-${item.goodsDTO.id}`"
						:key="`${item.goodsDTO.id}-${item.goodsUUid}`"
						:disabled="isDisabled"
						class="item-row"
					>
						<div class="item-cell">
							<itemInfoCell
								:itemData="item"
								:isDisabled="isDisabled"
								@on-centerHouse-edit="onCenterHouseEdit"
								class="search-info"
							></itemInfoCell>
						</div>
					</div>
				</van-collapse-item>
			</van-collapse>
		</div>
		<div class="search-bottom">
			<van-button
				v-show="!isDisabled"
				class="bottom-btn fx-no-radius"
				type="primary"
				@click="onCreatConfirm"
			>生成出库单</van-button>
		</div>
		<filterListPopup
			v-model="allCenterHousePopShow"
			title="发货仓库检索"
			:rollingLoad="true"
			:getDataApi="getAllCenterHouseListData"
			@on-select="selectAllCenterHouse(arguments)"
		></filterListPopup>
		<filterListPopup
			v-model="centerHousePopShow"
			title="发货仓库检索"
			:rollingLoad="true"
			:getDataApi="getCenterHouseListData"
			@on-select="selectCenterHouse(arguments)"
		></filterListPopup>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import itemInfoCell from '@/components/uniformDistributionOut/sendOut/ItemInfoCell.vue'
import filterListPopup from '@/components/common/FilterListPopup.vue'
export default {
	name: 'itemListPop',
	components: {
		itemInfoCell,
		filterListPopup
	},
	props: {
		data: {
			type: Array,
			default: () => {
				return []
			}
		},
		orderId: {
			type: String,
			default: ''
		},
		isDisabled: Boolean,
		visibleFlag: Boolean
	},
	data () {
		return {
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			searchKey: '',
			itemEditRowData: {},
			activeStoreNames: [],
			centerHousePopShow: false,
			allCenterHousePopShow: false
			// redCode: ''
		}
	},
	watch: {
		visibleFlag: {
			handler (val) {
				if (val) {
					this.searchKey = ''
					this.setDetailGoodsUUid(this.data)
					// 展开折叠
					this.data.forEach(storeItem => {
						let hasDetails = storeItem.details.filter(item => {
							return item.changeType !== 'del'
						}).length
						if (hasDetails > 0) {
							this.activeStoreNames.push(`${storeItem.id}`)
						}
					})
				}
			},
			immediate: true
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize',
			sysMoneyPointSize: 'sysMoneyPointSize',
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId
		}),
		detailsLength (arg) {
			return this.data.reduce((pre, cur) => {
				let arr = cur.details.filter(item => {
					return item.changeType !== 'del'
				})
				return pre + arr.length
			}, 0)
		}
	},
	methods: {
		// {{{统配出库单分批之后可以生成相同仓库下相同品项，故设置uuid，唯一标示key值
		setDetailGoodsUUid (data) {
			data.forEach(dataItem => {
				dataItem.details.forEach(item => {
					item.goodsUUid = this.$fxUtils.createUUID()
				})
			})
		},
		// }}}
		storeShowComputed (store) {
			return this.detailFilter(store.details).length > 0
		},
		detailFilter (items, searchKeywords = 'code,name,pinYin') {
			return items.filter(item => {
				return item.changeType !== 'del' && !!searchKeywords.split(',').find(itemKey => {
					if (item.goodsDTO[itemKey].toLowerCase().includes(this.searchKey.toLowerCase())) {
						return true
					}
				})
			})
		},
		onCloseClick () {
			this.$emit('update:visibleFlag', false)
		},
		// {{{ 发货仓库
		onCenterHouseEdit (item) {
			this.itemEditRowData = item
			this.centerHousePopShow = true
		},
		selectCenterHouse ([item]) {
			this.itemEditRowData.centerHouseDTO = item
			this.itemEditRowData.currentAmount = this.toFixedNumberSize(item.amount / this.itemEditRowData.unitDTO.value)
		},
		toFixedNumberSize (data, pointSize = this.sysMoneyPointSize) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, pointSize))
		},
		getCenterHouseListData (keyword = null) {
			let data = {
				keyword: keyword,
				orderId: this.orderId,
				goodsId: this.itemEditRowData.goodsDTO.id
			}
			let params = {
				keyword: keyword
			}
			return this.$fxApi('uniformDistributionOutBill.getHouse4NoEnoughAmountGoods', data)({ data: params }).then(res => {
				return res.noEnoughGoods
			})
		},
		onAllCenterHouseClick () {
			this.allCenterHousePopShow = true
		},
		selectAllCenterHouse ([house]) {
			this.data.forEach(storeItem => {
				storeItem.details.forEach(item => {
					item.centerHouseDTO = house
				})
			})
			let itemDetails = []
			this.data.forEach(item => {
				itemDetails.push(...item.details)
			})
			this.$fxApi('uniformDistributionOutBill.getOutHouseGidAmount', this.orderId)({ data: itemDetails }).then(res => {
				if (res.noEnoughGoods) {
					let noEnoughGoods = res.noEnoughGoods
					this.data.forEach(storeItem => {
						storeItem.details.forEach(item => {
							let amount = noEnoughGoods.find(goodsItem => {
								return goodsItem.detailId === item.detailId
							}).amount
							item.currentAmount = this.toFixedNumberSize(amount / item.unitDTO.value)
						})
					})
				}
			})
		},
		getAllCenterHouseListData (keyword = null) {
			let params = {
				keyword: keyword
			}
			return this.$fxApi('uniformDistributionOutBill.getHouseList4UniformNoEnoughSet', this.orderId)({ data: params }).then(res => {
				return res.shops
			})
		},
		// }}}
		onCreatConfirm () {
			let itemDetails = []
			this.data.forEach(item => {
				itemDetails.push(...item.details)
			})
			this.$emit('update:visibleFlag', false)
			this.$fxApi('uniformDistributionOutBill.createUniform', this.orderId)({ data: itemDetails }).then(res => {
				this.$emit('on-send-confirm', res.message)
			}).catch(res => {
				this.$emit('on-send-confirm', '')
			})
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.item-search-block {
	height: 100%;
	background:$fxWhite
	display: flex
	flex-direction: column
	overflow-x: hidden
	.item-title {
		height:40px
		line-height:40px
		border-bottom:1px solid $fxBorder
		text-align: left
		.title-house {
			font-size:12px
			margin-left:20px
		}
		.house-icon {
			float: right
			display: inline-block
			padding-top: 11px
			padding-right: 10px
		}
		.title-count {
			margin-left:20px
		}
	}
	.item-list {
		flex:1
		overflow:scroll
		position: relative
		text-align: left
		padding: 0 13px
		width: 350px
		.item-store-title-container {
			display:flex
			flex-direction: row
			align-items: center
			font-size: 12px
			height: 40px
			.item-store-title {
				display: flex
				flex-direction: row
				justify-content: space-between
				align-items: center
				flex: 1
				.store-left-name {
					height:40px
					line-height:40px
					font-size:12px
					text-indent:10px
					max-width: 155px
					display:inline-block
				}
				.store-right-name{
					display:inline-block
					height:40px
					line-height:40px
					width: 141px
					text-align: right
					text-align: right
					float: right
				}
			}
		}
		.item-row {
			border-bottom:1px solid $fxBorder
			.item-row-delete {
				background-color:$fxRed
				color:$fxWhite
				font-size: 15px
				width: 80px;
				height: 100%
				line-height: 80px;
				display: inline-block;
				text-align: center;
			}
		}
		.search-checkbox {
			width: 25px
		}
		.item-cell {
			display: flex
			flex-flow: row
			align-items: center
		}
		.search-info{
			flex: 1
			overflow: hidden
		}
	}
	.search-bottom {
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
