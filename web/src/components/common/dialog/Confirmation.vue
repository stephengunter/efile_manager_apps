<script setup>
import { computed } from 'vue'
import { ERRORS, WARNING, SUCCESS, DIALOG_TITLE, DIALOG_MESSAGE } from '@/consts'

const name = 'CommonConfirmation'
const props = defineProps({
   type: {
      type: String,
      default: ''
   },
   title: {
      type: String,
      default: ''
   },
   text: {
      type: String,
      default: ''
   },
   ok_text: {
      type: String,
      default: '確定'
   },
   cancel_text: {
      type: String,
      default: ''
   },
   on_ok: {
      type: Function,
      default: null
   },
   on_cancel: {
      type: Function,
      default: null
   }
})

const emit = defineEmits(['ok', 'cancel'])
const title_style = computed(() => {
   if(props.type === ERRORS) return 'bg-red'
   else if(props.type === WARNING) return 'bg-warning'
   return 'bg-info'
})
const title_icon = computed(() => {
   if(props.type === ERRORS) return 'mdi-alert-circle'
   else if(props.type === WARNING) return 'mdi-alert'
   return 'mdi-information'
})

const noAction = computed(() => !props.on_ok && !props.on_cancel)

function ok() {
   if(props.on_ok) props.on_ok()
   else emit('ok')
}
function cancel() {
   if(props.on_cancel) props.on_cancel()
   else emit('cancel')
}

</script>
<template>
   <v-card>
      <v-card-title :class="title_style">
         <v-icon class="mb-1" :icon="title_icon" />
         {{ title  }}
      </v-card-title>
      <slot>
         <v-card-text v-if="text">
            <v-container>
               <p v-html="text">
               
               </p>
            </v-container>
         </v-card-text>
      </slot>
      <v-card-actions v-show="!noAction">
         <v-spacer />
         <v-btn v-show="cancel_text" text @click="cancel">
            {{ cancel_text }}
         </v-btn>
         <v-btn color="green darken-1" text @click="ok">
            {{ ok_text }}
         </v-btn>
      </v-card-actions>
   </v-card>
</template>