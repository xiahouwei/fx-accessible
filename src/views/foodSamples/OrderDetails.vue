<template>
	<div class="filter-popup">
		<w-header title="编辑留样" :border="true"></w-header>
		<div ref="filterContent" class="filter-content">
			<van-cell-group>
				<van-cell title="留样编号" :value="orderInfoData.sysBillCode"/>
				<van-cell
					title="机构名称"
					:value="orderInfoData.shopDTO && orderInfoData.shopDTO.name"
					value-class="info-item-value"
					@click="changeInfo('onShopClick')"
				/>
				<van-cell
					title="菜谱日期"
					:value="formatterDate(orderInfoData.foodDate)"
					:is-link="isBillState(0)"
					@click="changeInfo('onFoodDateClick')"
				/>
				<van-cell
					title="餐别"
					:value="orderInfoData.goodsMealsDTO && orderInfoData.goodsMealsDTO.name"
					value-class="info-item-value"
					:is-link="isBillState(0)"
					@click="changeInfo('onMealsClick')"
				/>
				<van-cell
					title="菜品名称"
					:value="orderInfoData.foodsDTO && orderInfoData.foodsDTO.name"
					value-class="info-item-value"
					:is-link="isBillState(0)"
					@click="changeInfo('onFoodClick')"
				/>
				<van-cell
					title="厨师"
					:value="orderInfoData.cookDTO && orderInfoData.cookDTO.name"
					value-class="info-item-value"
					:is-link="isBillState(0)"
					@click="changeInfo('onChefClick')"
				/>
				<van-pro-number-field
					v-model="orderInfoData.amount"
					label="留样重量(克)"
					input-align="right"
					class="info-item-amount"
					min="0"
					:max="maxAmount"
					:defaultValue="0"
					:intLength="numberLength"
					:pointSize="sysPointSize"
				></van-pro-number-field>
				<van-cell title="留样员" :value="orderInfoData.samplerDTO && orderInfoData.samplerDTO.name" value-class="info-item-value"/>
				<van-cell title="留样时间" :value="formatterDate(orderInfoData.samplDate)" value-class="info-item-value"/>
				<van-cell title="留样图片" :border="false" value-class="info-item-value"></van-cell>
				<van-cell class="info-cell-img" value-class="info-item-img">
					<div class="photo-wrap">
						<div v-if="!imgSrc && isBillState(0)" class="upload-photo" @click="changeInfo('onUploadClick')"></div>
						<div v-else>
							<van-icon v-if="isBillState(0)" color="#FC4E49" size="20px" class="img-del" name="clear" @click="changeInfo('onDeleteImgClick')"/>
							<img v-if="imgSrc" :src="imgSrc" :onerror="$fxCommon.errorImg(imgSrc)" class="uploader-img">
						</div>
					</div>
				</van-cell>
			</van-cell-group>
		</div>
		<div class="filter-bottom">
			<van-button
				v-show="$fxAuth('foodSamplBill.print')"
				class="print-btn fx-no-radius"
				@click="onPrintClick"
			>打印</van-button>
			<van-button
				v-show="$fxAuth('foodSamplBill.save') && isBillState(0)"
				class="bottom-btn fx-no-radius"
				type="info"
				@click="onClickHandler('onSaveClick')"
			>保存</van-button>
			<van-button
				v-show="$fxAuth('foodSamplBill.process') && isBillState(0)"
				class="bottom-btn fx-no-radius"
				type="primary"
				@click="onClickHandler('onExpressClick')"
			>处理</van-button>
			<van-button
				v-show="$fxAuth('foodSamplBill.cancelprocess') && isBillState(1)"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onUnExpressClick"
			>取消处理</van-button>
			<van-button
				v-show="$fxAuth('foodSamplBill.del') && isBillState(0)"
				class="bottom-btn fx-no-radius"
				type="danger"
				@click="onDeleteClick"
			>删除</van-button>
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
				:shopId="orderInfoData.shopDTO && orderInfoData.shopDTO.id"
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
import listComp from '@/components/common/ListComp.vue'
import itemEditComp from '@/components/foodSamples/common/itemEditComp.vue'
const ITEM_SIZE = 50
export default {
	name: 'foodSamplesDetails',
	components: {
		listComp,
		itemEditComp
	},
	data () {
		return {
			query: this.$route.query,
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			orderInfoData: {},
			datePickerShow: false,
			currentDate: '',
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
		this.createOrderDetails()
	},
	computed: {
		...mapState({
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId,
			sysPointSize: 'sysPointSize',
			numberLength: 'numberLength',
			maxAmount: 'maxAmount'
		}),
		formatterDate (date) {
			return (date) => {
				if (typeof date === 'number') {
					return this.$fxUtils.setDateTime(new Date(date), '时分')
				} else {
					return ''
				}
			}
		},
		isBillState (state) {
			return (state) => {
				if (Object.prototype.toString.call(state) === '[object Array]') {
					return state.includes(this.orderInfoData.billState)
				} else {
					return this.orderInfoData.billState === state
				}
			}
		},
		imgSrc () {
			return this.orderInfoData.base64Str ? this.orderInfoData.base64Str : this.orderInfoData.annexUrl
		}
	},
	methods: {
		createOrderDetails () {
			return new Promise((resolve, reject) => {
				this.getOrderDetails().then(res => {
					this.orderInfoData = res.foodSamples[0]
					resolve(this.orderInfoData)
				}).catch(e => reject(e))
			})
		},
		getOrderDetails () {
			return new Promise(resolve => {
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/foodsampls/users/${this.loginerId}`,
					data: {
						billId: this.query.orderId
					}
				}).then(res => {
					resolve(res)
				})
			})
		},
		// {{{ 日期
		onFoodDateClick () {
			if (this.orderInfoData.foodDate) this.currentDate = new Date(this.orderInfoData.foodDate)
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
		// {{{
		changeInfo (method) {
			if (this.isBillState(1)) {
				return false
			}
			this[method]()
		},
		// }}}
		// {{{ 机构
		onShopClick () {
			/* 需求改为编辑时不能更改机构 */
			// this.onShopRefresh()
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
					this.setImgData('data:image/jpeg;base64,' + res)
				})
			} else {
				// 通过相册 获取图片 返回base64图片
				this.$fxCordova.camera.getPictureByLibrary().then(res => {
					this.setImgData('data:image/jpeg;base64,' + res)
				})
			}
		},
		onDeleteImgClick () {
			this.setImgData('')
			this.orderInfoData.delFilename = this.orderInfoData.annexUrl
			this.orderInfoData.annexUrl = ''
		},
		setImgData (data) {
			this.orderInfoData.base64Str = data
		},
		// }}}
		onClickHandler (method) {
			this.checkOrderInfo().then(() => {
				this[method]()
			})
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
		// {{{ 保存
		onSaveClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定生成单据吗?'
			}).then(() => {
				this.saveHandler(this.orderInfoData)
			}).catch(() => {
			})
		},
		saveHandler (params, isPrint) {
			return new Promise((resolve, reject) => {
				this.$fxHttp.requestPut({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/foodsampls/${this.query.orderId}/users/${this.loginerId} `,
					data: params,
					query: {
						m: 'modify'
					}
				}).then(res => {
					this.createOrderDetails().then((res) => {
						!isPrint && this.$fxToast.success('保存成功')
						resolve(res)
					}).catch(e => reject(e))
				}).catch(e => reject(e))
			})
		},
		// }}}
		// {{{ 处理
		onExpressClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定生成留样吗?'
			}).then(() => {
				this.expressHandler(this.orderInfoData)
			}).catch(() => {
			})
		},
		expressHandler (params) {
			this.$fxHttp.requestPut({
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/foodsampls/${this.query.orderId}/users/${this.loginerId} `,
				data: params,
				query: {
					m: 'editAndProcess'
				}
			}).then(res => {
				this.createOrderDetails().then(() => {
					this.$fxToast.success('处理成功')
				})
			})
		},
		// }}}
		// {{{ 取消处理
		onUnExpressClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要取消处理该留样吗?'
			}).then(() => {
				this.unExpressHandler(this.orderInfoData)
			}).catch(() => {
			})
		},
		unExpressHandler (params) {
			this.$fxHttp.requestPut({
				url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/foodsampls/${this.query.orderId}/users/${this.loginerId} `,
				data: params,
				query: {
					m: 'cancelProcess'
				}
			}).then(res => {
				this.createOrderDetails().then(() => {
					this.$fxToast.success('取消处理成功')
				})
			})
		},
		// }}}
		// {{{ 删除
		onDeleteClick () {
			this.$dialog.confirm({
				title: '提示',
				message: '确定要删除该留样吗?'
			}).then(() => {
				let params = this.orderInfoData
				this.$fxHttp.requestDel({
					url: `${this.$fxBaseApi.url}/accounts/${this.loginerShopId}/foodsampls/${this.query.orderId}/users/${this.loginerId} `,
					data: params,
					query: {
						userId: this.loginerId
					}
				}).then(res => {
					this.$fxToast.success('删除成功').then(() => {
						this.$router.go(-1)
					})
				})
			}).catch(() => {
			})
		},
		// 触发打印
		onPrintClick () {
			let msg = '打印留样将先保存该单据，是否打印?'
			if (this.isBillState(1)) {
				msg = '确定打印留样吗？'
			}
			this.$dialog.confirm({
				title: '提示',
				message: msg
			}).then(async _ => {
				try {
					/* 保存并重新拉取单据信息 */
					let params = this.isBillState(1) ? this.orderInfoData : await this.saveHandler(this.orderInfoData, 'isPrint')
					params && this.printEvent(params)
				} catch (e) {
					this.$fxToast.fail('打印失败')
				}
			}).catch(_ => null)
		},
		// 打印方法
		printEvent (params) {
			if (process.env.NODE_ENV === 'development') {
				this.$fxToast.fail('开发环境无法使用打印功能')
			} else {
				this.$fxCordova.sunmiprint('foodResidue', {
					id: params.sysBillCode,
					barmsg: `http://${this.$fxGetBaseUrl()}/ewmapi/${params.id}/foodSampleInfo`,
					foodResidueDate: this.formatterDate(params.samplDate),
					menudate: this.$fxUtils.setDate(new Date(params.foodDate)),
					itemName: params.foodsDTO && params.foodsDTO.name,
					itemChef: params.cookDTO && params.cookDTO.name,
					eatTime: params.goodsMealsDTO && params.goodsMealsDTO.name,
					foodResidueMember: params.samplerDTO && params.samplerDTO.name
				}).then(res => {
					this.$fxToast.success('打印成功')
				})
			}
		}
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
		background-color: #fff
		.info-item-value {
			text-overflow: ellipsis
			white-space: nowrap
		}
		.info-cell-img {
			padding: 0
			.photo-wrap {
				padding: 10px
				.upload-photo {
					width: 160px
					height: 160px
					background-image: url('~images/icon/icon-upload-photo.png')
					background-size:100% 100%
					background-repeat: no-repeat
				}
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
		.info-item-amount::after {
			display: block;
		}
	}
	.filter-bottom {
		display: flex
		flex-direction: row
		width:100%
		.bottom-btn {
			flex:1
		}
		.print-btn {
			flex: 1
			color: $fxWhite
			background-color: $fxDeepYellow
			border: $fxDeepYellow
		}
	}
}
</style>
