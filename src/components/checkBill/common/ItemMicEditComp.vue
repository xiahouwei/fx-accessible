<template>
	<div class="itemMicEditComp-popup">
		<w-header title="语音盘点" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div class="itemMicEditComp-content">
			<div v-html="recordMessage" class="itemMicEditComp-record-message"></div>
			<img class="itemMicEditComp-record-icon" src="@/assets/images/icon/icon-record.png" alt="">
		</div>
		<div class="itemMicEditComp-bottom">
			<button
				class="record-btn"
				@touchstart="onRecordTouchStart"
				@touchend="onRecordTouchEnd"
			>{{recordBtnText}}</button>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
export default {
	name: 'itemMicEditComp',
	props: {
		visibleFlag: Boolean,
		shopId: String,
		billId: String,
		checkPlanId: String,
		houseId: String,
		checkDate: [String, Number]
	},
	data () {
		return {
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			recording: false,
			recordSuccessMessage: ''
		}
	},
	computed: {
		...mapState({
			loginerId: state => state.loginer.loginerId
		}),
		recordBtnText () {
			return this.recording ? '松开盘点' : '按住说话'
		},
		recordMessage () {
			return this.recording ? '开始录入盘点指令' : this.recordSuccessMessage
		}
	},
	watch: {
		recording (val) {
			if (val) {
				this.recordSuccessMessage = ''
			}
		}
	},
	methods: {
		onCloseClick () {
			this.$emit('update:visibleFlag', false)
		},
		onRecordTouchStart () {
			this.recording = true
			let recordFileName = `intelEDI-${new Date().getTime()}.m4a`
			this.$fxCordova.media.startRecord({
				fileName: recordFileName
			})
		},
		onRecordTouchEnd () {
			this.recording = false
			this.$fxCordova.media.stopRecord().then(recordFileFullPath => {
				// alert(recordFileFullPath)
				this.uploadAudio(recordFileFullPath)
			}).catch(() => {
				this.recordSuccessMessage = '语音获取失败'
			})
		},
		uploadAudio (fileFullPath) {
			const params = {
				checkPlanId: this.checkPlanId || '',
				houseId: this.houseId || '',
				checkDate: this.$fxUtils.setDateTime(new Date(this.checkDate)) || ''
			}
			this.recordSuccessMessage = '盘点语音解析中...'
			const url = `${this.$fxBaseApi.url}/upload/shops/${this.shopId}/users/${this.loginerId}/checkId/${this.billId}/checkbills`
			this.$fxHttp.fileTransfer({
				url,
				fileFullPath,
				params
			}).then(res => {
				this.recordSuccessMessage = this.getCheckItemMessage(res.checkBillDetails)
				this.$emit('on-micAdd-item', res.checkBillDetails)
			}).catch(error => {
				this.recordSuccessMessage = error.message
			})
		},
		getCheckItemMessage (data) {
			let item = data[0]
			let itemName = item.goodsDTO.name
			let itemUnit = item.checkUnitDTO.name
			let itemAmount = item.checkUnitAmount
			return `成功盘点${itemName}${itemAmount}${itemUnit}`
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.itemMicEditComp-popup {
	height:100%
	width: 100%
	text-align:left
	display: flex
	flex-direction: column
	background-color: rgba(0, 0, 0, 0.7)
	.itemMicEditComp-content {
		flex:1
		.itemMicEditComp-record-message {
			margin-top:50px
			min-height:20px
			height:20px
			line-height:20px
			color:$fxWhite
			font-size:20px
			text-align:center
		}
		.itemMicEditComp-record-icon {
			margin: 150px auto 20px auto
			width:100px
			height:100px
		}
	}
	.itemMicEditComp-bottom {
		display: flex
		flex-direction: row
		width:100%
		.record-btn {
			height:50px
			line-height:50px
			font-size:16px
			color:$fxWhite
			flex:1
			text-align:center
			background-color:gray
			border: 1px solid transparent
		}
	}
}
</style>
