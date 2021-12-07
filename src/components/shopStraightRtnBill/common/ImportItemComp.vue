<template>
	<div class="import-bill">
		<w-header title="选择导入品项" :border="true" :leftOptions="leftOptions" @on-click-back="onCloseClick">
			<headSelectAllBtn slot="header-right" :active="isSelectAll" @click="onSelectAllClick"></headSelectAllBtn>
		</w-header>
		<div class="import-bill-content">
			<div
				v-show="storeItemData.length !== 0"
				v-for="storeItem in storeItemData"
				:key="storeItem.id"
				class="store-item-block fx-shadow-block"
			>
				<div class="item-store-title fx-ellipsis">{{storeItem.name}}</div>
				<importItemInfoCell
					v-for="item in storeItem.details"
					:key="`${storeItem.id}-${item.goodsDTO.id}`"
					:itemData="item"
				></importItemInfoCell>
			</div>
			<emptyBill v-show="storeItemData.length === 0" message="暂无可导入品项"></emptyBill>
		</div>
		<div class="import-bill-bottom">
			<van-button
				class="add-btn fx-no-radius"
				type="primary"
				@click="onImportConfirm"
			>导入品项</van-button>
		</div>
	</div>
</template>

<script>
import headSelectAllBtn from '@/components/common/HeadSelectAllBtn.vue'
import importItemInfoCell from '@/components/shopStraightRtnBill/common/ImportItemInfoCell.vue'
import emptyBill from '@/components/common/EmptyBill.vue'
export default {
	name: 'impportBill',
	components: {
		headSelectAllBtn,
		importItemInfoCell,
		emptyBill
	},
	props: {
		visibleFlag: Boolean,
		storeItemData: {
			type: Array,
			default: () => {
				return []
			}
		}
	},
	data () {
		return {
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			}
		}
	},
	computed: {
		isSelectAll () {
			let selectedAllFlag = true
			for (let i = 0; i < this.storeItemData.length; i++) {
				let unSelected = this.storeItemData[i].details.findIndex(item => {
					return item.checked !== true
				})
				if (~unSelected) {
					selectedAllFlag = false
					break
				}
			}
			return selectedAllFlag
		}
	},
	methods: {
		onCloseClick () {
			this.$emit('update:visibleFlag', false)
		},
		onSelectAllClick () {
			this.selectAllHandler()
		},
		selectAllHandler () {
			let flag = this.isSelectAll
			this.storeItemData.forEach(storeItem => {
				storeItem.details.forEach(item => {
					this.$set(item, 'checked', !flag)
				})
			})
		},
		onImportConfirm () {
			let selectItem = this.findSelectItem()
			let zeroSelectItem = selectItem.find(item => {
				return item.busUnitInAmount === 0 || !item.busUnitInAmount
			})
			if (zeroSelectItem) {
				this.$fxToast.fail('数量为0的品项不能导入！')
				return false
			}
			if (selectItem.length === 0) {
				this.$fxToast.fail('请选择导入品项')
				return false
			}
			this.$emit('on-item-import-confirm', this.findSelectItem())
		},
		findSelectItem () {
			return this.storeItemData.reduce((pre, cur) => {
				let selects = cur.details.filter(item => {
					return item.checked === true
				})
				pre.push(...selects)
				return pre
			}, [])
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.import-bill {
	height:100%
	background:$fxWhite
	display: flex
	flex-direction: column
	text-align:left
	.import-bill-content {
		flex:1
		overflow:scroll
		.store-item-block {
			width:340px
			margin:5px auto
			padding:5px
			.item-store-title {
				height:40px
				line-height:40px
				font-size:12px
				text-indent:10px
			}
		}
	}
	.import-bill-bottom {
		width:100%
		display: flex
		flex-direction: row
		.add-btn {
			width:100%
		}
	}
}
</style>

