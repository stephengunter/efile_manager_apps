<script setup>
const name = 'CommonButtonEdit'
const props = defineProps({
   tooltip: {
      type: String,
      default: '編輯'
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
const emit = defineEmits(['edit'])


function edit() {
	emit('edit')
}
</script>
<template>
   <v-tooltip v-if="tooltip" top>
      <template v-slot:activator="{ props }">
         <v-btn  v-bind="props" :size="size" color="info" icon="mdi-pencil"
         :class="class_name" 
         :disabled="disabled" 
         @click.prevent="edit"  
         >
         </v-btn>
      </template>
      <span v-text="tooltip"></span>
   </v-tooltip>
   <v-btn v-else :size="size" color="info" icon="mdi-pencil" 
   :class="class_name" :disabled="disabled" 
   @click.prevent="edit" 
   >
   </v-btn>
  
</template>