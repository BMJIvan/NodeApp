import { createApp } from 'vue'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as Icons from '@element-plus/icons'

import App from './App.vue'

//createApp(App).mount('#app')
const app = createApp(App)

app.use(ElementPlus)
app.use(Icons)

app.mount('#app')