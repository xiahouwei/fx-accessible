import Vue from 'vue'
export default {
	add (res) {
		return new Promise(resolve => {
			Vue.prototype.$fxToast.success('生成单据成功').then(() => {
				resolve(res)
			})
		})
	},
	save (res) {
		return new Promise(resolve => {
			Vue.prototype.$fxToast.success('保存成功').then(() => {
				resolve(res)
			})
		})
	},
	submit (res) {
		return new Promise(resolve => {
			Vue.prototype.$fxToast.success('提交成功').then(() => {
				resolve(res)
			})
		})
	},
	check (res) {
		return new Promise(resolve => {
			Vue.prototype.$fxToast.success('审核成功').then(() => {
				resolve(res)
			})
		})
	},
	returned (res) {
		return new Promise(resolve => {
			Vue.prototype.$fxToast.success('退回成功').then(() => {
				resolve(res)
			})
		})
	},
	uncheck (res) {
		return new Promise(resolve => {
			Vue.prototype.$fxToast.success('反审成功').then(() => {
				resolve(res)
			})
		})
	},
	copy (res) {
		return new Promise(resolve => {
			Vue.prototype.$fxToast.success('复制成功').then(() => {
				resolve(res)
			})
		})
	},
	reCheck (res) {
		return new Promise(resolve => {
			Vue.prototype.$fxToast.success('复审成功').then(() => {
				resolve(res)
			})
		})
	},
	unReCheck (res) {
		return new Promise(resolve => {
			Vue.prototype.$fxToast.success('取消复审成功').then(() => {
				resolve(res)
			})
		})
	},
	sorting (res) {
		return new Promise(resolve => {
			Vue.prototype.$fxToast.success('分拣成功').then(() => {
				resolve(res)
			})
		})
	},
	deleteMulity (res) {
		return new Promise(resolve => {
			const { successCount, failCount, failMsg } = res
			if (!failMsg) {
				Vue.prototype.$fxToast.success(`删除成功${successCount}条,删除失败${failCount}条！`).then(() => {
					resolve(res)
				})
			} else {
				Vue.prototype.$fxToast.warning(failMsg)
			}
		})
	},
	deleteMulityType2 (res) {
		return new Promise(resolve => {
			const { successCnt } = res
			if (successCnt !== 0) {
				Vue.prototype.$fxToast.success(`删除成功${successCnt}条,删除失败${res.failure_num}条！`).then(() => {
					resolve(res)
				})
			} else {
				Vue.prototype.$fxToast.warning(`删除成功${successCnt}条,删除失败${res.failure_num}条！`).then(() => {
					resolve(res)
				})
			}
		})
	},
	importMulity (res) {
		return new Promise(resolve => {
			Vue.prototype.$fxToast.success('导入成功').then(() => {
				resolve(res)
			})
		})
	},
	sendEdi (res) {
		return new Promise(resolve => {
			Vue.prototype.$fxToast.success('发单成功').then(() => {
				resolve(res)
			})
		})
	}
}
