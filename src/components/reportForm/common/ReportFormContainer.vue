<template>
	<w-app-page>
		<w-header :title="reportFormConfig.label" :border="true">
			<w-icon
				type="report-search-filter"
				slot="header-right"
				class="report-head-btn"
				@click="onSearchClick"
			></w-icon>
			<w-icon
				type="report-column-filter"
				slot="header-right"
				class="report-head-btn"
				@click="onColumnFilterClick"
			></w-icon>
		</w-header>
		<reportFormSearchBar
			v-show='showSearchBar'
			v-model="searchText"
			:reportFormId="reportFormConfig.id"
			@on-search="inputSearchKey"
		></reportFormSearchBar>
		<w-virtual-table
			ref="table"
			:sumCol="sumCol"
			:frozenCol="frozenColProp"
			:sort="false"
			:sumFormatter="sumFormatter"
		>
			<w-virtual-table-column
				v-for="item in columnData"
				:key="item.code"
				:prop="item.code"
				:label="item.name"
				:decimal="item.decimal"
				:visiable="item.selected"
			>
				<div v-if="item.type==='image'" slot-scope="scope">
					<a href="javascript:void(0);" @click="onImgCellClick(scope)">查看</a>
				</div>
			</w-virtual-table-column>
		</w-virtual-table>
		<van-popup
			v-model="filterPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<slot name="slot-filter"></slot>
		</van-popup>
		<van-popup
			v-model="columnFilterPopShow"
			position="right"
			class="fx-list-popup-full"
			:close-on-click-overlay="false"
			:lock-scroll="false"
		>
			<columnFilterPop
				:visibleFlag.sync="columnFilterPopShow"
				:planList="reportPlans"
				:plan.sync="defaultPlan"
				:planDetails.sync="columnData"
				:planDetailsApi="getPlanDetail"
				@on-confirm="onColumnFilterConfirm"
			></columnFilterPop>
		</van-popup>
	</w-app-page>
</template>

<script>
/* reportFormContainer by shw 2019/12/31
 * @desc 报表页面通用组件
 *
 * <必传>
 * @param {reportFormConfig} [object] - 报表设定
 * @reportFormConfig {
 * 	label: 报表名称,
 * 	id: 报表id,
 * 	responseKey: 自定义responseKey
 * }
 * @param {getReportParams}  [Function] - 获取报表参数 形参(params:根据)
 * @param {reportPlans}  [Array] - 报表方案数组
 * @param {filterPopShow}  [Boolean] - 是否打开筛选条件popup 注意此属性必须加sync修饰符
 *
 *<非必传>
 * @param {planDetailsApi}  [Function] - 获取方案接口 (建议用默认通用)形参(schemeId:方案id)
 * @param {reportFormApi}  [Function] - 报表接口 (建议用默认通用)形参(params:getReportParams返回值)
 * @param {showSearchBar} [Boolean] - 是否开启关键字搜索功能
 *
 * @methods {init} 初始化页, 传入方案,获取params方法,成功后刷新报表
 * @methods {initReportForm} 初始化页面方法, 需传入默认方案
 * @methods {refreshReportForm}  报表刷新方法 需传入接口参数
 * @methods {getColumns}   获取当前列数据
 *
 * @slot {slot-filter} 筛选组件插槽
 */
import { mapState, mapGetters } from 'vuex'
import reportFormSearchBar from '@/components/reportForm/common/ReportFormSearchBar.vue'
import columnFilterPop from '@/components/reportForm/common/ColumnFilterPop.vue'
import utils from '@/js/lib/utils'
export default {
	name: 'report',
	components: {
		reportFormSearchBar,
		columnFilterPop
	},
	props: {
		reportFormConfig: {
			type: Object,
			default: () => {
				return {}
			}
		},
		planDetailsApi: Function,
		reportFormApi: Function,
		reportPlans: {
			type: Array,
			default: () => {
				return []
			}
		},
		getReportParams: Function,
		filterPopShow: Boolean,
		showSearchBar: {
			type: Boolean,
			default: false
		},
		reportFormId: {
			type: String,
			default: () => {
				return ''
			}
		}
	},
	data () {
		return {
			columnData: [],
			sumCol: [],
			columnFilterPopShow: false,
			defaultPlan: {},
			searchText: '',
			tableData: [],
			searchColumsKey: this.reportFormConfig.searchColumsKey,
			params: {}
		}
	},
	computed: {
		...mapState({
			loginerShopId: state => state.loginer.loginerShopId,
			loginerId: state => state.loginer.loginerId,
			sysPointSize: 'sysPointSize',
			sysMoneyPointSize: 'sysMoneyPointSize'
		}),
		...mapGetters(['reportFrozenColGetter']),
		frozenColumnFlag () {
			return this.reportFrozenColGetter(this.reportFormConfig.id)
		},
		frozenColProp () {
			const visibleCol = this.columnData.filter(item => {
				return !!item.selected
			})
			return this.frozenColumnFlag ? visibleCol.length !== 0 ? visibleCol[0].code : '' : ''
		},
		extendColumns () {
			return [
				...this.createColumnsWithSysPointSize(this.reportFormConfig.columnCount || []),
				...this.createColumnsWithSysMoneyPointSize(this.reportFormConfig.columnPrice || []),
				...this.createImageColumns(this.reportFormConfig.columnImage || [])
			]
		}
	},
	methods: {
		init ({ reportPlan, getReportParams }) {
			this.initReportForm(reportPlan).then(() => {
				getReportParams().then(res => {
					this.refreshReportForm(res)
				})
			})
		},
		initReportForm (plan = {}) {
			return new Promise(resolve => {
				this.defaultPlan = plan
				this.getPlanDetail(plan.id).then(res => {
					this.setColumnData(res)
					resolve()
				})
			})
		},
		getValidcols () {
			return this.columnData.filter(item => {
				return !!item.selected
			}).map(item => {
				return item.code
			}).join(',')
		},
		refreshReportForm (filterParams) {
			this.$nextTick(() => {
				const params = this.$fxUtils.isDef(filterParams) ? filterParams : this.getReportParams()
				params.validcols = this.getValidcols()
				this.params = params
				this.getReportData(params).then(res => {
					if (utils.getAppType() === 'cld' && res && params.validcols.includes('makeTime')) {
						res.map((item) => {
							item.makeTime = this.$fxUtils.timestampToTime(item.makeTime)
						})
					}
					this.tableData = res
					this.$refs.table.initGrid(res)
				})
			})
		},
		getColumns () {
			return this.columnData
		},
		onColumnFilterClick () {
			this.columnFilterPopShow = true
		},
		setColumnData (columns) {
			this.columnData = this.extendColumnsHandler(columns)
			this.sumCol = columns.reduce((pre, cur) => {
				if (cur.sum) {
					pre.push(cur.code)
				}
				return pre
			}, [])
		},
		extendColumnsHandler (columns) {
			if (Array.isArray(this.extendColumns) && this.extendColumns.length > 0) {
				columns.forEach(item => {
					const col = this.extendColumns.find(extCol => {
						return item.code === extCol.prop
					})
					if (col) {
						item = Object.assign(item, col)
					}
				})
			}
			return columns
		},
		createDecimalColumns (cols, decimal) {
			return cols.map(item => {
				return {
					prop: item,
					decimal: decimal
				}
			})
		},
		createColumnsWithSysPointSize (cols) {
			return this.createDecimalColumns(cols, this.sysPointSize)
		},
		createColumnsWithSysMoneyPointSize (cols) {
			return this.createDecimalColumns(cols, this.sysMoneyPointSize)
		},
		createImageColumns (cols, decimal) {
			return cols.map(item => {
				return {
					prop: item,
					type: 'image'
				}
			})
		},
		getPlanDetail (schemeId) {
			const params = {
				schemeId
			}
			if (typeof this.planDetailsApi === 'function') {
				return this.planDetailsApi(params)
			} else {
				if (utils.getAppType() === 'cld') {
					return this.$fxApi('reportForm.get4CldPlanDetail')(schemeId, this.reportFormId)
				} else {
					return this.$fxApi('reportForm.getPlanDetail')(params)
				}
			}
		},
		getReportData (params) {
			if (typeof this.reportFormApi === 'function') {
				return this.reportFormApi(params)
			} else {
				if (utils.getAppType() === 'cld') {
					return this.$fxApi('reportForm.get4CldReportData')(params, this.reportFormId)
				} else {
					return this.$fxApi('reportForm.getReportData')(params, this.reportFormConfig.id, this.reportFormConfig.responseKey)
				}
			}
		},
		sumFormatter (data, prop) {
			const col = this.columnData.find(item => {
				return prop === item.code
			})
			const decimal = col ? col.decimal : 4
			// 老的规则弃用
			// const sum = data.reduce((pre, cur) => {
			// 	let preNum = parseFloat(pre)
			// 	let curNum = parseFloat(cur[prop])
			// 	return this.$fxUtils.toFixedSHW((preNum + curNum), decimal, false)
			// }, 0)
			// return sum
			// 这个结果是正确的,z5的结果是不正确的 但是要跟z5的一致
			// const sum = data.reduce((pre, cur) => {
			// 	let preNum = parseFloat(pre)
			// 	let curNum = parseFloat(this.$fxUtils.toFixedSHW(cur[prop], decimal, false))
			// 	return preNum + curNum
			// }, 0)
			// return this.$fxUtils.toFixedSHW(sum, decimal, false)
			// 模拟z5的方法
			const sum = data.reduce((pre, cur) => {
				let preNum = parseFloat(pre)
				let curNum = parseFloat(this.numberFormat(cur[prop], decimal))
				if (isNaN(curNum)) {
					return preNum
				} else {
					return preNum + curNum
				}
			}, 0)
			return this.numberFormat(sum, decimal)
		},
		onSearchClick () {
			this.$emit('update:filterPopShow', true)
		},
		numberFormat (num, len) {
			let powNum = Math.pow(10, len)
			return String(Math.round(num * powNum) / powNum)
		},
		inputSearchKey () {
			const _data = this.tableData.filter(item => {
				return !!this.searchColumsKey.find(itemKey => {
					return this.$fxUtils.fuzzyQueryString(item[itemKey], this.searchText)
				})
			})
			this.$refs.table.initGrid(_data)
		},
		onImgCellClick ({ row, index }) {
			const _dom = document.createRange().createContextualFragment(row.lookPicture)
			this.$fxApi('reportForm.getGoodsImagesList')(_dom.firstChild.dataset.goodsId).then(res => {
				if (res.length === 0) {
					this.$fxToast.fail('没有可查看图片!')
					return false
				}
				this.$fxImagePreview(res)
			})
		},
		onColumnFilterConfirm (columns) {
			this.setColumnData(columns)
			this.refreshReportForm(this.params)
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.report-head-btn {
	width:40px
	height:100%
	background-size: 20px
}
</style>
