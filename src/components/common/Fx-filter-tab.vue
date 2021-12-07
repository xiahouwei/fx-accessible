<template>
	<div class="fx-filter-tab fx-shadow-down">
		<div class="fx-filter-tab__item">
			<div class="filter-item" v-show="leftTabType" @click="onLeftTabClick">
				<span>{{leftTabLabel}}</span>
				<van-icon name="arrow-down" class="filter-arrow" />
				<span>{{leftTabValue}}</span>
			</div>
		</div>
		<div class="fx-filter-tab__item">
			<div class="filter-item" v-show="rightTabType" @click="onRightTabClick">
				<span>{{rightTabLabel}}</span>
				<van-icon name="arrow-down" class="filter-arrow" />
				<span>{{rightTabValue}}</span>
			</div>
		</div>
		<w-action-sheet
			ref="stateActionSheet"
			v-model="stateActionShow"
			:actions="stateActions"
		></w-action-sheet>
	</div>
</template>

<script>
import FILTER_CONFIG from '@/config/state_filter_config'
export default {
	name: 'fx-filter-tab',
	props: {
		leftTabState: String,
		rightTabState: String,
		leftTabType: String,
		rightTabType: String
	},
	data () {
		return {
			stateActionShow: false,
			stateActions: []
		}
	},
	computed: {
		leftTabLabel () {
			return this.leftTabType ? FILTER_CONFIG[this.leftTabType].name : ''
		},
		rightTabLabel () {
			return this.rightTabType ? FILTER_CONFIG[this.rightTabType].name : ''
		},
		leftTabValue () {
			const state = FILTER_CONFIG[this.leftTabType].actions.find(item => {
				return item.id === this.leftTabState
			})
			return this.leftTabType ? state && state.name : ''
		},
		rightTabValue () {
			return this.rightTabType ? FILTER_CONFIG[this.rightTabType].actions.find(item => {
				return item.id === this.rightTabState
			}).name : ''
		}
	},
	methods: {
		onLeftTabClick () {
			this.stateActions = FILTER_CONFIG[this.leftTabType].actions
			this.$refs.stateActionSheet.doSelect().then(item => {
				this.$emit('on-left-tab-select', item)
			})
		},
		onRightTabClick () {
			this.stateActions = FILTER_CONFIG[this.rightTabType].actions
			this.$refs.stateActionSheet.doSelect().then(item => {
				this.$emit('on-right-tab-select', item)
			})
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.fx-filter-tab {
	display: flex;
	flex-direction: row;
	height:50px
	line-height:50px
	border-bottom:1px solid $fxBorder
	box-shadow:0px 2px 6px $fxBorder
	font-size:14px
	&__item {
		flex:1
		position:relative
		&:not(:last-of-type) {
			&::after {
				content:''
				width:1px
				height:30px
				position:absolute
				top:10px
				right:0
				background-color:$fxBorder
			}
		}
	}
	.filter-arrow {
		margin-left:10px
		margin-right:20px
	}
}
</style>
