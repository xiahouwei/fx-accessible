<template>
	<div class="itemRowEdit-popup">
		<w-header :title="currentItemData.goodsDTO.name" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div ref="rowEditContent" class="itemRowEdit-content">
			<van-cell-group>
				<van-cell title="订货数量" :value="currentItemData.outOrderAmount" value-class="info-item-value"></van-cell>
				<van-cell title="中心出库数" :value="currentItemData.rawAmount" value-class="info-item-value"></van-cell>
				<van-cell title="门店入库数" :value="currentItemData.busUnitInAmount" value-class="info-item-value"></van-cell>
				<van-cell title="差异数量" :value="differenceAmount" value-class="info-item-value"/>
				<van-cell v-show="$fxAuth('distributionInBill.seeprice')" title="非税单价" :value="currentItemData.price" value-class="info-item-value"></van-cell>
				<van-cell v-show="$fxAuth('distributionInBill.seenotaxmoney')" title="非税金额" :value="currentItemData.inMoney" value-class="info-item-value"></van-cell>
				<van-cell v-show="$fxAuth('distributionInBill.seetax')" title="税率" :value="fomatterTaxes(currentItemData.tax)" value-class="info-item-value"></van-cell>
				<van-cell v-show="$fxAuth('distributionInBill.seetaxmoney')" title="税额" :value="currentItemData.taxInMoney" value-class="info-item-value"></van-cell>
				<van-cell title="品项编号" :value="currentItemData.goodsDTO.code" value-class="info-item-value"></van-cell>
				<van-cell title="品项类型" :value="currentItemData.goodsDTO.styleName" value-class="info-item-value"></van-cell>
				<van-pro-field
					v-model="currentItemData.memo"
					:disabled="isDisabled"
					:placeholder="setPlaceholder('请输入备注')"
					label="备注"
					value-class="info-item-value"
					input-align="right"
					@focus="onFocus('memo')"
				></van-pro-field>
				<van-cell v-show="sysShowDZCData" title="净重量" :value="toFixedNumberSize(currentItemData.netWeight)" value-class="info-item-value"></van-cell>
				<van-cell v-show="sysShowDZCData" title="皮重量" :value="toFixedNumberSize(currentItemData.skinWeight)" value-class="info-item-value"></van-cell>
				<van-cell v-show="sysShowDZCData" title="毛重量" :value="toFixedNumberSize(currentItemData.grossWeight)" value-class="info-item-value"></van-cell>
				<van-cell v-show="sysShowDZCData" title="称重单位" :value="currentItemData.weightUnit" value-class="info-item-value"></van-cell>
				<van-cell v-show="sysShowDZCData" title="称重状态" :value="currentItemData.isWeightSign ? '已称重' : '未称重'" value-class="info-item-value"></van-cell>
				<van-cell v-show="sysShowDZCData" title="图片" :border="false" value-class="info-item-value"></van-cell>
				<select-image
					class="bom-select-image"
					v-on="$listeners"
					v-show="currentItemData.id"
					:selcetPictureMode="selcetPictureMode"
					:isDisabled="isDisabled || updateImageDisabled"
					:uploadAble="6"
					:currentItemData="currentItemData"
					@on-selcet-iamge="selcetPictureActionsheet=true"
					@pictureChange="pictureChange"
				/>
			</van-cell-group>
		</div>
		<div class="itemRowEdit-bottom">
			<van-button v-if="!isDisabled" class="confirm-btn fx-no-radius" type="primary" @click="onConfirmClick">保存</van-button>
		</div>
		<van-actionsheet
			v-model="selcetPictureActionsheet"
			:actions="actions"
			cancel-text="取消"
			@select="onSelect"
		/>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import selectImage from '@/components/common/selectImage.vue'
export default {
	name: 'itemRowEdit',
	components: {
		selectImage
	},
	props: {
		visibleFlag: Boolean,
		itemData: {
			type: Object,
			default: () => {
				return {}
			}
		},
		isDisabled: Boolean,
		updateImageDisabled: {
			type: Boolean,
			default: false
		}
	},
	data () {
		return {
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			delImagesArr: [],
			currentItemData: {},
			selcetPictureMode: {},
			selcetPictureActionsheet: false,
			actions: [{
				name: '拍摄',
				value: 'Camera'
			}, {
				name: '从手机相册选择',
				value: 'Library'
			}]
		}
	},
	computed: {
		...mapState({
			sysShowDZCData: state => state.systemParams.sysShowDZCData,
			sysPointSize: 'sysPointSize'
		}),
		differenceAmount () {
			let differenceAmount = this.currentItemData.rawAmount - this.currentItemData.busUnitInAmount
			differenceAmount = parseFloat(this.$fxUtils.toFixedSHW(differenceAmount, this.sysPointSize))
			return Number.isNaN(differenceAmount) ? '' : differenceAmount
		},
		fomatterTaxes (tax) {
			return (tax) => {
				if (tax) {
					let taxes = this.$fxUtils.toFixedSHW(tax * 100, 2, false)
					return `${taxes}%`
				} else {
					return '0%'
				}
			}
		},
		setPlaceholder (val) {
			return (val) => {
				return this.isDisabled ? '' : val
			}
		},
		comptedItemImgSrc (imageUrls) {
			return (imageUrls) => {
				if (!imageUrls) {
					return ''
				}
				return imageUrls.length === 0 ? '' : imageUrls[0].imagUrl
			}
		}
	},
	watch: {
		visibleFlag: {
			handler (val) {
				if (val) {
					this.currentItemData = JSON.parse(JSON.stringify(this.itemData))
				}
			},
			immediate: true
		}
	},
	methods: {
		toFixedNumberSize (data) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysPointSize))
		},
		pictureChange (val, delImagesArr) {
			this.currentItemData.images = val
			this.delImagesArr = delImagesArr
		},
		onCloseClick () {
			this.$emit('update:visibleFlag', false)
		},
		onConfirmClick () {
			if (this.currentItemData.id) {
				this.currentItemData.changeType = 'edit'
				this.saveBill().then(_ => this.saveNotice())
			} else {
				this.saveNotice()
			}
		},
		saveNotice () {
			this.$emit('on-Confirm', this.currentItemData)
			this.$emit('update:visibleFlag', false)
		},
		resetImagesUrl (storeBillImags) {
			// this.currentItemData.images = this.currentItemData.images.map(item => {
			// 	if (item.type && item.type === 'add' && storeBillImags.length) {
			// 		item = storeBillImags.splice(0, 1)[0]
			// 	}
			// 	return item
			// })
			this.currentItemData.images = storeBillImags
		},
		saveBill () {
			return new Promise((resolve, reject) => {
				let inputFile = []
				this.currentItemData.images.map(item => {
					if (item.type && item.type === 'add') {
						inputFile.push(item.imagUrl)
					}
				})
				let delParams = this.delImagesArr.map(item => {
					return item.imagUrl
				})
				let params = {
					'input_files[]': inputFile,
					'del_filename': delParams
				}
				if (inputFile.length || delParams.length) {
					this.$fxHttp.requestPost({
						url: `${this.$fxBaseApi.url}/upload/detailId/${this.currentItemData.id}/uploadDetailPicturesMultipleWithMaxCount`,
						data: params
					}).then(res => {
						/* 将base64地址替换为服务端返回地址，替换规则为按服务端返回顺序 */
						this.resetImagesUrl(res.storeBillImags)
						resolve()
					}).catch(e => reject(e))
				} else {
					resolve()
				}
			})
		},
		// {{{ 选择图片
		onSelect (item) {
			this.selcetPictureMode = {
				...item,
				random: Math.random()
			}
			this.selcetPictureActionsheet = false
		},
		// }}}
		onFocus (ref) {
			this.onScrollTop(ref)
		},
		onScrollTop (scrollRef, distance = 20) {
			let detailsRowRef = this.$refs[scrollRef]
			if (!detailsRowRef || detailsRowRef.length === 0) {
				return false
			}
			let offsetTop = detailsRowRef.$el.offsetTop
			let $el = this.$refs['rowEditContent']
			this.$fxUtils.scrollTopW({ offsetTop, $el, distance })
		}
	}
}
</script>

<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.itemRowEdit-popup {
	height:100%
	width: 100%
	text-align:left
	display: flex
	flex-direction: column
	.itemRowEdit-content {
		flex:1
		overflow:scroll
		.info-item-value {
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.info-cell-img {
			padding: 0
		}
		.info-item-img {
			padding:0 10px 15px 50px
			box-sizing:border-box
			&>img {
				width:100%
				height:100%
			}
		}
	}
	.itemRowEdit-bottom {
		display: flex
		flex-direction: row
		width:100%
		.confirm-btn {
			flex:1
		}
	}
}
</style>
