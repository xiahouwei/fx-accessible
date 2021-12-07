import inputResize from './src/inputResize'
import promisePro from './src/promisePro'
import redCodeEvent from './src/redCode'
import stylusDynamic from './src/stylusDynamic'
require('./src/fastclick.js')

export { stylusDynamic as $fxStylusDynamic }

export default (vue) => {
	window.FastClick.attach(document.body)
	inputResize()
	promisePro()
	redCodeEvent()
}
