<template>
	<w-header :title="title" :border="true">
		<headEditBtn
			v-show="showCheckBtn"
			slot="header-right"
			:active="checkBtnActive"
			@click="onOrderEditClick"
		></headEditBtn>
		<headSearchBtn v-show="showSearchBtn" slot="header-right" @click="onSearchClick"></headSearchBtn>
		<headSelectAllBtn
			v-show="showSelectAllBtn"
			:active="selectAllBtnActive"
			slot="header-right"
			@click="onSelectAllClick"
		></headSelectAllBtn>
	</w-header>
</template>

<script>
import headSearchBtn from '@/components/common/HeadSearchBtn.vue'
import headEditBtn from '@/components/common/HeadEditBtn.vue'
import headSelectAllBtn from '@/components/common/HeadSelectAllBtn.vue'
export default {
	name: 'fx-order-list-header',
	components: {
		headSearchBtn,
		headEditBtn,
		headSelectAllBtn
	},
	props: {
		title: String,
		showCheckBtn: Boolean,
		checkBtnActive: Boolean,
		showSearchBtn: Boolean,
		showSelectAllBtn: Boolean,
		selectAllBtnActive: Boolean
	},
	data () {
		return {
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			}
		}
	},
	methods: {
		onOrderEditClick () {
			this.$emit('on-check-click', this.checkBtnActive)
		},
		onSearchClick () {
			this.$emit('on-search-click')
		},
		onSelectAllClick () {
			this.$emit('on-selectAll-click', this.selectAllBtnActive)
		}
	}
}
</script>
