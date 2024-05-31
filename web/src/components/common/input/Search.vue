
<script setup>
import { reactive, onBeforeMount } from 'vue'
import { deepClone } from '@/utils'
const name = 'Search'
const props = defineProps({
   label: {
      type: String,
      default: ''
   },
   keyword: {
      type: String,
      default: ''
   }
})
const emit = defineEmits(['search'])
const initialState = {
   val: ''
}
const state = reactive(deepClone(initialState))

onBeforeMount(init)

function init() {
   state.val = props.keyword
}
function clear() {
   state.val = ''
   search()
}
function search() {
   emit('search', state.val)
}
</script>

<template>
   <form @submit.prevent="search">
      <v-text-field :label="label"
      prepend-inner-icon="mdi-magnify"
      density="compact" :clearable="true"
      variant="solo" 
      v-model="state.val" 
      @click:clear="clear"
      />
   </form>
</template>