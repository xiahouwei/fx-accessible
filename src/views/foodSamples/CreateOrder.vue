<template>
	<div class="inteledi-foodSamples">
		<w-header title="新增留样" :border="true"></w-header>
		<div class="foodSamples-content">
			<div class="foodSamples-filter">
				<OrderInfo
					:data="orderInfoData"
					@on-shop-click="onShopClick"
					@on-food-click="onFoodClick"
					@on-meals-click="onMealsClick"
					@on-foodDate-click="onFoodDateClick"
					@on-chef-click="onChefClick"
				></OrderInfo>
			</div>
			<div class="img-wrap">
				<span class="img-title">留样图片</span>
				<div class="photo-wrap">
					<div v-if="!orderInfoData.base64Str" class="upload-photo" @click="onUploadClick"></div>
					<div v-else>
						<van-icon color="#FC4E49" size="20px" class="img-del" name="clear" @click="onDeleteImgClick"/>
						<img :src="orderInfoData.base64Str" :onerror="$fxCommon.errorImg(orderInfoData.base64Str)" class="uploader-img">
					</div>
				</div>
			</div>
		</div>
		<div class="foodSamples-bottom">
			<van-button
				v-show="$fxAuth('foodSamplBill.save')"
				type="primary"
				class="save-btn"
				@click="onSaveClick"
			>保存</van-button>
		</div>
		<van-popup v-model="datePickerShow" position="bottom">
			<w-date-picker
				:visibleFlag.sync="datePickerShow"
				:currentDate="currentDate"
				@confirm="dateConfirmhandle"
			></w-date-picker>
		</van-popup>
		<van-popup v-model="shopPopShow" position="right" class="fx-list-popup-300" :lock-scroll="false">
			<listComp
				:visibleFlag.sync="shopPopShow"
				:data="shopList"
				:loadFinished="shopListLoadFinished"
				:loading.sync="onShopLoading"
				title="机构检索"
				@on-search="searchShop"
				@on-select="selectShop"
				@on-load="onShopLoad"
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
		<van-popup
			v-model="itemPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<itemEditComp
				:visibleFlag.sync="itemPopShow"
				:shopId="orderInfoData.shopDTO.id"
				@on-confirm="onItemEditConfirm"
			></itemEditComp>
		</van-popup>
		<van-actionsheet
			v-model="uploadActionShow"
			:actions="uploadActions"
			cancel-text="取消"
			@select="onUploadSelect"
		/>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import OrderInfo from '@/components/foodSamples/orderDetails/OrderInfo.vue'
import listComp from '@/components/common/ListComp.vue'
import itemEditComp from '@/components/foodSamples/common/itemEditComp.vue'
const ITEM_SIZE = 50
export default {
	name: 'createFoodSamples',
	components: {
		OrderInfo,
		listComp,
		itemEditComp
	},
	data () {
		return {
			listStart: 0,
			pullRefreshLoading: false,
			currentDate: new Date(),
			orderInfoData: {
				foodDate: new Date().getTime(),
				shopDTO: {},
				goodsMealsDTO: {},
				foodsDTO: {},
				cookDTO: {},
				base64Str: ''
			},
			datePickerShow: false,
			shopPopShow: false,
			shopList: [],
			shopListStart: 0,
			onShopLoading: false,
			shopListLoadFinished: false,
			mealsPopShow: false,
			mealsList: [],
			mealsListStart: 0,
			onMealsLoading: false,
			mealsListLoadFinished: false,
			chefPopShow: false,
			chefList: [],
			chefListStart: 0,
			onChefLoading: false,
			chefListLoadFinished: false,
			itemPopShow: false,
			uploadActionShow: false,
			uploadActions: [
				{ id: 0, name: '拍摄' },
				{ id: 1, name: '从手机相册选择' }
			]
		}
	},
	created () {
		/* 初始加载给机构名称赋默认值 */
		this.getShopListData().then(res => {
			res && res.shops && res.shops.length && this.$set(this.orderInfoData, 'shopDTO', res.shops[0])
		})
	},
	computed: {
		...mapState({
			loginerShopId: state => state.loginer.loginerShopId,
			loginerShopName: state => state.loginer.loginerShopName,
			loginerId: state => state.loginer.loginerId
		})
	},
	methods: {
		// {{{ 日期
		onFoodDateClick () {
			if (this.foodDate) this.currentDate = new Date(this.foodDate)
			this.datePickerShow = true
		},
		dateConfirmhandle (date) {
			this.orderInfoData.foodDate = date.getTime()
			this.datePickerShow = false
		},
		// }}}
		// {{{ 选择品项
		onFoodClick () {
			if (!this.orderInfoData.shopDTO.id) {
				this.$fxToast.fail('请选择机构!')
				return false
			}
			this.itemPopShow = true
		},
		// }}}
		// {{{ 机构
		onShopClick () {
			this.onShopRefresh()
		},
		searchShop (keyword) {
			this.onShopRefresh(keyword)
		},
		selectShop (item) {
			if (item.id === this.orderInfoData.shopDTO.id) {
				return true
			}
			this.orderInfoData.shopDTO = item
		},
		onShopRefresh (keyword = null) {
			this.shopListStart = 0
			this.getShopListData(keyword).then(res => {
				this.shopPopShow = true
				this.onShopLoading = false
				this.shopListStart += ITEM_SIZE
				this.shopListLoadFinished = res.shops.length < ITEM_SIZE
				this.shopList = res.shops
			})
		},
		onShopLoad (keyword = null) {
			this.getShopListData(keyword).then(res => {
				this.onShopLoading = false
				this.shopListStart += ITEM_SIZE
				this.shopListLoadFinished = res.shops.length < ITEM_SIZE
				this.shopList.push(...res.shops)
			})
		},
		getShopListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					start: this.shopListStart,
					size: ITEM_SIZE,
					paged: true,
					keyword: keyword,
					orgFlag: 0,
					m: 'getShopListForUserhouse',
					billType: 'foodSample'
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/users/${this.loginerId}/shops`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		// }}}
		// {{{ 类别
		onMealsClick () {
			this.onMealsRefresh()
		},
		searchMeals (keyword) {
			this.onMealsRefresh(keyword)
		},
		selectMeals (item) {
			if (item.id === this.orderInfoData.goodsMealsDTO.id) {
				return true
			}
			this.orderInfoData.goodsMealsDTO = item
		},
		onMealsRefresh (keyword = null) {
			this.mealsListStart = 0
			this.getMealsListData(keyword).then(res => {
				this.mealsPopShow = true
				this.onMealsLoading = false
				this.mealsListStart += ITEM_SIZE
				this.mealsListLoadFinished = res.goodsMealsDTOData.length < ITEM_SIZE
				this.mealsList = res.goodsMealsDTOData
			})
		},
		onMealsLoad (keyword = null) {
			this.getMealsListData(keyword).then(res => {
				this.onMealsLoading = false
				this.mealsListStart += ITEM_SIZE
				this.mealsListLoadFinished = res.goodsMealsDTOData.length < ITEM_SIZE
				this.mealsList.push(...res.goodsMealsDTOData)
			})
		},
		getMealsListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					start: this.mealsListStart,
					size: ITEM_SIZE,
					paged: true,
					keyword: keyword,
					m: 'getMeals'
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/food`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		// }}}
		// {{{厨师
		onChefClick () {
			if (!this.orderInfoData.shopDTO.id) {
				this.$fxToast.fail('请选择机构!')
				return false
			}
			this.onChefRefresh()
		},
		searchChef (keyword) {
			this.onChefRefresh(keyword)
		},
		selectChef (item) {
			if (item.id === this.orderInfoData.cookDTO.id) {
				return true
			}
			this.orderInfoData.cookDTO = item
		},
		onChefRefresh (keyword = null) {
			this.chefListStart = 0
			this.getChefListData(keyword).then(res => {
				this.chefPopShow = true
				this.onChefLoading = false
				this.chefListStart += ITEM_SIZE
				this.chefListLoadFinished = res.employeeDTOData.length < ITEM_SIZE
				this.chefList = res.employeeDTOData
			})
		},
		onChefLoad (keyword = null) {
			this.getChefListData(keyword).then(res => {
				this.onChefLoading = false
				this.chefListStart += ITEM_SIZE
				this.chefListLoadFinished = res.employeeDTOData.length < ITEM_SIZE
				this.chefList.push(...res.employeeDTOData)
			})
		},
		getChefListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					orgId: this.orderInfoData.shopDTO.id,
					start: this.chefListStart,
					size: ITEM_SIZE,
					paged: true,
					keyword: keyword,
					m: 'getChef'
				}
				this.$fxHttp.requestGet({
					url: `${this.$fxBaseApi.url}/accounts/food/shop/${this.loginerShopId}/users/${this.loginerId}`,
					data: params
				}).then(res => {
					resolve(res)
				})
			})
		},
		// }}}
		// {{{ 保存
		onSaveClick () {
			this.checkOrderInfo().then(() => {
				this.$dialog.confirm({
					title: '提示',
					message: '确定生成单据吗?'
				}).then(() => {
					let params = this.getSaveParams()
					this.createHandler(params)
				}).catch(() => {
				})
			})
		},
		createHandler (params) {
			this.$fxHttp.requestPost({
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/foodsampls/users/${this.loginerId} `,
				data: params,
				query: {
					m: 'addBill'
				}
			}).then(res => {
				this.$fxToast.success('生成单据成功').then(() => {
					this.$router.replace({
						path: 'foodSamplesDetails',
						query: {
							orderId: res.foodSamples[0].id
						}
					})
				})
			})
		},
		getSaveParams () {
			return this.orderInfoData
		},
		checkOrderInfo () {
			return new Promise((resolve, reject) => {
				const checkInfo = [
					[this.orderInfoData.shopDTO.id, '机构'],
					[this.orderInfoData.goodsMealsDTO.id, '餐别'],
					[this.orderInfoData.foodsDTO.id, '菜品'],
					[this.orderInfoData.cookDTO.id, '厨师']
				]
				let checkFlag = true
				for (let i = 0; i < checkInfo.length; i++) {
					if (!checkInfo[i][0]) {
						this.$fxToast.top(`请选择${checkInfo[i][1]}！`)
						checkFlag = false
						break
					}
				}
				if (checkFlag) {
					resolve()
				}
			})
		},
		// }}}
		onItemEditConfirm (food) {
			this.orderInfoData.foodsDTO = food
		},
		// {{{ 上传照片
		onUploadClick () {
			this.uploadActionShow = true
		},
		onUploadSelect (uploadType) {
			this.uploadActionShow = false
			if (uploadType.id === 0) {
				// 通过相机 获取图片 返回base64图片
				this.$fxCordova.camera.getPictureByCamera().then(res => {
					this.orderInfoData.base64Str = 'data:image/jpeg;base64,' + res
				})
			} else {
				// 通过相册 获取图片 返回base64图片
				this.$fxCordova.camera.getPictureByLibrary().then(res => {
					this.orderInfoData.base64Str = 'data:image/jpeg;base64,' + res
				})
			}
		},
		onDeleteImgClick () {
			this.orderInfoData.base64Str = ''
		}
		// }}}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.inteledi-foodSamples {
	height: 100%
	background: $fxWhite
	display: flex
	flex-direction: column
	.foodSamples-content {
		flex: 1
		overflow: scroll
		.foodSamples-filter {
			text-align: left
			padding: 3px 0px
			background: #eee
		}
		.foodSamples-list {
			min-height: 526px
		}
		.img-wrap {
			text-align: left
			padding: 14px 13px
			.img-title {
				text-align: left
				font-size: 16px
			}
			.photo-wrap {
				padding: 10px
				position: relative
				.upload-photo {
					width: 160px
					height: 160px
					background-image: url('~images/icon/icon-upload-photo.png')
					background-size: 100% 100%
					background-repeat: no-repeat
				}
				.uploader-img {
					width: 160px
					height: 160px
				}
				.img-del {
					position: absolute
					top: 0
					left: 177px
				}
			}
		}
	}
	.foodSamples-bottom {
		display: flex
		.save-btn {
			flex: 1
		}
	}
}
</style>

