<template>
	<Cell
		:title="title"
		:value="value"
		title-class="wind-cell-title"
		value-class="wind-cell-value"
		@click="onCellClick"
	>
		<slot></slot>
		<Icon
			v-show="isLink"
			slot="right-icon"
			name="arrow"
			class="wind-cell-right-icon"
			@click.stop="onCellClick"
		/>
		<Icon
			v-show="isClear"
			slot="right-icon"
			name="close"
			class="wind-cell-right-icon"
			@click.stop="onCellClear"
		/>
	</Cell>
</template>

<script>
/* cell by shw 2020/5/26
 * @desc 筛选条件-单元格 主要用于用户筛选条件时,提供条件单元格
 *
 * @param {title} [str] - 标题
 * @param {value}  [str]
 *
 * @event {on-click} 选择时触发
 * @event {on-clear} 点击clear按钮时触发
 */
import { Cell, Icon } from 'vant'
export default {
	name: 'w-cell',
	components: {
		Cell,
		Icon
	},
	props: {
		title: String,
		value: null,
		showCloseBtn: Boolean,
		disabled: Boolean,
		isLink: Boolean,
		isClear: Boolean
	},
	methods: {
		onCellClick () {
			if (this.disabled) {
				return false
			}
			this.$emit('click')
		},
		onCellClear () {
			if (this.disabled) {
				return false
			}
			this.$emit('on-clear')
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.wind-cell-title {
	flex: none;
	width: 100px
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
}
.wind-cell-value {
	text-overflow: ellipsis;
	white-space: nowrap;
}
.wind-cell-right-icon {
	width:16px
	height:24px
	line-height:24px
	margin-left:5px
	color: $fxGraylight
	display: flex;
	align-items: center;
}
</style>
