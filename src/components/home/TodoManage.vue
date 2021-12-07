<template>
	<div class="order-manage-module">
		<div class="manage-module-header">
			<p class="module-header-title">待办工作</p>
		</div>
		<div class="manage-module-content">
			<div class="manage-module-row" v-for="index of rowLength" :key="index">
				<div v-for="rowIndex of rowCount" :key="todoItem(index, rowIndex).name" class="manage-module-item">
					<div class="manage-module-item-block">
						<van-icon
							v-show="!$fxUtils.isEmptyObjSHW(todoItem(index, rowIndex))"
							class="manage-module-item-icon"
							:name="todoItem(index, rowIndex).img"
							:info="todoItem(index, rowIndex).count > 99 ? '99+' : todoItem(index, rowIndex).count"
							@click="onTodoManageClick(todoItem(index, rowIndex))"
						/>
					</div>
					<p>{{todoItem(index, rowIndex).name}}</p>
				</div>
				<!--<div class="manage-module-item">
					<div class="manage-module-item-block">
						<van-icon class="manage-module-item-icon" :name="require('@/assets/images/icon/order-logo/icon-area.png')" />
					</div>
					<p>区域配送</p>
				</div>
				<div class="manage-module-item">
					<div class="manage-module-item-block">
						<van-icon class="manage-module-item-icon" :name="require('@/assets/images/icon/order-logo/icon-production.png')" />
					</div>
					<p>生产管理</p>
				</div>
				<div class="manage-module-item">
					<div class="manage-module-item-block">
						<van-icon class="manage-module-item-icon" :name="require('@/assets/images/icon/order-logo/icon-pay.png')" />
					</div>
					<p>应收应付</p>
				</div>-->
			</div>
		</div>
		<van-popup
			v-model="todoBillPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<todoBill
				:visibleFlag.sync="todoBillPopShow"
				:todoBill="todoBill"
				v-on="$listeners"
			></todoBill>
		</van-popup>
	</div>
</template>

<script>
import todoBill from '@/components/home/todoBillPop.vue'
const ROW_COUNT = 5
export default {
	name: 'todoManageModule',
	components: {
		todoBill
	},
	props: {
		todoManageData: {
			type: Array,
			default: () => {
				return []
			}
		}
	},
	data () {
		return {
			data: [],
			todoBillPopShow: false,
			todoBill: [],
			rowCount: ROW_COUNT
		}
	},
	computed: {
		rowLength () {
			return Math.ceil(this.data.length / this.rowCount)
		},
		todoItem (rowIndex, columnIndex) {
			return (rowIndex, columnIndex) => {
				return this.data[(rowIndex - 1) * this.rowCount + (columnIndex - 1)] || {}
			}
		}
	},
	watch: {
		todoManageData: {
			immediate: true,
			handler (val) {
				this.setManageData(val)
			}
		}
	},
	methods: {
		setManageData (data) {
			let type = []
			let types = []
			for (let item = '', i = data.length - 1; i >= 0; --i) {
				item = data[i]
				type = this.getTypeByName(types, item.fname)
				type.todos.push(item)
				type.count += item.num
				if (!type.fsort) {
					type.fsort = item.fsort
				}
			}
			// 排序
			types.sort((a, b) => {
				var n1 = a.fsort
				var n2 = b.fsort
				if (n1 > n2) {
					return -1
				} else if (n1 < n2) {
					return 1
				} else {
					return 0
				}
			})
			// 增加图片
			types.forEach((item, index) => {
				item.img = require('@/assets/images/icon/order-logo/icon-todo-' + index + '.png')
			})
			this.data = types
		},
		// {{{ getTypeByName
		getTypeByName (list, key) {
			let item = ''
			for (let i = list.length - 1; i >= 0; --i) {
				item = list[i]
				if (item.name === key) {
					return item
				}
			}
			item = {
				name: key,
				count: 0,
				todos: []
			}
			list.push(item)
			return item
		},
		// }}}
		onTodoManageClick (data) {
			this.todoBill = data
			this.todoBillPopShow = true
		},
		getTodoCount () {
			return new Promise(resolve => {
				this.$nextTick(() => {
					const count = this.data.reduce((pre, cur) => {
						return cur.count + pre
					}, 0)
					resolve(count > 99 ? 99 : count)
				})
			})
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.order-manage-module {
	display: flex
	flex-direction: column
	height: 100%
	.manage-module-header {
		display: flex
		flex-direction: row
		align-items: center
		justify-content: center
		padding-right: 10px
		.module-header-title {
			text-align: left
			flex: 1
			position: relative
			padding: 5px 19px 10px
			font-size: 14px
		}
		.module-header-title:before {
			content: ''
			position:absolute
			top: 2px
			left: 9px
			width: 4px
			height: 23px
			background-color:$fxBlue
		}
	}
	.manage-module-content {
		-webkit-overflow-scrolling: touch
		flex: 1
		overflow-x: hidden
		padding: 6px 7px 0px 0px
	}
	.manage-module-row {
		display:flex
		flex-direction: row
		margin-top:20px
		.manage-module-item {
			flex:0 0 20%
			text-align:center
			.manage-module-item-block {
				position:relative
				.item-block-icon {
					top: -12px
					right: 0px
					position: absolute
				}
			}
			.manage-module-item-icon {
				display:inline-block
				width:30px
				height:30px
				margin-bottom:10px
			}
		}
	}
}
</style>
