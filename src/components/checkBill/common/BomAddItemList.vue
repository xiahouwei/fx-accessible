<template>
	<div class="item-details-content" ref="details-content">
		<van-list
			v-model="currentListLoading"
			:finished="loadFinished"
			finished-text="没有更多了"
			:error.sync="listError"
			error-text="请求失败，点击重新加载"
			@load="onLoadMore"
		>
			<div
				v-for="(item, index) in itemList"
				:key="item.goods.id"
				:ref="`details-row-${index}`"
				class="item-detail"
			>
				<slot name="item-cell" :$item="item" :$index="index"></slot>
			</div>
		</van-list>
	</div>
</template>

<script>
export default {
	name: 'bomAddItemList',
	props: {
		value: [String, Number],
		itemList: {
			type: Array,
			default: () => {
				return []
			}
		},
		listLoading: Boolean,
		loadFinished: Boolean,
		listError: {
			type: Boolean,
			default: false
		}
	},
	data () {
		return {
			activeNames: [],
			currentListLoading: false
		}
	},
	watch: {
		listLoading: {
			handler (val) {
				this.currentListLoading = val
			},
			immediate: true
		},
		currentListLoading (val) {
			this.$emit('update:listLoading', val)
		}
	},
	computed: {
		comptedItemImgSrc (imageUrls) {
			return (imageUrls) => {
				return imageUrls.length === 0 ? '' : imageUrls[0]
			}
		}
	},
	methods: {
		onLoadMore () {
			this.$emit('on-load-more')
		},
		onSelectLetter (index, distance = 40) {
			let detailsRowRef = this.$refs[`details-row-${index}`]
			if (!detailsRowRef || detailsRowRef.length === 0) {
				return false
			}
			let offsetTop = detailsRowRef[0].offsetTop
			let $el = this.$refs['details-content']
			this.$fxUtils.scrollTopW({ offsetTop, $el, distance })
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.item-details-content {
	flex:1
	overflow:scroll
	position: relative;
	.item-detail {
		width:100%
		height:80px
	}
}
</style>
