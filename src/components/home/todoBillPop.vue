<template>
	<div class="todoBill-popup">
		<w-header :title="todoBill.name" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div ref="filterContent" class="todoBill-content">
			<div v-for="(item, index) of todoBill.todos" :key="index">
				<div v-if="!item.moreTypes || item.moreTypes && item.moreTypes.length" class="popup-block fx-shadow-block" @click="onBillClick(item)">
					<div>
						<span class="block-left-icon"></span>
						<span>{{item.name}}（{{item.num}}）</span>
						<van-icon class="block-right-icon" name="arrow" />
					</div>
					<div v-for="(moreTypesItem, moreTypeindex) of item.moreTypes" :key="moreTypeindex" class="popup-block-more" @click="onBillClick(moreTypesItem)">
						<span class="block-left-icon"></span>
						<span>{{moreTypesItem.sname}}（{{moreTypesItem.num}}）</span>
						<van-icon class="block-right-icon" name="arrow" />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'todoBillPop',
	components: {
	},
	props: {
		visibleFlag: Boolean,
		todoBill: {
			type: Object,
			default: () => {
				return {}
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
	methods: {
		onCloseClick () {
			this.$emit('update:visibleFlag', false)
		},
		onBillClick (item) {
			this.$emit('todoBillClick', item)
			this.$emit('update:visibleFlag', false)
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.todoBill-popup {
	height:100%
	width: 100%
	text-align:left
	display: flex
	flex-direction: column
	.todoBill-content {
		flex:1
		overflow:scroll
		.info-item-value {
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.item-clear-btn {
			width:16px
			height:24px
			line-height:24px
			margin-left:5px
			color: $fxGraylight
		}
	}
	.popup-block {
		width:300px
		margin:10px auto
		padding:15px
		text-align:left
		.block-left-icon {
			display: inline-block
			width: 3px
			height: 15px
			background-color: #6cc089
			vertical-align: bottom
			margin-right: 10px
			border-radius: 3px
		}
		.block-right-icon {
			float: right
		}
		.popup-block-more {
			margin: 20px 0 0 15px
		}
	}
}
</style>
