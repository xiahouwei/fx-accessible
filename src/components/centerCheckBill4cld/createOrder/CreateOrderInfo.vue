<template>
	<div class="create-order-info fx-shadow-block">
		<van-cell-group>
			<w-cell
				title="配送中心"
				:is-link="!isDisabled"
				@click="onEmitClick('on-rdc-click')"
			>{{data.rdcDTO && data.rdcDTO.name}}</w-cell>
			<w-cell
				title="盘点仓库"
				:is-link="!isDisabled"
				@click="onEmitClick('on-house-click')"
			>{{data.houseDTO && data.houseDTO.name}}</w-cell>
			<w-cell
				title="盘点分类"
				:is-link="!isDisabled"
				@click="onEmitClick('on-checkType-click')"
			>{{data.checkTypeDTO && data.checkTypeDTO.name}}</w-cell>
			<w-cell
				title="业务日期"
				:is-link="!isDisabled"
				@click="onBusDateClick"
			>{{formatterDate(data.businessDate)}}</w-cell>
			<w-cell
				title="未盘品项"
				:is-link="!isDisabled && this.data.unCheckItemDoTypeEnable"
				@click="onUncheckItemDoTypeEmitClick('on-notCheckType-click')"
			>{{unCheckItemDoTypeName}}</w-cell>
			<w-cell
				title="盘点方式"
				:is-link="!isDisabled"
				@click="onEmitClick('on-groupFlag-click')"
			>{{groupFlagName}}</w-cell>
			<w-cell
				title="成本类型"
				:is-link="!isDisabled"
				@click="onEmitClick('on-costType-click')"
			>{{costTypeName}}</w-cell>
			<w-cell
				title="业务类型"
				:is-link="!isDisabled"
				@click="onEmitClick('on-businessType-click')"
			>{{data.businessTypeDTO && data.businessTypeDTO.name}}</w-cell>
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
	computed: {
		...mapState({
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
		unCheckItemDoTypeName () {
			if (!this.data) return ''
			return this.$fxTypeMiddleware.getCommonTypeItemById('notCheckType')(this.data.unCheckItemDoType).name
		},
		groupFlagName () {
			return this.$fxTypeMiddleware.getCommonTypeItemById('checkWay')(this.data.groupFlag).name
		},
		costTypeName () {
			return this.$fxTypeMiddleware.getCommonTypeItemById('costType')(this.data.costType).name
		}
	},
	methods: {
		onUncheckItemDoTypeEmitClick (type) {
			if (this.isDisabled || !this.data.unCheckItemDoTypeEnable) {
				return false
			}
			this.$emit(type)
		},
		onEmitClick (type) {
			if (this.isDisabled) {
				return false
			}
			this.$emit(type)
		},
		onBusDateClick () {
			this.onEmitClick('on-busdate-click')
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.create-order-info {
	width:340px
	margin:10px auto
	padding:5px
	text-align:left
	display: flex
	flex-direction: column
	flex: 1
}
</style>
