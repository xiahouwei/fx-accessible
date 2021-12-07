<template>
	<filterPopComp
		@on-close="onCloseClick"
		@on-confirm="onConfirmClick"
		@on-reset="onResetClick">
		<van-cell-group slot="solt-filter-cell">
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
			<van-pro-field
				v-model="storeNO"
				label="仓位编号"
				placeholder="请输入仓位编号"
				input-align="right"
			></van-pro-field>
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
			<van-cell title="当前库存范围"></van-cell>
			<van-pro-number-field
				v-model="stockMinAmount"
				label="库存下限"
				input-align="right"
				min="0"
				:max="maxAmount"
				:intLength="numberLength"
				:pointSize="sysPointSize"
			></van-pro-number-field>
			<van-pro-number-field
				v-model="stockMaxAmount"
				label="库存上限"
				input-align="right"
				min="0"
				:max="maxAmount"
				:intLength="numberLength"
				:pointSize="sysPointSize"
			></van-pro-number-field>
		</van-cell-group>
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
	</filterPopComp>
</template>

<script>
import { mapState } from 'vuex'
import filterPopComp from '@/components/reportForm/common/FilterPopComp.vue'
import filterCell from '@/components/common/FilterCell.vue'
import filterListPopup from '@/components/common/FilterListPopup.vue'
const FILTER_PARAMS_KEY = [
	'shop',
	'storeType',
	'store',
	'bigClass',
	'smallClass',
	'itemType',
	'item'
]
export default {
	name: 'filterPop',
	components: {
		filterPopComp,
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
			shop: '请选择',
			shopId: '',
			storeType: '请选择',
			storeTypeId: '',
			store: '请选择',
			storeId: '',
			storeNO: '',
			bigClass: '请选择',
			bigClassId: '',
			smallClass: '请选择',
			smallClassId: '',
			itemType: '请选择',
			itemTypeId: '',
			item: '请选择',
			itemId: '',
			stockMinAmount: 0,
			stockMaxAmount: 0,
			shopPopShow: false,
			storeTypePopShow: false,
			storePopShow: false,
			bigClassPopShow: false,
			smallClassPopShow: false,
			itemTypePopShow: false,
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
		}
	},
	methods: {
		initDefaultShop () {
			this.shopId = this.filterParams.shopId
			this.shop = this.filterParams.shop
		},
		getFilterParams () {
			const stockMinAmount = this.stockMinAmount === 0 ? null : this.stockMinAmount
			const stockMaxAmount = this.stockMaxAmount === 0 ? null : this.stockMaxAmount
			return {
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
				storeNO: this.storeNO,
				stockMinAmount,
				stockMaxAmount
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
			this.storeNO = ''
			this.stockMinAmount = 0
			this.stockMaxAmount = 0
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
		// 机构名称
		getShopListData (keyword = null, start, size) {
			const params = {
				keyword: keyword,
				shoparea: null,
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
		}
	}
}
</script>
