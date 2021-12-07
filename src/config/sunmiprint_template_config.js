export default {
	// 留样模板
	foodResidue (params) {
		return {
			title: '留样',
			remark: '依据食品安全法,留样食品需要保存48小时',
			id: `留样编号:${params.id}`,
			foodResidueDate: `留样时间:${params.foodResidueDate}`,
			menudate: `菜谱日期:${params.menudate}`,
			barmsg: params.barmsg, /* 二维码所含信息，通常为详情页面url */
			itemName: `品名:${params.itemName}`,
			itemChef: `厨师:${params.itemChef}`,
			eatTime: `餐别:${params.eatTime}`,
			foodResidueMember: `留样员:${params.foodResidueMember}`
		}
	}
}
