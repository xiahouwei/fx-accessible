<template>
	<van-image-preview v-model="visible" :images="images"></van-image-preview>
</template>


<script type="text/babel">
export default {
	props: {
		images: {
			type: Array,
			default: () => {
				return []
			}
		}
	},
	data () {
		return {
			visible: false
		}
	},
	methods: {
		show () {
			this.visible = true
		},
		hide () {
			this.visible = false
		}
	}
}
</script>
