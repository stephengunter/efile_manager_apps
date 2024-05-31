/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

// Plugins
import vuetify from './vuetify'
import { registerFilters } from './filters'
import vue3GoogleLogin from 'vue3-google-login'
import VueSocialSharing from 'vue-social-sharing'
import { Vue3Mq } from 'vue3-mq'
import { GOOGLE_AUTH_PARAMS } from '@/config'
import timeago from 'vue-timeago3'
import { zhTW } from 'date-fns/locale'
import router from '@/routes'
import store from '@/store'

export const registerPlugins = (app) => {
	registerFilters(app)
	app.use(vuetify)
		.use(Vue3Mq, {
			preset: 'vuetify'
		})
		.use(timeago, {
			// converterOptions: {
			// 	includeSeconds: false,
			// },
			locale: zhTW
		})
		.use(vue3GoogleLogin, {
			clientId: GOOGLE_AUTH_PARAMS.client_id
		})
		.use(VueSocialSharing)
		.use(router)
		.use(store)
		
}
