<template>
	<div class="store-item">
		<w-header title="编辑按BOM报损明细" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div class="add-store-bar">
			<van-button class="add-store-btn" type="primary" round @click="onAddStoreClick">添加仓库</van-button>
		</div>
		<div class="store-item-content">
			<van-collapse v-model="activeStoreNames" :border="false">
				<van-collapse-item :name="storeItem.id"
					v-for="storeItem in currentStoreItemData"
					:key="storeItem.id"
					v-show="storeShowComputed(storeItem)"
					class="store-row"
				>
					<div slot="title" class="item-store-title">
						<span class="item-store-name fx-ellipsis">{{storeItem.name}}</span>
					</div>
					<div class="item-storn-btn">
						<span class="edit-btn" @click="editStoreItem(storeItem)"></span>
					</div>
					<div
						v-for="item in storeItem.details"
						:key="`${storeItem.id}-${item.goods.id}`"
						v-show="item.changeType !== 'del'"
						class="item-row"
					>
						<bomInfoCell :itemData="item" :isDisabled="true" :disabledWatchBtn="true"></bomInfoCell>
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
import bomInfoCell from '@/components/breakBill/common/bomInfoCell.vue'
export default {
	name: 'storeItemComp',
	components: {
		listComp,
		bomInfoCell
	},
	props: {
		visibleFlag: Boolean,
		shopId: {
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
		selectStore (item) {
			this.currentStoreObj = item
			this.selectCurrentStore()
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
		editStoreItem (store) {
			this.currentStoreObj = Object.assign({}, {
				code: store.code,
				id: store.id,
				name: store.name,
				pinYin: store.pinYin,
				updateIndicator: store.updateIndicator
			})
			this.selectCurrentStore()
		},
		onSaveClick () {
			this.$emit('on-save', this.currentStoreItemData)
			this.$emit('update:visibleFlag', false)
		},
		selectCurrentStore () {
			this.$emit('on-select-store', this.currentStoreObj)
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
			overflow:hidden
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
		.save-btn {
			width:100%
		}
	}
}
</style>
