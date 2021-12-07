<template>
	<div class="item-search clearfix">
		<van-search
			v-model="searchText"
			placeholder="请输入搜索关键词"
			shape="round"
			class="search-text"
			@input="inputSearchKey"
			@search="confirmSearchKey"
		/>
		<i :class='activeClass()' class="title-icon-selectAll" @click="onSelectAllClick"></i>
	</div>
</template>

<script>
export default {
	name: 'searchHead',
	props: {
		selectActive: {
			type: [String, Boolean],
			default: () => {
				return 'hide'
			}
		},
		beforeChange: Function,
		searchKey: String,
		initSearch: Boolean
	},
	data () {
		return {
			searchText: ''
		}
	},
	watch: {
		initSearch: {
			handler (val) {
				if (val) {
					this.searchText = ''
				}
			},
			immediate: true
		}
	},
	methods: {
		activeClass () {
			if (this.selectActive === true) {
				return 'is-active'
			} else if (this.selectActive === false) {
				return ''
			} else {
				return 'item-hide'
			}
		},
		onSelectAllClick () {
			this.$emit('on-select-click')
		},
		inputSearchKey () {
			if (this.beforeChange === undefined) {
				this.$emit('update:searchKey', this.searchText)
			} else if (Object.prototype.toString.call(this.beforeChange) === '[object Function]') {
				if (this.beforeChange()) {
					this.$nextTick(() => {
						this.$emit('update:searchKey', this.searchText)
					})
				}
			}
		},
		confirmSearchKey () {
			this.$emit('on-confirm-key', this.searchText)
		}
	}
}
</script>

<style  lang="stylus" scoped>
.item-search {
	display: flex
	width: 100%
	flex-direction: row
	.search-text {
		flex: 1
	}
	.title-icon-selectAll {
		width: 26px
		background-repeat:no-repeat
		background-position-y: center
		background-position-x: left
		background-size: 16px
		display:inline-block
		background-image:url('~images/icon/icon-select-all.png')
	}
	.title-icon-selectAll.is-active {
		background-image:url('~images/icon/icon-select-all-active.png')
	}
	.item-hide {
		display: none;
	}
	>>>.van-cell {
		$fx-dynamic-font-size(14px)
	}
}
</style>
