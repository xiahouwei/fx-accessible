<template>
	<div class="itemRowEdit-popup">
		<div class="batch-wrap">
			<w-header title="批量设置" :leftOptions="leftOptions"></w-header>
			<div class="itemRowEdit-content">
				<van-cell @click="onProductDateClick" title="生产日期：" :value="fomatterDate(produceDate)" is-link />
			</div>
			<div class="itemRowEdit-bottom">
				<div class="batch-btn" @click="onCloseClick">取消</div>
				<div class="batch-btn btn-query" @click="onConfirmClick">确认</div>
			</div>
		</div>
		<van-popup v-model="datePickerShow" position="bottom">
			<w-date-picker
				:visibleFlag.sync="datePickerShow"
				:currentDate="currentDate"
				@confirm="dateConfirmhandle"
			></w-date-picker>
		</van-popup>
	</div>
</template>

<script>
import { mapState } from 'vuex'
export default {
	name: 'batchProduceDate',
	components: {
	},
	props: {
		visibleFlag: Boolean
	},
	data () {
		return {
			leftOptions: {
				showBackBtn: false,
				preventGoBack: false
			},
			produceDate: new Date(),
			currentDate: new Date(),
			datePickerShow: false
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize',
			numberLength: 'numberLength',
			maxAmount: 'maxAmount',
			sysShowDZCData: state => state.systemParams.sysShowDZCData,
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId
		}),
		fomatterDate (date) {
			return (date) => {
				if (date) {
					return this.$fxUtils.setDateTime(new Date(date), '时分')
				} else {
					return ''
				}
			}
		}
	},
	watch: {
		visibleFlag: {
			handler (val) {
				if (val) {
					this.produceDate = this.$fxUtils.getCustomerDateAndTime(new Date(), '00:00')
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
			this.$emit('update:visibleFlag', false)
			this.$emit('on-Confirm', this.produceDate)
		},
		onProductDateClick () {
			this.datePickerShow = true
		},
		dateConfirmhandle (date) {
			this.produceDate = date.getTime()
			this.datePickerShow = false
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
		.produce-date {
			width: 120px
		}
	}
	.itemRowEdit-bottom {
		display: flex
		flex-direction: row
		width:100%
		height: 34%
		border-top: 1px solid $fxGray
	}
	.batch-wrap {
		position: fixed
		top: 50%
		left: 50%
		transform: translate3d(-50%, -50%, 0)
		width: 90%
		height: 20%
		background-color: #fff
		.batch-btn {
			width: 50%
			display: flex
			justify-content: center
			align-items: center
		}
		.btn-query {
			color: $fxBlue
			border-left: 1px solid $fxGray
		}
	}
}
</style>
