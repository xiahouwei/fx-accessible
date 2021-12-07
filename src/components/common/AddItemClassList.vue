<template>
	<div class="add-item-class-content fx-vant-class-collapse">
		<div
			class="all-class"
			:class="{'is-active': value===''}"
			@click.stop="selectClass('')"
		>{{classTitle}}</div>
		<van-collapse v-model="activeNames" :accordion="true">
			<van-collapse-item
				v-for="item in itemClassList"
				:key="item.id"
				:name="item.id">
				<div slot="title" class="big-class">{{item.name}}</div>
				<van-cell
					v-for="smallItem in item.smallType"
					:key="smallItem.id"
					:title="smallItem.name"
					class="small-class"
					:class="{'is-active': value===smallItem.id}"
					@click.stop="selectClass(smallItem.id)"
				/>
			</van-collapse-item>
		</van-collapse>
	</div>
</template>

<script>
export default {
	name: 'addItemClassList',
	props: {
		value: [String, Number],
		itemClassList: {
			type: Array,
			default: () => {
				return []
			}
		},
		classTitle: {
			type: String,
			default: '全部品项'
		}
	},
	data () {
		return {
			activeNames: []
		}
	},
	methods: {
		selectClass (classId) {
			this.$emit('input', classId)
			this.$emit('on-select-class', classId)
			this.$emit('on-change-class', [classId, this.value])
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.add-item-class-content {
	width:120px
	overflow:scroll
	border-right:1px solid $fxBorder
	text-align:left
	.all-class {
		height:44px
		line-height:44px
		$fx-dynamic-font-size(12px)
		text-indent:14px
		&.is-active {
			background-color:$fxDefaultColor
			color:$fxWhite
		}
	}
	.big-class {
		width:100%
		$fx-dynamic-font-size(12px)
		overflow: hidden;
		text-overflow : ellipsis
		white-space: nowrap;
	}
	.small-class {
		width:100%
		$fx-dynamic-font-size(12px)
		overflow: hidden;
		&.is-active {
			background-color:$fxDefaultColor
			color:$fxWhite
		}
	}
}
</style>
