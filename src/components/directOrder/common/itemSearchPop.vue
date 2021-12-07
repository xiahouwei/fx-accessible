<template>
	<div class="item-search-block">
		<w-header title="搜索品项" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div class="item-search clearfix">
			<van-search
				v-model="searchKey"
				placeholder="请输入搜索关键词"
				shape="round"
				@search="onConfirmKey"
				/>
		</div>
		<div class="item-list" ref="details-content">
			<van-collapse v-model="activeStoreNames" :border="false">
				<van-collapse-item :name="storeItem.id"
					v-for="storeItem in data"
					:key="storeItem.id"
					class="store-row"
					v-show="storeShowComputed(storeItem)"
				>
					<div slot="title" class="item-store-title fx-ellipsis">{{storeItem.name}}</div>
					<van-swipe-cell
						v-for="item in detailFilter(storeItem.details)"
						v-show="item.showFlag"
						:ref="`details-row-${storeItem.id}-${item.goodsDTO.id}`"
						:key="`${storeItem.id}-${item.goodsDTO.id}`"
						class="item-row"
					>
						<itemInfoCell
							:itemData="item"
							:isDisabled="isDisabled"
							:disabledEditBtn="focusing"
							@on-unit-edit="onUnitEdit"
							@on-item-edit="onSearchItemEdit"
						></itemInfoCell>
					</van-swipe-cell>
				</van-collapse-item>
			</van-collapse>
		</div>
		<div class="search-bottom">
			<van-button
				v-show="!isDisabled"
				class="bottom-btn fx-no-radius"
				type="primary"
				@click="onSearchConfirm"
			>保存</van-button>
		</div>
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
				:isDisabled="isDisabled"
				@on-Confirm="onEditRowConfirm"
			></itemRowEditPop>
		</van-popup>
		<van-actionsheet
			v-model="unitActionShow"
			:actions="unitActions"
			cancel-text="取消"
			@select="onUnitSelect"
		/>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import itemInfoCell from '@/components/directOrder/common/ItemInfoCell.vue'
import itemRowEditPop from '@/components/directOrder/common/itemRowEditPop.vue'
export default {
	name: 'itemSearchPop',
	components: {
		itemInfoCell,
		itemRowEditPop
	},
	props: {
		data: {
			type: Array,
			default: () => {
				return []
			}
		},
		isDisabled: Boolean,
		visibleFlag: Boolean
	},
	data () {
		return {
			focusing: false, // 添加输入框验证之后开启
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			unitActionShow: false,
			unitActions: [],
			searchKey: '',
			itemRowEditPopShow: false,
			itemEditRowData: {},
			activeStoreNames: []
		}
	},
	created () {
		if (this.isDisabled) {
			return
		}
		this.$fxEventBus.$on('redCode', this.getItemByRedCode)
	},
	beforeDestroy () {
		this.$fxEventBus.$off('redCode', this.getItemByRedCode)
	},
	watch: {
		visibleFlag: {
			handler (val) {
				if (val) {
					this.searchKey = ''
					this.showData(this.data)
					// 展开折叠
					this.data.forEach(storeItem => {
						let hasDetails = storeItem.details.filter(item => {
							return item.changeType !== 'del'
						}).length
						if (hasDetails > 0) {
							this.activeStoreNames.push(storeItem.id)
						}
					})
				}
			},
			immediate: true
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize'
		})
	},
	methods: {
		storeShowComputed (store) {
			return this.detailFilter(store.details).length > 0
		},
		detailFilter (items, searchKeywords = 'code,name,pinYin') {
			return items.filter(item => {
				return item.changeType !== 'del' && item.showFlag && !!searchKeywords.split(',').find(itemKey => {
					if (item.goodsDTO[itemKey].toLowerCase().includes(this.searchKey.toLowerCase())) {
						return true
					}
				})
			})
		},
		onCloseClick () {
			if (this.focusing) { // input不符合验证规则
				return false
			}
			this.$emit('update:visibleFlag', false)
		},
		onItemFocus (arg, uuid) {
			this.focusing = true
		},
		onItemBlur () {
			this.focusing = false
		},
		// {{{ 编辑行其他数据
		onSearchItemEdit (itemData) {
			this.itemEditRowData = itemData
			this.itemRowEditPopShow = true
		},
		onEditRowConfirm (item) {
			let storeIndex = this.data.findIndex(storeItem => {
				return storeItem.id === item.inHouseDTO.id
			})
			if (~storeIndex) {
				let detailsIndex = this.data[storeIndex].details.findIndex(detailsItem => {
					return detailsItem.goodsDTO.id === item.goodsDTO.id
				})
				if (~detailsIndex) {
					this.data[storeIndex].details[detailsIndex] = item
				}
			}
		},
		// }}}
		// {{{ 编辑单位
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
			let tempUnit = item.unitDTO
			let factor = tempUnit.value / unit.value
			let rawAmount = parseFloat(this.$fxUtils.toFixedSHW(item.rawAmount * factor, this.sysPointSize))
			let busUnitInAmount = parseFloat(this.$fxUtils.toFixedSHW(item.busUnitInAmount * factor, this.sysPointSize))
			let taxPrice = parseFloat(this.$fxUtils.toFixedSHW(item.inMoneyWithTax / busUnitInAmount, this.sysPointSize))
			let price = parseFloat(this.$fxUtils.toFixedSHW(item.inMoney / busUnitInAmount, this.sysPointSize))
			item.unitDTO = unit
			item.rawAmount = rawAmount
			item.busUnitInAmount = busUnitInAmount
			item.taxPrice = taxPrice
			item.price = price
		},
		getItemUnit (goodsId) {
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
		// }}}
		onSearchConfirm () {
			if (this.focusing) { // input不符合验证规则
				return false
			}
			this.$emit('on-search-confirm', this.data)
			this.$emit('update:visibleFlag', false)
		},
		toFixedNumberSize (data, pointSize = this.sysPointSize) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, pointSize))
		},
		// {{{扫码
		getItemByRedCode (redCode) {
			if (!this.visibleFlag) {
				return false
			}
			this.getItemByCode(redCode).then(res => {
				let goods = res.billAndDetails[0]
				if (goods.length === 0) {
					this.$fxToast.top('当前仓库无此品项!')
					return false
				}
				this.hideItemData(this.data)
				let showItem = null
				for (let i = 0; i < this.data.length; i++) {
					showItem = this.data[i].details.find(item => {
						return item.goodsDTO.id === goods.goodsDTO.id && item.changeType !== 'del'
					})
					if (showItem) {
						break
					}
				}
				if (showItem) {
					this.itemUpdate(goods, showItem)
					this.$set(showItem, 'showFlag', true)
				} else {
					this.$fxToast.top('无此品项!')
				}
				this.searchKey = ''
			})
		},
		itemUpdate (codeItem, showItem) {
			const unitDTO = showItem.unitDTO
			const currentUnitDTO = codeItem.unitDTO
			const ratio = currentUnitDTO.value / unitDTO.value
			const countValue = codeItem.goodsDTO.countValue * ratio
			if (showItem.id) {
				this.$set(showItem, 'changeType', 'edit')
			}
			this.onAmountChange(countValue, showItem)
		},
		onAmountChange (busUnitInAmount, itemData) {
			let { inMoneyWithTax, taxPrice, inMoney, taxInMoney, price, tax } = itemData
			inMoneyWithTax = this.toFixedNumberSize(taxPrice * busUnitInAmount)
			inMoney = this.toFixedNumberSize(price * busUnitInAmount)
			taxInMoney = this.toFixedNumberSize(inMoney * tax)
			itemData.inMoneyWithTax = inMoneyWithTax
			itemData.inMoney = inMoney
			itemData.taxInMoney = taxInMoney
			itemData.busUnitInAmount = this.toFixedNumberSize(busUnitInAmount)
		},
		getItemByCode (barCodes) {
			return new Promise(resolve => {
				let params = {
					m: 'getGoodsByBarCode4Modify',
					barCodes: barCodes
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/goods`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		hideItemData (data) {
			data.forEach(storeItem => {
				storeItem.details.forEach(item => {
					this.$set(item, 'showFlag', false)
				})
			})
		},
		// 默认显示所有数据
		showData (data) {
			data.forEach(storeItem => {
				storeItem.details.forEach(item => {
					this.$set(item, 'showFlag', true)
				})
			})
		},
		onConfirmKey () {
			if (this.searchKey !== '') {
				return
			}
			this.showData(this.data)
		}
		// }}}
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
	.item-list {
		flex:1
		overflow:scroll
		position: relative
		text-align: left
		padding: 0 13px
		width: 350px
		.item-store-title {
			height:40px
			line-height:40px
			font-size:12px
			text-indent:10px
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
