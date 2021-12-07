import STATE_MODULE from '@/config/state_config.js'
const getStateConfig = function (type) {
	return STATE_MODULE[type]
}

const stateIs = function (type) {
	return function (key = []) {
		return function (value) {
			const states = getStateConfig(type)
			const keys = [].concat(key)
			const organType = keys.map(item => {
				return states[item]
			})
			return organType.includes(`${value}`)
		}
	}
}
const getStateVal = function (type) {
	return function (key) {
		const states = getStateConfig(type)
		return states[key]
	}
}
const getStateName = function (type) {
	return function (val) {
		const states = getStateConfig(type)
		const _key = Object.keys(states).find(item => {
			return states[item] === val
		})
		return STATE_MODULE.stateName[_key]
	}
}
const getStateList = function (type) {
	const stateObj = STATE_MODULE[type]
	const stateName = STATE_MODULE.stateName
	return Object.keys(stateObj).map(item => {
		return {
			id: stateObj[item],
			name: stateName[item]
		}
	})
}
export default {
	stateIs,
	getStateVal,
	getStateName,
	getStateList
}
