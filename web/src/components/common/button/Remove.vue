<script setup>
const name = 'CommonButtonRemove'
const props = defineProps({
   tooltip: {
      type: String,
      default: '刪除'
   },
   disabled: {
      type: Boolean,
      default: false
   },
   class_name: {
      type: String,
      default: ''
   },
   size: {
      type: String,
      default: 'small'
   }
})
const emit = defineEmits(['remove'])


function remove() {
	emit('remove')
}
</script>
<template>
   <v-tooltip v-if="tooltip" top>
      <template v-slot:activator="{ props }">
         <v-btn  v-bind="props" :size="size" color="error" icon="mdi-delete"
         :class="class_name" 
         :disabled="disabled" 
         @click.prevent="remove"  
         >
         </v-btn>
      </template>
      <span v-text="tooltip"></span>
   </v-tooltip>
   <v-btn v-else :size="size" color="error" icon="mdi-delete" 
   :class="class_name" :disabled="disabled" 
   @click.prevent="remove" 
   >
   </v-btn>
  
</template>