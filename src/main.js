import Vue from 'vue'
import App from './App.vue'
import router from './router/index'
import store from './store/index'
import appInit, { appMount } from '@/js/appInit'
appInit(Vue)
const app = {}

Vue.config.productionTip = false
app.vue = appMount(Vue, router, store, App)

export default app
