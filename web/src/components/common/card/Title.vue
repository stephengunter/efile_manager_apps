<script setup>
const name = 'CommonCardTitle'
const props = defineProps({
   id: {
      default: ''
   },
   title: {
      type: String,
      default: ''
   },
   tooltip: {
      type: String,
      default: ''
   },
   can_cancel: {
      type: Boolean,
      default: true
   },
   cancel_tooltip: {
      type: String,
      default: '取消'
   },
   show_id: {
      type: Boolean,
      default: true
   },
   class_name: {
      type: String,
      default: ''
   }
})
const emit = defineEmits(['create', 'edit', 'cancel'])

function create() {
	emit('create')
}
function edit() {
	emit('edit')
}
function cancel() {
	emit('cancel')
}
</script>
<template>
   <v-card-title>
      <span v-if="props.title" class="text-h5 font-weight-black">{{ props.title }}</span>
      <span v-if="props.id" v-show="props.show_id" class="headline ml-3">Id : {{ props.id }} </span>
      <template v-if="props.id">
         <CommonButtonEdit v-if="props.tooltip" class_name="float-right" :tooltip="props.tooltip"
         @edit="edit"
         />
      </template>
      <template v-else>
         <CommonButtonCreate v-if="props.tooltip" class_name="float-right" :tooltip="props.tooltip"
         @create="create"
         />
      </template>
      <CommonButtonClose v-if="props.can_cancel" :tooltip="cancel_tooltip" 
      @close="cancel" 
      />
   </v-card-title>
</template>