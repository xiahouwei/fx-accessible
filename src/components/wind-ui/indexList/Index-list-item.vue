<template>
	<li class="wind-index-list-item">
	<p class="wind-index-list-item-index" :id="`list-item-${index}`">{{ index }}</p>
	<ul>
		<slot></slot>
	</ul>
	</li>
</template>

<script type="text/babel">
/**
 * index-list-item by shang 2018/1/18
 * @desc index-list-item 标签选项
 * @param {index} [String] - index(must)
 *
 */
export default {
	name: 'w-index-list-item',
	props: {
		index: {
			type: String,
			required: true
		}
	},
	// create list-item array
	mounted () {
		this.$parent.itemArr.push(this)
	},
	// router leave hook : delete list-item in array
	beforeDestroy () {
		let index = this.$parent.itemArr.indexOf(this)
		if (index > -1) {
			this.$parent.itemArr.splice(index, 1)
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.wind-index-list-item {
	margin:0;
	padding:0;
	width:100%;
	line-height: 1.5;
}
.wind-index-list-item-index {
	margin: 0;
	padding: 10px;
	background-color: #fafafa;
	text-align: left;
	font-size: 14px;
}
</style>
