<template>
	<div class="billUploaderEdit-popup">
		<w-header :title="'附件上传'" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div class="billUploaderEdit-content">
			<van-uploader :before-read="imagePreview" @oversize="onOversize" :after-read="onRead" :max-size="20971520" accept="image/*" class="uploader-item">
				<van-icon size="50px" name="photograph" />
			</van-uploader>
			<ul class="img-list">
				<li v-for="(item, index) in imgList" :key="index" >
					<img :src="fomatterFileSrc(item)" :onerror="$fxCommon.errorImg(fomatterFileSrc(item))" class="uploader-img">
					<van-icon class="img-del" name="cross" @click="delImg(index, item)"/>
				</li>
			</ul>
		</div>
		<div class="billUploaderEdit-bottom">
			<van-button v-if="!isDisabled" class="confirm-btn fx-no-radius" type="primary" @click="onConfirmClick">保存</van-button>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
export default {
	name: 'uploaderEditPop',
	components: {
	},
	props: {
		visibleFlag: Boolean,
		billId: String,
		isDisabled: Boolean
	},
	data () {
		return {
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			imgList: [],
			delFiles: []
		}
	},
	computed: {
		...mapState({
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId
		})
	},
	watch: {
		visibleFlag: {
			handler (val) {
				if (val) {
					this.resetFilesList()
				}
			},
			immediate: true
		}
	},
	methods: {
		resetFilesList () {
			return new Promise(resolve => {
				this.imgList = []
				this.delFiles = []
				this.getList().then(res => {
					this.imgList = res.storeBillImags
					resolve(res)
				})
			})
		},
		fomatterFileSrc (item) {
			return item.baseCode ? item.baseCode : item.imagUrl
		},
		getList () {
			return new Promise(resolve => {
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/upload/billId/${this.billId}/getAnnexByBillId`
				}).then(res => {
					resolve(res)
				})
			})
		},
		onCloseClick () {
			this.$emit('update:visibleFlag', false)
		},
		onConfirmClick () {
			this.saveBill().then(res => {
				this.resetFilesList().then(() => {
					this.$fxToast.success(res.message)
					this.$emit('update:visibleFlag', false)
				})
			})
		},
		saveBill () {
			return new Promise(resolve => {
				let params = []
				this.imgList.filter(item => {
					if (item.fileCode) {
						params.push({
							name: 'input_files[]',
							value: item.fileCode
						})
					}
				})
				let delParams = this.delFiles.map(item => {
					return item.imagUrl
				})
				params.push({
					name: 'del_filename',
					value: delParams.join('\r\n')
				})
				this.$fxHttp.requestFilePost({
					url: `${this.$fxBaseApi.url}/upload/billId/${this.billId}/uploadPictures`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		onRead (file) {
			this.imgList.push({ fileCode: file.file, name: file.file.name, baseCode: file.content })
		},
		onOversize (file, detail) {
			this.$fxToast.fail('文件超过了允许大小20480KB!')
		},
		imagePreview (file) {
			let imgList = this.imgList
			if (!/\.(gif|jpg|png|GIF|JPG|PNG)$/.test(file.name)) {
				this.$fxToast.fail('图片类型必须是.gif,jpg,png中的一种')
				return false
			}
			if (imgList.length >= 6) {
				this.$fxToast.fail('最多可上传6张图片!')
				return false
			} else {
				return true
			}
		},
		delImg (index, item) {
			if (item.imagUrl) {
				this.delFiles.push(item)
			}
			this.imgList.splice(index, 1)
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.billUploaderEdit-popup {
	height:100%
	width: 100%
	text-align:left
	display: flex
	flex-direction: column
	.billUploaderEdit-content {
		text-align: center
		flex:1
		padding: 0 20px
	}
	.billUploaderEdit-bottom {
		display: flex
		flex-direction: row
		width:100%
		.confirm-btn {
			flex:1
		}
	}
	.uploader-item {
		text-align: center
	}
	.img-list {
		display: flex
		flex-wrap: wrap
		li {
			padding: 10px 20px
			position: relative
			.img-del {
                position: absolute
                right: 12px
                top: 8px
            }
			.uploader-img {
				width: 117px
				height: 100px
			}
		}
	}
}
</style>
