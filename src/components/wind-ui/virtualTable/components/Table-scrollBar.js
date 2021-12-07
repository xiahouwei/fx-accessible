import { TABLE_NAME } from '../js/config.js'
export default {
	name: 'windTableScrollBar',
	props: {
		type: {
			type: String,
			default: 'y'
		},
		translateY: {
			type: Number,
			default: 0
		},
		translateX: {
			type: Number,
			default: 0
		},
		length: Number
	},
	data () {
		return {
			visiable: false,
			timer: null
		}
	},
	destroyed () {
		clearTimeout(this.timer)
	},
	watch: {
		translateY () {
			this.visibleHandler()
		},
		translateX () {
			this.visibleHandler()
		}
	},
	methods: {
		initBarLength (viewLength, scrollPageLength) {
			if (scrollPageLength <= viewLength) {
				return 0
			}
			const barLength = viewLength / scrollPageLength * viewLength
			return barLength < 10 ? 10 : barLength
		},
		visibleHandler () {
			clearTimeout(this.timer)
			this.visiable = true
			this.timer = setTimeout(() => {
				this.visiable = false
			}, 1000)
		}
	},
	render (h) {
		return h('div', {
			class: [`${TABLE_NAME}__scrollBar-container`, `table-scrollBar-${this.type}`]
		}, [h('div', {
			class: [`${TABLE_NAME}__scrollBar`, `table-scrollBar-${this.type}`],
			style: {
				opacity: this.visiable ? 1 : 0,
				[this.type === 'y' ? 'height' : 'width']: `${this.length}px`,
				transform: `translate3d(${this.translateX}px, ${this.translateY}px, 0px)`
			}
		})])
	}
}
