<template>
	<div class="item-complete-block">
		<w-header :title="title" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div class="clearfix">
			<van-search
				v-model="searchKey"
				placeholder="请输入搜索关键词"
				shape="round"
				@search="onConfirmKey"
			/>
		</div>
		<div class="item-list" ref="details-content">
			<van-tabs
				v-model="activeName"
				:swipe-threshold="3"
				color="#538FFD"
			>
				<van-tab
					v-for="group in itemList"
					:title="group.groupName"
					:key="group.id"
				>
					<div class="item-btn-wrap">
						<van-button size="small" :plain="'1' === group.checkType" type="primary" @click="onCheckClick(group, '0')">未验收</van-button>
						<van-button size="small" :plain="'0' === group.checkType || !group.checkType" type="primary" @click="onCheckClick(group, '1')">已验收</van-button>
					</div>
					<div class="item-group-wrap">
						<div class="item-group-detail">
							<van-swipe-cell
								v-for="item in detailFilter(group.groupDetails)"
								v-show="(item.checkFlag === group.checkType) || (!group.checkType && item.checkFlag === '0')"
								ref="details-content"
								:key="item.id"
								class="store-row"
							>
								<ItemCompleteCell
									:itemData="item"
									:isDisabled="isDisabled"
									:disabledEditBtn="focusing"
									@on-edit-click="onEditClick"
									@on-complete-click="onCompleteClick"
									@on-upload-click="onUploadClick"
								></ItemCompleteCell>
							</van-swipe-cell>
						</div>
					</div>
				</van-tab>
			</van-tabs>
		</div>
		<van-popup
			v-model="numberKeyboardShow"
			position="bottom"
			:lock-scroll="false"
			@close="onNumberKeyboardClose"
		>
			<itemNumberKeyboard
				:title="keyboardTitleCompted"
				:unit="keyboardUnitCompted"
				:amount="keyboardAmountCompted"
				:pointSize="sysPointSize"
				:intLength="numberLength"
				@on-save-click="onKeyboardSave"
				@change="onKeyboardChange"
				@hide="onKeyboardHide"
			></itemNumberKeyboard>
		</van-popup>
		<van-actionsheet
			v-model="uploadActionShow"
			:actions="uploadActions"
			cancel-text="取消"
			@select="onUploadSelect"
		/>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import picture from '@/assets/images/img/picture.js'
import ItemCompleteCell from '@/components/unifyOrder/common/ItemCompleteCell.vue'
import itemNumberKeyboard from '@/components/unifyOrder/common/ItemCompNumberKeyboard.vue'
export default {
	name: 'itemCompletePop',
	components: {
		ItemCompleteCell,
		itemNumberKeyboard
	},
	props: {
		billId: String,
		data: {
			type: Array,
			default: () => {
				return []
			}
		},
		isDisabled: Boolean,
		visibleFlag: Boolean,
		searchKeywords: String,
		title: String,
		getCheckList: {
			type: Function,
			default: () => {
				console.log('prop function')
			}
		},
		completeHandle: {
			type: Function,
			default: () => {
				console.log('prop function')
			}
		}
	},
	data () {
		return {
			focusing: false,
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			searchKey: '',
			rowActiveItem: {},
			itemRowEditPopShow: false,
			itemEditRowData: {},
			unitActions: [],
			unitActionShow: false,
			activeStoreNames: [],
			itemList: [],
			searchItemId: '',
			activeName: 0,
			numberKeyboardShow: false,
			uploadItem: {},
			uploadActionShow: false,
			uploadActions: [
				{ id: 0, name: '拍摄' },
				{ id: 1, name: '从手机相册选择' }
			]
		}
	},
	watch: {
		visibleFlag: {
			handler (val) {
				if (val) {
					this.createDetails(this.data)
				}
			},
			immediate: true
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize',
			numberLength: 'numberLength',
			loginerId: state => state.loginer.loginerId,
			loginerShopId: state => state.loginer.loginerShopId
		}),
		keyboardTitleCompted () {
			if (!this.rowActiveItem.id) {
				return ''
			} else {
				let row = this.itemList[this.activeName].groupDetails.find(item => {
					return item.id === this.rowActiveItem.id
				})
				return row.goodsDTO.name
			}
		},
		keyboardUnitCompted () {
			if (!this.rowActiveItem.id) {
				return ''
			} else {
				let row = this.itemList[this.activeName].groupDetails.find(item => {
					return item.id === this.rowActiveItem.id
				})
				return row.unitDTO.name
			}
		},
		keyboardAmountCompted () {
			if (!this.rowActiveItem.id) {
				return '0'
			} else {
				let row = this.itemList[this.activeName].groupDetails.find(item => {
					return item.id === this.rowActiveItem.id
				})
				return row.checkAmount
			}
		}
	},
	methods: {
		createDetails (data, active, checkType) {
			this.searchKey = ''
			if (checkType && data[active]) data[active].checkType = checkType
			this.itemList = JSON.parse(JSON.stringify(data))
			this.searchItemId = ''
			this.activeName = active || 0
		},
		detailFilter (items) {
			return items.filter(item => {
				return !!this.searchKeywords.split(',').find(itemKey => {
					if (item.goodsDTO[itemKey].includes(this.searchKey)) {
						if (this.searchItemId && item.goodsDTO.id !== this.searchItemId) {
							return false
						} else {
							return true
						}
					}
				})
			})
		},
		onCloseClick () {
			if (this.focusing) { // input不符合验证规则
				return false
			}
			this.$emit('update:visibleFlag', false)
			this.$emit('on-complete-change')
		},
		// {{{扫码
		getItemByRedCode (redCode) {
			if (!this.visibleFlag) {
				return false
			}
			// redCode = '2231231231231001000'
			this.getItemByCode(redCode).then(res => {
				let goods = res.billAndDetails[0]
				if (goods.length === 0) {
					this.$fxToast.top('当前仓库无此品项!')
					return false
				}
				let showItem = null
				for (let i = 0; i < this.itemList.length; i++) {
					showItem = this.itemList[i].groupDetails.find(item => {
						return item.goodsDTO.id === goods.goodsDTO.id
					})
					if (showItem) {
						break
					}
				}
				if (showItem) {
					this.searchItemId = showItem.goodsDTO.id
					this.itemUpdate(goods)
				} else {
					this.$fxToast.top('无此品项!')
				}
				this.searchKey = ''
			})
		},
		itemUpdate (goods) {
			let selectItem = null
			for (let i = 0; i < this.itemList.length; i++) {
				selectItem = this.itemList[i].groupDetails.find(item => {
					return item.goodsDTO.id === goods.goodsDTO.id && item.checkFlag === '0'
				})
				if (selectItem) {
					break
				}
			}
			const unitDTO = selectItem.unitDTO
			const currentUnitDTO = goods.unitDTO
			const ratio = currentUnitDTO.value / unitDTO.value
			const countValue = selectItem.goodsDTO.countValue * ratio
			selectItem.checkAmount = this.toFixedNumberSize(countValue)
		},
		toFixedNumberSize (data) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysPointSize))
		},
		getItemByCode (barCodes) {
			return new Promise(resolve => {
				let params = {
					m: 'getGoodsByBarCode4Modify',
					barCodes: barCodes
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/goods`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		onConfirmKey () {
			if (this.searchKey !== '') {
				return true
			}
			this.searchItemId = ''
		},
		// }}}
		// {{{ 切换已验收未验收筛选
		onCheckClick (group, flag) {
			this.$set(group, 'checkType', flag)
		},
		// }}}
		// {{{ 上传照片
		onUploadClick (itemData) {
			this.uploadItem = itemData
			this.uploadActionShow = true
		},
		onUploadSelect (uploadType) {
			this.uploadActionShow = false
			let base64Str = ''
			if (process.env.NODE_ENV === 'development') {
				this.uploadImge(picture)
			} else {
				if (uploadType.id === 0) {
					// 通过相机 获取图片 返回base64图片
					this.$fxCordova.camera.getPictureByCamera().then(res => {
						base64Str = 'data:image/jpeg;base64,' + res
						this.uploadImge(base64Str)
					})
				} else {
					// 通过相册 获取图片 返回base64图片
					this.$fxCordova.camera.getPictureByLibrary().then(res => {
						base64Str = 'data:image/jpeg;base64,' + res
						this.uploadImge(base64Str)
					})
				}
			}
		},
		uploadImge (base64Str) {
			return new Promise(resolve => {
				// let params = [{
				// 	name: 'input_files[]',
				// 	value: base64Str
				// }]
				// if (this.uploadItem && this.uploadItem.images && Array.isArray(this.uploadItem.images) && this.uploadItem.images.length) {
				// 	params.push({
				// 		name: 'del_filename',
				// 		value: ''
				// 	})
				// }
				let params = {
					'input_files[]': [base64Str],
					'del_filename': []
				}
				this.$fxHttp.requestPost({
					// url: `${this.$fxBaseApi.url}/upload/detailId/${this.uploadItem.id}/uploadDetailPictures`,
					url: `${this.$fxBaseApi.url}/upload/detailId/${this.uploadItem.id}/uploadDetailPicturesMultipleWithMaxCount`,
					data: params
				}).then(res => {
					this.getCheckList().then(res => {
						/* 提示需放在所有接口请求完成后，否则将被覆盖 */
						this.$fxToast.success('照片上传成功！')
						this.createDetails(res.billDetailGroup, this.activeName, this.itemList[this.activeName].checkType || '')
					})
					resolve(res)
				})
			})
		},
		// }}}
		// {{{ 验收
		onCompleteClick (itemData, amount) {
			let groupAmount = 0
			if (amount !== undefined) {
				groupAmount = amount
			} else { // 点击键盘的时候，直接验收出库数
				groupAmount = itemData.rawAmount
			}
			let groupParam = {
				groupId: this.itemList[this.activeName].groupId,
				groupAmount: groupAmount,
				data: itemData,
				checkFlag: this.rowActiveItem.checkFlag // 已验收和未验收请求有区别，'1'为已验收
			}
			this.completeHandle(itemData, groupParam, this.billId).then(res => {
				this.getCheckList().then(res => {
					/* 验收成功后收起键盘，先置空rowActiveItem后将不触发收起事件中还原值的方法 */
					this.rowActiveItem = {}
					this.numberKeyboardShow = false
					this.createDetails(res.billDetailGroup, this.activeName, this.itemList[this.activeName].checkType || '')
					this.$fxToast.success('验收成功')
				})
			})
			/* let url
			let params = [{
				id: itemData.id,
				checkAmount: groupAmount
			}]
			已验收和未验收修改数据接口有区别
			if (this.rowActiveItem.checkFlag === '1') {
				url = `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}}/distributionindetails?m=updateCheckAmount`
			} else {
				url = `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/distributioninbills/${this.billId}?m=accept&groupId=${this.itemList[this.activeName].groupId}`
			}
			this.$fxHttp.requestPut({
				url,
				data: params
			}).then(res => {
				this.getCheckList().then(res => {
					/!* 验收成功后收起键盘，先置空rowActiveItem后将不触发收起事件中还原值的方法 *!/
					this.rowActiveItem = {}
					this.numberKeyboardShow = false
					this.createDetails(res.billDetailGroup, this.activeName, this.itemList[this.activeName].checkType || '')
					this.$fxToast.success('验收成功')
				})
			}) */
		},
		// }}}
		// {{{ 编辑验收数量
		onEditClick (item) {
			this.rowActiveItem = JSON.parse(JSON.stringify(item))
			this.numberKeyboardShow = true
		},
		// }}}
		// {{{ 模拟键盘
		onKeyboardSave () {
			let itemData = this.itemList[this.activeName].groupDetails.find(item => {
				return item.id === this.rowActiveItem.id
			})
			this.onCompleteClick(itemData, itemData.checkAmount)
		},
		onKeyboardChange (val) {
			this.changeSelectItem(val)
		},
		onKeyboardHide () {
			this.changeSelectItem(this.rowActiveItem.checkAmount)
			this.numberKeyboardShow = false
			this.rowActiveItem = {}
		},
		onNumberKeyboardClose () {
			this.changeSelectItem(this.rowActiveItem.checkAmount)
			this.rowActiveItem = {}
		},
		changeSelectItem (val) {
			let amount = this.toFixedNumberSize(val)
			let item = this.itemList[this.activeName].groupDetails.find(item => {
				return item.id === this.rowActiveItem.id
			})
			if (!item) {
				return false
			}
			item.checkAmount = val
			item.inMoney = this.toFixedNumberSize(parseFloat(item.price) * parseFloat(amount))
			item.taxInMoney = this.toFixedNumberSize(parseFloat(item.inMoney) * parseFloat(item.tax))
			item.inMoneyWithTax = this.toFixedNumberSize(parseFloat(item.inMoney) + parseFloat(item.taxInMoney))
		}
		// }}}
	}
}
</script>
<style lang="stylus">
.item-complete-block {
	.item-list .van-tab {
		min-width: 33.33%
	}
}
</style>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
@import '~$assets/stylus/extend.styl'
.item-complete-block {
	height: 100%
	background: $fxWhite
	display: flex
	flex-direction: column
	overflow-x: hidden
	.item-list {
		flex:  1
		overflow: hidden
		position: relative
		text-align: left
		padding: 0 13px
		width: 350px
		.item-group-wrap {
			overflow: auto
			height: 450px
			.item-group-detail {
				display: flex
				flex-wrap: wrap
				.store-row {
					padding: 8px
				}
			}
		}
	}
	.item-btn-wrap {
		padding: 10px 0px 7px 15px
	}
}
</style>
