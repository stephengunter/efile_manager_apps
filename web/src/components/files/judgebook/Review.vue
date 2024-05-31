<script setup>
import { ref, reactive, computed, watch, onBeforeMount, nextTick } from 'vue'
import { useStore } from 'vuex'
import { isEmptyObject, deepClone, isNumeric, setValues, rocNumToDateText } from '@/utils'
import JudgebookFile from '@/models/files/judgebook'
import Errors from '@/common/errors'
import { VALIDATE_MESSAGES, ACTION_TYPES } from '@/consts'


const name = 'FilesJudgebookReview'
const props = defineProps({
   list: {
      type: Array,
      default: () => []
   },
   court_types: {
      type: Array,
      default: () => []
   },
	origin_types: {
      type: Array,
      default: () => []
   }
})
const emit = defineEmits([ACTION_TYPES.SUBMIT.name])
const store = useStore()

const initialState = {
	models: []
}

const state = reactive(deepClone(initialState))

onBeforeMount(init)

function init() {
   props.list.forEach(item => {
      let model = {
         id: 0,
         typeId: 0,
         judgeDate: 0,
         fileNumber: '',
         originType: '',
         courtType: '',
         year: '',
         category: '',
         num: '',
         ps: '',
         fileName: '',
         errors: new Errors()
      }
      setValues(item, model)
      check(model)
      state.models.push(model)
   })
}

const labels = computed(() => store.state.files_judgebooks.labels)
const results = computed(() => store.state.files_judgebooks.upload.results)

const types = computed(() => store.state.files_judgebooks.types)
const type_options = computed(() => {
	return types.value.map(item => ({
		value: item.id, title: item.title
	}))
})

const has_error = computed(() => {
   if(!state.models.length) return false
   return state.models.map(model => model.errors.any()).some(element => element === true)
})

function typeOrigin(model) {
   const type = types.value.find(item => item.id === model.typeId)
   const originType = props.origin_types.find(item => item.value === model.originType)
   
   return `${type.title} (${originType.title})`
}
function caseInfo(model) {
   const courtType = props.court_types.find(item => item.value === model.courtType)
   
   return `${courtType.title} ${model.year}年 ${model.category} ${model.num}`
}
function judgeDate(model) {
   const roc = true
   return rocNumToDateText(model.judgeDate, roc)
   
}
function check(model) {
   checkFileNumber(model)
}

function checkFileNumber(model) {
   const key = 'fileNumber'
   let valid = false
   if(model[key]) valid = JudgebookFile.checkFileNumber(model[key])
   else valid = false
   
   
   if(valid) {
      model.errors.clear(key)
   }else {
      let msg = model[key] ? `${labels.value[key]}不正確` : VALIDATE_MESSAGES.REQUIRED(labels.value[key])
      model.errors.set(key, [msg])
   }
}
function onSubmit() {
	emit(ACTION_TYPES.SUBMIT.name, state.models)
}

function getResult(model) {
   if(results.value.length) {
      return results.value.find(item => item.id === model.id)
   }
   return null
}

</script>

<template>
<div>
   <v-row dense>
      <v-col cols="12">
         <v-table>
            <thead>
               <tr>
                  <th class="text-center" style="width: 10%;">
                     
                  </th>
                  <th class="text-center" style="width: 15%;">
                     
                  </th>
                  <th class="text-center" style="width: 10%;">
                     {{ labels['judgeDate'] }}
                  </th>
                  <th class="text-center text-indigo-lighten-1" style="width: 25%;">
                     {{ labels['fileNumber'] }}
                  </th>
                  <th class="text-center text-indigo-lighten-1" >
                     備註
                  </th>
               </tr>
            </thead>
            <tbody>
               <tr v-for="model in state.models" :key="model.id">
                  <td class="font-weight-bold">
                     {{ typeOrigin(model) }}
                  </td>
                  <td class="font-weight-bold">
                     {{ caseInfo(model) }}
                  </td>
                  <td class="font-weight-bold text-center" >
                     {{ judgeDate(model) }}
                  </td>
                  <td>
                     <v-text-field variant="outlined" class="pt-3" density="compact"
                     v-model="model.fileNumber" :error-messages="model.errors.get('fileNumber')" 
                     @input="checkFileNumber(model)"
                     />
                  </td>
                  <td>
                     <v-text-field  variant="outlined" class="pt-3" density="compact"
                     v-model="model.ps"
                     />
                  </td>
               </tr>
            </tbody>
         </v-table>
      </v-col>
   </v-row>
   <v-row dense>
      <v-col cols="12">
         <v-btn color="success" class="float-right"
         :disabled="state.models.length === 0 || has_error"
         @click.prevent="onSubmit"
         >
				審核通過
         </v-btn>
      </v-col>
   </v-row>   
</div>
</template>