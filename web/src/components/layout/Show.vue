<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import { deepClone, onErrors } from '@/utils'
import { SHOW_PHOTO, PREVIEW_ATTACHMENT, SHOW_MODIFY_RECORDS, FETCH_MODIFY_RECORDS } from '@/store/actions.type'
import { WIDTH, ENTITY_TYPES } from '@/consts'

const name = 'LayoutShow'
const store = useStore()

const initialState = {
   key: '',
   active: false,
   width: WIDTH.M,
   title: '',
   value: '',
   attachment: {
      blob: null, 
      url: '',
      width: 0,
      height: 0
   }
}

const state = reactive(deepClone(initialState))

onMounted(() => {
	window.addEventListener(SHOW_PHOTO, showPhoto)
})

onBeforeUnmount(() => {
	window.removeEventListener(SHOW_PHOTO, showPhoto)
})

Bus.on(SHOW_MODIFY_RECORDS, showModifyRecords)
Bus.on(SHOW_PHOTO, showPhoto)
Bus.on(PREVIEW_ATTACHMENT, previewAttachment)

function showPhoto({ detail }) {
   const url = detail.url
   if(url) {
      state.title = ''
      state.key = 'photo'
      state.value = url
      state.width = WIDTH.L
      state.active = true
   }else {
      state = { ...initialState }
   }
}
function previewAttachment({ blob, fileName }) {
   const blobUrl = URL.createObjectURL(blob)
   state.attachment.url = blobUrl
   state.title = fileName
   state.key = PREVIEW_ATTACHMENT
   state.width = WIDTH.XL
   state.active = true
}
function showModifyRecords({type, id, action, title, width}) {
   state.key = ENTITY_TYPES.MODIFY_RECORD.name
   state.value = ''
   state.title = title
   state.width = width ? width : WIDTH.M + 200
   if(type && id) {
      store.dispatch(FETCH_MODIFY_RECORDS, { type, id, action })
      .then(() => state.active = true)
      .catch(error => console.log(error))
   }else {
      state.active = true
   }
}
function onCancel() {
   state.active = false
   Object.assign(state, deepClone(initialState));
}
</script>
<template>
   <v-dialog persistent v-model="state.active" :width="state.width">
      <v-card v-if="state.active">
         <CommonCardTitle :title="state.title"
			@cancel="onCancel"
			/>
         <v-card-text>
            <ModifyRecordTable v-if="state.key === ENTITY_TYPES.MODIFY_RECORD.name" />
            <div v-if="state.key === PREVIEW_ATTACHMENT">
               <iframe :src="state.attachment.url" style="width: 100%; height:100vh">
               </iframe>  
            </div>
            <div v-else>
               <v-img class="img-fluid" :src="state.value" />
            </div>
         </v-card-text>
      </v-card>
   </v-dialog>
</template>


<style scoped>

.img-fluid {
   max-width: 100%;
   height: auto;
}

</style>