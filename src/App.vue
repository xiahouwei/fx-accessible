<template>
	<div id="app">
		<transition :name="transitionName" mode="out-in">
			<keep-alive :include="keepAlives">
				<router-view ></router-view>
			</keep-alive>
		</transition>
	</div>
</template>
<script>
import { mapState } from 'vuex'
import backbutton from '@/js/mixin/backbutton'
import appversion from '@/js/mixin/appversion'
import keepAlives from '@/config/keep_alive_config.js'
const pathHistory = []
export default {
	name: 'app',
	mixins: [backbutton, appversion],
	data () {
		return {
			transitionName: 'page-next',
			keepAlives
		}
	},
	computed: {
		...mapState({
			fontSizeType: state => state.stylusDynamic.fontSizeType
		})
	},
	watch: {
		$route (to, from) {
			const len = pathHistory.length - 1
			if (len >= 0 && pathHistory[len] === to.path) {
				pathHistory.pop()
				this.transitionName = 'page-fade-in-left'
			} else {
				pathHistory.push(from.path)
				this.transitionName = 'page-fade-in-right'
			}
		}
	},
	mounted () {
		this.$fxStylusDynamic.setStyle('fontSizeType', this.fontSizeType)
	}
}
</script>
<style lang="stylus">
#app {
	text-align center
	height:100%
}
.page-fade-in-right-enter-active {
	animation: fadeinR .5s;
}
.page-fade-in-left-enter-active {
	animation: fadeinL .5s;
}
@keyframes fadeinR {
	0% {
	opacity: 0;
	transform: translateX(100%);
	}
	100% {
	opacity:1;
	transform:translateX(0);
	}
}
@keyframes fadeinL{
	0% {
	opacity: 0;
	transform: translateX(-100%);
	}
	100% {
	opacity: 1;
	transform: translateX(0);
	}
}
[v-cloak] {
	display: none;
}
</style>

