	<template>
	<div class="checkbill-info-block fx-shadow-block">
		<van-cell-group>
				<van-cell
					class="info-item"
					title="机构"
					value-class="info-item-value"
					:value="data.shopDTO && data.shopDTO.name"
					is-link
					@click="onEmitClick('on-shop-click')"
				/>
				<van-cell
					class="info-item"
					title="盘点仓库"
					value-class="info-item-value"
					:value="data.houseDTO && data.houseDTO.name"
					is-link
					@click="onEmitClick('on-house-click')"
				/>
				<van-cell
					class="info-item"
					title="盘点日期"
					:value="formatterDate(data.businessDate)"
					is-link
					@click="onEmitClick('on-date-click')"
				/>
				<van-pro-field
					v-model="data.manualCode"
					class="info-item"
					label="手工单号"
					placeholder="请输入手工单号"
					input-align="right"
					:disabled="isDisabled"
				/>
				<van-cell
					class="info-item"
					title="盘点方案"
					value-class="info-item-value"
					:value="data.planDTO && data.planDTO.name ? data.planDTO.name : '请选择'"
					@click="onEmitClick('on-plan-click')"
				>
					<van-icon
						slot="right-icon"
						:name="!hasPlan ? 'arrow' : 'close'"
						class="item-clear-btn"
						@click.stop="!hasPlan ? onEmitClick('on-plan-click') : onEmitClick('on-plan-clear')"
					/>
				</van-cell>
				<van-pro-field
					v-model="data.billMemo"
					class="info-item"
					label="整单备注"
					placeholder="请输入整单备注"
					input-align="right"
					:disabled="isDisabled"
				/>
			<van-cell title="盘点方式" :value="data.batchTypeName" value-class="info-item-value" is-link @click="onEmitClick('on-batchType-click')" />
		</van-cell-group>
	</div>
</template>

<script>
import { mapState } from 'vuex'
export default {
	name: 'orderInfoAdd',
	components: {
	},
	props: {
		data: {
			type: Object,
			default: () => {
				return {}
			}
		},
		isDisabled: Boolean
	},
	data () {
		return {
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize',
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId
		}),
		formatterDate (date) {
			return (date) => {
				if (typeof date === 'number') {
					return this.$fxUtils.setDateTime(new Date(date), '时分')
				} else {
					return date
				}
			}
		},
		hasPlan () {
			return this.data.planDTO && this.data.planDTO.id
		}
	},
	methods: {
		onEmitClick (type) {
			if (this.isDisabled) {
				return false
			}
			this.$emit(type)
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.checkbill-info-block {
	width:340px
	margin:10px auto
	padding:5px
	text-align:left
	display: flex
	flex: 1
	-webkit-box-flex: 1
	flex-direction: column
	.info-title {
		.info-title-name {
			font-size:12px
		}
		.stateTag {
			font-size:12px
			margin-right:10px
		}
	}
	.info-item {
		.info-item-value {
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.item-clear-btn {
			width:16px
			height:24px
			line-height:24px
			margin-left:5px
			color: $fxGraylight
		}
	}
	[class*='van-hairline']::after {
		border-top: 0 solid $fxWhite
	}
}
</style>
