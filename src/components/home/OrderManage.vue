<template>
	<div class="order-manage-module">
		<div class="manage-module-header">
			<p class="module-header-title">{{title}}</p>
			<van-button v-show="clearState && editState" type="primary" size="mini" @click="saveEditResult">完成</van-button>
		</div>
		<div class="manage-module-content">
			<div class="manage-module-row" v-for="index of rowLength" :key="index">
				<div
					v-for="orderIndex of orderRowCount"
					:key="orderItem(index, orderIndex).id"
					class="manage-module-item"
					@click="billClickHandler(orderItem(index, orderIndex))" >
					<div v-show="!setShowMoreItem(index, orderIndex)">
						<div class="manage-module-item-block" :class="{'fx-red-dot': parseFloat(orderItem(index, orderIndex).waring) > 0}" v-show="orderItem(index, orderIndex).showFlag">
							<img
								:class="{'disabled-gray': orderItem(index, orderIndex).disabled}"
								class="manage-module-item-icon"
								:src="orderItem(index, orderIndex).iconSrc">
							<van-icon
								v-show="addState"
								class="item-block-icon"
								name="add" color="#5e8ff7" size="20px"
								@click="addOrderItem(orderItem(index, orderIndex))"
							/>
							<van-icon
								v-show="clearState"
								class="item-block-icon"
								name="clear" color="#bebfc0" size="20px"
								@click="clearOrderItem(orderItem(index, orderIndex))"
							/>
						</div>
						<p v-show="orderItem(index, orderIndex).showFlag">{{orderItem(index, orderIndex).label}}</p>
					</div>
					<div v-show="setShowMoreItem(index, orderIndex)">
						<div
							class="manage-module-item"
							@click="editManage" >
							<div class="manage-module-item-block">
								<img
									class="manage-module-item-icon"
									:src="require('@/assets/images/icon/icon-more.png')">
							</div>
							<p>更多</p>
						</div>
					</div>
				</div>
			</div>
			<div v-show="setShowMoreRow" class="manage-module-row">
				<div class="manage-module-item" @click="editManage" >
					<div class="manage-module-item-block">
						<img
							class="manage-module-item-icon"
							:src="require('@/assets/images/icon/icon-more.png')">
					</div>
					<p>更多</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
const ORDER_ROW_COUNT = 4
export default {
	name: 'manageModule',
	props: {
		orderManageData: {
			type: Array,
			default: () => {
				return []
			}
		},
		title: String,
		addState: {
			type: Boolean,
			default: false
		},
		clearState: {
			type: Boolean,
			default: false
		},
		moreFlag: {
			type: Boolean,
			default: false
		}
	},
	data () {
		return {
			orderRowCount: ORDER_ROW_COUNT,
			showMoreItem: false
		}
	},
	computed: {
		...mapState({
			billAuth: state => state.auth.billAuth
		}),
		rowLength () {
			return Math.ceil(this.orderManageData.length / this.orderRowCount)
		},
		orderItem (rowIndex, columnIndex) {
			return (rowIndex, columnIndex) => {
				return this.orderManageData[(rowIndex - 1) * this.orderRowCount + (columnIndex - 1)] || {}
			}
		},
		setShowMoreRow () {
			return this.orderManageData.length % this.orderRowCount === 0 && this.moreFlag
		},
		// 编辑状态，禁止点击进入单据事件
		editState () {
			return this.addState || this.clearState
		}
	},
	created () {
		this.authOrder()
	},
	methods: {
		authOrder () {
			this.orderManageData.forEach((item, index) => {
				this.$set(this.orderManageData[index], 'disabled', !this.$fxUtils.isDef(this.billAuth[item.auth]))
			})
		},
		setShowMoreItem (rowIndex, columnIndex) {
			if ((rowIndex - 1) * this.orderRowCount + (columnIndex - 1) === this.orderManageData.length && this.moreFlag) {
				return true
			} else {
				return false
			}
		},
		billClickHandler (item) {
			if (this.editState) {
				return false
			}
			if (!item.disabled) {
				this.$emit('manageModuleClick', item)
			} else {
				this.$dialog.alert({
					title: '提示',
					message: '没有该单据的管辖权限！'
				})
			}
		},
		editManage () {
			this.$emit('on-edit-manage')
		},
		// {{{ 新增删除常订订单
		clearOrderItem (item) {
			this.$emit('on-clear-manage', item)
		},
		addOrderItem (item) {
			this.$emit('on-add-manage', item)
		},
		// {{{ 保存
		saveEditResult () {
			// 状态置回
			this.$emit('update:addState', false)
			this.$emit('update:clearState', false)
			console.log(this.orderManageData)
			this.$emit('on-save-manage', this.orderManageData)
		}
		// }}}
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
		/* overflow-y: scroll */
		overflow-x: hidden
		padding: 6px 7px 0px 0px
	}
	.manage-module-row {
		display:flex
		flex-direction: row
		margin-top:20px
		.manage-module-item {
			flex:0 0 25%
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
				width:50px
				height:50px
				margin-bottom:10px
			}
		}
		.disabled-gray {
			-webkit-filter: grayscale(100%);
			-moz-filter: grayscale(100%);
			-ms-filter: grayscale(100%);
			-o-filter: grayscale(100%);
			filter: grayscale(100%);
			filter: gray;
		}
	}
}
</style>
