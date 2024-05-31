<script setup>
const name = 'ButtonCreate'
const props = defineProps({
   tooltip: {
      type: String,
      default: '新增'
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
const emit = defineEmits(['create'])


function create() {
	emit('create')
}
</script>
<template>
   <v-tooltip v-if="tooltip" top>
      <template v-slot:activator="{ props }">
         <v-btn  v-bind="props" :size="size" color="info" icon="mdi-plus"
         :class="class_name" 
         :disabled="disabled" 
         @click.prevent="create"  
         >
         </v-btn>
      </template>
      <span v-text="tooltip"></span>
   </v-tooltip>
   <v-btn v-else :size="size" color="info" icon="mdi-plus" 
   :class="class_name" :disabled="disabled" 
   @click.prevent="create" 
   >
   </v-btn>
  
</template>