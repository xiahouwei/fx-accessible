<template>
	<div class="item-search-block">
		<w-header title="搜索品项" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<searchHead :initSearch="visibleFlag" :searchKey.sync="searchKey" :beforeChange="onBeforeChange"></searchHead>
		<oftenItemList
			ref="addItemList"
			:data="currentData"
			:rowActive="rowActive"
			:amount.sync="amount"
			:searchKey="searchKey"
			class="often-item-list"
			@on-item-click="onItemClick"
		></oftenItemList>
		<div class="search-bottom">
			<van-button
				v-show="!isDisabled"
				class="bottom-btn fx-no-radius fx-btn"
				type="primary"
				@click="onSearchConfirm"
			>保存</van-button>
		</div>
		<div v-show="numberKeyboardShow" class="details-number-keyboard">
			<itemNumberKeyboard
				:title="keyboardTitleCompted"
				:amount="keyboardAmountCompted"
				:pointSize="sysPointSize"
				:intLength="numberLength"
				:unit="keyboardUnitCompted"
				:unitEdit="false"
				@change="onKeyboardChange"
				@pre="onKeyboardPre"
				@next="onKeyboardNext"
				@hide="onKeyboardHide"
			></itemNumberKeyboard>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import searchHead from '@/components/common/searchHead.vue'
import itemNumberKeyboard from '@/components/common/ItemNumberKeyboard.vue'
import oftenItemList from '@/components/shopOrder/oftenOrder/oftenItemList.vue'
export default {
	name: 'oftenItemSearchPop',
	components: {
		searchHead,
		itemNumberKeyboard,
		oftenItemList
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
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			currentData: [],
			searchKey: '',
			numberKeyboardShow: false,
			rowActive: [], // 0:仓库index 1:品项index
			amount: 0
		}
	},
	watch: {
		visibleFlag: {
			handler (val) {
				if (val) {
					this.searchKey = ''
					this.currentData = JSON.parse(JSON.stringify(this.data))
					this.resetHandler()
				}
			},
			immediate: true
		},
		rowActiveData: {
			handler (val, oldVal) {
				if (!this.currentData.length) {
					return true
				}
				if (oldVal.length) {
					let itemData = this.$fxCommon.detailFilter(this.currentData[oldVal[0]].details, this.searchKey)[oldVal[1]]
					itemData.busUnitAmount = parseFloat(itemData.busUnitAmount)
					if (!val.length) {
						this.numberKeyboardShow = false
					} else {
						this.scrollToActive(val)
					}
				} else {
					this.scrollToActive(val)
				}
			},
			deep: true
		}
	},
	computed: {
		...mapState({
			loginerId: state => state.loginer.loginerId,
			numberLength: 'numberLength',
			sysPointSize: 'sysPointSize'
		}),
		keyboardTitleCompted () {
			let indexs = this.rowActive
			if (!indexs.length || !this.data.length) {
				return ''
			} else {
				let indexs = this.rowActive
				let row = this.$fxCommon.detailFilter(this.currentData[indexs[0]].details, this.searchKey)[indexs[1]]
				return row.goodsDTO.name
			}
		},
		keyboardUnitCompted () {
			let indexs = this.rowActive
			if (!indexs.length || !this.data.length) {
				return ''
			} else {
				let indexs = this.rowActive
				let row = this.$fxCommon.detailFilter(this.currentData[indexs[0]].details, this.searchKey)[indexs[1]]
				return row.unitDTO.name
			}
		},
		keyboardAmountCompted () {
			let indexs = this.rowActive
			if (!indexs.length || !this.data.length) {
				return '0'
			} else {
				let row = this.$fxCommon.detailFilter(this.currentData[indexs[0]].details, this.searchKey)[indexs[1]]
				return row.busUnitAmount
			}
		},
		rowActiveData () {
			return [...this.rowActive]
		}
	},
	methods: {
		onCloseClick () {
			this.resetHandler()
			this.$emit('update:visibleFlag', false)
		},
		onItemClick (indexs) {
			this.rowActive = indexs
			this.numberKeyboardShow = true
		},
		// {{{ 搜索前事件
		onBeforeChange () {
			this.numberKeyboardShow = false
			this.rowActive = []
			return true
		},
		// }}}
		// {{{ 键盘
		onKeyboardChange (val) {
			this.amount = val
		},
		onKeyboardPre () {
			let rowActive = this.rowActive
			let data = this.currentData.filter(store => {
				return this.$fxCommon.storeFilter(store, this.searchKey)
			})
			if (!rowActive.length || (rowActive[0] === 0 && rowActive[1] === 0)) {
				return false
			}
			if (rowActive[1] === 0) { // 仓库里第一个
				rowActive[0]--
				rowActive[1] = this.$fxCommon.detailFilter(data[rowActive[0]].details, this.searchKey).length - 1
			} else {
				rowActive[1]--
			}
			this.$set(this.rowActive, 0, rowActive[0])
			this.$set(this.rowActive, 1, rowActive[1])
		},
		onKeyboardNext () {
			let rowActive = this.rowActive
			let data = this.currentData.filter(store => {
				return this.$fxCommon.storeFilter(store, this.searchKey)
			})
			if (!rowActive.length || (rowActive[0] === data.length - 1 && rowActive[1] === this.$fxCommon.detailFilter(data[data.length - 1].details, this.searchKey).length - 1)) {
				return false
			}
			if (rowActive[1] + 1 === this.$fxCommon.detailFilter(data[rowActive[0]].details, this.searchKey).length) { // 仓库里最后一个
				rowActive[0]++
				rowActive[1] = 0
			} else {
				rowActive[1]++
			}
			this.$set(this.rowActive, 0, rowActive[0])
			this.$set(this.rowActive, 1, rowActive[1])
		},
		onKeyboardHide () {
			this.rowActive = []
		},
		scrollToActive (indexs) {
			this.$nextTick(() => {
				this.$refs.addItemList.onSelectLetter(indexs, 20)
			})
		},
		// }}}
		// {{{ 保存
		onSearchConfirm () {
			this.resetHandler()
			let selectItem = this.findSelectItem()
			if (selectItem.length === 0) {
				this.$fxToast.fail('请选择常订品项，并填写订货数量')
				return false
			}
			this.$nextTick(() => {
				this.$emit('on-search-confirm', this.currentData)
				this.$emit('update:visibleFlag', false)
			})
		},
		findSelectItem () {
			let importData = []
			this.currentData.forEach(dataItem => {
				let selects = dataItem.details.filter(item => {
					if (item.checked === true) {
						item.changeType = 'add'
						return true
					} else {
						return false
					}
				})
				if (selects.length) {
					let selectData = JSON.parse(JSON.stringify(dataItem))
					selectData.details = selects
					importData.push(selectData)
				}
			})
			return importData
		},
		// }}}
		// {{{ 重置
		resetHandler () {
			this.rowActive = ''
			this.numberKeyboardShow = false
		}
		// }}}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
@import '~$assets/stylus/extend.styl'
.item-search-block {
	height: 100%;
	background:$fxWhite
	display: flex
	flex-direction: column
	overflow-x: hidden
	.often-item-list {
		padding: 0 10px
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
