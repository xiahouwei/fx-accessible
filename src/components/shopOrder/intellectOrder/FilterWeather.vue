<template>
	<div class="filter-info-popup fx-shadow-block">
		<van-collapse :border="false" v-model="activeNames">
			<van-collapse-item name="1">
				<template #title>
					<h3 class="block-name fx-ellipsis fx-block-title fx-info-title">天气影响：</h3>
				</template>
				<van-radio-group v-model="filterWeather.weatherRaido">
					<div class="block-content">
						<div v-for="item in filterWeather.days" :key="item.code" class="block-wrap">
							<div class="block-name fx-ellipsis">
								<van-radio @click="onEmitClick('on-weatherraido-click')" :name="item.code"><i class="title-icon" :class="'icon-'+item.code"></i><span>{{item.name}}：</span></van-radio>
							</div>
							<div class="block-right">
								<button :class="{ 'filter-btn-active': item.minus }" class="filter-minus" @click="onFilterBtnClick(item, 'minus', 'add')"/>
								<span class="block-amount block-middle">
									<w-stepper
										ref="amountInput"
										v-model="item.count"
										min="0"
										:max="maxAmount"
										class="amount-step"
										:stepperBtnShow="false"
										:intLength="6"
										inputWidth="28vw"
									></w-stepper>
								</span>
								<span class="block-right-text">%</span>
								<button :class="{ 'filter-btn-active': item.add }" class="filter-add" @click="onFilterBtnClick(item, 'add', 'minus')"/>
							</div>
						</div>
						<div class="block-wrap">
							<div class="block-name fx-ellipsis">其他因素：</div>
							<div class="block-right">
							<span class="block-amount">
								<van-field v-model="filterWeather.otherFactor" input-align="right" placeholder="请输入其他原因"/>
							</span>
							</div>
						</div>
						<div class="block-wrap">
							<div class="block-name fx-ellipsis"></div>
							<div class="block-right">
								<button :class="{ 'filter-btn-active': filterWeather.otherFactorMinus }" class="filter-minus" @click="onFilterBtnClick(filterWeather, 'otherFactorMinus', 'otherFactorAdd')"/>
								<span class="block-amount block-middle">
									<w-stepper
										ref="amountInput"
										v-model="filterWeather.otherFactorCount"
										min="0"
										:max="maxAmount"
										class="amount-step"
										:stepperBtnShow="false"
										:intLength="numberLength"
										inputWidth="28vw"
									></w-stepper>
								</span>
								<span class="block-right-text">%</span>
								<button :class="{ 'filter-btn-active': filterWeather.otherFactorAdd }" class="filter-add" @click="onFilterBtnClick(filterWeather, 'otherFactorAdd', 'otherFactorMinus')"/>
							</div>
						</div>
					</div>
				</van-radio-group>
			</van-collapse-item>
		</van-collapse>
	</div>
</template>

<script>
import { mapState } from 'vuex'
export default {
	name: 'filterWeather',
	components: {
	},
	props: {
		filterWeather: {
			type: Object,
			default: () => {
				return {}
			}
		}
	},
	computed: {
		...mapState({
			numberLength: 'numberLength',
			maxAmount: 'maxAmount'
		})
	},
	data () {
		return {
			activeNames: []
		}
	},
	methods: {
		onFilterBtnClick (item, selectName, deselectName) {
			item[selectName] = true
			item[deselectName] = false
		},
		onEmitClick (type) {
			this.$emit(type)
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.filter-info-popup {
	text-align:left
	display: flex
	flex-direction: column
	background-color: #fff
	.block-content {
		flex: 1
		.block-wrap {
			display: flex
			flex-direction: row
			padding: 8px 0px
			height: 30px
			line-height: 30px
			vertical-align: middle
			margin-bottom: 0px
			.block-name {
				flex: 1
				$fx-dynamic-font-size(13px)
			}
			.block-right {
				flex: 1
				text-align: right
				display: flex
			}
		}
		.block-amount {
			display: inline-block
		}
		.block-right-text {
			margin-right: 11px
		}
		.block-middle {
			vertical-align: middle
		}
		.filter-checkbox {
			padding-right: 10px
		}
		.filter-minus, .filter-add {
			width: 20px
			height: 21px
			box-sizing: border-box
			border: 1px solid $fxBlue
			margin-top: 5px
			position: relative
			padding: 5px
			vertical-align: middle
			border-radius: 50%
		}
		.filter-minus::before, .filter-add::after, .filter-add::before {
			content: ''
			position: absolute
			margin: auto
			top: 0
			left: 0
			right: 0
			bottom: 0
			background-color: $fxBlue
		}
		.filter-minus::before, .filter-add::before {
			width: 9px
			height: 1px
		}
		.filter-add::after {
			width: 1px
			height: 9px
		}
		.filter-btn-active {
			background-color: $fxBlue
		}
		.filter-btn-active.filter-minus::before, .filter-btn-active.filter-add::after, .filter-btn-active.filter-add::before {
			background-color: $fxWhite
		}
		.filter-minus::before{
			content: ''
			position: absolute
			margin: auto
			top: 0
			left: 0
			right: 0
			bottom: 0
			background-color: $fxBlue
		}
		.title-icon {
			width:16px
			height:14px
			background-repeat:no-repeat
			background-position: center
			background-size: 100%
			display:inline-block
			margin-right:10px
		}
		.icon-sunnyDay {
			background-image: url('~images/icon/icon-sunnyDay.png')
		}
		.icon-cloudyDay {
			background-image: url('~images/icon/icon-cloudyDay.png')
		}
		.icon-windy {
			background-image: url('~images/icon/icon-windy.png')
		}
		.icon-rain {
			background-image: url('~images/icon/icon-rain.png')
		}
		.icon-smog {
			background-image: url('~images/icon/icon-smog.png')
		}
		.icon-snowing {
			background-image: url('~images/icon/icon-snowing.png')
		}
	}
}
</style>
