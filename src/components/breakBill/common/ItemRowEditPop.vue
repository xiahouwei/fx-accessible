<template>
	<div class="itemRowEdit-popup">
		<w-header :title="currentItemData.goodsDTO.name" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div class="itemRowEdit-content">
			<van-cell-group>
				<van-cell title="单位" :value="currentItemData.unitDTO.name" value-class="info-item-value"/>
				<van-cell title="非税单价" :value="currentItemData.price" value-class="info-item-value"/>
				<van-cell title="税率" :value="fomatterTaxes(currentItemData.tax)" value-class="info-item-value"/>
				<van-cell title="税额" :value="currentItemData.taxOutMoney" value-class="info-item-value"/>
				<van-cell title="含税单价" :value="currentItemData.taxPrice" value-class="info-item-value"/>
				<van-cell title="含税金额" :value="currentItemData.outMoneyWithTax" value-class="info-item-value"/>
				<van-cell title="批次号" :value="currentItemData.batchCode" value-class="info-item-value"/>
				<van-cell title="规格" :value="currentItemData.goodsDTO.spec" value-class="info-item-value"/>
				<van-cell title="品项编号" :value="currentItemData.goodsDTO.code" value-class="info-item-value"/>
				<van-pro-field
					v-model="currentItemData.memo"
					label="备注"
					value-class="info-item-value"
					:placeholder="setPlaceholder('请输入备注')"
					input-align="right"
					:disabled="isDisabled"
				/>
			</van-cell-group>
			<bom-select-image
				class="bom-select-image"
				v-on="$listeners"
				v-bind="$props"
				v-show="currentItemData.id"
				:disabled="isDisabled"
				:uploadAble="6"
				:currentItemData="currentItemData"
				@pictureChange="pictureChange"
			/>
		</div>
		<div class="itemRowEdit-bottom">
			<van-button
				v-if="!isDisabled"
				class="confirm-btn fx-no-radius"
				type="primary"
				@click="onConfirmClick"
			>保存</van-button>
			<van-button
				v-else
				class="confirm-btn fx-no-radius"
				type="primary"
				@click="onCloseClick"
			>确定</van-button>
		</div>
	</div>
</template>

<script>
import bomSelectImage from '@/components/breakBill/common/BomSelectImage.vue'
export default {
	name: 'itemRowEdit',
	components: {
		bomSelectImage
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
		selcetPictureMode: {
			type: Object,
			default: () => {}
		}
	},
	data () {
		return {
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			currentItemData: {},
			delImagesArr: []
		}
	},
	computed: {
		setPlaceholder (val) {
			return (val) => {
				return this.isDisabled ? '' : val
			}
		},
		fomatterTaxes (value) {
			return (value) => {
				if (value) {
					let taxes = this.$fxUtils.toFixedSHW(value * 100, 2, false)
					return `${taxes}%`
				} else {
					return '0%'
				}
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
		pictureChange (val, delImagesArr) {
			this.currentItemData.images = val
			this.delImagesArr = delImagesArr
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
				// delParams.length && params.push({
				// 	name: 'del_filename',
				// 	value: delParams.join('\r\n')
				// })
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
			// let params = []
			// this.currentItemData.images.map(item => {
			// 	if (item.type && item.type === 'add') {
			// 		params.push({
			// 			name: 'input_files[]',
			// 			value: item.imagUrl
			// 		})
			// 	}
			// })
			// let delParams = this.delImagesArr.map(item => {
			// 	return item.imagUrl
			// })
			// delParams.length && params.push({
			// 	name: 'del_filename',
			// 	value: delParams.join('\r\n')
			// })
			// if (params.length) {
			// 	this.$fxHttp.requestFilePost({
			// 		url: `${this.$fxBaseApi.url}/upload/detailId/${this.currentItemData.id}/uploadDetailPicturesMultipleWithMaxCount`,
			// 		data: params
			// 	}).then(res => {
			// 		/* 将base64地址替换为服务端返回地址，替换规则为按服务端返回顺序 */
			// 		this.resetImagesUrl(res.storeBillImags)
			// 		resolve()
			// 	}).catch(e => reject(e))
			// } else {
			// 	resolve()
			// }
			// })
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
	}
	.itemRowEdit-bottom {
		display: flex
		flex-direction: row
		width:100%
		.confirm-btn {
			flex:1
		}
	}
	.bom-select-image {
		margin: 10px 15px;
	}
}
</style>
