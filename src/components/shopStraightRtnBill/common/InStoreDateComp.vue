<template>
	<div class="inStore-date">
		<div class="date-box">
			<div>入库日期</div>
			<div class="begin-date-box" @click="onEmitHandler('on-beginDate-click')">{{beginDate}}</div>
			<div>至</div>
			<div class="end-date-box" @click="onEmitHandler('on-endDate-click')">{{endDate}}</div>
		</div>
		<van-button type="primary" size="mini" round class="search-btn" @click="onEmitHandler('on-search-click')">查询</van-button>
	</div>
</template>

<script>
export default {
	name: 'inStoreDate',
	props: {
		beginDate: [String, Number],
		endDate: [String, Number]
	},
	methods: {
		onEmitHandler (type) {
			this.$emit(type)
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.inStore-date {
	display: flex
	flex-direction: row
	align-items: center
	border-bottom:1px solid #eee
	height:40px
	line-height:40px
	.date-box {
		display: flex
		flex-direction: row
		flex:1
		padding-left:10px
		.begin-date-box, .end-date-box {
			width:110px
		}
	}
	.search-btn {
		margin-right: 5px;
		margin-left: 5px;
	}
}
</style>

