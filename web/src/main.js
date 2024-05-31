import { createApp } from 'vue'
import App from './App.vue'
import mitt from 'mitt'

window.Bus = mitt()
// Plugins
import { registerPlugins } from '@/plugins'

const app = createApp(App)
registerPlugins(app)
app.mount('#app')