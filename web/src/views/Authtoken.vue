<script setup>
import { reactive, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import { LOGIN_BY_AUTHTOKEN } from '@/store/actions.type'
import { SET_ERRORS, CLEAR_ERRORS } from '@/store/mutations.type'  
import { VALIDATE_MESSAGES, WIDTH } from '@/consts'
import { resolveErrorData, onErrors, onSuccess, setValues, deepClone } from '@/utils'

const name = 'AuthtokenView'
const store = useStore()
const route = useRoute()
const router = useRouter()

const initialState = {

}
const state = reactive(deepClone(initialState))

onBeforeMount(() => {
	if(route.params) {
      const model = {
         userName: route.params.username,
         token: route.params.token,
         provider: route.params.provider
      }
      
      store.dispatch(LOGIN_BY_AUTHTOKEN, model)
      .then(() => onLoginSuccess())
      .catch(error => onLoginError(error))
   }
})
function onLoginError(error) {
   let errors = resolveErrorData(error)
   if(errors) store.commit(SET_ERRORS, Object.values(errors))
   else onErrors(error)
}
function onLoginSuccess() {
   onSuccess('登入成功')
   if(state.returnUrl) {
      if(state.returnQuery) router.push({ path: state.returnUrl, query: state.returnQuery })
      else router.push({ path: state.returnUrl })
   } 
   else router.push({ path: '/' })
}
</script>


<template>
   <v-card :max-width="WIDTH.S">
      <v-alert
         title="系統登入中，請稍後"
         type="info"
         variant="tonal"
      ></v-alert>
   </v-card>
   
</template>