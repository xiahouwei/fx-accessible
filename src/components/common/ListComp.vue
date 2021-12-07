<template>
	<div class="shop-popup">
		<w-header :title="title" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<van-pro-search
			v-show="searchShow"
			v-model="searchKey"
			shape="round"
			@search="search"
		/>
		<div class="popup-content">
			<van-list
				v-model="listLoading"
				:finished="loadFinished"
				finished-text="没有更多了"
				:error.sync="listError"
				:immediate-check="immediateCheck"
				error-text="请求失败，点击重新加载"
				@load="onLoad"
			>
				<van-cell
					v-for="item in data"
					:key="item.id"
					:title="item.name"
					class="fx-van-cell"
					@click="indexListClick(item)"
				/>
			</van-list>
		</div>
	</div>
</template>

<script>
export default {
	name: 'filterPop',
	props: {
		loading: Boolean,
		visibleFlag: Boolean,
		title: String,
		data: {
			type: Array,
			default: () => {
				return []
			}
		},
		searchShow: {
			type: Boolean,
			default: true
		},
		loadFinished: Boolean,
		immediateCheck: {
			type: Boolean,
			default: true
		}
	},
	data () {
		return {
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			searchKey: '',
			listLoading: false,
			listError: false
		}
	},
	watch: {
		loading: {
			handler (val) {
				if (!val) {
					this.listLoading = false
				}
			},
			immediate: true
		},
		visibleFlag (val) {
			if (val) {
				this.searchKey = ''
			}
		}
	},
	methods: {
		onCloseClick () {
			this.$emit('update:visibleFlag', false)
		},
		indexListClick (item) {
			this.$emit('on-select', item)
			this.$emit('update:visibleFlag', false)
		},
		search (searchKey) {
			this.$emit('on-search', searchKey)
		},
		onLoad () {
			this.$emit('update:loading', true)
			this.$emit('on-load', this.searchKey || null)
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.shop-popup {
	height:100%
	width: 100%
	text-align:left
	display: flex
	flex-direction: column
	>>>.popup-content {
		flex:1
		overflow: scroll
		.van-list__finished-text {
			$fx-dynamic-font-size(12px)
		}
	}
}
</style>
