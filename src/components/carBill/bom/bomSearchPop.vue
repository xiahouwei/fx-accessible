<template>
	<div class="item-search-block">
		<w-header title="搜索品项" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<searchHead :initSearch="visibleFlag" :searchKey.sync="searchKey" :selectActive="isSelectAll" @on-select-click="onSelectAllClick"></searchHead>
		<div class="item-list" ref="details-content">
			<van-swipe-cell
				v-for="(item, index) in $fxCommon.detailFilter(data, searchKey)"
				v-show="item.changeType !== 'del'"
				:ref="`details-row-${item.goodsDTO.id}`"
				:key="item.goodsDTO.id"
				class="item-row"
				:right-width="80"
				:disabled="isDisabled || focusing"
			>
				<div class="item-cell">
					<checkBox
						:visibleFlag="!isDisabled"
						:checked="item.checked"
						class="search-checkbox"
						@on-checkbox-click="onCheckBoxClick(item)"
					></checkBox>
					<bomInfoCell
						:itemData="item"
						:isDisabled="isDisabled"
						:disabledEditBtn="focusing"
						v-on="$listeners"
						@on-bom-focus="onItemFocus(arguments, `${item.goodsDTO.id}`)"
						@on-bom-blur="onItemBlur"
						@on-unit-edit="onUnitEdit"
						@on-bom-edit="onSearchItemEdit"
						class="search-info"
					></bomInfoCell>
				</div>
				<div slot="right" class="item-row-delete" @click="onDeleteClick(item, index, data)">删除</div>
			</van-swipe-cell>
		</div>
		<div class="search-bottom">
			<van-button
				v-show="!isDisabled"
				class="bottom-btn fx-no-radius"
				type="primary"
				@click="onSearchConfirm"
			>保存</van-button>
			<van-button
				v-show="!isDisabled && $fxAuth('carBill.delDetail')"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onSelectConfirm"
			>删除</van-button>
		</div>
		<van-actionsheet
			v-model="unitActionShow"
			:actions="unitActions"
			cancel-text="取消"
			@select="onUnitSelect"
		/>
		<van-popup
			v-model="itemRowEditPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<bomRowEditPop
				:visibleFlag.sync="itemRowEditPopShow"
				:bomData="itemEditRowData"
				:isDisabled="isDisabled"
				@on-Confirm="onEditRowConfirm"
			></bomRowEditPop>
		</van-popup>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import bomInfoCell from '@/components/carBill/bom/bomInfoCell.vue'
import bomRowEditPop from '@/components/carBill/bom/bomRowEditPop.vue'
import searchHead from '@/components/common/searchHead.vue'
import checkBox from '@/components/common/CheckBox.vue'
export default {
	name: 'bomSearchPop',
	components: {
		bomInfoCell,
		bomRowEditPop,
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
		visibleFlag: Boolean
	},
	data () {
		return {
			focusing: false,
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			searchKey: '',
			itemRowEditPopShow: false,
			itemEditRowData: {},
			unitActions: [],
			unitActionShow: false
		}
	},
	watch: {
		visibleFlag: {
			handler (val) {
				if (val) {
					this.searchKey = ''
				}
			},
			immediate: true
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize'
		}),
		isSelectAll () {
			// 单据下发称重或者单据审核全选按钮隐藏
			if (this.isDisabled) {
				return ''
			}
			let selectItemL = 0
			let dataL = 0
			let searchItems = this.$fxCommon.detailFilter(this.data, this.searchKey)
			selectItemL = searchItems.filter(item => {
				return item.changeType !== 'del' && item.checked
			}).length
			dataL = searchItems.length

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
		onCloseClick () {
			if (this.focusing) { // input不符合验证规则
				return false
			}
			this.$emit('update:visibleFlag', false)
		},
		onDeleteClick (item, index, details) {
			if (item.id) {
				this.$set(item, 'changeType', 'del')
				this.$set(item, 'factCount', 0)
			} else {
				details.splice(index, 1)
			}
		},
		onItemFocus (arg, uuid) {
			this.focusing = true
		},
		onItemBlur () {
			this.focusing = false
		},
		// {{{ 编辑行其他数据
		onSearchItemEdit (itemData) {
			this.itemEditRowData = itemData
			this.itemRowEditPopShow = true
		},
		onEditRowConfirm (item) {
			let index = this.data.findIndex(detailsItem => {
				return detailsItem.id === item.id
			})
			if (~index) {
				this.data[index] = item
			}
		},
		// }}}
		// {{{ 修改单位
		onUnitEdit (item) {
			this.itemEditRowData = item
			this.getItemUnit(item.goodsDTO.id).then(res => {
				this.unitActions = res
				this.unitActionShow = true
			})
		},
		getItemUnit (goodsId) {
			return new Promise(resolve => {
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/shopId/users/userId/goods/${goodsId}/units`,
					query: {
						userId: this.loginerId
					}
				}).then(res => {
					resolve(res.units)
				})
			})
		},
		onUnitSelect (unit) {
			this.unitActionShow = false
			let item = this.itemEditRowData
			let tempUnit = item.unitDTO
			let rate = tempUnit.value / unit.value
			let factCount = parseFloat(this.$fxUtils.toFixedSHW(item.factCount * rate, this.sysPointSize))
			item.unitDTO = unit
			item.factCount = factCount
			if (item.id) {
				item.changeType = 'edit'
			}
		},
		// }}}
		onSearchConfirm () {
			if (this.focusing) { // input不符合验证规则
				return false
			}
			// 去除被选状态
			this.data.forEach(item => {
				delete item.checked
			})
			this.$emit('on-search-confirm', this.data)
			this.$emit('update:visibleFlag', false)
		},
		// {{{ 删除
		onCheckBoxClick (item) {
			if (this.focusing) { // input不符合验证规则
				return false
			}
			this.$set(item, 'checked', !item.checked)
		},
		onSelectAllClick () {
			let flag = !this.isSelectAll
			let searchItem = this.$fxCommon.detailFilter(this.data, this.searchKey)
			searchItem.forEach(item => {
				if (item.changeType !== 'del') {
					this.$set(item, 'checked', flag)
				}
			})
		},
		onSelectConfirm () {
			let checkedItem = this.data.find(item => {
				return item.checked && item.changeType !== 'del'
			})
			if (!checkedItem) {
				this.$fxToast.top('请先选择品项!')
				return true
			}
			this.$dialog.confirm({
				title: '提示',
				message: '是否删除？'
			}).then(() => {
				let details = this.data
				for (let i = details.length - 1; i >= 0; i--) {
					let item = details[i]
					if (!item.checked) {
						continue
					}
					if (item.id) {
						this.$set(item, 'changeType', 'del')
					} else {
						this.data.splice(i, 1)
					}
				}
			})
		}
		// }}}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.item-search-block {
	height: 100%
	background: $fxWhite
	display: flex
	flex-direction: column
	overflow-x: hidden
	.item-list {
		flex: 1
		overflow: scroll
		position: relative
		text-align: left
		padding: 0 13px
		width: 350px
		.item-store-title {
			height: 40px
			line-height: 40px
			font-size: 12px
			text-indent: 10px
		}
		.item-row {
			border-bottom: 1px solid $fxBorder
			.item-row-delete {
				background-color: $fxRed
				color: $fxWhite
				font-size: 15px
				width: 80px
				height: 100%
				line-height: 80px
				display: inline-block
				text-align: center
			}
		}
		.search-checkbox {
			width: 25px
		}
		.item-cell {
			display: flex
			flex-flow: row
			align-items: center
		}
		.search-info {
			flex: 1
			overflow-x: hidden
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
