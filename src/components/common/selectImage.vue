<template>
	<div
		class="bomSelectImage"
		v-show="picture.length || !isDisabled"
	>
		<div
			v-show="picture"
			v-for="(item, i) in picture"
			:key="i+item.imagUrl"
		>
			<img :src="item.imagUrl"/>
			<van-icon
				size="20px"
				name="clear"
				class="img-del"
				color="#FC4E49"
				@click="del(item, i)"
				v-show="!isDisabled"
			/>
		</div>
		<div
			v-show="!isDisabled && (!picture || picture.length<uploadAble)"
			@click="showSelect"
		>
			<img src="~images/icon/icon-upload-photo.png"/>
		</div>
	</div>
</template>

<script>
import picture from '@/assets/images/img/picture.js'
export default {
	name: 'selectImage',
	props: {
		selcetPictureMode: {
			type: Object,
			default: () => {}
		},
		currentItemData: {
			type: Object,
			default: () => {}
		},
		uploadAble: {
			type: Number,
			default: 1
		},
		isDisabled: {
			type: Boolean,
			default: false
		}
	},
	data () {
		return {
			picture: [],
			delArr: []
		}
	},
	methods: {
		add (src) {
			this.picture.push({
				imagUrl: src,
				type: 'add'
			})
		},
		del (item, i) {
			if (item.type !== 'add') {
				this.delArr.push(item)
			}
			this.picture.splice(i, 1)
		},
		showSelect () {
			this.$emit('on-selcet-iamge')
		},
		getPictureData (val) {
			if (process.env.NODE_ENV === 'development') {
				this.add(picture)
			} else {
				if (this.$fxCordova && this.$fxCordova.camera) {
					this.$fxCordova.camera[`getPictureBy${val}`]()
						.then(res => {
							this.add(`data:image/jpeg;base64,${res}`)
						})
				} else {
					this.$fxToast.fail('未获取到$fxCordova')
				}
			}
		}
	},
	watch: {
		currentItemData: {
			handler (n) {
				this.picture = n && n.images ? JSON.parse(JSON.stringify(n.images)) : []
				this.delArr = []
			},
			immediate: true
		},
		selcetPictureMode: {
			handler (n) {
				n.value && this.getPictureData(n.value)
			}
		},
		picture: {
			handler (n) {
				this.$emit('pictureChange', n, this.delArr)
			}
		}
	}
}
</script>

<style lang="stylus" scoped>
.bomSelectImage {
	height: auto;
	padding 10px;
	overflow: hidden;
	&>div {
		float: left;
		width: 140px;
		height: 140px;
		margin-right: 15px
		position: relative;
		img {
			width: 100%;
			height: 100%;
			border-radius: 4px;
		}
		.img-del {
			top: 0;
			right: -17px;
			position: absolute;
			z-index: 9999;
		}
	}
}
</style>
