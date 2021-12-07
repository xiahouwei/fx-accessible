<template>
	<div class="store-item">
		<w-header title="编辑入库单明细" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div class="add-store-bar">
			<van-button class="add-store-btn" type="primary" round @click="onAddStoreClick">添加仓库</van-button>
		</div>
		<div class="store-item-content">
			<van-collapse v-model="activeStoreNames" :border="false">
				<van-collapse-item :name="storeItem.id"
					v-for="(storeItem, storeIndex) in currentStoreItemData"
					:key="storeItem.id"
					class="store-row"
					v-show="storeShowComputed(storeItem)">
					<div slot="title" class="item-store-title">
						<span>{{storeItem.name}}</span>
					</div>
					<div class="item-storn-btn">
						<span class="edit-btn" @click="editStoreItem(storeItem)"></span>
						<span class="delete-btn" @click="deleteStoreItem(storeItem, storeIndex)"></span>
					</div>
					<div
						v-for="(item, index) in storeItem.details"
						:key="`${storeItem.id}-${item.goodsDTO.id}-${index}`"
						class="item-row"
						v-show="item.changeType !== 'del'"
					>
						<itemInfoCell :itemData="item" :isDisabled="true" :showEditBtn="false"></itemInfoCell>
					</div>
				</van-collapse-item>
			</van-collapse>
		</div>
		<div class="store-item-bottom">
			<van-button class="save-btn fx-no-radius" type="primary" @click="onSaveClick">保存</van-button>
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
			class="fx-list-popup-full scan-pop"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<scanEditComp
				:visibleFlag.sync="itemPopShow"
				:supplierId="supplierId"
				:shopId="shopId"
				:store="currentStoreObj"
				:initGoods="scanGoods"
				:parentStoreItem="computedStoreItem"
				:orderItemList="currentStoreItemData"
				v-bind="$attrs"
				@on-confirm="onItemEditConfirm"
			></scanEditComp>
		</van-popup>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import listComp from '@/components/common/ListComp.vue'
import scanEditComp from '@/components/stockInBill/common/scanEditComp.vue'
import itemInfoCell from '@/components/stockInBill/common/ItemInfoCell.vue'
export default {
	name: 'ScanStoreComp',
	components: {
		listComp,
		scanEditComp,
		itemInfoCell
	},
	props: {
		visibleFlag: Boolean,
		shopId: {
			type: String,
			default: ''
		},
		supplierId: {
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
			activeStoreNames: [],
			scanGoods: {}
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize',
			systemParams: 'systemParams',
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
					// 展开折叠
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
		onStoreRefresh (keyword = null) {
			this.getStoreListData(keyword).then(res => {
				this.storeList = res.shops.filter(item => {
					let hasHouse = this.currentStoreItemData.find(currentStoreItem => {
						let index = currentStoreItem.details.findIndex(detailItem => {
							return detailItem.changeType !== 'del'
						})
						return ~index && currentStoreItem.id === item.id
					})
					if (!hasHouse) {
						return true
					}
				})
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
		selectStore (item) {
			this.currentStoreObj = item
			this.barcodeScan()
		},
		onItemEditConfirm ([selectedItemArr, store]) {
			this.currentStoreItemData = JSON.parse(JSON.stringify(selectedItemArr))
		},
		editStoreItem (store) {
			this.currentStoreObj = Object.assign({}, {
				code: store.code,
				id: store.id,
				name: store.name,
				pinYin: store.pinYin,
				updateIndicator: store.updateIndicator
			})
			this.barcodeScan()
		},
		// {{{ 扫码
		barcodeScan () {
			this.$fxCordova.barcodeScan().then(barcode => {
			// this.$dialog.alert({
			// 	title: '扫码成功',
			// 	message: result
			// })
				this.getItemByTwoCode(barcode).then(result => {
					this.scanGoods = result[0]
					this.itemPopShow = true
				})
			})
			// this.getItemByTwoCode('5555555555555').then(result => {
			// 	this.scanGoods = result[0]
			// 	this.itemPopShow = true
			// })
		},
		// }}}
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
		},
		// }}}
		// {{{ 扫二维码
		getItemByTwoCode (barcode) {
			let params = {
				shopId: this.shopId,
				query: {
					barCode: barcode,
					houseId: this.currentStoreObj.id,
					supplierId: this.supplierId
				}
			}
			return this.$fxApi('z5common.getScanCodeBySM', params)().then(res => {
				return res.billAndDetails
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
			font-size:12px
			text-indent:10px
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
		.save-btn {
			width:100%
		}
	}
	.scan-pop {
		background-color: rgba(255,255,255,0.1)
	}
}
</style>
