import Errors from '@/common/errors'
import appRoutes from '@/routes/app'
import { MENUS } from '@/consts'
import { GET_MENUS, PAGE_NOT_FOUND } from '@/store/actions.type'
import { SET_BREAD_ITEMS, SET_LOADING, SET_ERRORS, CLEAR_ERRORS, 
   SET_DRAWER, TOGGLE_DRAWER, SET_ROUTE, SET_MENUS, TOGGLE_USER_MENU
} from '@/store/mutations.type'
import { deepClone } from '@/utils'
import { ROUTE_NAMES } from '@/consts'

const initialState = {
   showUserMenu: true,
   breadItems: [],
   loading: false,
   drawer: true,
   errors: new Errors(),
   route: {
      to: {}, 
      from: {}
   },
   menus: []
}

const state = deepClone(initialState)


const getters = {
   drawer(state) {
      return state.drawer
   },
   breadItems(state) {
      return state.breadItems
   },
   loading(state) {
      return state.loading
   },
   errors(state) {
      return state.errors
   },
   showUserMenu(state) {
      return state.showUserMenu
   }
}


const actions = {
   [GET_MENUS](context, auth) {
      if(auth) context.commit(SET_MENUS, appRoutes.filter(item => item.isMainMenuItem()).filter(item => item.isRoot()))
      else context.commit(SET_MENUS, [])
   },
   [PAGE_NOT_FOUND](context, { router, returnUrl }) {
      if(!returnUrl) returnUrl = state.route.from.fullPath
      router.push({ name: ROUTE_NAMES.NOT_FOUND, query: { returnUrl } })
   }
}

const mutations = {
   [SET_BREAD_ITEMS](state, items) {
      state.breadItems = items
   },
   [SET_LOADING](state, loading) {
      state.loading = loading
   },
   [SET_DRAWER](state, drawer) {
      state.drawer = drawer
   },
   [TOGGLE_DRAWER](state) {
      state.drawer = !state.drawer
   },
   [SET_ERRORS](state, errors) {
      state.errors.record(errors)
   },
   [CLEAR_ERRORS](state) {
      state.errors.clear()   
   },
   [SET_ROUTE](state, { to, from }) {
      state.route.to = deepClone(to)
      state.route.from = deepClone(from)
   },
   [SET_MENUS](state, menus) {
      state.menus = menus
   },
   [TOGGLE_USER_MENU](state, val) {
      state.showUserMenu = val
   }
}

export default {
   state,
   actions,
   mutations,
   getters
}
 