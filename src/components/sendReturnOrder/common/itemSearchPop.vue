<template>
	<div class="item-search-block">
		<w-header title="搜索品项" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div class="item-search clearfix">
			<van-search
				v-model="searchKey"
				placeholder="请输入搜索关键词"
				shape="round"
				/>
		</div>
		<div class="item-list" ref="details-content">
			<van-collapse v-model="activeStoreNames" :border="false">
				<van-collapse-item :name="storeItem.id"
					v-show="$fxCommon.storeFilter(storeItem, searchKey)"
					v-for="storeItem in data"
					:key="storeItem.id"
					class="store-row"
				>
					<div slot="title" class="item-store-title fx-ellipsis">{{storeItem.name}}</div>
					<van-swipe-cell
						v-show="item.changeType !== 'del'"
						v-for="(item, index) in $fxCommon.detailFilter(storeItem.details, searchKey)"
						:ref="`details-row-${storeItem.id}-${item.goodsDTO.id}`"
						:key="`${storeItem.id}-${item.goodsDTO.id}`"
						:right-width="80"
						:disabled="isDisabled || focusing"
						class="item-row"
					>
						<itemInfoCell
							:itemData="item"
							:isDisabled="isDisabled"
							:disabledEditBtn="focusing"
							v-on="$listeners"
							@on-item-focus="onItemFocus(arguments, `${storeItem.id}-${item.goodsDTO.id}`)"
							@on-item-blur="onItemBlur"
						></itemInfoCell>
						<div slot="right" class="item-row-delete" @click="onDeleteClick(item, index, storeItem.details)">删除</div>
					</van-swipe-cell>
				</van-collapse-item>
			</van-collapse>
		</div>
		<div class="search-bottom">
			<van-button
				v-show="!isDisabled"
				class="bottom-btn fx-no-radius"
				type="primary"
				@click="onSearchConfirm"
			>保存</van-button>
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
			<itemRowEditPop
				:visibleFlag.sync="itemRowEditPopShow"
				:itemData="itemEditRowData"
				:isDisabled="isDisabled"
				@on-Confirm="onEditRowConfirm"
			></itemRowEditPop>
		</van-popup>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import itemInfoCell from '@/components/sendReturnOrder/common/ItemInfoCell.vue'
import itemRowEditPop from '@/components/sendReturnOrder/common/ItemRowEditPop.vue'
export default {
	name: 'itemSearchPop',
	components: {
		itemInfoCell,
		itemRowEditPop
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
			unitActionShow: false,
			activeStoreNames: []
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
				}
			},
			immediate: true
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize'
		})
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
				this.$set(item, 'busUnitAmount', 0)
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
			let busUnitAmount = parseFloat(this.$fxUtils.toFixedSHW(item.busUnitAmount * rate, this.sysPointSize))
			item.unitDTO = unit
			item.busUnitAmount = busUnitAmount
			if (item.id) {
				item.changeType = 'edit'
			}
		},
		// }}}
		onSearchConfirm () {
			if (this.focusing) { // input不符合验证规则
				return false
			}
			this.$emit('on-search-confirm', this.data)
			this.$emit('update:visibleFlag', false)
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.item-search-block {
	height: 100%;
	background:$fxWhite
	display: flex
	flex-direction: column
	overflow-x: hidden
	.item-list {
		flex:1
		overflow:scroll
		position: relative
		text-align: left
		padding: 0 13px
		width: 350px
		.item-store-title {
			height:40px
			line-height:40px
			font-size:12px
			text-indent:10px
		}
		.item-row {
			border-bottom:1px solid $fxBorder
			.item-row-delete {
				background-color:$fxRed
				color:$fxWhite
				font-size: 15px
				width: 80px;
				height: 100%
				line-height: 80px;
				display: inline-block;
				text-align: center;
			}
		}
	}
	.search-bottom {
		width:100%
		display: flex
		flex-direction: row
		.bottom-btn {
			flex:1
			padding:0
			overflow:hidden
		}
	}
}
</style>
