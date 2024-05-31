<script setup>
import { reactive, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import { useVuelidate } from '@vuelidate/core'
import { email, required, helpers } from '@vuelidate/validators'
import { LOGIN, LOGIN_BY_GOOGLE } from '@/store/actions.type'
import { SET_ERRORS, CLEAR_ERRORS } from '@/store/mutations.type'  
import { VALIDATE_MESSAGES, WIDTH } from '@/consts'
import { resolveErrorData, onErrors, onSuccess, setValues, deepClone } from '@/utils'

const name = 'LoginView'
const store = useStore()
const route = useRoute()
const router = useRouter()

const initialState = {
   returnUrl: '',
   returnQuery: '',
   form: {
      username: '',
      password: ''
   },
   password:{
      visible: false
   }
}
const state = reactive(deepClone(initialState))
const labels = {
	'username':'Email',
	'password':'密碼'
}

const rules = {
   username: { 
      required: helpers.withMessage(VALIDATE_MESSAGES.REQUIRED(labels['username']), required), 
      email: helpers.withMessage(VALIDATE_MESSAGES.WRONG_FORMAT_OF(labels['username']), email), 
   },
   password: {
      required: helpers.withMessage(VALIDATE_MESSAGES.REQUIRED(labels['password']), required)
   } 
}

const v$ = useVuelidate(rules, state.form)

onBeforeMount(() => {
	if(route.query) {
      state.returnUrl = route.query.returnUrl ? route.query.returnUrl : ''
      let copy = JSON.parse(JSON.stringify(route.query))
      delete copy['returnUrl']
      state.returnQuery = copy
   }
})

function onSubmit() {
	v$.value.$validate().then(valid => {
      if(!valid) return
      store.dispatch(LOGIN, state.form)
      .then(() => onLoginSuccess())
      .catch(error => onLoginError(error))
	})
}

function clear() {
   v$.value.$reset()
   setValues(initialState.form, state.form)
}

//#region google
function callback(data) {
   clear()
   store.commit(CLEAR_ERRORS)
   if(data.credential) {
      store.commit(CLEAR_ERRORS)
      store.dispatch(LOGIN_BY_GOOGLE, data.credential)
      .then(onLoginSuccess)
      .catch(error => onLoginError(error))
   } else onErrors()
}

//#endregion
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
function onInputChanged(){
   store.commit(CLEAR_ERRORS)
}
</script>


<template>
   <v-card :max-width="WIDTH.S">
      <v-card-title class="font-weight-black">
         <h2 class="ma-2">登入</h2>            
      </v-card-title>
      <v-card-text>
         <v-container>
            <form @submit.prevent="onSubmit" @input="onInputChanged">
               <v-row>
                  <v-col cols="12">
                     <v-text-field variant="outlined" :label="labels['username']"
                     prepend-inner-icon="mdi-email-outline"
                     density="compact" :placeholder="`請輸入${labels['username']}`"                     
                     v-model="state.form.username"
                     :error-messages="v$.username.$errors.map(e => e.$message)"                     
                     @input="v$.username.$touch"
                     @blur="v$.username.$touch"
                     />
                     <v-text-field variant="outlined" :label="labels['password']"
                     prepend-inner-icon="mdi-lock-outline"
                     density="compact" :placeholder="`請輸入${labels['password']}`" 
                     :append-inner-icon="state.password.visible ? 'mdi-eye-off' : 'mdi-eye'"
                     :type="state.password.visible ? 'text' : 'password'"
                     v-model="state.form.password"
                     :error-messages="v$.password.$errors.map(e => e.$message)"
                     @input="v$.password.$touch"
                     @blur="v$.password.$touch"
                     @click:append-inner="state.password.visible = !state.password.visible"
                     />
                  </v-col>
                  <v-col cols="12">
                     <v-btn type="submit" color="success" class="float-right">
                     登入
                     </v-btn>
                  </v-col> 
                  <v-col cols="12">
                     <CommonErrorsList />
                  </v-col>
               </v-row>
            </form>
         </v-container>
      </v-card-text>
   </v-card>
</template>