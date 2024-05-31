<script setup>
import { reactive, computed, onBeforeMount, watch } from 'vue'
import { isEmptyObject } from '@/utils'
import { deepClone } from '@/utils'

const name = 'MenuDrawer'

const props = defineProps({
   item: {
      type: Object,
      default: null
   },
   current: {
      type: Object,
      default: null
   }
})
const emit = defineEmits(['select'])

const initialState = {
   expand: false,
   parent_active: false,
   sub_active_name: ''
}
const state = reactive(deepClone(initialState))

const subMenuItems  = computed(() => props.item.getSubitems().filter(item => item.isMainMenuItem()))

watch(() => props.current, init ,{
   deep: true
})

onBeforeMount(init)

function init() {
   if(isEmptyObject(props.current)) return
   currentMain()
   if(subMenuItems.value.length) {
      subMenuItems.value.forEach(sub => {
         if(sub.name === props.current.name) {
            state.expand = true
            state.parent_active = true
            state.sub_active_name = sub.name
         }else {
            if(props.current.hasParent(sub.name)) {
               state.expand = true
               state.parent_active = true
               state.sub_active_name = sub.name
            }
         }
      })
   }
}
function currentMain() {
   if(props.item.name === props.current.name) {
      state.parent_active = true
      state.expand = true
      state.sub_active_name = ''
   }else {
      state.parent_active = false
      state.expand = false
      state.sub_active_name = ''
   }
}
function expand() {
   state.expand = !state.expand
}
function select() {
   emit('select', props.item)
}
</script>
<template>
   <v-list-item :prepend-icon="item.meta.icon" :active="state.parent_active" >
      <template v-slot:title>
         <a href="#" @click.prevent="select" style="color: white;" class="text-decoration-none">
         {{ item.meta.title }}
         </a>
      </template>
      <template v-if="subMenuItems.length" v-slot:append>
         <v-btn variant="text" :icon="state.expand ? 'mdi-menu-down' : 'mdi-menu-right'" 
         @click.prepend="expand"
         />
      </template>
   </v-list-item>
   <div v-show="state.expand">
      <v-list-item style="margin-left : 45px"
      v-for="subItem in subMenuItems"  :key="subItem.name"
      :active="subItem.name === state.sub_active_name" 
      color="info"
      :title="subItem.meta.title"
      :prepend-icon="subItem.meta.icon"
      :value="subItem.name"
      :to="subItem.path"
      />
   </div>
</template>
