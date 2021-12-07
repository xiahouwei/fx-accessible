<template>
	<filterPopComp
		@on-close="onCloseClick"
		@on-confirm="onConfirmClick"
		@on-reset="onResetClick">
		<van-cell-group slot="solt-filter-cell">
			<van-cell title="业务日期"/>
			<van-cell title="起始时间" :value="beginDate" is-link @click="onBeginDateClick" />
			<van-cell title="结束时间" :value="endDate" is-link @click="endDateClick" />
			<filterCell
				title="门店区域"
				:value="shopArea"
				:showCloseBtn="!!shopAreaId"
				@on-click="onFilterCellClick('shopAreaPopShow')"
				@on-clear="onFilterCellClear(['shopArea', 'shop'])"
			></filterCell>
			<filterCell
				title="机构名称"
				:value="shop"
				:showCloseBtn="!!shopId"
				@on-click="onFilterCellClick('shopPopShow')"
				@on-clear="onFilterCellClear('shop')"
			></filterCell>
			<filterCell
				title="仓库类型"
				:value="storeType"
				:showCloseBtn="!!storeTypeId"
				@on-click="onFilterCellClick('storeTypePopShow')"
				@on-clear="onFilterCellClear(['storeType', 'store'])"
			></filterCell>
			<filterCell
				title="仓库名称"
				:value="store"
				:showCloseBtn="!!storeId"
				@on-click="onFilterCellClick('storePopShow')"
				@on-clear="onFilterCellClear('store')"
			></filterCell>
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
				title="储藏方式"
				:value="goodsStore"
				:showCloseBtn="!!goodsStoreId"
				@on-click="onFilterCellClick('goodsStorePopShow')"
				@on-clear="onFilterCellClear(['goodsStore', 'item'])"
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
			v-model="shopAreaPopShow"
			title="门店区域检索"
			:getDataApi="getShopAreaListData"
			@on-select="onFilterSelect(arguments, 'shopArea')"
		></filterListPopup>
		<filterListPopup
			v-model="shopPopShow"
			title="机构名称检索"
			:rollingLoad="true"
			:getDataApi="getShopListData"
			@on-select="onFilterSelect(arguments, 'shop')"
		></filterListPopup>
		<filterListPopup
			v-model="storeTypePopShow"
			title="仓库类型检索"
			:rollingLoad="true"
			:getDataApi="getStoreTypeListData"
			@on-select="onFilterSelect(arguments, 'storeType')"
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
		<filterListPopup
			v-model="goodsStorePopShow"
			title="储藏方式检索"
			:rollingLoad="true"
			:getDataApi="getGoodsStoreWayListData"
			@on-select="onFilterSelect(arguments, 'goodsStore')"
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
	'shopArea',
	'shop',
	'storeType',
	'store',
	'bigClass',
	'smallClass',
	'itemType',
	'item',
	'goodsStore'
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
			beginDate: this.$fxUtils.getCurrentMonthFirst(),
			endDate: this.$fxUtils.getCurrentMonthLast(),
			shopArea: '请选择',
			shopAreaId: '',
			shop: '请选择',
			shopId: '',
			storeType: '请选择',
			storeTypeId: '',
			store: '请选择',
			storeId: '',
			bigClass: '请选择',
			bigClassId: '',
			smallClass: '请选择',
			smallClassId: '',
			itemType: '请选择',
			itemTypeId: '',
			item: '请选择',
			itemId: '',
			goodsStore: '请选择',
			goodsStoreId: '',
			datePickerShow: false,
			shopAreaPopShow: false,
			shopPopShow: false,
			storeTypePopShow: false,
			storePopShow: false,
			bigClassPopShow: false,
			smallClassPopShow: false,
			itemTypePopShow: false,
			goodsStorePopShow: false,
			itemPopShow: false
		}
	},
	created () {
		this.initDefaultShop()
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
			loginerShopId: state => state.loginer.loginerShopId,
			loginerShopName: state => state.loginer.loginerShopName,
			loginerId: state => state.loginer.loginerId,
			loginerOrganType: state => state.loginer.loginerOrganType
		}),
		shopCellDisable () {
			return this.$fxStateMiddleware.stateIs('loginerOrganType')(['shop', 'center', 'area'])(this.loginerOrganType)
		}
	},
	methods: {
		initDefaultShop () {
			this.shopId = this.filterParams.shopId
			this.shop = this.filterParams.shop
		},
		getFilterParams () {
			return {
				beginDate: this.beginDate || this.$fxUtils.getCurrentMonthFirst(),
				endDate: this.endDate || this.$fxUtils.getCurrentMonthLast(),
				shopArea: this.shopArea,
				shopAreaId: this.shopAreaId,
				shop: this.shop,
				shopId: this.shopId,
				storeType: this.storeType,
				storeTypeId: this.storeTypeId,
				store: this.store,
				storeId: this.storeId,
				bigClass: this.bigClass,
				bigClassId: this.bigClassId,
				smallClass: this.smallClass,
				smallClassId: this.smallClassId,
				itemType: this.itemType,
				itemTypeId: this.itemTypeId,
				item: this.item,
				itemId: this.itemId,
				goodsStore: this.goodsStore,
				goodsStoreId: this.goodsStoreId
			}
		},
		onCloseClick () {
			this.$emit('update:visibleFlag', false)
		},
		onConfirmClick () {
			this.confirmCheck().then(() => {
				this.$emit('update:visibleFlag', false)
				this.$emit('update:filterParams', this.getFilterParams())
				this.$emit('on-confirm', this.getFilterParams())
			})
		},
		onResetClick () {
			this.resetHandler()
		},
		resetHandler () {
			this.beginDate = this.$fxUtils.getCurrentMonthFirst()
			this.endDate = this.$fxUtils.getCurrentMonthLast()
			this.resetFilterCell(FILTER_PARAMS_KEY)
			if (this.shopCellDisable) {
				this.shop = this.loginerShopName
				this.shopId = this.loginerShopId
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
		confirmCheck () {
			return new Promise(resolve => {
				if (!this.shopId) {
					this.$fxToast.fail('请选择机构!')
					return false
				}
				resolve()
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
		dateConfirmhandle (date) {
			if (this.dateType === 'begin') {
				this.beginDate = this.$fxUtils.setDate(date)
				if (!this.endDate || !this.$fxUtils.compareDateRange(this.beginDate, this.endDate, 31)) {
					this.endDate = this.setDateRange(this.beginDate, 31)
				}
			} else {
				this.endDate = this.$fxUtils.setDate(date)
				if (!this.beginDate || !this.$fxUtils.compareDateRange(this.beginDate, this.endDate, 31)) {
					this.beginDate = this.setDateRange(this.endDate, -31)
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
			case 'shopArea':
				this.resetFilterCell(['shop', 'store'])
				break
			case 'shop':
				this.resetFilterCell('store')
				break
			case 'storeType':
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
		// 门店区域
		getShopAreaListData (keyword = null) {
			const params = {
				keyword: keyword
			}
			return this.$fxApi('reportForm.getShopArea')(params)
		},
		// 机构名称
		getShopListData (keyword = null, start, size) {
			const params = {
				keyword: keyword,
				shoparea: this.shopAreaId || null,
				start,
				size
			}
			return this.$fxApi('reportForm.getShop')(params)
		},
		// 仓库类型
		getStoreTypeListData (keyword = null, start, size) {
			const params = {
				keyword: keyword,
				start,
				size
			}
			return this.$fxApi('reportForm.getStoreType')(params)
		},
		// 仓库名称
		getStoreListData (keyword = null, start, size) {
			const params = {
				keyword: keyword,
				shopName: this.shopId,
				houseType: this.storeTypeId,
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
		// 单据类型
		getItemTypeListData (keyword = null, start, size) {
			const params = {
				keyword: keyword,
				start,
				size
			}
			return this.$fxApi('reportForm.getItemType')(params)
		},
		// 储藏方式
		getGoodsStoreWayListData (keyword = null, start, size) {
			const params = {
				keyword: keyword,
				start,
				size
			}
			return this.$fxApi('reportForm.getGoodsStoreWay')(params)
		}
	}
}
</script>
