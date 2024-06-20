import { createApp } from 'vue'
import App from './App.vue'
import '@/events'
import mitt from 'mitt'
import '@/assets/styles/app.scss'


window.Bus = mitt()
// Plugins
import { registerPlugins } from '@/plugins'

const app = createApp(App)
registerPlugins(app)
app.mount('#app')