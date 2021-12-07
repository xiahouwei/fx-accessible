<template>
	<div class="filter-popup">
		<w-header title="筛选条件" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div ref="filterContent" class="filter-content">
			<van-cell-group>
				<van-cell title="创建日期"/>
				<van-cell title="起始时间" :value="beginDate" is-link @click="onBeginDateClick" />
				<van-cell title="结束时间" :value="endDate" is-link @click="onEndDateClick" />
				<van-cell title="预估日期"/>
				<van-cell title="起始时间" :value="beginReckonDate" is-link @click="onBeginReckonDateClick" />
				<van-cell title="结束时间" :value="endReckonDate" is-link @click="onEndReckonDateClick" />
				<van-cell title="门店" :value="shop.name" value-class="info-item-value" is-link @click="onShopClick" />
				<van-field
					ref="billNo"
					v-model="billNo"
					label="系统单号"
					value-class="info-item-value"
					placeholder="请输入系统单号"
					input-align="right"
				/>
			</van-cell-group>
		</div>
		<div class="filter-bottom">
			<van-button class="reset-btn fx-no-radius" type="info" @click="onResetClick">重置</van-button>
			<van-button class="confirm-btn fx-no-radius" type="primary" @click="onConfirmClick">确定</van-button>
		</div>
		<van-popup v-model="datePickerShow" position="bottom">
			<w-date-picker :visibleFlag.sync="datePickerShow" :currentDate="currentDate" @confirm="dateConfirmhandle"></w-date-picker>
		</van-popup>
		<filterListPopup
			v-model="shopPopShow"
			title="门店检索"
			:rollingLoad="true"
			:getDataApi="getShopListData"
			@on-select="selectShop(arguments)"
		></filterListPopup>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import filterListPopup from '@/components/common/FilterListPopup.vue'
export default {
	name: 'FilterPop',
	components: {
		filterListPopup
	},
	props: {
		visibleFlag: Boolean,
		filterParams: {
			type: Object,
			default: () => {
				return {}
			}
		}
	},
	data () {
		return {
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			currentDate: new Date(),
			datePickerShow: false,
			beginDate: this.$fxCommon.orderFilterStartDate(),
			endDate: this.$fxCommon.orderFilterEndDate(),
			beginReckonDate: this.$fxCommon.orderFilterStartDate(),
			endReckonDate: this.$fxCommon.orderFilterEndDate(),
			shop: {
				name: '请选择'
			},
			shopPopShow: false,
			searchGoodsKeyword: '',
			billNo: ''
		}
	},
	watch: {
		visibleFlag: {
			handler (val) {
				if (val && this.$fxUtils.isEmptyObjSHW(this.filterParams)) {
					this.resetHandler()
				}
			},
			immediate: true
		}
	},
	computed: {
		...mapState({
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId
		})
	},
	methods: {
		onCloseClick () {
			this.$emit('update:visibleFlag', false)
		},
		onBeginDateClick () {
			this.datePickerShow = true
			if (this.beginDate) this.currentDate = new Date(this.beginDate)
			this.dateType = 'begin'
		},
		onEndDateClick () {
			this.datePickerShow = true
			if (this.endDate) this.currentDate = new Date(this.endDate)
			this.dateType = 'end'
		},
		onBeginReckonDateClick () {
			this.datePickerShow = true
			if (this.beginReckonDate) this.currentDate = new Date(this.beginReckonDate)
			this.dateType = 'beginReckon'
		},
		onEndReckonDateClick () {
			this.datePickerShow = true
			if (this.endReckonDate) this.currentDate = new Date(this.endReckonDate)
			this.dateType = 'endReckon'
		},
		dateConfirmhandle (date) {
			if (this.dateType === 'begin') {
				this.beginDate = this.$fxUtils.setDateTime(date, '时分')
				if (!this.endDate || !this.$fxCommon.orderFilterRangeDate(this.beginDate, this.endDate)) {
					this.endDate = this.$fxCommon.orderFilterDate(date)
				}
			} else if (this.dateType === 'end') {
				this.endDate = this.$fxUtils.setDateTime(date, '时分')
				if (!this.beginDate || !this.$fxCommon.orderFilterRangeDate(this.beginDate, this.endDate)) {
					this.beginDate = this.$fxCommon.orderFilterStartDate(date)
				}
			} else if (this.dateType === 'beginReckon') {
				this.beginReckonDate = this.$fxUtils.setDateTime(date, '时分')
				if (!this.endReckonDate || !this.$fxCommon.orderFilterRangeDate(this.beginReckonDate, this.endReckonDate)) {
					this.endReckonDate = this.$fxCommon.orderFilterDate(date)
				}
			} else if (this.dateType === 'endReckon') {
				this.endReckonDate = this.$fxUtils.setDateTime(date, '时分')
				if (!this.beginReckonDate || !this.$fxCommon.orderFilterRangeDate(this.beginReckonDate, this.endReckonDate)) {
					this.beginReckonDate = this.$fxCommon.orderFilterStartDate(date)
				}
			}
			this.datePickerShow = false
		},
		// {{{门店
		onShopClick () {
			this.shopPopShow = true
		},
		selectShop ([item]) {
			this.shop = item
		},
		getShopListData (keyword = null, start, size) {
			let params = {
				keyword: keyword,
				start: start,
				size: size
			}
			return this.$fxApi('z5common.getListShop4ExceptPS')({ data: params }).then(res => {
				return res.shops
			})
		},
		// }}}
		onResetClick () {
			this.resetHandler()
		},
		resetHandler () {
			this.beginDate = this.$fxCommon.orderFilterStartDate()
			this.endDate = this.$fxCommon.orderFilterEndDate()
			this.beginReckonDate = this.$fxCommon.orderFilterStartDate()
			this.endReckonDate = this.$fxCommon.orderFilterEndDate()
			this.billNo = ''
			this.shop = {
				name: '请选择'
			}
		},
		onConfirmClick () {
			this.$emit('update:visibleFlag', false)
			this.$emit('update:filterParams', this.getFilterParams())
			this.$emit('on-confirm', this.getFilterParams())
		},
		getFilterParams () {
			return {
				beginDate: this.beginDate || this.$fxCommon.orderFilterStartDate(),
				endDate: this.endDate || this.$fxCommon.orderFilterEndDate(),
				beginReckonDate: this.beginReckonDate || this.$fxCommon.orderFilterStartDate(),
				endReckonDate: this.endReckonDate || this.$fxCommon.orderFilterEndDate(),
				shopId: this.shop.id,
				billNo: this.billNo
			}
		},
		onFocus (ref) {
			this.onScrollTop(ref)
		},
		onScrollTop (scrollRef, distance = 20) {
			let detailsRowRef = this.$refs[scrollRef]
			if (!detailsRowRef || detailsRowRef.length === 0) {
				return false
			}
			let offsetTop = detailsRowRef.$el.offsetTop
			let $el = this.$refs['filterContent']
			this.$fxUtils.scrollTopW({ offsetTop, $el, distance })
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.filter-popup {
	height:100%
	width: 100%
	text-align:left
	display: flex
	flex-direction: column
	.filter-content {
		flex:1
		overflow:scroll
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
	.filter-bottom {
		display: flex
		flex-direction: row
		width:100%
		.reset-btn,.confirm-btn {
			flex:1
		}
	}
}
</style>
