<template>
	<div class="item-list" ref="details-content">
		<div
			v-for="(storeItem, storeIndex) in data"
			:key="storeItem.id"
			class="store-row"
			v-show="$fxCommon.storeFilter(storeItem, searchKey)"
		>
			<div class="item-store-title fx-title fx-ellipsis">{{storeItem.name}}</div>
			<div
				v-show="item.changeType !== 'del'"
				v-for="(item, itemIndex) in $fxCommon.detailFilter(storeItem.details, searchKey)"
				:ref="`details-row-${storeIndex}-${itemIndex}`"
				:key="`${storeItem.id}-${item.goodsDTO.id}`"
				class="item-row"
				:class="{
					'is-active':rowActive[0]===storeIndex && rowActive[1]===itemIndex
				}"
				@click="onItemClick(storeIndex, itemIndex)"
			>
				<checkBox
					:visibleFlag="true"
					:checked="item.checked"
					class="order-checkbox"
					@on-checkbox-click="onClick(item, `${storeItem.id}-${item.goodsDTO.id}`)"></checkBox>
				<itemInfoCell
					:ref="`itemInfoCell-${storeItem.id}-${item.goodsDTO.id}`"
					v-bind="$attrs"
					:itemData="item"
					:isDisabled="true"
					:disabledEditBtn="true"
					:disabledWatchBtn="true"
					class="order-item-cell"
				>
				</itemInfoCell>
			</div>
		</div>
	</div>
</template>

<script>
import itemInfoCell from '@/components/shopOrder/common/ItemInfoCell.vue'
import checkBox from '@/components/common/CheckBox.vue'
export default {
	name: 'oftenItemList',
	components: {
		itemInfoCell,
		checkBox
	},
	props: {
		data: {
			type: Array,
			default: () => {
				return []
			}
		},
		amount: [Number, String],
		rowActive: [Number, String, Array],
		searchKey: {
			type: String,
			default: () => {
				return ''
			}
		}
	},
	inheritAttrs: false,
	data () {
		return {
		}
	},
	watch: {
		amount: {
			handler (val) {
				if (val >= 0) {
					this.itemChange(val)
				}
			}
		}
	},
	computed: {
		storeShowComputed (storeItem) {
			return (storeItem) => {
				let hasDetails = storeItem.details.filter(item => {
					return item.changeType !== 'del'
				}).length
				return hasDetails > 0
			}
		}
	},
	methods: {
		onClick (item, uuid) {
			if (this.focusing) { // input不符合验证规则
				return false
			}
			if (item.checked) {
				if (item.must) { // 品项是必选的
					return false
				}
				item.busUnitAmount = 0
				item.consultMoney = 0
				this.$set(item, 'checked', !item.checked)
			}
		},
		onItemClick (storeIndex, itemIndex) {
			this.$emit('on-item-click', [storeIndex, itemIndex])
		},
		itemChange (val) {
			let item = this.$fxCommon.detailFilter(this.data[this.rowActive[0]].details, this.searchKey)[this.rowActive[1]]
			item.busUnitAmount = val
			let checked = false
			if (val > 0) {
				checked = true
			}
			this.$set(item, 'checked', checked)
			// 复位amount，便于下次监听修改
			this.$emit('update:amount', -1)
		},
		onSelectLetter (indexs, distance = 40) {
			let detailsRowRef = this.$refs[`details-row-${indexs[0]}-${indexs[1]}`]
			if (!detailsRowRef || detailsRowRef.length === 0) {
				return false
			}
			let offsetTop = detailsRowRef[0].offsetTop - 5
			let $el = this.$refs['details-content']
			this.$fxUtils.scrollTopW({ offsetTop, $el, distance })
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
@import '~$assets/stylus/extend.styl'
.item-list {
	flex: 1
	overflow: scroll
	position: relative;
	.item-store-title {
		height: 40px
		line-height: 40px
		text-indent: 24px
		background-image:url('~images/icon/wind-ui/icon-house.svg')
		background-repeat: no-repeat
		background-position: 0 50%
	}
	.item-row {
		border-bottom: 1px solid $fxBorder
		display: flex;
		flex-direction: row
		align-items: center
	}
	.item-row.is-active {
		border-color: $fxDefaultColor
		border-top-width: 1px
		border-top-style: solid
		border-bottom-width: 1px
		border-bottom-style: solid
	}
	.order-checkbox {
		width: 25px
	}
	.order-item-cell {
		overflow: hidden
	}
}
</style>
