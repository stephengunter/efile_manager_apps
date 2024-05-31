<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { isEmptyObject, deepClone } from '@/utils'
const name = 'CommonUpload'
const props = defineProps({
   show_button: {
      type: Boolean,
      default: false
   },
   button_label: {
      type: String,
      default: '上傳檔案'
   },
   multiple: {
      type: Boolean,
      default: true
   },
   is_media: {
      type: Boolean,
      default: true
   },
   allow_types: {
      type: Array,
      default: () => []
   },
   exclude: {
      type: Array,
      default: () => []
   }
})

defineExpose({
   launch, getFiles
})
const emit = defineEmits(['file-added', 'file-removed'])
const inputUpload = ref(null)

const image_types = ['image/png', 'image/gif', 'image/jpeg']
const initialState = {
	files: [],
   thumbnails: []
}
const state = reactive(deepClone(initialState))

const accept = computed(() => props.is_media ? image_types.toString() : props.allow_types.toString())
const names = computed(() => state.files.map(x => x.name))
const button_disable = computed(() => {
   if(state.files.length) {
      return true
   }
   return false
})

function getFiles() {
   return state.files
}
function launch() {
   inputUpload.value.click()
}

function onFileChange(e) {
   let files = e.target.files || e.dataTransfer.files
   if(!files.length) return
   let addFiles = []
   for(let i = 0; i < files.length; i++) {
      if(fileCanAdd(files[i])) {
         addFiles.push(addFile(files[i]))
      }
   }
   Promise.all(addFiles).then(() => {
      if(props.is_media) {
         emit('file-added', { files: state.files, thumbs: state.thumbnails })
      }else {
         emit('file-added', state.files)
      }
   })
}

function fileCanAdd(file) {
   if (fileExist(file.name)) return false
   if (props.exclude.includes(file.name)) return false
   return true
}
function fileExist(name) {
   return findFileIndex(name) >= 0
}
function findFileIndex(name) {
   return state.files.findIndex(item => item.name === name)
}
function addFile(file) {
   if(props.is_media) {
      return new Promise((resolve, reject) => {
         let image = createImage(file)
         image.then(data => {
            let thumb = {
               data: data,
               name: file.name,
               type: file.type,
            }
            state.files.push(file)
            state.thumbnails.push(thumb)

            resolve(true)
         }).catch(error => {
            console.error(error)
            reject()
         })
      })
   }else {
      
      return new Promise((resolve) => {
         state.files.push(file)
         resolve(true)
      })
   }
}
function removeFile(name) {
   let index = findFileIndex(name)
   if(index >= 0) {
      state.files.splice(index, 1)

      if(!state.files.length) inputUpload.value.value = ''
   }
   removeThumb(name)

   emit('file-removed', state.files)
}
function removeThumb(name) {
   let thumbIndex = state.thumbnails.findIndex(item => item.name == name)
   if (thumbIndex >= 0) state.thumbnails.splice(thumbIndex, 1)
}

function createImage(file) {
   return new Promise((resolve, reject) => {
      if(!isImage(file.type)) resolve(null)

      const reader = new FileReader();
      reader.onerror = (error) => {
         reader.abort()
         reject(error)
      }
      reader.onload = () => {
         resolve(reader.result)
      }
      reader.readAsDataURL(file)
   });
}
function isImage(type) {
   return image_types.includes(type)
}
</script>
<template>
   <div>
      <v-btn v-show="show_button" variant="outlined" v-bind="props"  
      color="primary" v-text="button_label" :disabled="button_disable"
      @click.prevent="launch"
      >
      </v-btn>
      <input ref="inputUpload" style="display: none;" type="file" 
      :multiple="multiple" :accept="accept" 
      @change="onFileChange" 
      > 
      <v-chip size="small" class="ma-2" v-for="file in state.files"
      closable :key="file.name"  
      @click:close="removeFile(file.name)"
      >
      {{ file.name }}
      </v-chip>
   </div>
</template>