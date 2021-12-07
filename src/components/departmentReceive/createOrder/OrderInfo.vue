<template>
	<div class="order-info-block fx-shadow-block">
		<van-collapse v-model="activeNames" :border="false">
			<van-collapse-item name="1" :disabled="collapseDisabled">
				<div slot="title" class="info-title">
					<span class="info-title-name">单据信息</span>
					<stateText class="stateTag fl-r" :billState="data.billState"></stateText>
					<span class="info-title-weightState" v-show="data.weightState === 1">待称重</span>
				</div>
				<van-tabs v-model="tabActive" animated>
					<van-tab title="表头">
						<van-cell
							class="info-item"
							title="出库机构"
							value-class="info-item-value"
							:value="data.shopDTO && data.shopDTO.name"
							:is-link="!isDisabled && isAutoType([1])"
							@click="onEmitClick('on-shop-click')"
						/>
						<van-cell
							class="info-item"
							title="部门"
							value-class="info-item-value"
							:value="data.departmentDTO && data.departmentDTO.name"
							:is-link="!isDisabled && isAutoType([1])"
							@click="onEmitClick('on-department-click')"
						/>
						<van-cell
							class="info-item"
							title="业务日期"
							:value="formatterDate(data.businessDate)"
							:is-link="!isDisabled && isAutoType([1])"
							@click="onBusDateClick"
						/>
						<van-pro-field
							v-model="data.manualCode"
							class="info-item"
							label="手工单号"
							:placeholder="isDisabled ? '' : '请输入手工单号'"
							input-align="right"
							maxlength="50"
							:disabled="isDisabled"
						/>
						<van-cell
							class="info-item"
							title="业务人"
							value-class="info-item-value"
							:value="data.employeeDTO && data.employeeDTO.name"
							@click="onEmitClick('on-employee-click')"
						>
							<van-icon
								slot="right-icon"
								v-show="!isDisabled && isAutoType([1])"
								:name="!hasEmployee ? 'arrow' : 'close'"
								class="item-clear-btn"
								@click.stop="!hasEmployee ? onEmitClick('on-employee-click') : onEmitClick('on-employee-clear')"
							/>
						</van-cell>
						<van-cell
							v-if="$fxSysAuth('departmentReceiveBill.viewSubject')"
							class="info-item"
							title="科目"
							value-class="info-item-value"
							:value="data.subjectDTO && data.subjectDTO.name"
							@click="onEmitClick('on-subject-click')"
						>
							<van-icon
								slot="right-icon"
								v-show="!isDisabled"
								:name="!hasSubject? 'arrow' : 'close'"
								class="item-clear-btn"
								@click.stop="!hasSubject ? onEmitClick('on-subject-click') : onEmitClick('on-subject-clear')"
							/>
						</van-cell>
					</van-tab>
					<van-tab title="更多">
						<van-cell class="info-item" title="制单人" :value="data.billEmp" />
						<van-cell class="info-item" title="制单日期" :value="formatterDate(data.billDate)" />
						<van-cell class="info-item" title="审核人" :value="data.checkEmp" />
						<van-cell class="info-item" title="审核日期" :value="formatterDate(data.checkDate)" />
						<van-pro-field
							v-model="data.billMemo"
							class="info-item"
							label="整单备注"
							:placeholder="isDisabled ? '' : '请输入整单备注'"
							input-align="right"
							maxlength="50"
							:disabled="isDisabled || isAutoType([5])"
						/>
						<!-- <van-cell class="info-item" title="上级单据" :value="data.highBill" is-link /> -->
						<!-- <van-cell class="info-item" title="下级单据" :value="data.lowBill" is-link /> -->
						<!-- <van-cell class="info-item" title="单据履历" :value="data.billRecord" is-link /> -->
						<van-cell
							class="info-item"
							title="单据类型"
							value-class="info-item-value"
							:value="data.businessTypeDTO && data.businessTypeDTO.name"
							@click="onEmitClick('on-billType-click')"
						>
							<van-icon
								slot="right-icon"
								v-show="!isDisabled"
								:name="!hasBillType ? 'arrow' : 'close'"
								class="item-clear-btn"
								@click.stop="!hasBillType ? onEmitClick('on-billType-click') : onEmitClick('on-billType-clear')"
							/>
						</van-cell>
					</van-tab>
				</van-tabs>
			</van-collapse-item>
		</van-collapse>
	</div>
</template>

<script>
import stateText from '@/components/common/StateText.vue'
export default {
	name: 'orderInfo',
	components: {
		stateText
	},
	props: {
		data: {
			type: Object,
			default: () => {
				return {}
			}
		},
		isDisabled: Boolean,
		collapseDisabled: Boolean
	},
	data () {
		return {
			activeNames: ['1'],
			tabActive: 0
		}
	},
	computed: {
		formatterDate (date) {
			return (date) => {
				if (typeof date === 'number') {
					return this.$fxUtils.setDateTime(new Date(date), '时分')
				} else {
					return ''
				}
			}
		},
		hasEmployee () {
			return this.data.employeeDTO && this.data.employeeDTO.id
		},
		// 生成方式 1手动 5快速领用
		// 快速领用把机构、业务人、部门、单位置为不可用
		isAutoType (state) {
			return state => {
				if (Object.prototype.toString.call(state) === '[object Array]') {
					return state.includes(this.data.autoType)
				} else {
					return this.data.autoType === state
				}
			}
		},
		hasBillType () {
			return this.data.businessTypeDTO && this.data.businessTypeDTO.id
		},
		hasSubject () {
			return this.data.subjectDTO && this.data.subjectDTO.id
		}
	},
	methods: {
		onEmitClick (type) {
			if (this.isDisabled || this.isAutoType([5])) {
				return false
			}
			this.$emit(type)
		},
		onBusDateClick () {
			this.onEmitClick('on-busdate-click')
		},
		closeCollapse () {
			this.activeNames = []
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.order-info-block {
	width:340px
	margin:10px auto
	padding:5px
	text-align:left
	.info-title {
		.info-title-name {
			font-size:12px
		}
		.stateTag {
			font-size:12px
			margin-right:10px
		}
		.info-title-weightState {
			margin-left:20px
			color:$fxRed
			font-size:16px
		}
	}
	.info-item {
		font-size:12px !important
		padding:5px 0 !important
		.info-item-value {
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.item-clear-btn {
			width:16px
			height:24px
			line-height:24px
			margin-left:5px
			font-size:16px
			color: $fxGraylight
		}
	}
}
</style>

