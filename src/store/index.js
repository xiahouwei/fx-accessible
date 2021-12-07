import Vue from 'vue'
import Vuex from 'vuex'
import state from './state'
import * as mutations from './mutations'
import * as actions from './actions'
import getters from './getter'
import loginer from './src/loginer/index'
import appSubject from './src/appSubject/index'
import auth from './src/auth/index'
import systemParamsCld from './src/system-params-cld/index'
import reportForm from './src/report-form/index'
import stylusDynamic from './src/stylus-dynamic'
Vue.use(Vuex)

const store = () => new Vuex.Store({
	state,
	mutations,
	actions,
	getters,
	modules: {
		loginer,
		appSubject,
		auth,
		systemParamsCld,
		reportForm,
		stylusDynamic
	}
})

export default store
