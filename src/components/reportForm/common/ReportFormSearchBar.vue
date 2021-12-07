<template>
	<div class="report-form-tools">
		<w-icon
			:type="!!frozenColumnFlag ? 'report-frozen-column-active' : 'report-frozen-column'"
			class="frozen-btn"
			@click="onFrozenClick"
		></w-icon>
		<van-pro-search
			v-model="searchText"
			shape="round"
			:clearable="true"
			:searchImmediate="true"
			:duration="100"
			class="report-form-search-bar"
			@search="onSearch"
		></van-pro-search>
	</div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
	name: 'reportFormSearchBar',
	props: {
		value: null,
		reportFormId: String
	},
	data () {
		return {
			searchText: ''
		}
	},
	computed: {
		...mapGetters(['reportFrozenColGetter']),
		frozenColumnFlag () {
			return this.reportFrozenColGetter(this.reportFormId)
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
		onSearch (val) {
			this.$emit('input', val)
			this.$emit('on-search', val)
		},
		onFrozenClick () {
			this.$store.commit('SET_REPORT_FROZEN_COL', {
				[this.reportFormId]: !this.frozenColumnFlag
			})
		}
	}
}
</script>

<style  lang="stylus" scoped>
.report-form-tools {
	display: flex
	flex-direction: row
	align-items: center;
	width: 100%
	.frozen-btn {
		margin-left: 10px
	}
	.report-form-search-bar {
		display: flex
		flex-direction: row
		flex: 1
		height: 34px
		&>>>.van-search {
			flex: 1
		}
		&>>>.van-cell {
			font-size:10px
			line-height: 0
		}
	}
}
</style>
