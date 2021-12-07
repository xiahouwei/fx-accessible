import utils from '@/js/lib/utils'
export default () => {
	const platfromObj = utils.platformIs()
	const appHeight = document.body.clientHeight + 'px'
	window.addEventListener('resize', () => {
		if (process.env.NODE_ENV === 'production' && platfromObj.iPhone) {
			document.body.style.height = appHeight
		}
		const activeElement = document.activeElement
		setTimeout(() => {
			activeElement.scrollIntoView()
		}, 100)
	}, false)
}
