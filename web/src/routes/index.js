import { createRouter, createWebHistory } from 'vue-router'
import appRoutes from './app'
import store from '@/store'

import JwtService from '@/services/jwt.service'
import { ROUTE_TYPES, ROUTE_NAMES } from '@/consts'
import { APP_CLOSED } from '@/config'
import { CHECK_AUTH, REFRESH_TOKEN, GET_MENUS, LOGOUT } from '@/store/actions.type'
import { SET_ROUTE, CLEAR_ERRORS, PURGE_AUTH, TOGGLE_USER_MENU } from '@/store/mutations.type'

const history = createWebHistory(process.env.BASE_URL)
const routes = appRoutes.map(item => {
	let parts = item.view.split('/')
	if(parts.length === 3) {
		return { 
			...item, 
			component: () => import(`@/views/${parts[0]}/${parts[1]}/${parts[2]}.vue`)
		}
	}
	else if(parts.length === 2) {
		return { 
			...item, 
			component: () => import(`@/views/${parts[0]}/${parts[1]}.vue`)
		}
	}else {
		return { 
			...item, 
			component: () => import(`@/views/${item.view}.vue`)
		}
	}
})


const redirect = (next, route) => next(route)

const authDone = (next, to, auth = false) => {
	// if(to.name === ROUTE_NAMES.JUDGEBOOKFILES) {
	// 	store.commit(TOGGLE_USER_MENU, false)
	// }else store.commit(TOGGLE_USER_MENU, true)
	store.dispatch(GET_MENUS, auth)
	return next()
}
const refreshToken = (next, to) => {
	store.dispatch(REFRESH_TOKEN)
	.then(token => {	
		if(token) return redirect(next, { path: to.path })
		else return redirect(next, { path: '/login' })
	})
}

const router = createRouter({
	history, routes
})


router.beforeEach((to, from, next) => {
	if(APP_CLOSED && to.name !== ROUTE_NAMES.CLOSE) return redirect(next, { name: ROUTE_NAMES.CLOSE })
	if(to.name === ROUTE_NAMES.AUTHTOKEN) {
		store.commit(PURGE_AUTH)
		return authDone(next, to)
	}
	
	store.commit(SET_ROUTE, { to: appRoutes.find(page => page.name === to.name), from: appRoutes.find(page => page.name === from.name) })
	store.commit(CLEAR_ERRORS)
	

	store.dispatch(CHECK_AUTH).then(auth => {
		if(to.meta.type === ROUTE_TYPES.FOR_ALL) return authDone(next, to, auth)
	
		if(auth) { 
			if(to.meta.type === ROUTE_TYPES.GUEST_ONLY) return redirect(next, { path: '/' })
			
			let tokenStatus = JwtService.tokenStatus()
			if(tokenStatus === -1) {
				//token過期
				return refreshToken(next, to)

			}else if(tokenStatus === 0) {
				//token 即將到期
				return refreshToken(next, to)

			}else return authDone(next, to, auth)
			
		}else{
			//無token
			if(to.meta.type === ROUTE_TYPES.GUEST_ONLY) return authDone(next, to, auth)
			else {
				let query = { ...to.query, returnUrl: to.path }
				return redirect(next, { path: '/login', query })
			}
		}
	})
})

export default router
