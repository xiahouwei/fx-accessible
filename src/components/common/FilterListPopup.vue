<template>
	<van-popup v-model="popupShowFlag" position="right" class="fx-list-popup-300" :lock-scroll="false">
		<listComp
			:visibleFlag.sync="popupShowFlag"
			:title="title"
			:data="listData"
			:loadFinished="currentLoadFinish"
			:loading.sync="onItemLoading"
			@on-search="onSearchHandler"
			@on-select="onSelectHandler"
			@on-load="onListLoad"
		></listComp>
	</van-popup>
</template>

<script>
/* filterListPopup by shw 2019/10/29
 * @desc 筛选条件-列表-弹窗 主要用于用户筛选条件时,提供选项列表
 *
 * @param {title} [str] - 标题
 * @param {visibleFlag}  [Boolean] - 开启状态
 * @param {rollingLoad}  [Boolean] - 是否开启滚动加载
 * @param {itemSize}  [Number] - 加载个数 默认50
 * @param {getDataApi}  [Array] - 获取数据方法, 需要返回promise, 形参(keyword, listStart, itemSize)
 *
 * @event {on-select} 选择时触发
 * @event {on-show}   打开列表时触发
 */
import listComp from '@/components/common/ListComp.vue'
const ITEM_SIZE = 50
export default {
	name: 'filterListPopup',
	components: {
		listComp
	},
	props: {
		value: Boolean,
		title: String,
		rollingLoad: Boolean,
		itemSize: {
			type: Number,
			default: ITEM_SIZE
		},
		getDataApi: Function
	},
	data () {
		return {
			popupShowFlag: false,
			itemListLoadFinished: false,
			onItemLoading: false,
			listStart: 0,
			listData: []
		}
	},
	computed: {
		currentLoadFinish () {
			return this.itemListLoadFinished || !this.rollingLoad
		}
	},
	watch: {
		value: {
			immediate: true,
			handler (val) {
				if (val) {
					this.onListRefresh().then(() => {
						this.$emit('on-show')
					})
				}
			}
		},
		popupShowFlag: {
			immediate: true,
			handler (val) {
				if (!val) {
					this.$emit('input', false)
				}
			}
		}
	},
	methods: {
		onSearchHandler (keyword) {
			this.onListRefresh(keyword)
		},
		onSelectHandler (item) {
			this.$emit('on-select', item)
		},
		onListRefresh (keyword = null) {
			this.listStart = 0
			return new Promise(resolve => {
				this.getDataApi(keyword, this.listStart, this.itemSize).then(list => {
					this.popupShowFlag = true
					this.onItemLoading = false
					this.listStart += this.itemSize
					this.itemListLoadFinished = list.length < this.itemSize
					this.listData = list
					resolve()
				})
			})
		},
		onListLoad (keyword = null) {
			this.getDataApi(keyword, this.listStart, this.itemSize).then(list => {
				this.onItemLoading = false
				this.listStart += this.itemSize
				if (list.length < this.itemSize) {
					this.itemListLoadFinished = true
				}
				this.listData.push(...list)
			})
		}
	}
}
</script>

