<template>
	<div class="store-item">
		<w-header title="编辑订货单明细" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div class="add-store-bar">
			<van-button class="add-store-btn fx-btn" type="primary" round @click="onAddStoreClick">添加仓库</van-button>
		</div>
		<div class="store-item-content">
			<van-collapse v-model="activeStoreNames" :border="false">
				<van-collapse-item :name="storeItem.id"
					v-for="(storeItem, storeIndex) in currentStoreItemData"
					:key="storeItem.id"
					v-show="storeShowComputed(storeItem)"
					class="store-row">
						<div slot="title" class="item-store-title" >
							<span class="item-store-name fx-title fx-ellipsis">{{storeItem.name}}</span>
						</div>
						<div class="item-storn-btn">
							<span class="edit-btn" @click="editStoreItem(storeItem)"></span>
							<span class="delete-btn" @click="deleteStoreItem(storeItem, storeIndex)"></span>
						</div>
						<div
							v-for="item in storeItem.details"
							:key="`${storeItem.id}-${item.goodsDTO.id}`"
							v-show="item.changeType !== 'del'"
							class="item-row"
						>
							<itemInfoCell :itemData="item" :isDisabled="true" :disabledWatchBtn="true"></itemInfoCell>
						</div>
				</van-collapse-item>
			</van-collapse>
		</div>
		<div class="store-item-bottom">
			<van-button class="save-btn fx-no-radius fx-btn" type="primary" @click="onSaveClick">保存</van-button>
			<van-button v-show="$fxAuth('shopOrderBill.importCommonGoods')" class="save-btn fx-no-radius fx-btn" type="info" @click="onImportOftenOrderClick">导入常订品项</van-button>
		</div>
		<van-popup
			v-model="storePopShow"
			position="right"
			class="fx-list-popup-300"
			:lock-scroll="false"
		>
			<listComp
				:visibleFlag.sync="storePopShow"
				:data="storeList"
				:loadFinished="true"
				title="仓库检索"
				@on-search="searchStore"
				@on-select="selectStore"
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
				:shopId="shopId"
				:orderPlanId="orderPlanId"
				:store="currentStoreObj"
				:businessDate="businessDate"
				:urgentFlag="urgentFlag"
				:parentStoreItem="computedStoreItem"
				@on-confirm="onItemEditConfirm"
			></itemEditComp>
		</van-popup>
		<van-popup
			v-model="oftenOrderPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<importOftenOrderPop
				:visibleFlag.sync="oftenOrderPopShow"
				:workDate="businessDate"
				:shopId="shopId"
				:orderPlanId="orderPlanId"
				:urgentFlag="urgentFlag"
				:houseGoodsArray="houseGoodsArray"
				@on-item-import-confirm="onImportDataConfirm"
			></importOftenOrderPop>
		</van-popup>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import listComp from '@/components/common/ListComp.vue'
import itemEditComp from '@/components/shopOrder/common/itemEditComp.vue'
import itemInfoCell from '@/components/shopOrder/common/ItemInfoCell.vue'
import importOftenOrderPop from '@/components/shopOrder/oftenOrder/importOftenOrderPop.vue'
export default {
	name: 'storeItemComp',
	components: {
		listComp,
		itemEditComp,
		itemInfoCell,
		importOftenOrderPop
	},
	props: {
		visibleFlag: Boolean,
		shopId: {
			type: String,
			default: ''
		},
		businessDate: {
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
		storeItemData: {
			type: Array,
			default: () => {
				return []
			}
		}
	},
	data () {
		return {
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			storePopShow: false,
			storeList: [],
			itemPopShow: false,
			currentStoreObj: {},
			currentStoreItemData: [],
			oftenOrderPopShow: false,
			houseGoodsArray: [],
			activeStoreNames: []
		}
	},
	computed: {
		...mapState({
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId
		}),
		computedStoreItem () {
			if (this.$fxUtils.isEmptyObjSHW(this.currentStoreObj)) {
				return []
			} else {
				let currentStore = this.currentStoreItemData.find(item => {
					return item.id === this.currentStoreObj.id
				})
				if (currentStore) {
					return currentStore.details
				} else {
					return []
				}
			}
		},
		storeShowComputed (storeItem) {
			return (storeItem) => {
				let hasDetails = storeItem.details.filter(item => {
					return item.changeType !== 'del'
				}).length
				return hasDetails > 0
			}
		}
	},
	watch: {
		visibleFlag: {
			handler (val) {
				if (val) {
					this.currentStoreItemData = this.storeItemData
					this.openStoreItemList(this.currentStoreItemData)
				}
			},
			immediate: true
		}
	},
	methods: {
		onCloseClick () {
			this.$emit('update:visibleFlag', false)
		},
		onAddStoreClick () {
			this.onStoreRefresh()
		},
		searchStore (keyword) {
			this.onStoreRefresh(keyword)
		},
		selectStore (item) {
			this.currentStoreObj = item
			this.itemPopShow = true
		},
		onStoreRefresh (keyword = null) {
			this.getStoreListData(keyword).then(res => {
				this.storeList = res.shops
				this.storePopShow = true
			})
		},
		getStoreListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					keyword: keyword,
					m: 'list4ShopOrderBill'
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.shopId}/users/${this.loginerId}/houses`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		onItemEditConfirm ([selectedItemArr, store]) {
			let currentStore = this.currentStoreItemData.find(item => {
				return item.id === store.id
			})
			if (currentStore) {
				currentStore.details = selectedItemArr
			} else {
				let _store = Object.assign({}, store)
				_store.details = selectedItemArr
				this.currentStoreItemData.push(_store)
			}
			this.openStoreItemList(this.currentStoreItemData)
		},
		editStoreItem (store) {
			this.currentStoreObj = Object.assign({}, {
				code: store.code,
				id: store.id,
				name: store.name,
				pinYin: store.pinYin,
				updateIndicator: store.updateIndicator
			})
			this.itemPopShow = true
		},
		deleteStoreItem (store, index) {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要删除当前仓库品项吗?'
			}).then(() => {
				let deleteItems = store.details.filter(item => {
					return !!item.id
				})
				if (deleteItems.length === 0) {
					this.currentStoreItemData.splice(index, 1)
					return false
				}
				deleteItems.forEach(item => {
					item.changeType = 'del'
				})
				this.currentStoreItemData[index].details = deleteItems
			}).catch(() => {
			})
		},
		onSaveClick () {
			this.$emit('on-save', this.currentStoreItemData)
			this.$emit('update:visibleFlag', false)
		},
		// {{{ 导入
		onImportOftenOrderClick () {
			let houseGoodsArray = []
			this.currentStoreItemData.forEach(storeItemData => {
				storeItemData.details.forEach(item => {
					if (item.changeType !== 'del') {
						houseGoodsArray.push(storeItemData.id + item.goodsDTO.id)
					}
				})
			})
			this.houseGoodsArray = houseGoodsArray
			this.oftenOrderPopShow = true
		},
		onImportDataConfirm (importData) {
			importData.forEach(importItemData => {
				let currentStore = this.currentStoreItemData.find(item => {
					return item.id === importItemData.id
				})
				if (currentStore) {
					importItemData.details.forEach(importDetailsItem => {
						let currentDetailItem = currentStore.details.find(detailItem => {
							return detailItem.goodsDTO.id === importDetailsItem.goodsDTO.id
						})

						if (currentDetailItem) {
							let id = currentDetailItem.id
							Object.assign(currentDetailItem, importDetailsItem)
							currentDetailItem.changeType = 'edit'
							currentDetailItem.id = id
						} else {
							currentStore.details.push(importDetailsItem)
						}
					})
				} else {
					this.currentStoreItemData.push(importItemData)
				}
			})
		},
		// }}}
		// {{{ 展开折叠
		openStoreItemList (data) {
			data.forEach(storeItem => {
				let hasDetails = storeItem.details.filter(item => {
					return item.changeType !== 'del'
				}).length
				if (hasDetails > 0) {
					this.activeStoreNames.push(storeItem.id)
				}
			})
		}
		// }}}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.store-item {
	height:100%
	width: 100%
	text-align:left
	display: flex
	flex-direction: column
	.add-store-bar {
		text-align:center
		margin-bottom:10px
		.add-store-btn {
			width: 300px
		}
	}
	.store-item-content {
		flex:1
		overflow:scroll
		.store-row {
			position: relative
		}
		.item-store-title {
			height:28px
			line-height:28px
			text-indent:11px
			overflow:hidden
			background-image:url('~images/icon/wind-ui/icon-house.svg')
			background-repeat: no-repeat
			background-position: 0 50%
			margin-left: 9px
			.item-store-name {
				display:inline-block
				width:280px
			}
		}
		.item-storn-btn {
			position: absolute
			height: 20px
			top: 10px
			right: 20px
			.edit-btn, .delete-btn {
				display: inline-block
				background-repeat:no-repeat
				background-position: center
				background-size: 100%
				width: 20px
				height: 20px
				margin-right: 6px
			}
			.edit-btn {
				background-image:url('~images/icon/icon-item-edit.png')
				right: 45px;
			}
			.delete-btn {
				background-image:url('~images/icon/icon-store-delete.png')
				right: 5px;
			}
		}
		.item-row {
			border-bottom:1px solid $fxBorder
		}
	}
	.store-item-bottom {
		display: flex
		.save-btn {
			flex: 1
		}
	}
}
</style>
