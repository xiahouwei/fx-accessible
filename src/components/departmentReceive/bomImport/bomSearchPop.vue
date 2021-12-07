<template>
	<div class="item-search-block">
		<w-header title="已导入BOM" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div class="item-search clearfix">
			<van-search
				v-model="searchKey"
				placeholder="请输入搜索关键词"
				shape="round"
				/>
		</div>
		<div class="item-list bom-search-list" ref="details-content">
			<van-collapse v-model="activeStoreNames" :border="false">
				<van-collapse-item :name="storeItem.id"
                   v-for="storeItem in data"
                   :key="storeItem.id"
                   class="store-row"
                   v-show="storeShowComputed(storeItem)"
				>
					<div slot="title" class="item-store-title fx-ellipsis">{{storeItem.name}}</div>
					<van-swipe-cell
						v-show="item.changeType !== 'del'"
						v-for="item in detailFilter(storeItem.details)"
						:ref="`details-row-${storeItem.id}-${item.goods.id}`"
						:key="`${storeItem.id}-${item.goods.id}-${item.goodsUUid}`"
						class="item-row"
					>
						<div class="item-cell">
							<bomInfoCell
								:itemData="item"
								class="search-info"
								@on-item-focus="onItemFocus(arguments, `${storeItem.id}-${item.goods.id}`)"
							></bomInfoCell>
						</div>
					</van-swipe-cell>
				</van-collapse-item>
			</van-collapse>
		</div>
	</div>
</template>

<script>
import bomInfoCell from '@/components/departmentReceive/bomImport/bomInfoCell.vue'
export default {
	name: 'bomSearchPop',
	components: {
		bomInfoCell
	},
	props: {
		data: {
			type: Array,
			default: () => {
				return []
			}
		},
		visibleFlag: Boolean,
		searchKeywords: String
	},
	data () {
		return {
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			searchKey: '',
			activeStoreNames: []
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
							this.activeStoreNames.push(storeItem.id)
						}
					})
				}
			},
			immediate: true
		}
	},
	methods: {
		// {{{设置uuid，唯一标示key值
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
		detailFilter (items) {
			return items.filter(item => {
				return !!this.searchKeywords.split(',').find(itemKey => {
					if (item.goods[itemKey].toLowerCase().includes(this.searchKey.toLowerCase())) {
						return true
					}
				})
			})
		},
		onCloseClick () {
			this.$emit('update:visibleFlag', false)
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
		.item-row {
			border-bottom:1px solid $fxBorder
		}
	}
}
</style>
