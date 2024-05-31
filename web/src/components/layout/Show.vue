<script setup>
import { ref, reactive, computed, onMounted, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { deepClone, onErrors } from '@/utils'
import { SHOW_MODIFY_RECORDS, FETCH_MODIFY_RECORDS } from '@/store/actions.type'
import { WIDTH, ENTITY_TYPES } from '@/consts'
import { el } from 'date-fns/locale'

const name = 'LayoutShow'
const store = useStore()

const initialState = {
   active: false,
   width: WIDTH.M,
   title: ''
}

const state = reactive(deepClone(initialState))

Bus.on(SHOW_MODIFY_RECORDS, showModifyRecords)

// onMounted(() => {
	
// })
function showModifyRecords({type, id, action, title, width}) {
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
   <!-- <v-dialog v-model="photo.active" :max-width="photo.maxWidth">
      <v-card v-if="photo.model">
         <v-card-text>
            <div class="text-center" style="padding-top:36px;">
               <v-img class="img-center" :src="photo.model.id | photoIdUrl"
                  :max-width="photo.model.width"
               />
               <span v-if="photo.model.title" style="font-size: 16px; display: inline-block;" class="mt-3" v-text="photo.model.title"></span>
            </div>
         </v-card-text>
      </v-card>
   </v-dialog> -->
   <v-dialog persistent v-model="state.active" :width="state.width">
      <v-card v-if="state.active">
         <CommonCardTitle :title="state.title"
			@cancel="onCancel"
			/>
         <v-card-text>
            <ModifyRecordTable />
         </v-card-text>
      </v-card>
   </v-dialog>
</template>