import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './utils/theme'
import { initTracker } from './utils/tracker'
import './assets/css/color.css'
import './assets/css/global.scss'
import 'remixicon/fonts/remixicon.css'
import 'highlight.js/styles/atom-one-dark.css'

// 初始化追踪器
initTracker()

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app')
