<template>
	<w-app-page class="store-item">
		<w-header title="编辑中心采购订货单明细" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div class="add-store-bar">
			<van-button class="add-store-btn" type="primary" round @click="onHouseRefresh(null)">{{currentInHouseObj.id ? currentInHouseObj.name: '添加入库仓库'}}</van-button>
		</div>
		<div class="store-item-content">
			<van-collapse v-model="activeStoreNames" :border="false">
				<van-collapse-item :name="storeItem.id"
					v-for="(storeItem, storeIndex) in currentStoreItemData"
					:key="storeItem.id"
					v-show="storeShowComputed(storeItem)"
					class="store-row"
				>
					<div slot="title" class="item-store-title">
						<span class="item-store-name fx-ellipsis">入库仓库：{{storeItem.name}}</span>
					</div>
					<div class="item-storn-btn">
						<i class="edit-btn" @click="editStoreItem(storeItem)"></i>
						<i
							v-show="$fxAuth('stockOrderBill4cld.delDetail')"
							class="delete-btn"
							@click="deleteStoreItem(storeItem, storeIndex)"
						></i>
					</div>
					<div
						v-for="item in storeItem.details"
						:key="item.goodsUUid"
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
				@on-search="onHouseRefresh"
				@on-select="selectStore"
			></listComp>
		</van-popup>
	</w-app-page>
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
		rdcId: {
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
			currentInHouseObj: {},
			currentStoreObj: {},
			currentStoreItemData: [],
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
		},
		dataUUID () {
			this.data.forEach(dataItem => {
				dataItem.uuid = this.$fxUtils.createUUID()
				dataItem.details.forEach(item => {
					item.goodsUUid = this.$fxUtils.createUUID()
				})
			})
			return this.data
		}
	},
	watch: {
		visibleFlag: {
			handler (val) {
				if (val) {
					console.log(this.storeItemData)
					this.resetHandler()
					this.currentStoreItemData = this.storeItemData
					const _details = this.storeItemData.reduce((pre, cur) => {
						pre.push(...cur.details)
						return pre
					}, []).filter(item => {
						return item.changeType !== 'del'
					})
					if (_details.lengths > 0) {
						this.currentInHouseObj = _details[_details.lengths - 1].outHouseDTO
					}
					this.openStoreItemList(this.currentStoreItemData)
				}
			},
			immediate: true
		}
	},
	methods: {
		resetHandler () {
			this.currentInHouseObj = {}
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
		// {{{ 仓库
		onHouseRefresh (keyword = null) {
			this.getHouseListData(keyword).then(res => {
				this.storeList = res.shops
				this.storePopShow = true
			})
		},
		getHouseListData (keyword = null) {
			const params = {
				keyword: keyword
			}
			return this.$fxApi('common.getStoreListData', this.rdcId)({ data: params })
		},
		selectStore (item) {
			this.currentInHouseObj = item
			this.$emit('on-select-store', this.currentInHouseObj)
			this.$emit('update:visibleFlag', false)
		},
		// }}}
		editStoreItem (store) {
			this.currentInHouseObj = Object.assign({}, {
				code: store.code,
				id: store.id,
				name: store.name,
				pinYin: store.pinYin,
				updateIndicator: store.updateIndicator
			})
			this.$emit('on-select-store', this.currentInHouseObj)
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
					this.activeStoreNames.push(dataItem.id)
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
