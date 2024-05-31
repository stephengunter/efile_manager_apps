<script setup>
import { reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { SET_DRAWER } from '@/store/mutations.type'
import { SITE_TITLE } from '@/config'
import { deepClone, isEmptyObject } from '@/utils'

const name = 'LayoutDrawer'
const store = useStore()
const router = useRouter()

const initialState = {
   open: []
}
const state = reactive(deepClone(initialState))

const menus = computed(() => store.state.app.menus)

const drawer = computed({
	get() {
		return store.getters.drawer
	},
	set(val) {
		store.commit(SET_DRAWER, val)
	}
})

const current = computed(() => store.state.app.route.to)

function onSelected(item) {
   router.push({ name: item.name })
}  

</script>

<template>
   <v-navigation-drawer id="app-drawer" v-model="drawer" 
   app theme="dark" class="bg-teal-darken-3"

   v-bind="$attrs"
   >
      <v-list dense nav>
         <v-list-item>
            <template v-slot:prepend>
               <v-avatar size="36px">
                  <v-img src="@/assets/logo.png"></v-img>
               </v-avatar>
            </template>
            <v-list-item-title class="text-h6" style="line-height: 1.5rem;"  
            v-text="SITE_TITLE" />
         </v-list-item>
      </v-list>

      <v-divider class="mb-2" />
      <v-list density="compact">
         <MenuDrawer  v-for="item in menus" :key="item.name" 
         :item="item" :current="current"
         @select="onSelected"
         />
      </v-list>
   </v-navigation-drawer>
</template>
