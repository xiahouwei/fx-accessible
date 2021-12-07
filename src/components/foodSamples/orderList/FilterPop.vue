<template>
	<div class="filter-popup">
		<w-header title="筛选条件" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div ref="filterContent" class="filter-content">
			<van-cell-group>
				<van-cell title="菜谱日期"/>
				<van-cell title="起始时间" :value="beginDate" is-link @click="onBeginDateClick" />
				<van-cell title="结束时间" :value="endDate" is-link @click="endDateClick" />
				<van-cell title="厨师" :value="chef" value-class="info-item-value" is-link @click="onChefClick" />
				<van-cell title="餐别" :value="meals" value-class="info-item-value" is-link @click="onMealsClick" />
				<van-cell title="菜品名称" :value="food" value-class="info-item-value" is-link @click="onFoodClick" />
			</van-cell-group>
		</div>
		<div class="filter-bottom">
			<van-button class="reset-btn fx-no-radius" type="info" @click="onResetClick">重置</van-button>
			<van-button class="confirm-btn fx-no-radius" type="primary" @click="onConfirmClick">确定</van-button>
		</div>
		<van-popup v-model="datePickerShow" position="bottom">
			<w-date-picker :visibleFlag.sync="datePickerShow" :currentDate="currentDate" @confirm="dateConfirmhandle"></w-date-picker>
		</van-popup>
		<van-popup v-model="chefPopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="chefPopShow"
				:data="chefList"
				:loadFinished="chefListLoadFinished"
				:loading.sync="onChefLoading"
				title="厨师检索"
				@on-search="searchChef"
				@on-select="selectChef"
				@on-load="onChefLoad"
			></listComp>
		</van-popup>
		<van-popup v-model="mealsPopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="mealsPopShow"
				:data="mealsList"
				:loadFinished="mealsListLoadFinished"
				:loading.sync="onMealsLoading"
				title="餐别检索"
				@on-search="searchMeals"
				@on-select="selectMeals"
				@on-load="onMealsLoad"
			></listComp>
		</van-popup>
		<van-popup v-model="foodPopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="foodPopShow"
				:data="foodList"
				:loadFinished="foodListLoadFinished"
				:loading.sync="onFoodLoading"
				title="菜品检索"
				@on-search="searchFood"
				@on-select="selectFood"
				@on-load="onFoodLoad"
			></listComp>
		</van-popup>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import listComp from '@/components/common/ListComp.vue'
const ITEM_SIZE = 50
export default {
	name: 'filterPop',
	components: {
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
			chefListStart: 0,
			chefListLoadFinished: false,
			onChefLoading: false,
			chefPopShow: false,
			chefList: [],
			chefKeyword: null,
			chef: '请选择',
			chefId: '',
			mealsListStart: 0,
			mealsListLoadFinished: false,
			onMealsLoading: false,
			mealsPopShow: false,
			mealsList: [],
			mealsKeyword: null,
			meals: '请选择',
			mealsId: '',
			foodListStart: 0,
			foodListLoadFinished: false,
			onFoodLoading: false,
			foodPopShow: false,
			foodList: [],
			foodKeyword: null,
			food: '请选择',
			foodId: '',
			datePickerShow: false,
			currentDate: new Date(),
			beginDate: this.$fxCommon.orderFilterStartDate(),
			endDate: this.$fxCommon.orderFilterEndDate(),
			dateType: ''
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
		onConfirmClick () {
			this.$emit('update:visibleFlag', false)
			this.$emit('on-confirm', this.getFilterParams())
			this.$emit('update:filterParams', this.getFilterParams())
		},
		getFilterParams () {
			return {
				beginDate: this.beginDate || this.$fxCommon.orderFilterStartDate(),
				endDate: this.endDate || this.$fxCommon.orderFilterEndDate(),
				chefId: this.chefId,
				mealsId: this.mealsId,
				foodId: this.foodId
			}
		},
		onResetClick () {
			this.resetHandler()
		},
		resetHandler () {
			this.beginDate = this.$fxCommon.orderFilterStartDate()
			this.endDate = this.$fxCommon.orderFilterEndDate()
			this.chefListStart = 0
			this.chef = '请选择'
			this.chefId = ''
			this.chefKeyword = null
			this.mealsListStart = 0
			this.meals = '请选择'
			this.mealsId = ''
			this.mealsKeyword = null
			this.foodListStart = 0
			this.food = '请选择'
			this.foodId = ''
			this.foodKeyword = null
		},
		// {{{厨师
		onChefClick () {
			this.chefKeyword = null
			this.chefListLoadFinished = false
			this.onChefRefresh()
		},
		searchChef (keyword) {
			this.chefKeyword = keyword
			this.onChefRefresh()
		},
		selectChef (item) {
			this.chef = item.name
			this.chefId = item.id
		},
		onChefLoad () {
			this.getChefListData().then(res => {
				this.chefList.push(...res.employeeDTOData)
			})
		},
		onChefRefresh () {
			this.chefListStart = 0
			this.getChefListData().then(res => {
				this.chefPopShow = true
				this.chefList = res.employeeDTOData
			})
		},
		getChefListData () {
			return new Promise(resolve => {
				let params = {
					start: this.chefListStart,
					size: ITEM_SIZE,
					keyword: this.chefKeyword,
					paged: true,
					m: 'getChef'
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/food/shop/${this.loginerShopId}/users/${this.loginerId}`,
					data: params
				}).then(res => {
					this.onChefLoading = false
					this.chefListStart += ITEM_SIZE
					if (res.employeeDTOData.length < ITEM_SIZE) {
						this.chefListLoadFinished = true
					} else {
						this.chefListLoadFinished = false
					}
					resolve(res)
				})
			})
		},
		// }}}
		// {{{机构
		onMealsClick () {
			this.mealsKeyword = null
			this.mealsListLoadFinished = false
			this.onMealsRefresh()
		},
		searchMeals (keyword) {
			this.mealsKeyword = keyword
			this.onMealsRefresh()
		},
		selectMeals (item) {
			this.meals = item.name
			this.mealsId = item.id
		},
		onMealsLoad () {
			this.getMealsListData().then(res => {
				this.mealsList.push(...res.goodsMealsDTOData)
			})
		},
		onMealsRefresh () {
			this.mealsListStart = 0
			this.getMealsListData().then(res => {
				this.mealsPopShow = true
				this.mealsList = res.goodsMealsDTOData
			})
		},
		getMealsListData () {
			return new Promise(resolve => {
				let params = {
					start: this.mealsListStart,
					size: ITEM_SIZE,
					keyword: this.mealsKeyword,
					paged: true,
					m: 'getMeals'
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/food`,
					data: params
				}).then(res => {
					this.onMealsLoading = false
					this.mealsListStart += ITEM_SIZE
					if (res.goodsMealsDTOData.length < ITEM_SIZE) {
						this.mealsListLoadFinished = true
					} else {
						this.mealsListLoadFinished = false
					}
					resolve(res)
				})
			})
		},
		// }}}
		// {{{品项
		onFoodClick () {
			this.foodKeyword = null
			this.onFoodRefresh()
		},
		searchFood (keyword) {
			this.foodKeyword = keyword
			this.onFoodRefresh(keyword)
		},
		selectFood (item) {
			this.food = item.name
			this.foodId = item.id
		},
		onFoodRefresh () {
			this.foodListStart = 0
			this.getFoodListData().then(res => {
				this.foodPopShow = true
				this.foodList = res.foodDTOData
			})
		},
		onFoodLoad () {
			this.getFoodListData().then(res => {
				this.foodList.push(...res.foodDTOData)
			})
		},
		getFoodListData () {
			return new Promise(resolve => {
				let params = {
					start: this.foodListStart,
					size: ITEM_SIZE,
					paged: true,
					searchText: this.foodKeyword,
					m: 'getFoodslist',
					allFlag: 'on'
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/food`,
					data: params
				}).then(res => {
					this.onFoodLoading = false
					this.foodListStart += ITEM_SIZE
					if (res.foodDTOData.length < ITEM_SIZE) {
						this.foodListLoadFinished = true
					} else {
						this.foodListLoadFinished = false
					}
					resolve(res)
				})
			})
		},
		// }}}
		// {{{业务日期
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
				this.beginDate = this.$fxUtils.setDateTime(date, '时分')
				if (!this.endDate || !this.$fxCommon.orderFilterRangeDate(this.beginDate, this.endDate)) {
					this.endDate = this.$fxCommon.orderFilterDate(date)
				}
			} else {
				this.endDate = this.$fxUtils.setDateTime(date, '时分')
				if (!this.beginDate || !this.$fxCommon.orderFilterRangeDate(this.beginDate, this.endDate)) {
					this.beginDate = this.$fxCommon.orderFilterStartDate(date)
				}
			}
			this.datePickerShow = false
		}
		// }}}
	}
}
</script>

<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.filter-popup {
	height: 100%
	width: 100%
	text-align: left
	display: flex
	flex-direction: column
	.filter-content {
		flex: 1
		overflow: scroll
		.info-item-value {
			text-overflow: ellipsis
			white-space: nowrap
		}
	}
	.filter-bottom {
		display: flex
		flex-direction: row
		width: 100%
		.reset-btn, .confirm-btn {
			flex: 1
		}
	}
}
</style>
