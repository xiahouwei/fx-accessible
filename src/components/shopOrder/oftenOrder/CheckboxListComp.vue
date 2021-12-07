<template>
	<div class="shop-popup">
		<w-header :title="title" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<van-search v-model="searchKey" placeholder="请输入搜索关键词"  shape="round" @search="search" class="search-pro"/>
		<div class="popup-content">
			<van-checkbox-group v-model="selectDataNames">
				<van-list
					v-model="listLoading"
					:finished="loadFinished"
					finished-text="没有更多了"
					:error.sync="listError"
					error-text="请求失败，点击重新加载"
					@load="onLoad"
				>
					<van-cell
						v-for="(item, index) in data"
						:key="item.id"
						:title="item.name"
						@click="indexListClick(index)"
						class="fx-van-cell"
					>
						<div class="list-checkbox" slot="icon">
							<van-checkbox
								ref="checkboxes"
								shape="square"
								:name="item.name"
								:value="item.id"
							>
								<img
									class="checkbox-img"
									slot="icon"
									slot-scope="props"
									:src="props.checked ? checkedIcon.active : checkedIcon.normal"
								>
							</van-checkbox>
						</div>
					</van-cell>
				</van-list>
			</van-checkbox-group>
		</div>
		<div class="filter-bottom">
			<van-button class="confirm-btn fx-no-radius fx-btn" type="primary" @click="onConfirmClick">确定</van-button>
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
		loadFinished: Boolean
	},
	data () {
		return {
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			searchKey: '',
			listLoading: false,
			listError: false,
			selectDataNames: [],
			checkedIcon: {
				normal: require('@/assets/images/icon/icon-checked.png'),
				active: require('@/assets/images/icon/icon-checked-active.png')
			}
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
				this.selectDataNames = []
			}
		}
	},
	methods: {
		onCloseClick () {
			this.$emit('update:visibleFlag', false)
		},
		indexListClick (index) {
			this.$refs.checkboxes[index].toggle()
		},
		search () {
			this.$emit('on-search', this.searchKey)
		},
		onLoad () {
			this.$emit('update:loading', true)
			this.$emit('on-load', this.searchKey)
		},
		onConfirmClick () {
			let selectDataIds = []
			this.$refs.checkboxes.forEach(checkBox => {
				if (checkBox.checked) {
					selectDataIds.push(checkBox.value)
				}
			})
			if (!selectDataIds.length) {
				this.$fxToast.fail('请先选择常订品项方案!')
				return false
			}
			let selectData = {
				names: this.selectDataNames,
				ids: selectDataIds
			}
			this.$emit('on-select', selectData)
			this.$emit('update:visibleFlag', false)
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
	.popup-content {
		flex:1
		overflow: scroll
		>>>.van-list__finished-text {
			$fx-dynamic-font-size(12px)
		}
	}
	.filter-bottom {
		display: flex
		flex-direction: row
		width:100%
		.confirm-btn {
			flex:1
		}
	}
	.list-checkbox {
		margin-right: 10px
	}
	.checkbox-img{
		width: 20px
	}
	.search-pro {
		>>>.van-cell {
			$fx-dynamic-font-size(14px)
		}
	}
}
</style>
