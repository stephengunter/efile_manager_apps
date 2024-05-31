<script setup>
import { computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { LOGOUT } from '@/store/actions.type'
import { deepClone, shortName, pluralization } from '@/utils'
import { ROUTE_NAMES, ENTITY_TYPES } from '@/consts'

const name = 'MenuUser'
const props = defineProps({
   user: {
      type: Object,
      default: null
   }
})
const router = useRouter()
const store = useStore()

const initialState = {
   pictureError: false,
   items: []
   // items: [{
   //    title: '登出', name: LOGOUT, icon: 'mdi-logout-variant'
   // },{
   //    title: ENTITY_TYPES.PROFILES.title, name: ENTITY_TYPES.PROFILES.name, icon: 'mdi-account'
   // }] 
}

const noPicture = computed(() => {
   if(!props.user.picture) return true
   if(state.pictureError) return true
   return false
})

const state = reactive(deepClone(initialState))

function onSelected(name) {
   if(name === LOGOUT) logout()
   else if(name === ENTITY_TYPES.PROFILES.name) profiles()
}
function logout() {
   store.dispatch(LOGOUT)
   .then(() => router.push({ name: ROUTE_NAMES.LOGIN }))   
}
function profiles() {
   const id = props.user.id
   router.push({ name: ROUTE_NAMES.USER_DETAILS, params: { id } })
}

</script>
<template>
   <div>
      <v-menu>
         <template v-slot:activator="{ props }">
            <v-btn icon v-bind="props">
               <v-avatar v-if="noPicture" color="indigo">
                  {{ shortName(user) }}
               </v-avatar>
               <v-avatar v-else>
                  <v-img @error="() => state.pictureError = true"
                  :src="user.picture"
                  :alt="user.name"
                  />
               </v-avatar>
         </v-btn>
         </template>
         <v-list min-width="180"  max-width="300">   
         <v-list-item v-for="(item, index) in state.items" :key="index" @click.prevent="onSelected(item.name)">
               <template v-slot:prepend>
                  <v-icon :icon="item.icon"></v-icon>
               </template>
               <v-list-item-title v-text="item.title" />
            </v-list-item>
         </v-list> 
      </v-menu>
   </div>
</template>
