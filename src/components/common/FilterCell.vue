<template>
	<van-cell
		:title="title"
		:value="value"
		value-class="filter-cell-value"
		@click="onCellClick"
	>
		<van-icon
			slot="right-icon"
			:name="showCloseBtn ? 'close' : 'arrow'"
			class="filter-cell-right-icon"
			@click.stop="showCloseBtn ? onCellClear() : onCellClick()"
		/>
	</van-cell>
</template>

<script>
/* filterCell by shw 2019/10/30
 * @desc 筛选条件-单元格 主要用于用户筛选条件时,提供条件单元格
 *
 * @param {title} [str] - 标题
 * @param {value}  [str]
 *
 * @event {on-click} 选择时触发
 * @event {on-clear} 点击clear按钮时触发
 */
export default {
	name: 'filterCell',
	props: {
		title: String,
		value: null,
		showCloseBtn: Boolean,
		disabled: Boolean
	},
	methods: {
		onCellClick () {
			if (this.disabled) {
				return false
			}
			this.$emit('on-click')
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
.filter-cell-value {
	text-overflow: ellipsis;
	white-space: nowrap;
}
.filter-cell-right-icon {
	width:16px
	height:24px
	line-height:24px
	margin-left:5px
	color: $fxGraylight
	display: flex;
	align-items: center;
}
</style>
