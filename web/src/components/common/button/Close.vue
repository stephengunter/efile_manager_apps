<script setup>
const name = 'CommonButtonClose'
const props = defineProps({
   tooltip: {
      type: String,
      default: '關閉'
   }
})
const emit = defineEmits(['close'])
</script>

<template>
   <v-tooltip :text="tooltip">
      <template v-slot:activator="{ props }">
         <v-btn v-bind="props" class="close-icon-btn ma-3" density="compact" variant="text" icon="mdi-close"
         @click.prevent="() => emit('close')"
         />
      </template>
   </v-tooltip>
</template>


<style scoped>
.close-icon-btn {
   position : absolute;
   top : 0;
   right:0;
}
</style>