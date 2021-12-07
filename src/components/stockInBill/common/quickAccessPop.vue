<template>
	<div class="item-search-block">
		<w-header title="快速生成部门领用" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<searchHead :initSearch="visibleFlag" :searchKey.sync="searchKey" :selectActive="isSelectAll" @on-select-click="onSelectAllClick"></searchHead>
		<div class="order-info-block fx-shadow-block">
			<van-cell-group>
				<van-cell title="领用部门" :value="department" class="info-item" value-class="info-item-value" is-link @click="onDepartmentClick" />
			</van-cell-group>
		</div>
		<div class="item-list" ref="details-content">
			<van-collapse v-model="activeStoreNames" :border="false">
				<van-collapse-item :name="storeItem.id"
                   v-for="storeItem in data"
                   :key="storeItem.id"
                   class="store-row"
                   v-show="storeShowComputed(storeItem)"
				>
					<div slot="title" class="item-store-title-container">
						<div class="item-store-title">
							<div class="fx-ellipsis">{{storeItem.name}}</div>
						</div>
					</div>
					<div
						v-for="(item, index) in detailFilter(storeItem.details)"
						:key="`${storeItem.id}-${item.goodsDTO.id}-${index}`"
						class="item-row"
						v-show="item.changeType !== 'del'"
						:ref="`details-row-${storeItem.id}-${item.goodsDTO.id}`"
					>
						<div class="item-cell">
							<checkBox
								:visibleFlag="true"
								:checked="item.checked"
								class="search-checkbox"
								@on-checkbox-click="onCheckBoxClick(item)"
							></checkBox>
							<itemInfoCell
								:itemData="item"
								:isDisabled="isDisabled"
								@on-item-edit="onSearchItemEdit"
								class="search-info"
							></itemInfoCell>
						</div>
					</div>
				</van-collapse-item>
			</van-collapse>
		</div>
		<div class="search-bottom">
			<van-button
				class="bottom-btn fx-no-radius"
				type="primary"
				@click="onConfirm"
			>确认</van-button>
		</div>
		<van-popup
			v-model="itemRowEditPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<itemRowEditPop
				:visibleFlag.sync="itemRowEditPopShow"
				:itemData="itemEditRowData"
				:isDisabled="true"
			></itemRowEditPop>
		</van-popup>
		<filterListPopup
			v-model="departmentPopShow"
			title="部门检索"
			:rollingLoad="true"
			:getDataApi="getDepartmentListData"
			@on-select="selectDepartment"
		></filterListPopup>
	</div>
</template>

<script>
import filterListPopup from '@/components/common/FilterListPopup.vue'
import itemInfoCell from '@/components/stockInBill/common/ItemInfoCell.vue'
import itemRowEditPop from '@/components/stockInBill/common/ItemRowEditPop.vue'
import searchHead from '@/components/common/searchHead.vue'
import checkBox from '@/components/common/CheckBox.vue'
export default {
	name: 'quickAccessPop',
	components: {
		filterListPopup,
		itemInfoCell,
		itemRowEditPop,
		searchHead,
		checkBox
	},
	props: {
		data: {
			type: Array,
			default: () => {
				return []
			}
		},
		isDisabled: Boolean,
		visibleFlag: Boolean,
		shopId: String,
		billId: {
			type: String,
			default: () => {
				return ''
			}
		}
	},
	data () {
		return {
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			searchKey: '',
			itemRowEditPopShow: false,
			itemEditRowData: {},
			activeStoreNames: [],
			department: '请选择',
			departmentId: '',
			departmentPopShow: false,
			departmentList: []
		}
	},
	watch: {
		visibleFlag: {
			handler (val) {
				if (val) {
					this.searchKey = ''
					// 展开折叠
					this.data.forEach(storeItem => {
						let hasDetails = storeItem.details.filter(item => {
							return item.changeType !== 'del'
						}).length
						if (hasDetails > 0) {
							this.activeStoreNames.push(storeItem.id)
						}
					})
					// 设置默认部门
					this.setDefaultDepartment()
				}
			},
			immediate: true
		}
	},
	computed: {
		isSelectAll () {
			let selectItemL = 0
			let dataL = 0
			this.data.forEach(storeItem => {
				let searchItems = this.detailFilter(storeItem.details)
				selectItemL += searchItems.filter(item => {
					return item.changeType !== 'del' && item.checked
				}).length
				dataL += searchItems.length
			})
			if (selectItemL === 0) {
				return false
			} else if (selectItemL === dataL) {
				return true
			} else {
				return false
			}
		}
	},
	methods: {
		storeShowComputed (store) {
			return this.detailFilter(store.details).length > 0
		},
		detailFilter (items, searchKeywords = 'code,name,pinYin') {
			return items.filter(item => {
				return item.changeType !== 'del' && !!searchKeywords.split(',').find(itemKey => {
					if (item.goodsDTO[itemKey].toLowerCase().includes(this.searchKey.toLowerCase())) {
						return true
					}
				})
			})
		},
		onCloseClick () {
			this.$emit('update:visibleFlag', false)
		},
		// {{{ 编辑行其他数据
		onSearchItemEdit (itemData) {
			this.itemEditRowData = itemData
			this.itemRowEditPopShow = true
		},
		// }}}
		checkSelectInfo () {
			return new Promise(resolve => {
				let checkedItem = this.data.filter(storeItem => {
					return storeItem.details.find(item => {
						return item.checked && item.changeType !== 'del'
					})
				})
				if (checkedItem.length === 0) {
					this.$fxToast.top('请先选择品项!')
					return false
				}
				if (!this.departmentId) {
					this.$fxToast.top('请先选择部门!')
					return false
				}
				resolve()
			})
		},
		getSaveParams () {
			let itemDetails = []
			this.data.forEach(item => {
				itemDetails.push(...item.details)
			})
			let selectedArr = itemDetails.reduce((pre, cur) => {
				let arr = cur.checked && cur.changeType !== 'del' ? pre.concat(cur.id) : pre
				return arr
			}, [])
			return selectedArr
		},
		onConfirm () {
			this.checkSelectInfo().then(() => {
				const params = {
					'billId': this.billId,
					'detailIds': this.getSaveParams(),
					'departmentId': this.departmentId
				}
				return this.$fxApi('stockInBill.quickAccess')({ data: params }).then(res => {
					this.$dialog.alert({
						title: '提示',
						message: res.message
					})
					this.$emit('update:visibleFlag', false)
				})
			})
		},
		// {{{
		onCheckBoxClick (item) {
			this.$set(item, 'checked', !item.checked)
		},
		onSelectAllClick () {
			let flag = !this.isSelectAll
			this.data.forEach(storeItem => {
				let searchItem = this.detailFilter(storeItem.details)
				searchItem.forEach(item => {
					if (item.changeType !== 'del') {
						this.$set(item, 'checked', flag)
					}
				})
			})
		},
		// }}}
		// {{{部门
		setDefaultDepartment () {
			let params = {
				start: 0,
				size: 1,
				id: this.shopId
			}
			return this.$fxApi('z5common.getDepartment')({ data: params }).then(res => {
				this.department = res.departmentDTOData[0].name
				this.departmentId = res.departmentDTOData[0].id
			})
		},
		onDepartmentClick () {
			this.departmentPopShow = true
		},
		getDepartmentListData (keyword = null, start, size) {
			const params = {
				keyword: keyword,
				start,
				size,
				id: this.shopId
			}
			return this.$fxApi('z5common.getDepartment')({ data: params }).then(res => {
				return res.departmentDTOData
			})
		},
		selectDepartment (item) {
			this.department = item.name
			this.departmentId = item.id
		}
		// }}}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
@import '~$assets/stylus/extend.styl'
.item-search-block {
	height: 100%
	background: $fxWhite
	display: flex
	flex-direction: column
	overflow-x: hidden
	.order-info-block {
		text-align:left
		.van-cell-group::after {
			border-width: 0 0
		}
		.info-item {
			font-size: 12px !important
			.info-item-value {
				text-overflow: ellipsis
				white-space: nowrap
			}
		}
	}
	.item-list {
		flex: 1
		overflow: scroll
		position: relative
		text-align: left
		padding: 0 13px
		width: 350px
		.item-store-title-container {
			display: flex
			flex-direction: row
			align-items: center
			font-size: 12px
			height: 40px
			.item-store-title {
				display: flex
				flex-direction: row
				justify-content: space-between
				align-items: center
				flex: 1
				margin-left: 10px
			}
		}
		.item-row {
			border-bottom:1px solid $fxBorder
		}
		.search-checkbox {
			width: 25px
		}
		.item-cell {
			display: flex
			flex-flow: row
			align-items: center
		}
		.search-info{
			flex: 1
			overflow: hidden
		}
	}
	.search-bottom {
		width: 100%
		display: flex
		flex-direction: row
		.bottom-btn {
			flex: 1
			padding: 0
			overflow: hidden
		}
	}
}
</style>
