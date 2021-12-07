<template>
	<w-app-page class="item-search-block">
		<w-header title="搜索品项" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<fx-search-bar
			v-model="searchKey"
			:isSelectAll="isSelectAll"
			:showSelectAllBtn="!isDisabled"
			@on-select-click="onSelectAllClick"
		></fx-search-bar>
		<div class="item-list" ref="details-content">
			<van-collapse v-model="activeStoreNames" :border="false">
				<van-collapse-item :name="storeItem.id"
					v-for="storeItem in data"
					:key="storeItem.id"
					class="store-row"
					v-show="storeShowComputed(storeItem)"
				>
					<div slot="title" class="item-store-title-container">
						<div class="item-store-title">
							<span class="item-in-store-title fx-ellipsis">入库仓库：{{storeItem.name}}</span>
						</div>
					</div>
					<van-swipe-cell
						v-show="item.changeType !== 'del'"
						v-for="(item, index) in detailFilter(storeItem.details)"
						ref="details-row"
						:key="`${item.goodsDTO.id}-${index}`"
						:right-width="80"
						:disabled="isDisabled || focusing || !$fxAuth('stockInBill4cld.delDetail')"
						class="item-row"
					>
						<div class="item-cell">
							<checkBox
								:visibleFlag="!isDisabled"
								:checked="item.checked"
								class="search-checkbox"
								@on-checkbox-click="onCheckBoxClick(item)"
							></checkBox>
							<itemInfoCell
								:itemData="item"
								:isDisabled="isDisabled"
								:disabledEditBtn="focusing"
								@on-item-edit="onSearchItemEdit"
								@on-unit-edit="onUnitEdit"
								@on-item-focus="onItemFocus"
								@on-item-blur="onItemBlur"
								class="search-info"
							></itemInfoCell>
						</div>
						<div slot="right" class="item-row-delete" @click="onDeleteClick(item, index, storeItem.details)">删除</div>
					</van-swipe-cell>
				</van-collapse-item>
			</van-collapse>
		</div>
		<w-bottom-btn-bar>
			<w-button
				v-show="!isDisabled"
				size="large"
				type="primary"
				@click="onSearchConfirm"
			>保存</w-button>
			<w-button
				v-show="!isDisabled"
				size="large"
				type="danger"
				@click="onSelectConfirm"
			>删除</w-button>
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
				:isDisabled="isDisabled"
			></itemRowEditPop>
		</van-popup>
		<w-action-sheet
			v-fx-history-back="unitActionShow"
			ref="unitActionSheet"
			v-model="unitActionShow"
			:actions="unitActions"
		></w-action-sheet>
	</w-app-page>
</template>

<script>
import { mapState } from 'vuex'
import itemInfoCell from './ItemInfoCell'
import itemRowEditPop from './ItemRowEditPop'
import checkBox from '@/components/common/CheckBox'
const SEARCH_KEY_LOCAL = ['code', 'name', 'pinYin']
export default {
	name: 'itemSearchPop',
	components: {
		itemInfoCell,
		itemRowEditPop,
		checkBox
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
			query: this.$route.query,
			focusing: false,
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			searchKey: '',
			searchKeywords: SEARCH_KEY_LOCAL,
			itemRowEditPopShow: false,
			itemEditRowData: {},
			unitActions: [],
			unitActionShow: false,
			activeStoreNames: []
		}
	},
	beforeDestroy () {
		this.$fxEventBus.$off('redCode', this.getItemByRedCode)
	},
	watch: {
		visibleFlag: {
			handler (val) {
				if (val) {
					this.searchKey = ''
					this.data.forEach(storeItem => {
						let hasDetails = storeItem.details.filter(item => {
							return item.changeType !== 'del'
						}).length
						if (hasDetails > 0) {
							this.activeStoreNames.push(storeItem.id)
						}
					})
				} else {
					this.$dialog.close()
				}
			},
			immediate: true
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize'
		}),
		isSelectAll () {
			let selectItemL = 0
			let dataL = 0
			this.data.forEach(storeItem => {
				let searchItems = this.detailFilter(storeItem.details)
				selectItemL += searchItems.filter(item => {
					return item.changeType !== 'del' && item.checked
				}).length
				dataL += searchItems.length
			})
			return selectItemL !== 0 && selectItemL === dataL
		}
	},
	methods: {
		storeShowComputed (store) {
			return this.detailFilter(store.details).length > 0
		},
		detailFilter (items) {
			return items.filter(item => {
				return item.changeType !== 'del' && !!this.searchKeywords.find(itemKey => {
					return this.$fxUtils.fuzzyQueryString(item.goodsDTO[itemKey], this.searchKey)
				})
			})
		},
		onCloseClick () {
			if (this.focusing) {
				return false
			}
			this.$emit('update:visibleFlag', false)
		},
		onDeleteClick (item, index, details) {
			if (item.id) {
				this.$set(item, 'changeType', 'del')
			} else {
				details.splice(index, 1)
			}
		},
		onItemFocus () {
			this.focusing = true
		},
		onItemBlur () {
			this.focusing = false
		},
		onSearchItemEdit (itemData) {
			this.itemEditRowData = itemData
			this.itemRowEditPopShow = true
		},
		onUnitEdit (item) {
			this.$fxApi('common.getItemUnit', item.goodsDTO.id).then(res => {
				this.unitActions = res.units
				this.$refs.unitActionSheet.doSelect(item.unitDTO.id).then(unitItem => {
					this.$fxCalculation('stockInBill4cld').changeUnit(item, unitItem)
				})
			})
		},
		onSearchConfirm () {
			if (this.focusing) {
				return false
			}
			this.data.forEach(storeItem => {
				storeItem.details.forEach(item => {
					delete item.checked
				})
			})
			this.$emit('on-search-confirm', this.data)
			this.$emit('update:visibleFlag', false)
		},
		onCheckBoxClick (item) {
			if (this.focusing) {
				return false
			}
			this.$set(item, 'checked', !item.checked)
		},
		onSelectAllClick () {
			let flag = !this.isSelectAll
			this.data.forEach(storeItem => {
				let searchItem = this.detailFilter(storeItem.details)
				searchItem.forEach(item => {
					if (item.changeType !== 'del') {
						this.$set(item, 'checked', flag)
					}
				})
			})
		},
		onSelectConfirm () {
			let checkedItem = this.data.find(storeItem => {
				return storeItem.details.find(item => {
					return item.checked && item.changeType !== 'del'
				})
			})
			if (!checkedItem) {
				this.$fxToast.top('请先选择品项!')
				return true
			}
			this.$dialog.confirm({
				title: '提示',
				message: '是否删除？'
			}).then(() => {
				this.data.forEach(storeItem => {
					let details = storeItem.details
					for (let i = details.length - 1; i >= 0; i--) {
						let item = details[i]
						if (!item.checked) {
							continue
						}
						if (item.id) {
							this.$set(item, 'changeType', 'del')
						} else {
							storeItem.details.splice(i, 1)
						}
					}
				})
			})
		},
		computedAssistAmount (item) {
			if (item.assistUnitFlag) {
				item.outAssistAmount = item.busUnitOutAmount
			}
		},
		setDataMoneyAndPrice (data) {
			data.forEach((item, index) => {
				item.goodsDTO = {
					id: item.goodsId,
					imageUrls: item.goodsImgUrl ? [item.goodsImgUrl] : [],
					name: item.goodsName,
					spec: item.goodsSpec,
					code: item.goodsCode,
					pinYin: item.goodsSign
				}
				item.unitDTO = {
					id: item.unitId,
					name: item.unitName,
					value: item.unitValue
				}
				// 赠品
				item.giftFlag = false
				// 非税单价
				item.price = item.salePrice
				// 含税单价
				item.taxPrice = item.taxesPrice
				// 非税金额
				item.outMoney = 0
				// 含税金额
				item.outMoneyWithTax = 0
				// 税率
				item.tax = item.taxes
				// 税额
				item.taxOutMoney = 0
				// 成本价配送
				item.costDispach = false
			})
			return data
		},
		setChangeType (item) {
			item.changeType = item.id ? 'edit' : 'add'
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.item-search-block {
	.item-list {
		flex:1
		overflow:scroll
		position: relative
		text-align: left
		padding: 0 13px
		width: 350px
		.item-store-title-container {
			display:flex
			flex-direction: row;
			align-items: center;
			font-size:12px
			height:40px
			.item-store-title {
				display:flex
				flex-direction: row;
				justify-content: space-between;
				align-items: center;
				flex:1
				margin-left: 10px;
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
}
</style>
