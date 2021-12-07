<template>
	<filterPopComp
		@on-close="onCloseClick"
		@on-confirm="onConfirmClick"
		@on-reset="onResetClick">
		<van-cell-group slot="solt-filter-cell">
			<filterCell
				title="中心名称"
				:value="shopName"
				:showCloseBtn="!!shopNameId"
				@on-click="onFilterCellClick('shopNamePopShow')"
				@on-clear="onFilterCellClear(['shopName', 'store'])"
			></filterCell>
			<filterCell
				title="中心仓库"
				:value="store"
				:showCloseBtn="!!storeId"
				@on-click="onFilterCellClick('storePopShow')"
				@on-clear="onFilterCellClear('store')"
			></filterCell>
			<filterCell
				title="品项大类"
				:value="dlName"
				:showCloseBtn="!!dlNameId"
				@on-click="onFilterCellClick('dlNamePopShow')"
				@on-clear="onFilterCellClear(['dlName', 'lbName', 'itemName'])"
			></filterCell>
			<filterCell
				title="品项类别"
				:value="lbName"
				:showCloseBtn="!!lbNameId"
				@on-click="onFilterCellClick('lbNamePopShow')"
				@on-clear="onFilterCellClear(['lbName', 'itemName'])"
			></filterCell>
			<filterCell
				title="品项名称"
				:value="itemName"
				:showCloseBtn="!!itemNameId"
				@on-click="onFilterCellClick('itemNamePopShow')"
				@on-clear="onFilterCellClear('itemName')"
			></filterCell>
			<filterCell
				title="生产日期"
				:value="detes"
				class="dates-class"
				:showCloseBtn="!!detes"
				@on-clear="onFilterCellClear('dates')"
			></filterCell>
			<van-cell title="起始时间" :value="makeTimeOn" is-link @click="onBeginDateClick" />
			<van-cell title="结束时间" :value="makeTimeOff" is-link @click="endDateClick" />
			<w-cell title="结存数量">
				<w-number-input
					v-model="startAmount"
					:defaultValue="defaultValue"
					:pointSize="pointSize"
					:isEmptyValue="isEmptyValue"
					:type='inputType'
				/>&nbsp;&nbsp;至&nbsp;
				<w-number-input
					v-model="endAmount"
					:defaultValue="defaultValue"
					:pointSize="pointSize"
					:isEmptyValue="isEmptyValue"
					:type='inputType'
				/>
			</w-cell>
			<filterCell
				title="财务分类"
				:value="ftName"
				:showCloseBtn="!!ftNameId"
				@on-click="onFilterCellClick('ftNamePopShow')"
				@on-clear="onFilterCellClear('ftName')"
			></filterCell>
		</van-cell-group>
		<van-popup v-model="datePickerShow" position="bottom">
			<datePicker
				:visibleFlag.sync="datePickerShow"
				:currentDate="currentDate"
				@confirm="dateConfirmhandle"
			></datePicker>
		</van-popup>
		<filterListPopup
			v-model="shopNamePopShow"
			title="中心检索"
			:rollingLoad="true"
			:getDataApi="getCenterListData"
			@on-select="onFilterSelect(arguments, 'shopName')"
		></filterListPopup>
		<filterListPopup
			v-model="storePopShow"
			title="中心仓库检索"
			:rollingLoad="true"
			:getDataApi="getCenterStoreListData"
			@on-select="onFilterSelect(arguments, 'store')"
		></filterListPopup>
		<filterListPopup
			v-model="dlNamePopShow"
			title="品项大类检索"
			:rollingLoad="true"
			:getDataApi="getBigClassListData"
			@on-select="onFilterSelect(arguments, 'dlName')"
		></filterListPopup>
		<filterListPopup
			v-model="lbNamePopShow"
			title="品项类别检索"
			:rollingLoad="true"
			:getDataApi="getSmallClassListData"
			@on-select="onFilterSelect(arguments, 'lbName')"
		></filterListPopup>
		<filterListPopup
			v-model="itemNamePopShow"
			title="品项检索"
			:rollingLoad="true"
			:getDataApi="getItemListData"
			@on-select="onFilterSelect(arguments, 'itemName')"
		></filterListPopup>
		<filterListPopup
			v-model="ftNamePopShow"
			title="财务分类检索"
			:rollingLoad="true"
			:getDataApi="getFinancialTypeListData"
			@on-select="onFilterSelect(arguments, 'ftName')"
		></filterListPopup>
	</filterPopComp>
</template>

<script>
import { mapState } from 'vuex'
import filterPopComp from '@/components/reportForm/common/FilterPopComp.vue'
import datePicker from '@/components/common/DatePicker.vue'
import filterCell from '@/components/common/FilterCell.vue'
import filterListPopup from '@/components/common/FilterListPopup.vue'
const FILTER_PARAMS_KEY = [
	'shopName',
	'store',
	'dlName',
	'lbName',
	'itemName',
	'ftName'
]
export default {
	name: 'filterPop',
	components: {
		filterPopComp,
		datePicker,
		filterCell,
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
			dateType: '',
			currentDate: new Date(),
			makeTimeOn: this.$fxUtils.setDate(),
			makeTimeOff: this.$fxUtils.setDate(),
			shopName: '请选择',
			shopNameId: '',
			store: '请选择',
			storeId: '',
			dlName: '请选择',
			dlNameId: '',
			lbName: '请选择',
			lbNameId: '',
			itemName: '请选择',
			itemNameId: '',
			startAmount: '',
			endAmount: '',
			ftName: '请选择',
			ftNameId: '',
			shopNamePopShow: false,
			datePickerShow: false,
			storePopShow: false,
			dlNamePopShow: false,
			lbNamePopShow: false,
			itemNamePopShow: false,
			ftNamePopShow: false,
			pointSize: 4, // 数量限制4位小数
			defaultValue: '',
			inputWidth: '200',
			isEmptyValue: true,
			inputType: 'text'
		}
	},
	created () {
	},
	watch: {
		visibleFlag: {
			handler (val) {
				val && (this.$fxUtils.isEmptyObjSHW(this.filterParams) ? this.resetHandler() : this.setFilterParams())
			},
			immediate: true
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize',
			numberLength: 'numberLength',
			maxAmount: 'maxAmount',
			loginerShopId: state => state.loginer.loginerShopId,
			loginerShopName: state => state.loginer.loginerShopName,
			loginerId: state => state.loginer.loginerId,
			loginerOrganType: state => state.loginer.loginerOrganType
		}),
		shopCellDisable () {
			return this.$fxStateMiddleware.stateIs('loginerOrganType')(['shop', 'shopName', 'area'])(this.loginerOrganType)
		},
		detes () {
			if (this.makeTimeOn || this.makeTimeOff) {
				return this.makeTimeOn + '至' + this.makeTimeOff
			} else {
				return ''
			}
		}
	},
	methods: {
		getFilterParams () {
			return {
				makeTimeOn: this.makeTimeOn,
				makeTimeOff: this.makeTimeOff,
				shopName: this.shopName,
				shopNameId: this.shopNameId,
				store: this.store,
				storeId: this.storeId,
				dlName: this.dlName,
				dlNameId: this.dlNameId,
				lbName: this.lbName,
				lbNameId: this.lbNameId,
				itemName: this.itemName,
				itemNameId: this.itemNameId,
				startAmount: this.startAmount,
				endAmount: this.endAmount,
				ftName: this.ftName,
				ftNameId: this.ftNameId
			}
		},
		onCloseClick () {
			this.$emit('update:visibleFlag', false)
		},
		onConfirmClick () {
			this.$emit('update:visibleFlag', false)
			this.$emit('update:filterParams', this.getFilterParams())
			this.$emit('on-confirm', this.getFilterParams())
		},
		onResetClick () {
			this.resetHandler()
		},
		resetHandler () {
			this.makeTimeOn = `${this.$fxUtils.setDate()}`
			this.makeTimeOff = `${this.$fxUtils.setDate()}`
			this.startAmount = ''
			this.endAmount = ''
			this.resetFilterCell(FILTER_PARAMS_KEY)
		},
		setFilterParams () {
			FILTER_PARAMS_KEY.forEach(name => {
				if (this.filterParams[name]) {
					this[name] = this.filterParams[name]
					this[`${name}Id`] = this.filterParams[`${name}Id`]
				} else {
					this.resetFilterCell(name)
				}
			})
		},
		onBeginDateClick () {
			this.dateType = 'begin'
			if (this.makeTimeOn) this.currentDate = new Date(this.makeTimeOn)
			this.datePickerShow = true
		},
		endDateClick () {
			this.dateType = 'end'
			if (this.makeTimeOff) this.currentDate = new Date(this.makeTimeOff)
			this.datePickerShow = true
		},
		dateConfirmhandle (date) {
			if (this.dateType === 'begin') {
				this.makeTimeOn = this.$fxUtils.setDate(date)
				if (!this.makeTimeOff || !this.$fxUtils.compareDateRange(this.makeTimeOn, this.makeTimeOff, 31)) {
					this.makeTimeOff = this.setDateRange(this.makeTimeOn, 31)
				}
			} else if (this.dateType === 'end') {
				this.makeTimeOff = this.$fxUtils.setDate(date)
				if (!this.makeTimeOn || !this.$fxUtils.compareDateRange(this.makeTimeOn, this.makeTimeOff, 31)) {
					this.makeTimeOn = this.setDateRange(this.makeTimeOff, -31)
				}
			}
			this.datePickerShow = false
		},
		setDateRange (date, range) {
			return this.$fxUtils.setDate(this.$fxUtils.getCustomAssignDate(date, range))
		},
		onFilterCellClick (type) {
			this[type] = true
		},
		onFilterCellClear (name) {
			this.resetFilterCell(name)
		},
		onFilterSelect ([item], name) {
			this[name] = item.name
			this[`${name}Id`] = item.id
			this.selectAfterHandler(name)
		},
		selectAfterHandler (type) {
			switch (type) {
			case 'shopName':
				this.resetFilterCell('store')
				break
			case 'dlName':
				this.resetFilterCell(['lbName', 'itemName'])
				break
			case 'lbName':
				this.resetFilterCell('itemName')
				break
			}
		},
		resetFilterCell (cellName) {
			if (cellName === 'dates') {
				this.datesResetFilterCell()
			} else {
				const cells = [].concat(cellName)
				cells.forEach(item => {
					this[item] = '请选择'
					this[`${item}Id`] = ''
				})
			}
		},
		datesResetFilterCell () {
			this.makeTimeOn = ''
			this.makeTimeOff = ''
		},
		// 中心
		getCenterListData (keyword = null, start, size) {
			const params = {
				keyword: keyword,
				start,
				size
			}
			return this.$fxApi('reportForm.getRdcs')(params)
		},
		// 中心仓库
		getCenterStoreListData (keyword = null, start, size) {
			const params = {
				keyword: keyword,
				pid: this.shopNameId,
				start,
				size
			}
			return this.getDataApi('allhouse', params)
		},
		// 品项大类
		getBigClassListData (keyword = null, start, size) {
			const params = {
				keyword: keyword,
				start,
				size
			}
			return this.getDataApi('goodstype4big', params)
		},
		// 品项类别
		getSmallClassListData (keyword = null, start, size) {
			const params = {
				keyword: keyword,
				pid: this.dlNameId,
				start,
				size
			}
			return this.getDataApi('goodstype4small', params)
		},
		// 品项
		getItemListData (keyword = null, start, size) {
			const params = {
				keyword: keyword,
				start,
				size,
				bigClassId: this.dlNameId,
				smallClassId: this.lbNameId
			}
			return this.getDataApi('allgoods', params)
		},
		// 财务分类
		getFinancialTypeListData (keyword = null, start, size) {
			const params = {
				keyword: keyword,
				start,
				size
			}
			return this.getDataApi('allfinacetype', params)
		},
		// 通用请求
		getDataApi (urlName, params) {
			return this.$fxApi('reportForm.getCommonFilter')(urlName, params)
		}
	}
}
</script>

<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
* {touch-action: pan-y} // pan-y表示启用单指垂直平移手势(上下滑动事件)。用来解决 [Intervention] Unable to preventDefault inside passive event listener due to
.dates-class >>> .filter-cell-value {
  font-size: 3vw
}
</style>
