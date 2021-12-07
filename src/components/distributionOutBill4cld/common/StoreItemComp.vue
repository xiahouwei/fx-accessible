<template>
	<div class="store-item">
		<w-header title="编辑统配出库单明细" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div class="add-store-bar">
			<van-button v-if="currentOutHouseObj.id" class="add-store-btn" type="primary" round @click="onAddOutHouseClick">{{currentOutHouseObj.name}}</van-button>
			<van-button v-else class="add-store-btn" type="primary" round @click="onAddOutHouseClick">添加发货仓库</van-button>
		</div>
		<div class="add-store-bar">
			<van-button class="add-store-btn" type="primary" round @click="onAddShopHouseClick">添加收货仓库</van-button>
		</div>
		<div class="store-item-content">
			<van-collapse v-model="activeStoreNames" :border="false">
				<van-collapse-item :name="`${storeItem.id}-${storeItem.shopHouseDTO.id}`"
					v-for="(storeItem, storeIndex) in currentStoreItemData"
					:key="`${storeItem.id}-${storeItem.shopHouseDTO.id}`"
					v-show="storeShowComputed(storeItem)"
					class="store-row"
				>
					<div slot="title" class="item-store-title">
						<span class="item-store-name fx-ellipsis">出库仓库：{{storeItem.name}}</span>
						<span class="item-store-name fx-ellipsis">入库仓库：{{storeItem.shopHouseDTO.name}}</span>
					</div>
					<div class="item-storn-btn">
						<i class="edit-btn" @click="editStoreItem(storeItem)"></i>
						<i
							v-show="$fxAuth('distributionOutBill4cld.delDetail')"
							class="delete-btn"
							@click="deleteStoreItem(storeItem, storeIndex)"
						></i>
					</div>
					<div
						v-for="item in storeItem.details"
						:key="`${storeItem.shopHouseDTO.id}-${item.goodsDTO.id}-${item.goodsUUid}`"
						v-show="item.changeType !== 'del'"
						class="item-row"
					>
						<itemInfoCell :itemData="item" :isDisabled="true" :disabledWatchBtn="true" :showEditBtn="false"></itemInfoCell>
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
	</div>
</template>

<script>
import { mapState } from 'vuex'
import listComp from '@/components/common/ListComp.vue'
import itemInfoCell from './ItemInfoCell.vue'
export default {
	name: 'storeItemComp',
	components: {
		listComp,
		itemInfoCell
	},
	props: {
		visibleFlag: Boolean,
		inShopId: {
			type: String,
			default: ''
		},
		rdcId: {
			type: String,
			default: ''
		},
		businessDate: {
			type: [String, Number],
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
			currentOutHouseObj: {},
			currentShopHouseObj: {},
			currentStoreObj: {},
			currentStoreItemData: [],
			listCompType: '', // 标记收货仓库和发货仓库
			activeStoreNames: []
		}
	},
	computed: {
		...mapState({
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId
		}),
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
					this.resetHandler()
					this.currentStoreItemData = this.storeItemData
					let hasDetails = 0
					let outHouseDTO = {}
					this.storeItemData.forEach(storeItem => {
						hasDetails += storeItem.details.filter(item => {
							if (item.changeType !== 'del') {
								outHouseDTO = item.outHouseDTO
								return true
							} else {
								return false
							}
						}).length
					})
					if (hasDetails > 0) {
						this.currentOutHouseObj = outHouseDTO
					}
					// 展开折叠
					this.openStoreItemList(this.currentStoreItemData)
					this.setDetailGoodsUUid(this.currentStoreItemData)
				}
			},
			immediate: true
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
		resetHandler () {
			this.currentOutHouseObj = {}
			this.currentShopHouseObj = {}
			this.currentStoreItemData = []
		},
		onCloseClick () {
			this.$emit('update:visibleFlag', false)
		},
		clearItemConfim (message) {
			return new Promise(resolve => {
				let items = this.currentStoreItemData.filter(item => {
					let details = item.details.filter(details => {
						return details.changeType !== 'del'
					})
					if (details.length === 0) {
						return false
					} else {
						return true
					}
				})
				if (items.length === 0) {
					resolve()
				} else {
					this.$dialog.confirm({
						title: '提示',
						message: message
					}).then(() => {
						this.onItemClear()
						resolve()
					}).catch(() => {
					})
				}
			})
		},
		// {{{ 发货仓库
		onAddOutHouseClick () {
			this.onOutHouseRefresh()
		},
		onOutHouseRefresh (keyword = null) {
			this.listCompType = 'outHouse'
			this.getStoreListData(keyword).then(res => {
				this.storeList = res.shops
				this.storePopShow = true
			})
		},
		getStoreListData (keyword = null) {
			let shopId = ''
			let m = ''
			if (this.listCompType === 'outHouse') {
				shopId = this.rdcId
				m = 'list4ShopOrderBill'
			} else if (this.listCompType === 'shopHouse') {
				shopId = this.inShopId
				m = 'list4DistributionOutBillTC'
			}
			return new Promise(resolve => {
				let params = {
					keyword: keyword,
					m: m
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${shopId}/users/${this.loginerId}/houses`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		// }}}
		// {{{ 收货仓库
		onAddShopHouseClick () {
			if (!this.currentOutHouseObj.id) {
				this.$fxToast.top('请先选择发货仓库!')
				return false
			}
			this.onShopHouseRefresh()
		},
		onShopHouseRefresh (keyword = null) {
			this.listCompType = 'shopHouse'
			this.getStoreListData(keyword).then(res => {
				this.storeList = res.shops
				this.storePopShow = true
			})
		},
		// }}}
		searchStore (keyword) {
			if (this.listCompType === 'outHouse') {
				this.onOutHouseRefresh(keyword)
			} else if (this.listCompType === 'shopHouse') {
				this.onShopHouseRefresh(keyword)
			}
		},
		selectStore (item) {
			if (this.listCompType === 'outHouse') {
				this.currentOutHouseObj = item
			} else if (this.listCompType === 'shopHouse') {
				this.currentShopHouseObj = item
				this.$emit('on-select-store', this.currentOutHouseObj, this.currentShopHouseObj)
				this.$emit('update:visibleFlag', false)
			}
			this.listCompType = ''
		},
		editStoreItem (store) {
			this.currentOutHouseObj = Object.assign({}, {
				code: store.code,
				id: store.id,
				name: store.name,
				pinYin: store.pinYin,
				updateIndicator: store.updateIndicator
			})
			this.currentShopHouseObj = Object.assign({}, {
				id: store.shopHouseDTO.id,
				code: store.shopHouseDTO.code,
				name: store.shopHouseDTO.name,
				pinYin: store.shopHouseDTO.pinYin
			})
			this.$emit('on-select-store', this.currentOutHouseObj, this.currentShopHouseObj)
			this.$emit('update:visibleFlag', false)
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
		// {{{ 展开折叠
		openStoreItemList (data) {
			data.forEach(dataItem => {
				let hasDetails = dataItem.details.filter(item => {
					return item.changeType !== 'del'
				}).length
				if (hasDetails > 0) {
					this.activeStoreNames.push(`${dataItem.id}-${dataItem.shopHouseDTO.id}`)
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
			font-size:12px
			text-indent:10px
			position:relative
			overflow:hidden
			display: flex
			flex-direction: row
			padding-right: 49px
			.item-store-name {
				flex: 1
				width: 146px
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
