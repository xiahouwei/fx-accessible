<template>
	<div class="wind-pay">
		<transition name="wind-popup-transition-bottom">
			<div v-show="visible" class="wind-pay__container wind-popup__slide-bottom" >
				<div class="wind-pay__container-titler">
					<van-icon name="cross" size="20px" @click="onCloseClick"></van-icon>
				</div>
				<div class="wind-pay__container-content">
					<div class="pay-info-cell">付款方：{{payer}}</div>
					<div class="pay-info-cell">收款方：{{payee}}</div>
					<div class="pay-info-money">
						<w-price-span :price="money"></w-price-span>
					</div>
					<div v-show='isPaying' class="pay-loading">
						<van-loading :color="payLoadingColor" />
						<div>付款中...</div>
					</div>
					<div v-show='!isPaying' class="pay-type-radio">
						<van-radio-group v-model="radio">
							<van-cell-group>
								<van-cell
									v-show="hasPaytype('alipay')"
									title="支付宝支付"
									clickable
									@click="radio = 'alipay'"
								>
									<w-icon slot="icon" type="alipay" class="pay-icon"></w-icon>
									<van-radio slot="right-icon" name="alipay" />
								</van-cell>
								<van-cell
									v-show="hasPaytype('weixinPay')"
									title="微信支付"
									clickable
									@click="radio = 'weixinPay'"
								>
									<w-icon slot="icon" type="weixin-pay" class="pay-icon"></w-icon>
									<van-radio slot="right-icon" name="weixinPay" />
								</van-cell>
							</van-cell-group>
						</van-radio-group>
					</div>
				</div>
				<div class="wind-pay__container-bottom">
					<van-button
						v-show='!isPaying'
						class="pay-btn"
						type="primary"
						round
						@click="onPayClick"
					>立即付款</van-button>
					<van-button
						v-show='isPaying'
						class="pay-btn"
						type="primary"
						round
						@click="onPayConfirm"
					>我已付款</van-button>
				</div>
			</div>
		</transition>
		<transition name="wind-popup-transition-opacity">
			<div v-show="visible" class="wind-pay__mask"></div>
		</transition>
	</div>
</template>


<script type="text/babel">
export default {
	props: {
		value: Boolean,
		money: [String, Number],
		payer: String,
		payee: String,
		payTypes: {
			type: Array,
			default: () => {
				return []
			}
		}
	},
	data () {
		return {
			visible: false,
			confirmHandler: null,
			cancelHandler: null,
			radio: '',
			isPaying: false,
			payLoadingColor: '#1989fa'
		}
	},
	computed: {
		hasPaytype (type) {
			return (type) => {
				return this.payTypes.includes(type)
			}
		}
	},
	methods: {
		popupShow () {
			this.isPaying = false
			this.setCurrentPayType()
			this.visible = true
			this.$emit('on-show')
		},
		popupHide () {
			this.visible = false
			this.$emit('on-hide')
		},
		onCloseClick () {
			this.popupHide()
		},
		onPayClick () {
			this.isPaying = true
		},
		setCurrentPayType () {
			this.radio = this.payTypes[0]
		},
		onPayConfirm () {
			this.popupHide()
			if (typeof this.confirmHandler === 'function') {
				this.confirmHandler()
			}
		}
	}
}
</script>

<style lang="stylus" scoped>
.wind-pay {
	&__container, &__mask {
		position: absolute
		transition: all .3s ease-out
	}
	&__mask {
		width: 100%
		height: 100%
		top: 0
		right: 0
		background-color: rgba(0,0,0,0.4)
		z-index: 100
		opacity: 1
	}
	&__container {
		background-color: #fff
		z-index: 101
		border-top-left-radius: 10px
		border-top-right-radius: 10px
		display: flex;
		flex-direction: column;
		&.wind-popup__slide-bottom {
			bottom: 0
			left: 0
			width: 100%
			height: 370px
		}
		&-titler {
			display: flex;
			flex-direction: row-reverse;
			align-items: center;
			height: 30px;
			line-height: 30px;
			text-align: right;
			padding-right: 10px;
		}
		&-content {
			flex:1
			.pay-info-cell {
				height: 36px
				line-height: 36px
				font-size: 14px;
				padding: 0 10px;
			}
			.pay-info-money {
				height: 80px
				line-height: 80px
				text-align:center
			}
			.pay-type-radio {
				.pay-icon {
					margin-right: 10px
				}
			}
			.pay-loading {
				display: flex;
				flex-direction: column;
				align-items: center;
			}
		}
		&-bottom {
			height: 60px
			padding: 0 10px;
			align-items: center;
			display: flex;
			.pay-btn {
				width:100%
			}
		}
	}
}
.wind-popup-transition-bottom-enter, .wind-popup-transition-bottom-leave-active{
	transform: translate3d(0, 100%, 0)
}
.wind-popup-transition-opacity-enter, .wind-popup-transition-opacity-leave-active{
	opacity: 0
}
</style>
