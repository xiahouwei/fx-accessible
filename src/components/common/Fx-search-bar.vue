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
		<i
			v-show="showSelectAllBtn"
			:class="{'is-active': isSelectAll}"
			class="title-icon-selectAll"
			@click="onSelectAllClick"
		></i>
	</div>
</template>

<script>
export default {
	name: 'fx-search-bar',
	props: {
		value: null,
		isSelectAll: Boolean,
		showSelectAllBtn: Boolean
	},
	data () {
		return {
			searchText: ''
		}
	},
	watch: {
		value: {
			immediate: true,
			handler (val) {
				this.searchText = val
			}
		}
	},
	methods: {
		onSelectAllClick () {
			this.$emit('on-select-click')
		},
		inputSearchKey () {
			this.$emit('input', this.searchText)
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
}
</style>
