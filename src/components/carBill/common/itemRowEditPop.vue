<template>
	<div class="itemRowEdit-popup">
		<w-header :title="currentItemData.goodsDTO.name" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div class="itemRowEdit-content">
			<van-cell-group>
				<van-cell title="成品编号" :value="currentItemData.goodsDTO.code" value-class="info-item-value"/>
				<van-cell title="BOM名称" :value="currentItemData.bomDTO.name" :is-link="!isDisabled" value-class="info-item-value" @click="onBomClick"/>
				<van-cell title="单价" :value="isBillState ? currentItemData.price : ''" value-class="info-item-value"/>
				<van-cell title="金额" :value="isBillState ? currentItemData.sumMoney : ''" value-class="info-item-value"/>
				<van-cell title="产出金额" :value="isBillState ? currentItemData.factMoney : ''" value-class="info-item-value"/>
				<van-cell
					title="生产日期"
					:value="fomatterDate(currentItemData.produceDate)"
					:is-link="!isDisabled"
					@click="onProduceDateClick"
				/>
				<van-pro-number-field
					v-model="currentItemData.processingFee"
					label="加工费"
					input-align="right"
					min="0"
					:defaultValue="0"
					:max="maxAmount"
					:intLength="numberLength"
					:pointSize="sysPointSize"
					:disabled="isDisabled"
				></van-pro-number-field>
				<van-cell title="计划数量" :value="isBillState ? currentItemData.planCount : ''" value-class="info-item-value"/>
				<van-cell title="计划金额" :value="isBillState ? currentItemData.planMoney : ''" value-class="info-item-value"/>
				<van-cell v-show="sysShowDZCData" title="净重量" :value="toFixedNumberSize(currentItemData.netWeight)" value-class="info-item-value"></van-cell>
				<van-cell v-show="sysShowDZCData" title="皮重量" :value="toFixedNumberSize(currentItemData.skinWeight)" value-class="info-item-value"></van-cell>
				<van-cell v-show="sysShowDZCData" title="毛重量" :value="toFixedNumberSize(currentItemData.grossWeight)" value-class="info-item-value"></van-cell>
				<van-cell v-show="sysShowDZCData" title="称重单位" :value="currentItemData.weightUnit" value-class="info-item-value"></van-cell>
				<van-cell title="加工班组" :value="currentItemData.teamDTO ? currentItemData.teamDTO.name : ''" :is-link="!isDisabled" value-class="info-item-value" @click="onTeamClick"></van-cell>
				<van-cell title="计件费用" :value="currentItemData.pieceMoney" value-class="info-item-value"></van-cell>
				<van-pro-field
					v-model="currentItemData.memo"
					:placeholder="setPlaceholder('请输入备注')"
					:disabled="isDisabled"
					label="备注"
					value-class="info-item-value"
					input-align="right"
				/>
			</van-cell-group>
		</div>
		<div class="itemRowEdit-bottom">
			<van-button
				v-if="!isDisabled"
				class="confirm-btn fx-no-radius"
				type="primary"
				@click="onConfirmClick"
			>保存</van-button>
			<van-button
				v-else
				class="confirm-btn fx-no-radius"
				type="primary"
				@click="onCloseClick"
			>确定</van-button>
		</div>
		<van-popup v-model="datePickerShow" position="bottom">
			<w-date-picker
				:visibleFlag.sync="datePickerShow"
				:currentDate="currentDate"
				@confirm="dateConfirmhandle"
			></w-date-picker>
		</van-popup>
		<van-popup v-model="teamPopShow" position="right" class="fx-list-popup-300">
			<listComp
				:visibleFlag.sync="teamPopShow"
				:data="teamList"
				title="请选择加工班组"
				:loadFinished="true"
				@on-select="selectTeam"
				@on-search="searchTeam"
			></listComp>
		</van-popup>
		<van-popup v-model="bomPopShow" position="right" class="fx-list-popup-300">
			<listComp
				:visibleFlag.sync="bomPopShow"
				:data="bomList"
				title="请选择Bom"
				:loadFinished="bomLoadFinished"
				:loading.sync="bomLoading"
				@on-select="selectBom"
				@on-search="searchBom"
				@on-load="onBomLoad"
			></listComp>
		</van-popup>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import listComp from '@/components/common/ListComp.vue'
const ITEM_SIZE = 50
export default {
	name: 'itemRowEdit',
	components: {
		listComp
	},
	props: {
		visibleFlag: Boolean,
		itemData: {
			type: Object,
			default: () => {
				return {}
			}
		},
		shopId: String,
		inHouseId: String,
		outHouseId: String,
		isDisabled: Boolean,
		isBillState: Boolean
	},
	data () {
		return {
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			currentItemData: {},
			currentDate: new Date(),
			datePickerShow: false,
			teamPopShow: false,
			teamList: [],
			bomPopShow: false,
			bomList: [],
			bomListStart: 0,
			bomLoading: false,
			bomLoadFinished: false
		}
	},
	computed: {
		...mapState({
			sysShowDZCData: state => state.systemParams.sysShowDZCData,
			sysPointSize: 'sysPointSize',
			numberLength: 'numberLength',
			maxAmount: 'maxAmount'
		}),
		setPlaceholder (val) {
			return (val) => {
				return this.isDisabled ? '' : val
			}
		},
		fomatterDate (date) {
			return (date) => {
				if (date) {
					return this.$fxUtils.setDateTime(new Date(date), '时分')
				} else {
					return ''
				}
			}
		}
	},
	watch: {
		visibleFlag: {
			handler (val) {
				if (val) {
					this.currentItemData = JSON.parse(JSON.stringify(this.itemData))
				}
			},
			immediate: true
		}
	},
	methods: {
		toFixedNumberSize (data) {
			return parseFloat(this.$fxUtils.toFixedSHW(data, this.sysPointSize))
		},
		onCloseClick () {
			this.$emit('update:visibleFlag', false)
		},
		onProduceDateClick () {
			if (this.isDisabled) return false
			if (this.currentItemData.produceDate) this.currentDate = new Date(this.currentItemData.produceDate)
			this.datePickerShow = true
		},
		// {{{ 加工班组
		onTeamClick () {
			if (this.isDisabled) {
				return false
			}
			this.onTeamRefresh()
		},
		searchTeam (keyword) {
			this.onTeamRefresh(keyword)
		},
		selectTeam (item) {
			this.currentItemData.teamDTO = item
		},
		onTeamRefresh (keyword = null) {
			this.getTeamListData(keyword).then(res => {
				this.teamPopShow = true
				this.teamList = res.goodsTeam
			})
		},
		getTeamListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					goodsId: this.currentItemData.goodsDTO.id,
					searchText: keyword || null
				}
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/accounts/${this.shopId}/carBill`,
					data: params,
					query: {
						m: 'getTeamList'
					}
				}).then(res => {
					resolve(res)
				})
			})
		},
		// }}}
		// {{{ 材料bom
		onBomClick () {
			if (this.isDisabled) {
				return false
			}
			this.onBomRefresh()
		},
		searchBom (keyword) {
			this.onBomRefresh(keyword)
		},
		selectBom (item) {
			this.checkBom(item).then(() => {
				this.$dialog.confirm({
					title: '提示',
					message: '更改BOM会清空之前对应的BOM明细,是否继续?'
				}).then(() => {
					this.currentItemData.bomDTO = item
					item.bomDetail.forEach(bomItem => {
						let crude = item.crude
						if (this.$fxSysAuth('carBill.sysCarBillChangeAmount')) {
							bomItem.factCount = this.toFixedNumberSize(this.currentItemData.factCount * crude)
						}
						bomItem.theoryCount = this.toFixedNumberSize(this.currentItemData.factCount * crude)
						if (bomItem.id) {
							bomItem.changeType = 'edit'
						}
					})
					let currentItemData = this.currentItemData
					let bomDetail = currentItemData.bomDetail
					item.bomDetail.forEach(bom => {
						bom.changeType = 'add'
					})
					for (let i = bomDetail.length - 1; i > -1; i--) {
						let bom = bomDetail[i]
						if (bom.id) {
							bom.changeType = 'del'
						} else {
							bomDetail.splice(i, 1)
						}
					}
					bomDetail.push(...item.bomDetail)
					currentItemData.unitDTO = item.unitDTO
				})
			})
		},
		checkBom (item) {
			return new Promise(resolve => {
				let currentData = this.currentItemData.bomDTO
				if (currentData.id !== item.id) {
					resolve()
				}
			})
		},
		onBomRefresh (keyword = null) {
			this.bomListStart = 0
			this.getBomListData(keyword).then(res => {
				this.bomPopShow = true
				this.bomLoading = false
				this.bomListStart += ITEM_SIZE
				this.bomLoadFinished = res.carBomGoods.length < ITEM_SIZE
				this.bomList = this.resetBomList(res.carBomGoods)
			})
		},
		onBomLoad (keyword = null) {
			this.getBomListData(keyword).then(res => {
				this.bomLoading = false
				this.bomListStart += ITEM_SIZE
				if (res.carBomGoods.length < ITEM_SIZE) {
					this.bomLoadFinished = true
				}
				this.bomList.push(...this.resetBomList(res.carBomGoods))
			})
		},
		resetBomList (data) {
			return data.map(item => {
				item.bomDTO.bomDetail = item.bomDetail
				item.bomDTO.unitDTO = item.unitDTO
				return item.bomDTO
			})
		},
		getBomListData (keyword = null) {
			return new Promise(resolve => {
				let params = {
					start: this.bomListStart,
					size: ITEM_SIZE,
					paged: true,
					shopId: this.shopId,
					// inId: this.inHouseId,
					goodsId: this.currentItemData.goodsDTO.id,
					// outHouseId: this.outHouseId,
					searchText: keyword || null
				}
				this.$fxHttp.requestPost({
					url: `${this.$fxBaseApi.url}/accounts/${this.shopId}/carBill`,
					data: params,
					query: {
						m: 'getBomList'
					}
				}).then(res => {
					resolve(res)
				})
			})
		},
		// }}}
		dateConfirmhandle (date) {
			this.currentItemData.produceDate = date.getTime()
			this.datePickerShow = false
		},
		onConfirmClick () {
			if (this.currentItemData.id) {
				this.currentItemData.changeType = 'edit'
			}
			this.$emit('on-Confirm', this.currentItemData)
			this.$emit('update:visibleFlag', false)
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.itemRowEdit-popup {
	height:100%
	width: 100%
	text-align:left
	display: flex
	flex-direction: column
	.itemRowEdit-content {
		flex:1
		overflow:scroll
		.info-item-value {
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.info-cell-img {
			padding: 0
		}
		.info-item-img {
			padding:0 10px 15px 50px
			box-sizing:border-box
			&>img {
				width:100%
				height:100%
			}
		}
	}
	.itemRowEdit-bottom {
		display: flex
		flex-direction: row
		width:100%
		.confirm-btn {
			flex:1
		}
	}
}
</style>
