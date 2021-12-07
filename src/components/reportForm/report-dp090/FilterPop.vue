<template>
	<filterPopComp
		@on-close="onCloseClick"
		@on-confirm="onConfirmClick"
		@on-reset="onResetClick">
		<van-cell-group slot="solt-filter-cell">
			<filterCell
				title="门店名称"
				:value="shop"
				:showCloseBtn="!!shopId && !shopCellDisable"
				@on-click="onFilterCellClick('shopPopShow')"
				@on-clear="onFilterCellClear('shop')"
			></filterCell>
			<filterCell
				title="配送中心"
				:value="center"
				:showCloseBtn="!!centerId"
				@on-click="onFilterCellClick('centerPopShow')"
				@on-clear="onFilterCellClear('center')"
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
				title="品项名称"
				:value="item"
				:showCloseBtn="!!itemId"
				@on-click="onFilterCellClick('itemPopShow')"
				@on-clear="onFilterCellClear('item')"
			></filterCell>
		</van-cell-group>
		<filterListPopup
			v-model="shopPopShow"
			title="机构名称检索"
			:rollingLoad="true"
			:getDataApi="getShopListData"
			@on-select="onFilterSelect(arguments, 'shop')"
		></filterListPopup>
		<filterListPopup
			v-model="centerPopShow"
			title="配送中心检索"
			:rollingLoad="true"
			:getDataApi="getCenterListData"
			@on-select="onFilterSelect(arguments, 'center')"
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
	'center',
	'store',
	'bigClass',
	'smallClass',
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
			center: '请选择',
			centerId: '',
			store: '请选择',
			storeId: '',
			bigClass: '请选择',
			bigClassId: '',
			smallClass: '请选择',
			smallClassId: '',
			item: '请选择',
			itemId: '',
			shopPopShow: false,
			centerPopShow: false,
			storePopShow: false,
			bigClassPopShow: false,
			smallClassPopShow: false,
			itemPopShow: false
		}
	},
	created () {
		this.initDefaultShop()
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
			loginerShopId: state => state.loginer.loginerShopId,
			loginerShopName: state => state.loginer.loginerShopName,
			loginerId: state => state.loginer.loginerId,
			loginerOrganType: state => state.loginer.loginerOrganType
		}),
		shopCellDisable () {
			return this.$fxStateMiddleware.stateIs('loginerOrganType')(['shop'])(this.loginerOrganType)
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
				shop: this.shop,
				shopId: this.shopId,
				center: this.center,
				centerId: this.centerId,
				store: this.store,
				storeId: this.storeId,
				bigClass: this.bigClass,
				bigClassId: this.bigClassId,
				smallClass: this.smallClass,
				smallClassId: this.smallClassId,
				item: this.item,
				itemId: this.itemId
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
			this.resetFilterCell(FILTER_PARAMS_KEY)
			if (this.shopCellDisable) {
				this.shop = this.loginerShopName
				this.shopId = this.loginerShopId
			}
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
		confirmCheck () {
			return new Promise(resolve => {
				if (!this.shopId) {
					this.$fxToast.fail('请选择门店!')
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
			case 'center':
				this.resetFilterCell('store')
				break
			case 'bigClass':
				this.resetFilterCell(['smallClass', 'item'])
				break
			case 'smallClass':
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
				start,
				size
			}
			return this.$fxApi('reportForm.getAuthShop')(params)
		},
		// 配送中心
		getCenterListData (keyword = null, start, size) {
			const params = {
				keyword: keyword,
				start,
				size
			}
			return this.$fxApi('reportForm.getAuthCenter')(params)
		},
		// 仓库名称
		getStoreListData (keyword = null, start, size) {
			const params = {
				keyword: keyword,
				centerId: this.centerId,
				start,
				size
			}
			return this.$fxApi('reportForm.getUsingStore')(params)
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
				goodsSmallType: this.smallClassId
			}
			return this.$fxApi('reportForm.getItem')(params)
		}
	}
}
</script>
