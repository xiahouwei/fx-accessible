<template>
	<form action="">
		<Search
			class="search-pro"
			v-model="searchKey"
			:placeholder="placeholder"
			:shape="shape"
			:clearable="clearable"
			@search="onSearch"
			@input="onSearchInput"
			@focus="onSearchFocus"
			@blur="onSearchBlur"
			@clear="onSearchClear"
			@cancel="onSearchCancel"
		/>
	</form>
</template>

<script type="text/babel">
/**
 * SearchPro by SHW 2020/4/29
 * @desc vant-search增強
 *
 * @param {value}  [any] - 输入框值
 * @param {type}  [String] - field 类型
 * @param {disabled}  [Boolean] - 是否禁用
 *
 * @event {change} 当绑定值变化时触发的事件	当前组件的值
 * @event {blur} 输入框失焦时触发
 * @event {focus} 输入框聚焦时触发
 *
 */
import { Search } from 'vant'
export default {
	name: 'van-pro-search',
	components: {
		Search: Search
	},
	props: {
		value: null,
		placeholder: {
			type: String,
			default: '请输入搜索关键词'
		},
		shape: {
			type: String,
			default: 'square'
		},
		clearable: {
			type: Boolean,
			default: false
		},
		duration: {
			type: Number,
			default: 500
		},
		searchImmediate: {
			type: Boolean,
			default: false
		}
	},
	data () {
		return {
			searchDebounce: this.$fxUtils.debounce(),
			searchKey: ''
		}
	},
	watch: {
		value: {
			immediate: true,
			handler (val) {
				this.searchKey = val
			}
		}
	},
	methods: {
		onSearch (searchKey) {
			this.$emit('input', searchKey)
			this.$emit('search', searchKey)
		},
		onSearchInput (searchKey) {
			this.searchDebounce(this.duration, this.searchImmediate).then(() => {
				this.$emit('input', searchKey)
				this.$emit('search', searchKey)
			})
		},
		onSearchFocus () {
			this.$emit('focus')
		},
		onSearchBlur () {
			this.$emit('blur')
		},
		onSearchClear () {
			this.$emit('clear')
		},
		onSearchCancel () {
			this.$emit('cancel')
		}
	}
}
</script>
<style scoped lang="stylus">
.search-pro {
	>>>.van-cell {
		$fx-dynamic-font-size(14px)
	}
}
</style>
