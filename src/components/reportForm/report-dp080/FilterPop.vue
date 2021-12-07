<template>
	<filterPopComp
		@on-close="onCloseClick"
		@on-confirm="onConfirmClick"
		@on-reset="onResetClick">
		<van-cell-group slot="solt-filter-cell">
			<van-cell title="业务日期"/>
			<van-cell title="起始时间" :value="beginDate" is-link @click="onBeginDateClick" />
			<van-cell title="结束时间" :value="endDate" is-link @click="endDateClick" />
			<van-cell title="到货日期"/>
			<van-cell title="起始时间" :value="arriveBeginDate" is-link @click="onArriveBeginDateClick" />
			<van-cell title="结束时间" :value="arriveEndDate" is-link @click="onArriveEndDateClick" />
			<filterCell
				title="中心"
				:value="center"
				:showCloseBtn="!!centerId"
				@on-click="onFilterCellClick('centerPopShow')"
				@on-clear="onFilterCellClear(['center', 'centerStore'])"
			></filterCell>
			<filterCell
				title="中心仓库"
				:value="centerStore"
				:showCloseBtn="!!centerStoreId"
				@on-click="onFilterCellClick('centerStorePopShow')"
				@on-clear="onFilterCellClear('centerStore')"
			></filterCell>
			<filterCell
				title="供货商"
				:value="supplier"
				:showCloseBtn="!!supplierId"
				@on-click="onFilterCellClick('supplierPopShow')"
				@on-clear="onFilterCellClear('supplier')"
			></filterCell>
			<filterCell
				title="门店"
				:value="shop"
				:showCloseBtn="!!shopId"
				@on-click="onFilterCellClick('shopPopShow')"
				@on-clear="onFilterCellClear(['shop', 'store'])"
			></filterCell>
			<filterCell
				title="门店仓库"
				:value="store"
				:showCloseBtn="!!storeId"
				@on-click="onFilterCellClick('storePopShow')"
				@on-clear="onFilterCellClear('store')"
			></filterCell>
			<van-cell title="配送属性" :value="distributTypeName" is-link @click="onDistributTypeClick" />
			<van-cell title="分派状态" :value="assignFlagValueName" is-link @click="onAssignFlagValueClick" />
			<filterCell
				title="品项大类"
				:value="bigClass"
				:showCloseBtn="!!bigClassId"
				@on-click="onFilterCellClick('bigClassPopShow')"
				@on-clear="onFilterCellClear(['bigClass', 'smallClass', 'item'])"
			></filterCell>
			<filterCell
				title="品项小类"
				:value="smallClass"
				:showCloseBtn="!!smallClassId"
				@on-click="onFilterCellClick('smallClassPopShow')"
				@on-clear="onFilterCellClear(['smallClass', 'item'])"
			></filterCell>
			<filterCell
				title="品项类型"
				:value="itemType"
				:showCloseBtn="!!itemTypeId"
				@on-click="onFilterCellClick('itemTypePopShow')"
				@on-clear="onFilterCellClear(['itemType', 'item'])"
			></filterCell>
			<filterCell
				title="品项名称"
				:value="item"
				:showCloseBtn="!!itemId"
				@on-click="onFilterCellClick('itemPopShow')"
				@on-clear="onFilterCellClear('item')"
			></filterCell>
			<filterCell
				title="单据类型"
				:value="storeBillType"
				:showCloseBtn="!!storeBillTypeId"
				@on-click="onFilterCellClick('storeBillTypePopShow')"
				@on-clear="onFilterCellClear(['storeBillType'])"
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
			v-model="centerPopShow"
			title="中心检索"
			:rollingLoad="true"
			:getDataApi="getCenterListData"
			@on-select="onFilterSelect(arguments, 'center')"
		></filterListPopup>
		<filterListPopup
			v-model="centerStorePopShow"
			title="中心仓库"
			:rollingLoad="true"
			:getDataApi="getCenterStoreListData"
			@on-select="onFilterSelect(arguments, 'centerStore')"
		></filterListPopup>
		<filterListPopup
			v-model="supplierPopShow"
			title="供货商检索"
			:rollingLoad="true"
			:getDataApi="getSupplierListData"
			@on-select="onFilterSelect(arguments, 'supplier')"
		></filterListPopup>
		<filterListPopup
			v-model="shopPopShow"
			title="门店检索"
			:rollingLoad="true"
			:getDataApi="getShopListData"
			@on-select="onFilterSelect(arguments, 'shop')"
		></filterListPopup>
		<filterListPopup
			v-model="storePopShow"
			title="仓库检索"
			:rollingLoad="true"
			:getDataApi="getStoreListData"
			@on-select="onFilterSelect(arguments, 'store')"
		></filterListPopup>
		<filterListPopup
			v-model="bigClassPopShow"
			title="品项大类检索"
			:rollingLoad="true"
			:getDataApi="getBigClassListData"
			@on-select="onFilterSelect(arguments, 'bigClass')"
		></filterListPopup>
		<filterListPopup
			v-model="smallClassPopShow"
			title="品项小类检索"
			:rollingLoad="true"
			:getDataApi="getSmallClassListData"
			@on-select="onFilterSelect(arguments, 'smallClass')"
		></filterListPopup>
		<filterListPopup
			v-model="itemTypePopShow"
			title="品项类别检索"
			:rollingLoad="true"
			:getDataApi="getItemTypeListData"
			@on-select="onFilterSelect(arguments, 'itemType')"
		></filterListPopup>
		<filterListPopup
			v-model="itemPopShow"
			title="品项检索"
			:rollingLoad="true"
			:getDataApi="getItemListData"
			@on-select="onFilterSelect(arguments, 'item')"
		></filterListPopup>
		<van-popup v-model="distributTypePopShow" position="right" class="fx-list-popup-300">
			<listComp
				:visibleFlag.sync="distributTypePopShow"
				:data="distributTypeList"
				title="配送属性检索"
				:loadFinished="true"
				@on-select="selectDistributType"
				@on-search="searchDistributType"
			></listComp>
		</van-popup>
		<van-popup v-model="assignFlagValuePopShow" position="right" class="fx-list-popup-300">
			<listComp
				:visibleFlag.sync="assignFlagValuePopShow"
				:data="assignFlagValueList"
				title="分派状态检索"
				:loadFinished="true"
				@on-select="selectAssignFlagValue"
				@on-search="searchAssignFlagValue"
			></listComp>
		</van-popup>
		<filterListPopup
			v-model="storeBillTypePopShow"
			title="单据类型检索"
			:rollingLoad="true"
			:getDataApi="getStoreBillTypeListData"
			@on-select="onFilterSelect(arguments, 'storeBillType')"
		></filterListPopup>
	</filterPopComp>
</template>

<script>
import { mapState } from 'vuex'
import filterPopComp from '@/components/reportForm/common/FilterPopComp.vue'
import datePicker from '@/components/common/DatePicker.vue'
import filterCell from '@/components/common/FilterCell.vue'
import filterListPopup from '@/components/common/FilterListPopup.vue'
import listComp from '@/components/common/ListComp.vue'
const FILTER_PARAMS_KEY = [
	'center',
	'centerStore',
	'supplier',
	'shop',
	'store',
	'bigClass',
	'smallClass',
	'itemType',
	'item',
	'storeBillType'
]
export default {
	name: 'filterPop',
	components: {
		filterPopComp,
		datePicker,
		filterCell,
		filterListPopup,
		listComp
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
			beginDate: this.$fxUtils.setDate(),
			endDate: this.$fxUtils.setDate(),
			arriveBeginDate: '',
			arriveEndDate: '',
			center: '请选择',
			centerId: '',
			shop: '请选择',
			shopId: '',
			supplier: '请选择',
			supplierId: '',
			store: '请选择',
			storeId: '',
			centerStore: '请选择',
			centerStoreId: '',
			bigClass: '请选择',
			bigClassId: '',
			smallClass: '请选择',
			smallClassId: '',
			itemType: '请选择',
			itemTypeId: '',
			item: '请选择',
			itemId: '',
			storeBillType: '请选择',
			storeBillTypeId: '',
			assignFlagValue: null,
			assignFlagValueName: '全部',
			assignFlagValues: [
				{ id: null, name: '不限' },
				{ id: '未分派', name: '未分派' },
				{ id: '已分派', name: '已分派' },
				{ id: '不分派', name: '不分派' },
				{ id: '进行中', name: '进行中' }
			],
			assignFlagValuePopShow: false,
			assignFlagValueList: [],
			distributTypeName: '全部',
			distributType: null,
			distributTypes: [
				{ id: null, name: '不限' },
				{ id: '统配', name: '统配' },
				{ id: '直通', name: '直通' },
				{ id: '直送', name: '直送' },
				{ id: '直配', name: '直配' }
			],
			distributTypePopShow: false,
			distributTypeList: [],
			centerPopShow: false,
			datePickerShow: false,
			shopPopShow: false,
			supplierPopShow: false,
			storePopShow: false,
			centerStorePopShow: false,
			bigClassPopShow: false,
			smallClassPopShow: false,
			itemTypePopShow: false,
			storeBillTypePopShow: false,
			itemPopShow: false
		}
	},
	created () {
		// this.initDefaultShop()
		this.initDefaultCenter()
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
			return this.$fxStateMiddleware.stateIs('loginerOrganType')(['shop', 'center', 'area'])(this.loginerOrganType)
		},
		centerCellDisable () {
			return this.$fxStateMiddleware.stateIs('loginerOrganType')(['center'])(this.loginerOrganType)
		}
	},
	methods: {
		initDefaultShop () {
			this.shopId = this.filterParams.shopId
			this.shop = this.filterParams.shop
		},
		initDefaultCenter () {
			this.centerId = this.filterParams.centerId
			this.center = this.filterParams.center
		},
		getFilterParams () {
			return {
				beginDate: this.beginDate || this.$fxUtils.setDate(),
				endDate: this.endDate || this.$fxUtils.setDate(),
				arriveBeginDate: this.arriveBeginDate || '',
				arriveEndDate: this.arriveEndDate || '',
				center: this.center,
				centerId: this.centerId,
				supplier: this.supplier,
				supplierId: this.supplierId,
				shop: this.shop,
				shopId: this.shopId,
				store: this.store,
				storeId: this.storeId,
				centerStore: this.centerStore,
				centerStoreId: this.centerStoreId,
				bigClass: this.bigClass,
				bigClassId: this.bigClassId,
				smallClass: this.smallClass,
				smallClassId: this.smallClassId,
				item: this.item,
				itemId: this.itemId,
				itemTypeId: this.itemTypeId,
				storeBillType: this.storeBillType,
				storeBillTypeId: this.storeBillTypeId,
				assignFlagValue: this.assignFlagValue,
				distributType: this.distributType
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
			this.beginDate = `${this.$fxUtils.setDate()}`
			this.endDate = `${this.$fxUtils.setDate()}`
			this.arriveBeginDate = ''
			this.arriveEndDate = ''
			this.assignFlagValue = null
			this.distributType = null
			this.assignFlagValueName = '全部'
			this.distributTypeName = '全部'
			this.resetFilterCell(FILTER_PARAMS_KEY)
			// if (this.shopCellDisable) {
			// 	this.shop = this.loginerShopName
			// 	this.shopId = this.loginerShopId
			// }
			if (this.centerCellDisable) {
				this.initDefaultCenter()
			}
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
			if (this.beginDate) this.currentDate = new Date(this.beginDate)
			this.datePickerShow = true
		},
		endDateClick () {
			this.dateType = 'end'
			if (this.endDate) this.currentDate = new Date(this.endDate)
			this.datePickerShow = true
		},
		onArriveBeginDateClick () {
			this.dateType = 'arriveBegin'
			if (this.arriveBeginDate) this.currentDate = new Date(this.arriveBeginDate)
			this.datePickerShow = true
		},
		onArriveEndDateClick () {
			this.dateType = 'arriveEnd'
			if (this.arriveEndDate) this.currentDate = new Date(this.arriveEndDate)
			this.datePickerShow = true
		},
		dateConfirmhandle (date) {
			if (this.dateType === 'begin') {
				this.beginDate = this.$fxUtils.setDate(date)
				if (!this.endDate || !this.$fxUtils.compareDateRange(this.beginDate, this.endDate, 31)) {
					this.endDate = this.setDateRange(this.beginDate, 31)
				}
			} else if (this.dateType === 'end') {
				this.endDate = this.$fxUtils.setDate(date)
				if (!this.beginDate || !this.$fxUtils.compareDateRange(this.beginDate, this.endDate, 31)) {
					this.beginDate = this.setDateRange(this.endDate, -31)
				}
			} else if (this.dateType === 'arriveBegin') {
				this.arriveBeginDate = this.$fxUtils.setDate(date)
				if (!this.arriveEndDate || !this.$fxUtils.compareDateRange(this.arriveBeginDate, this.arriveEndDate, 31)) {
					this.arriveEndDate = this.setDateRange(this.arriveBeginDate, 31)
				}
			} else if (this.dateType === 'arriveEnd') {
				this.arriveEndDate = this.$fxUtils.setDate(date)
				if (!this.arriveBeginDate || !this.$fxUtils.compareDateRange(this.arriveBeginDate, this.arriveEndDate, 31)) {
					this.arriveBeginDate = this.setDateRange(this.arriveEndDate, -31)
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
			case 'center':
				this.resetFilterCell('centerStore')
				break
			case 'shop':
				this.resetFilterCell('store')
				break
			case 'bigClass':
				this.resetFilterCell(['smallClass', 'item'])
				break
			case 'smallClass':
				this.resetFilterCell('item')
				break
			case 'itemType':
				this.resetFilterCell('item')
				break
			}
		},
		resetFilterCell (cellName) {
			const cells = [].concat(cellName)
			cells.forEach(item => {
				this[item] = '请选择'
				this[`${item}Id`] = ''
			})
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
		// 中心仓库名称
		getCenterStoreListData (keyword = null, start, size) {
			const params = {
				keyword: keyword,
				centerId: this.centerId,
				start,
				size
			}
			return this.$fxApi('reportForm.getUsingStore')(params)
		},
		// 供货商名称
		getSupplierListData (keyword = null, start, size) {
			const params = {
				searchText: keyword,
				start,
				size
			}
			return this.$fxApi('reportForm.getSupplier')(params)
		},
		// 门店名称
		getShopListData (keyword = null, start, size) {
			const params = {
				keyword: keyword,
				start,
				size
			}
			return this.$fxApi('reportForm.getAuthShop')(params)
		},
		// 仓库名称
		getStoreListData (keyword = null, start, size) {
			const params = {
				keyword: keyword,
				shopName: this.shopId,
				start,
				size
			}
			return this.$fxApi('reportForm.getStore')(params)
		},
		// 品项大类
		getBigClassListData (keyword = null, start, size) {
			const params = {
				keyword: keyword,
				bigOrSmall: '1',
				start,
				size
			}
			return this.$fxApi('reportForm.getItemClass')(params)
		},
		// 品项小类
		getSmallClassListData (keyword = null, start, size) {
			const params = {
				keyword: keyword,
				bigOrSmall: '2',
				goodsBigType: this.bigClassId,
				start,
				size
			}
			return this.$fxApi('reportForm.getItemClass')(params)
		},
		// 品项
		getItemListData (keyword = null, start, size) {
			const params = {
				keyword: keyword,
				start,
				size,
				goodsBigType: this.bigClassId,
				goodsSmallType: this.smallClassId,
				goodsStyle: this.itemTypeId
			}
			return this.$fxApi('reportForm.getItem')(params)
		},
		// 品项类型
		getItemTypeListData (keyword = null, start, size) {
			const params = {
				keyword: keyword,
				start,
				size
			}
			return this.$fxApi('reportForm.getItemType')(params)
		},
		// 单据类型
		getStoreBillTypeListData (keyword = null, start, size) {
			const params = {
				keyword: keyword,
				start,
				size
			}
			return this.$fxApi('reportForm.getStoreBillType')(params)
		},
		// {{{ 分派状态
		onAssignFlagValueClick () {
			this.assignFlagValueList = this.assignFlagValues
			this.assignFlagValuePopShow = true
		},
		selectAssignFlagValue (item) {
			this.assignFlagValueName = item.name
			this.assignFlagValue = item.id
		},
		searchAssignFlagValue (keyword) {
			this.assignFlagValueList = this.assignFlagValues.filter(item => {
				return item['name'].includes(keyword)
			})
		},
		// }}}
		// {{{ 配送属性
		onDistributTypeClick () {
			this.distributTypeList = this.distributTypes
			this.distributTypePopShow = true
		},
		selectDistributType (item) {
			this.distributTypeName = item.name
			this.distributType = item.id
		},
		searchDistributType (keyword) {
			this.distributTypeList = this.distributTypes.filter(item => {
				return item['name'].includes(keyword)
			})
		}
		// }}}
	}
}
</script>
