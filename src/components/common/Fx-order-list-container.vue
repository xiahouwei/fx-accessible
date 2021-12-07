<template>
	<div class="fx-order-list-container">
		<van-pull-refresh
			v-model="pullRefreshLoading"
			v-show="data.length !== 0"
			class="fx-order-list-container__pull-refresh"
			@refresh="onPullRefresh"
		>
			<van-list
				v-model="listLoading"
				:finished="loadFinished"
				finished-text="没有更多了"
				:error.sync="listError"
				error-text="请求失败，点击重新加载"
				@load="onLoadMore"
			>
				<slot></slot>
			</van-list>
		</van-pull-refresh>
		<w-empty v-show="data.length === 0"></w-empty>
	</div>
</template>

<script>
export default {
	name: 'fx-order-list-container',
	props: {
		value: Boolean,
		data: {
			type: Array,
			default: () => {
				return []
			}
		},
		loadFinished: Boolean
	},
	data () {
		return {
			pullRefreshLoading: false,
			listLoading: false,
			listError: false
		}
	},
	watch: {
		value: {
			immediate: true,
			handler (val) {
				this.pullRefreshLoading = val
			}
		},
		pullRefreshLoading (val) {
			this.$emit('input', val)
		}
	},
	methods: {
		onPullRefresh () {
			this.$emit('on-refresh')
		},
		onLoadMore () {
			this.$emit('on-loadMore')
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.fx-order-list-container {
	display: flex
	flex-direction: column
	flex: 1
	overflow:scroll
	&__pull-refresh {
		min-height: 526px
		overflow: scroll
	}
}
</style>
