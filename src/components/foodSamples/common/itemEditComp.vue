<template>
	<div class="item-edit">
		<w-header title="选择菜品" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div class="item-search clearfix">
			<van-search v-model="searchKey" placeholder="请输入搜索关键词" shape="round" @search="search"/>
		</div>
		<div class="item-edit-content">
			<addItemClassList
				v-model="currentClass"
				:itemClassList="itemClassList"
				classTitle="全部菜品"
				@on-change-class="changeClass"
			></addItemClassList>
			<div class="item-details-content" ref="details-content">
				<van-list
					v-model="listLoading"
					:finished="loadFinished"
					finished-text="没有更多了"
					error-text="请求失败，点击重新加载"
					@load="onLoadMore"
				>
					<div
						v-for="item in itemList"
						:key="item.id"
						:ref="`details-row-${item.id}`"
						@click="clickCheckBoxes(item)"
						class="item-detail"
					>
						<div class="item-details-img">
							<img :src="comptedItemImgSrc(item.imageUrls)" :onerror="$fxCommon.errorImg('item')">
						</div>
						<div class="item-details-params">
							<div class="item-details-name fx-ellipsis">{{item.name}}</div>
							<div class="item-details-spec fx-ellipsis">{{item.spec}}</div>
						</div>
						<van-checkbox
							v-model="item.checked"
							class="item-checkbox"
							@change="clickCheckBoxes(item)"
						></van-checkbox>
					</div>
				</van-list>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import addItemClassList from '@/components/common/AddItemClassList.vue'
const ITEM_SIZE = 10
export default {
	name: 'itemEditComp',
	components: {
		addItemClassList
	},
	props: {
		visibleFlag: Boolean
	},
	data () {
		return {
			activeNames: [],
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			searchKey: '',
			currentClass: '',
			itemClassList: [],
			itemList: [],
			rowActive: '',
			listLoading: false,
			loadFinished: true,
			itemListStart: 0
		}
	},
	computed: {
		...mapState({
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId
		}),
		// 目前没有图片,只显示默认图片，如需求修改，则将此处改为图片正确显示
		comptedItemImgSrc (imageUrls) {
			return (imageUrls) => {
				return ''
			}
		}
	},
	watch: {
		visibleFlag: {
			handler (val) {
				if (val) {
					this.refresh()
				}
			},
			immediate: true
		}
	},
	methods: {
		// {{{重新请求数据
		refresh () {
			this.resetHandler()
			this.getItemClass().then(res => {
				this.itemClassList = res.foodsTypes
				this.getItemByClass()
			})
		},
		// }}}
		// {{{清空数据
		resetHandler () {
			this.currentClass = ''
			this.searchKey = ''
			this.itemList = []
		},
		// }}}
		// {{{返回
		onCloseClick () {
			this.$emit('update:visibleFlag', false)
		},
		// }}}
		// {{{选择类别
		changeClass (classId) {
			this.searchKey = ''
			this.getItemByClass()
		},
		getItemClass () {
			return new Promise(resolve => {
				let params = {
					m: 'getFoodTypelist'
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/food`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		getItemByClass (keywords) {
			this.itemListStart = 0
			this.getItem(keywords).then(res => {
				this.itemList = res.foodDTOData
				this.setListLoading(res.foodDTOData.length)
			})
		},
		// }}}
		getItem (keywords = this.searchKey) {
			// 保存选中品项
			return new Promise(resolve => {
				let params = {
					paged: true,
					start: this.itemListStart,
					size: ITEM_SIZE,
					searchText: keywords,
					foodsSmallType: this.currentClass || null,
					m: 'getFoodslist'
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/food`,
					data: params
				}).then(res => {
					res.foodDTOData.forEach(item => {
						item.checked = false
					})
					resolve(res)
				})
			})
		},
		// {{{下拉刷新
		search (searchKey) {
			this.searchKey = searchKey
			this.getItemByClass()
		},
		onLoadMore () {
			this.getItem().then(res => {
				this.itemList.push(...res.foodDTOData)
				this.setListLoading(res.foodDTOData.length)
			})
		},
		setListLoading (itemCount) {
			this.listLoading = false
			this.itemListStart += ITEM_SIZE
			if (itemCount < ITEM_SIZE) {
				this.loadFinished = true
			} else {
				this.loadFinished = false
			}
		},
		// }}}
		// {{{
		clickCheckBoxes (itemData) {
			this.$emit('on-confirm', itemData)
			this.$emit('update:visibleFlag', false)
		}
		// }}}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.item-edit {
	height: 100%
	width: 100%
	text-align: left
	display: flex
	flex-direction: column
	.item-edit-content {
		flex: 1
		display: flex
		flex-direction: row
		overflow: hidden
		.item-details-content {
			flex: 1
			overflow: scroll
			position: relative
			.item-detail {
				width: 100%
				height: 80px
				display: flex
				flex-direction: row
				.item-details-img {
					width: 80px
					height: 100%
					padding: 5px
					box-sizing: border-box
					&>img {
						width: 100%
						height: 100%
					}
				}
				.item-details-params {
					flex: 1
					overflow: hidden
					position: relative
					.item-details-name {
						width: 100%
						height: 30px
						line-height: 30px
						font-size:12px
					}
					.item-details-spec {
						height: 30px
						line-height: 30px
						font-size: 10px
					}
				}
				.item-checkbox {
					display: flex
					justify-content: center
					align-items: Center
					padding-right: 26px
				}
			}
		}
	}
}
</style>

