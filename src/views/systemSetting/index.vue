<template>
	<div class="sys-wrap">
		<w-header title="系统设置" :border="true"></w-header>
		<div class="sys-content">
			<van-cell-group>
				<van-cell title="字体大小" :value="fomatterFontType(fontSize)" value-class="info-item-value" is-link @click="onFontSizeClick" />
			</van-cell-group>
		</div>
		<van-actionsheet
			v-model="stateActionShow"
			:actions="stateActions"
			cancel-text="取消"
			@select="onStateSelect"
		/>
	</div>
</template>

<script>
import { mapState } from 'vuex'
export default {
	name: 'systemSetting',
	components: {
	},
	data () {
		return {
			fontSize: '',
			stateActionShow: false,
			stateActions: [
				{ id: 'normal', name: '小' },
				{ id: 'big', name: '中' },
				{ id: 'large', name: '大' }
			]
		}
	},
	computed: {
		...mapState({
			fontSizeType: state => state.stylusDynamic.fontSizeType
		}),
		fomatterFontType (type) {
			return (type) => {
				if (type === 'big') {
					return '中'
				} else if (type === 'large') {
					return '大'
				} else {
					return '小'
				}
			}
		}
	},
	mounted () {
		this.fontSize = this.fontSizeType
	},
	methods: {
		onFontSizeClick () {
			this.stateActionShow = true
		},
		onStateSelect (item) {
			this.fontSize = item.id
			// type = ['normal', 'big', 'large']
			this.$store.commit({
				type: 'SET_STYLUS_DYNAMIC',
				fontSizeType: item.id
			})
			this.stateActionShow = false
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.sys-wrap {
	height:100%
	width: 100%
	text-align:left
	display: flex
	flex-direction: column
	background-color: $fxWhite
	.sys-content {
		flex:1
		overflow:scroll
		.info-item-value {
			text-overflow: ellipsis
			white-space: nowrap
		}
	}
}
</style>
