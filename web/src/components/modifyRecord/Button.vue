<script setup>
import { WIDTH } from '@/consts'
import { isEmptyObject, deepClone, showModifyRecords } from '@/utils'

const name = 'ModifyRecordButton'
const props = defineProps({
   text: {
      type: String,
      default: ''
   },
   tooltip: {
      type: String,
      default: ''
   },
   title: {
      type: String,
      default: '編修紀錄'
   },
   type: {
      type: Object,
      default: null
   },
   id: {
      type: String,
      default: ''
   },
   action: {
      type: String,
      default: ''
   },
   width: {
      type: Number,
      default: () => WIDTH.L
   }
})


function fetchData() {
   showModifyRecords({
      type: props.type.name, id: props.id, 
      action: props.action, title: props.title, width: props.width
   })
}
</script>
<template>
   <v-tooltip :text="tooltip">
      <template v-slot:activator="{ props }">
         <a href="#" v-bind="props" @click.prevent="fetchData">{{ text }}</a>
      </template>
   </v-tooltip>
</template>
