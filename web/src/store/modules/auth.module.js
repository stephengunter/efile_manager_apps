import Errors from '@/common/errors'
import BaseService from '@/common/baseService'
import AuthService from '@/services/auth.service'
import AuthTokenService from '@/services/authtoken.service'
import OAuthService from '@/services/oAuth.service'
import JwtService from '@/services/jwt.service'
import { resolveUserFromClaims, isAdmin, isEmptyObject, deepClone } from '@/utils'

import { CHECK_AUTH, LOGIN, LOGIN_BY_GOOGLE, LOGIN_BY_AUTHTOKEN,
   LOGOUT, REFRESH_TOKEN 
} from '@/store/actions.type'
import { SET_AUTH, PURGE_AUTH, SET_USER, SET_LOADING } from '@/store/mutations.type'

const initialState = {
   user: {}
}

const state = deepClone(initialState)

const getters = {
   currentUser(state) {
     return state.user
   },
   isAuthenticated(state) {
     return !isEmptyObject(state.user)
   }
}

const defaultError = {
   status: 400,
   data: {'': ['身分驗證失敗, 請重新登入.']}
}

const actions = {
   [LOGIN](context, form) {
      context.commit(SET_LOADING, true)
      return new Promise((resolve, reject) => {
         AuthService.login(form)
         .then(model => {
            context.commit(SET_AUTH, {
               token: model.token,
               refreshToken: model.refreshToken
            }) 
            context.dispatch(CHECK_AUTH)
            .then(result => {
               if(result) resolve()
               else reject(defaultError)
            })
            .catch(() => reject(defaultError))            
         })
         .catch(error => reject(error))
         .finally(() => context.commit(SET_LOADING, false))
      })     
   },
   [LOGIN_BY_GOOGLE](context, token) {
      context.commit(SET_LOADING, true)
      return new Promise((resolve, reject) => {
         OAuthService.googleLogin(token)
         .then(model => {
            context.commit(SET_AUTH, {
               token: model.token,
               refreshToken: model.refreshToken
            })  
            context.dispatch(CHECK_AUTH)
            .then(result => {
               if(result) resolve()
               else reject(defaultError)
            })
            .catch(() => reject(defaultError))
         })
         .catch(error => reject(error))
         .finally(() => context.commit(SET_LOADING, false))
      })     
   },
   [LOGIN_BY_AUTHTOKEN](context, model) {
      context.commit(SET_LOADING, true)
      return new Promise((resolve, reject) => {
         AuthTokenService.login(model)
         .then(model => {
            context.commit(SET_AUTH, {
               token: model.token,
               refreshToken: model.refreshToken
            })  
            context.dispatch(CHECK_AUTH)
            .then(result => {
               if(result) resolve()
               else reject(defaultError)
            })
            .catch(() => reject(defaultError))
         })
         .catch(error => reject(error))
         .finally(() => context.commit(SET_LOADING, false))
      })     
   },
   [LOGOUT](context) {
      context.commit(PURGE_AUTH)
      return new Promise(resolve => {
         setTimeout(() => {
            resolve(true)
         }, 500)
      })
   },
   [CHECK_AUTH](context) {
      return new Promise((resolve) => {
         let token = JwtService.getToken()         
         if(token) {
            BaseService.setHeader(token)
            let claims = JwtService.resolveClaims(token)
            
            let user = resolveUserFromClaims(claims)
            if(user) {
               context.commit(SET_USER, user) 
               resolve(true)
            }else {
               context.commit(PURGE_AUTH)
               resolve(false)
            }            
         }else {
            context.commit(PURGE_AUTH)
            resolve(false)
         }
      })
   },
   [REFRESH_TOKEN](context) {
      context.commit(SET_LOADING, true)
      return new Promise((resolve) => {
         let accessToken = JwtService.getToken()
         let refreshToken = JwtService.getRefreshToken()
         let claims = JwtService.resolveClaims(accessToken)
         if(accessToken && refreshToken) {
            AuthService.refreshToken(claims.id, { accessToken, refreshToken })
            .then(model => {
               context.commit(SET_AUTH, {
                  token: model.token,
                  refreshToken: model.refreshToken
               })
               resolve(true)
            })
            .catch(err => {
               context.commit(PURGE_AUTH)
               resolve(false)           
            })
            .finally(() => { 
               context.commit(SET_LOADING, false)
            })
         }else {
            context.commit(PURGE_AUTH)
            resolve(false)
         }
      })
   }   
}


const mutations = {
   [SET_USER](state, user) {
      state.user = user
   },
   [SET_AUTH](state, { token, refreshToken }) {
      JwtService.saveToken(token, refreshToken)
      let claims = JwtService.resolveClaims(token)
     
      let user = resolveUserFromClaims(claims)
      state.user = user
   },
   [PURGE_AUTH](state) {
      state.isAuthenticated = false
      state.user = null
      
      JwtService.destroyToken()
      BaseService.setHeader(null)
   }
}

export default {
   state,
   actions,
   mutations,
   getters
}
 