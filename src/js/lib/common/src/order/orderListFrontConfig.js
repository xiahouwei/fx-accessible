import Vue from 'vue'
export default {
	// 新增
	add () {
		return Vue.prototype.$dialog.confirm({
			title: '提示',
			message: '确定生成单据吗？'
		})
	},
	// 保存
	save () {
		return Vue.prototype.$dialog.confirm({
			title: '提示',
			message: '确定要保存该单据吗？'
		})
	},
	// 提交
	submit () {
		return Vue.prototype.$dialog.confirm({
			title: '提示',
			message: '确定要提交该单据吗？'
		})
	},
	// 审核
	check () {
		return Vue.prototype.$dialog.confirm({
			title: '提示',
			message: '确定要审核该单据吗？'
		})
	},
	// 退回
	returned () {
		return Vue.prototype.$dialog.confirm({
			title: '提示',
			message: '确定要退回该单据吗？'
		})
	},
	// 反审
	uncheck () {
		return Vue.prototype.$dialog.confirm({
			title: '提示',
			message: '确定要反审该单据吗？'
		})
	},
	// 删除
	del () {
		return Vue.prototype.$dialog.confirm({
			title: '提示',
			message: '确定要删除该单据吗？'
		})
	},
	// 复制
	copy () {
		return Vue.prototype.$dialog.confirm({
			title: '提示',
			message: '确定要复制该单据吗？'
		})
	},
	// 复审
	reCheck () {
		return Vue.prototype.$dialog.confirm({
			title: '提示',
			message: '确定要复审该单据吗？'
		})
	},
	// 取消复审
	unReCheck () {
		return Vue.prototype.$dialog.confirm({
			title: '提示',
			message: '确定要取消复审该单据吗？'
		})
	},
	// 分拣
	sorting () {
		return Vue.prototype.$dialog.confirm({
			title: '提示',
			message: '确定要分拣该单据吗？'
		})
	},
	// 批量审核
	checkMulity (params) {
		return new Promise(resolve => {
			if (!params || params.length === 0) {
				Vue.prototype.$fxToast.fail('请选择要审核的单据')
				return false
			}
			Vue.prototype.$dialog.confirm({
				title: '提示',
				message: '确定要审核所选单据？'
			}).then(() => {
				resolve({ data: params })
			})
		})
	},
	// 批量分拣
	sortingMulity (params) {
		return new Promise(resolve => {
			if (!params || params.length === 0) {
				Vue.prototype.$fxToast.fail('请选择要分拣的单据')
				return false
			}
			resolve(params)
		})
	},
	sendEdi (params) {
		return Vue.prototype.$dialog.confirm({
			title: '提示',
			message: '确定要将该单据发送到EDI吗？'
		})
	}
}
