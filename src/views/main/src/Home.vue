<template>
	<w-app-page class="inteledi-home">
		<w-header :title="loginerName" :leftOptions="leftOptions">
			<i slot="header-left" class="home-title-icon" @click="onMeclick"></i>
		</w-header>
		<div class="home-date-bar">
			<div class="home-date-bar-content">{{currentDate}} {{currentWeek}}</div>
		</div>
		<div class="home-content">
			<div v-show="todoManageData.length > 0" class="order-manage order-shortcuts fx-shadow-block">
				<TodoManage
					ref="todoManage"
					:todoManageData="todoManageData"
					@todoBillClick="todoBillClickHandler"
				></TodoManage>
			</div>
			<div class="order-manage order-shortcuts fx-shadow-block">
				<orderManage
					v-if="getOrderManageData"
					:title="'常用模块'"
					:moreFlag="true"
					:clearState.sync="clearManage"
					:orderManageData="shortcutsList"
					@manageModuleClick="billClickHandler"
					@on-edit-manage="onEditManage"
					@on-clear-manage="onClearManage"
					@on-save-manage="onSaveManage"
				></orderManage>
			</div>
			<div class="order-manage order-type fx-shadow-block">
				<orderManage
					v-if="getOrderManageData"
					:title="'单据类型'"
					:addState.sync="addManage"
					:orderManageData="orderTypeList"
					@on-add-manage="onAddManage"
					@manageModuleClick="billClickHandler"
				></orderManage>
			</div>
			<div class="order-manage order-food fx-shadow-block">
				<orderManage
					v-if="getOrderManageData"
					:title="'食品安全'"
					:addState.sync="addManage"
					:orderManageData="foodTypeList"
					@on-add-manage="onAddManage"
					@manageModuleClick="billClickHandler"
				></orderManage>
			</div>
		</div>
		<van-popup v-model="meMenuShow" position="left" class="me-menu-popup">
			<meMenu></meMenu>
		</van-popup>
	</w-app-page>
</template>

<script>
import { mapState } from 'vuex'
import TodoManage from '@/components/home/TodoManage.vue'
import orderManage from '@/components/home/OrderManage.vue'
import meMenu from '@/components/home/MeMenu.vue'
import mixinTaxes from '@/js/mixin/taxes'
import mixinSystemParams from '@/js/mixin/systemParams'
import { getOrderModule } from '@/config/order-module'
export default {
	name: 'home',
	mixins: [mixinTaxes, mixinSystemParams],
	components: {
		TodoManage,
		orderManage,
		meMenu
	},
	data () {
		return {
			leftOptions: {
				showBackBtn: false
			},
			manageModule: getOrderModule(),
			meMenuShow: false,
			shortcutsList: [],
			orderTypeList: [],
			foodTypeList: [],
			getOrderManageData: false,
			clearManage: false,
			addManage: false,
			todoManageData: []
		}
	},
	computed: {
		...mapState({
			loginerName: state => state.loginer.loginerName,
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId
		}),
		currentDate () {
			return this.$fxUtils.setDate(new Date(), '年月日')
		},
		currentWeek () {
			return this.$fxUtils.getDateWeek(new Date())
		}
	},
	created () {
		this.$fxEventBus.initEvent(this, 'refreshTodoTypes', this.getTodoTypes)
		this.initHandler([
			this.$fxVerCheck(),
			this.getSystemConfig(),
			this.getShortcuts()
		])
		this.getTodoTypes()
	},
	watch: {
		clearManage (val) {
			if (!val) {
				this.addManage = false
			}
		}
	},
	methods: {
		initHandler ([...func]) {
			return Promise.all(func)
		},
		getSystemConfig () {
			return Promise.all([this.syncSystemParams(), this.syncTaxes()])
		},
		getShortcuts () {
			return new Promise(resolve => {
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/function/shortcuts`
				}).then(res => {
					this.setOrderItem(Object.keys(res.functionMapData[0] || {}))
					this.getOrderManageData = true
					resolve()
				})
			})
		},
		setOrderItem (shortcutsCodes) {
			this.orderTypeList = []
			this.shortcutsList = []
			this.foodTypeList = []
			this.manageModule.forEach(orderItem => {
				let isShortcuts = shortcutsCodes.find(codesItem => {
					return codesItem === orderItem.auth
				})
				if (isShortcuts) {
					this.shortcutsList.push(orderItem)
				} else if (orderItem.moduleType === 'foodSafe') {
					this.foodTypeList.push(orderItem)
				} else {
					this.orderTypeList.push(orderItem)
				}
			})
		},
		// {{{ 待办工作
		getTodoTypes () {
			this.$fxHttp.requestPost({
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/todotypes`,
				query: {
					m: 'setMoveStateForMoveApply'
				}
			}).then(() => {
				Promise.all([this.getTodosList(), this.backlogCountForMoveApply()]).then(result => {
					let todoManageData = result[0]
					if (Object.prototype.toString.call(todoManageData) !== '[object Array]') {
						return false
					}
					this.todoManageData = todoManageData
					let moveOrder = this.todoManageData.find(item => item.code === 'moveOrder')
					// 调拨申请单单独处理 存在 返回调拨申请单，但并未返回调拨申请单分类的情况（把部分仓库取消管辖了），此时不显示调拨申请单，故设置moreTypes = []，显示时，如moreTypes没有length则不显示
					if (result[1].length) {
						let sum = result[1].reduce((pre, cur) => {
							return pre + cur.num
						}, 0)
						moveOrder.num = sum
						moveOrder.moreTypes = result[1]
					} else {
						moveOrder.moreTypes = []
					}
					this.$refs.todoManage.getTodoCount().then(res => {
						this.$fxCordova.jpushSetBadge(res)
					})
				})
			})
		},
		// 调拨申请单
		backlogCountForMoveApply () {
			return new Promise((resolve, reject) => {
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/todotypes`,
					query: {
						m: 'backlogCountForMoveApply'
					},
					autoErrorMsg: false
				}).then(res => {
					resolve(res)
				}).catch((error) => {
					reject(error)
				})
			})
		},
		// 待办工作list
		getTodosList () {
			return new Promise((resolve, reject) => {
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/todotypes`,
					query: {
						m: 'getList'
					},
					autoErrorMsg: false
				}).then(res => {
					resolve(res)
				}).catch((error) => {
					reject(error)
				})
			})
		},
		todoBillClickHandler (data) {
			let params = {
				billState: '0'
			}
			if (data.code === 'moveOrder') { // 调拨申请单分类
				params.billState = null
				if (!data.moreTypes) {
					params.moveState = data.savenum + ''
					params.billState = data.billState + ''
				}
			}
			this.$router.push({
				name: data.code,
				params: params
			})
		},
		// }}}
		onMeclick () {
			this.meMenuShow = true
		},
		billClickHandler (item) {
			if (item.showFlag) {
				this.$router.push(item.path)
			}
		},
		checkShortcutsConfim (data) {
			return new Promise(resolve => {
				if (this.shortcutsList.length !== 12) {
					resolve(true)
					return true
				}
				this.$dialog.confirm({
					title: '提示',
					message: '确定删除第一条吗？'
				}).then(() => {
					this.shortcutsList.splice(0, 1)
					resolve(true)
				}).catch(() => {
					resolve(false)
				})
			})
		},
		onAddManage (orderManageItem) {
			this.checkShortcutsConfim(orderManageItem).then((res) => {
				if (res) {
					this.shortcutsList.push(orderManageItem)
				}
				let shortcutsCodes = this.shortcutsList.map(shortcutsItem => {
					return shortcutsItem.auth
				})
				this.setOrderItem(shortcutsCodes)
			})
		},
		onClearManage (item) {
			let orderName = item.auth
			let index = this.shortcutsList.map(shortcutsItem => {
				return shortcutsItem.auth
			}).indexOf(orderName)
			this.shortcutsList.splice(index, 1)
			let shortcutsCodes = this.shortcutsList.map(shortcutsItem => {
				return shortcutsItem.auth
			})
			this.setOrderItem(shortcutsCodes)
		},
		onEditManage () {
			this.addManage = true
			this.clearManage = true
		},
		onSaveManage () {
			let shortcutsIds = this.shortcutsList.map(item => {
				return item.id
			})
			let params = {
				shortcuts: shortcutsIds.join(',')
			}
			this.$fxHttp.requestGet({
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/function/saveShortcuts`,
				data: params
			}).then(res => {
				this.$fxToast.success(res.message)
				this.setOrderItem(Object.keys(res.functionMapData[0]))
			}).catch(() => {
				this.getShortcuts()
			})
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.inteledi-home {
	.home-title-icon {
		width:50px
		height:100%
		background-image:url('~images/icon/icon-ursename.png')
		background-repeat:no-repeat
		background-position: center
		background-size: 20px
		display:inline-block
	}
	.home-date-bar {
		padding-left:10px
		padding-right:10px
		margin-top:10px
		margin-bottom:10px
		.home-date-bar-content {
			position:relative
			text-align:left
			text-indent:20px
			font-size:16px
			letter-spacing:1px
			&:before {
				content: ''
				position:absolute
				top:0
				left:0
				width:3px
				height:20px
				background-color:$fxBlue
			}
		}
	}
	.home-content {
		flex: 1
		overflow: scroll
		.order-manage {
			width:330px
			margin:0 auto
			padding:10px 0
			&.order-shortcuts {
				margin-bottom: 8px
			}
		}
		.order-type {
			margin-bottom: 10px
		}
		.order-food {
			margin-bottom: 53px
		}
	}
	.me-menu-popup {
		height:100%
	}
}
</style>
