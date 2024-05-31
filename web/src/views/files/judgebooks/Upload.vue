<script setup>
import { ref, reactive, computed, watch, onBeforeMount, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { isEmptyObject, deepClone, isNumeric, tryParseInt, onSuccess, onErrors, rocNumToDate } from '@/utils'
import JudgebookFile from '@/models/files/judgebook'
import { VALIDATE_MESSAGES, WIDTH, ROUTE_NAMES, ENTITY_TYPES } from '@/consts'
import { FETCH_JUDGEBOOK_TYPES, UPLOAD_JUDGEBOOKFILES } from '@/store/actions.type'
import { SET_JUDGEBOOKFILE_UPLOAD_RESULTS, CLEAR_ERRORS } from '@/store/mutations.type'


const name = 'FilesJudgebooksUploadView'
const store = useStore()
const route = useRoute()
const router = useRouter()

const JUDGEBOOKFILE = ENTITY_TYPES.JUDGEBOOKFILE

const initialState = {
	type: null, 
	courtType: null, 
	models: [],
	date: {
		id: 1001,
		title: '',
		active: false,
		value: '',
		model: {
			text: '',
			text_cn: '',
			num: 0
		},
		error_message: ''
	}
}

const state = reactive(deepClone(initialState))

const file_upload = ref(null)

const params = computed(() => store.state.files_judgebooks.params)
const ad_dpts = computed(() => store.state.files_judgebooks.ad_dpts)
const dptOptions = computed(() => {
	let options = []
	if(ad_dpts.value) {
		ad_dpts.value.forEach(dpt => {
			if(options.findIndex(item => item.value === dpt) < 0) {
				options.push({ value: dpt, title: `${dpt}股`  })
			}
		})
	}
	return options
})
const allowEmptyJudgeDate = computed(() => store.state.files_judgebooks.allowEmptyJudgeDate)
const allowEmptyFileNumber = computed(() => store.state.files_judgebooks.allowEmptyFileNumber)

const types = computed(() => store.state.files_judgebooks.types)
const courtTypes = computed(() => store.state.files_judgebooks.courtTypes)
const originTypes = computed(() => store.state.files_judgebooks.originTypes)

const labels = computed(() => store.state.files_judgebooks.labels)
const type_options = computed(() => {
	return types.value.map(item => ({
		value: item.id, title: item.title
	}))
})

const results = computed(() => store.state.files_judgebooks.upload.results)

const has_error = computed(() => {
   if(!state.models.length) return false
   return state.models.map(model => model.errors.any()).some(element => element === true)
})

onBeforeMount(() => {
	if(types.value.length) init()
	else {
		store.dispatch(FETCH_JUDGEBOOK_TYPES)
		.then(() => {
			nextTick(init)
		})
		.catch(error => onErrors(error))
	}

})

function init() {
	store.commit(SET_JUDGEBOOKFILE_UPLOAD_RESULTS, [])
	if(params.value.typeId) state.type = types.value.find(item => item.id === params.value.typeId)
	if(params.value.courtType) state.courtType = courtTypes.value.find(item => item.value === params.value.courtType)
}

function backToIndex() {
	router.push({ name: ROUTE_NAMES.JUDGEBOOKFILES, query: { ...params.value } })
}

function resolveModel(file, type, judgeDate, courtType, originType) {
	if(file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      const fileNumber = ''
      let fileName = file.name.slice(0, -4)
		let year = ''
		let category = ''
		let num = ''
		let ps = ''
		let parts = fileName.split('_')
		if(parts.length >= 3) {
			category = parts[1]
         num = JudgebookFile.checkNum(parts[2])
			if(JudgebookFile.checkYear(parts[0])) year = parts[0]
			if(parts.length > 3) {
            const date = rocNumToDate(tryParseInt(parts[3]))
            if(date) judgeDate = tryParseInt(parts[3])
            else ps = parts[3].toString()
         }
		}
		return new JudgebookFile(type, judgeDate, fileNumber, originType, courtType, year, category ,num, file, ps)
	}
	return null
}
function onFileAdded(files) {
   const type = isEmptyObject(state.type) ? types.value[0] : state.type
   const courtType = isEmptyObject(state.courtType) ? courtTypes.value[0].value : state.courtType.value
   const dpt = ad_dpts.value.length ? ad_dpts.value[0] : ''
   const originType = originTypes.value[0].value
   const judgeDate = 0
   let id = -1
   state.models = []
   files.forEach(file => {
      let model = resolveModel(file, type, judgeDate, courtType, originType)
      if(model) {
         check(model, 'fileNumber')
			check(model, 'judgeDate')
         check(model, 'year')
         check(model, 'category')
         check(model, 'num')
         model.id = id
         model.dpt = dpt
         state.models.push(model)
         id -= 1
      } 
   })
}

function check(model, key) {
   let valid = false
   if(key === 'fileNumber') {
      if(model[key]) valid = JudgebookFile.checkFileNumber(model[key])
      else valid = allowEmptyFileNumber.value
   } 
	else if(key === 'judgeDate') {
      if(model[key]) valid = JudgebookFile.checkJudgeDate(model[key])
      else valid = allowEmptyJudgeDate.value
   } 
   else if(key === 'year') valid = JudgebookFile.checkYear(model[key])
   else if(key === 'category') valid = !isNumeric(model[key])
   else if(key === 'num') {
      valid = JudgebookFile.checkNum(model[key]) ? true : false
   }else valid = true
   
   
   if(valid) {
      model.errors.clear(key)
   }else {
      let msg = model[key] ? `${labels.value[key]}不正確` : VALIDATE_MESSAGES.REQUIRED(labels.value[key])
      model.errors.set(key, [msg])
   }
}

function onDateSelected(entry, { date, model }) {
   if(date) {
      entry.judgeDateModel.date = date
      entry.judgeDateModel.value = model.text_cn
      entry.judgeDateModel.model = deepClone(model)
      entry.judgeDate = model.num
   }else {
      entry.judgeDate = 0
		entry.judgeDateModel = JudgebookFile.iniJudgeDateModel()
   }
   check(entry, 'judgeDate')
}
function onSubmit() {
   state.models.forEach(model => model.num = JudgebookFile.checkNum(model.num))
	store.commit(CLEAR_ERRORS)
	store.dispatch(UPLOAD_JUDGEBOOKFILES, state.models)
	.then(results => {
		nextTick(() => {
			if(!store.state.files_judgebooks.upload.has_error) {
				onSuccess()
            backToIndex()
			}	
		})
	})
	.catch(error => onErrors(error))
}

function getResult(model) {
   if(results.value.length) {
      return results.value.find(item => item.id === model.id)
   }
   return null
}
function onFind(id) {
   const model = state.models.find(item => item.id === id)
   emit('find', model)
}
</script>

<template>
<div>
   <v-row dense>
      <v-col cols="11">
			<CommonInputUpload ref="file_upload" :multiple="true" :show_button="true"
         :is_media="false" :allow_types="['.pdf']"
         @file-added="onFileAdded" @file-removed="onFileAdded"
         />
      </v-col>
		<v-col cols="1">
			<v-tooltip :text="`返回${JUDGEBOOKFILE.title}管理`">
				<template v-slot:activator="{ props }">
					<v-btn class="float-right" icon="mdi-arrow-left-bold" v-bind="props" size="small" color="info"
					@click.prevent="backToIndex"
					/>
				</template>
			</v-tooltip>
		</v-col>
   </v-row>
   <v-row dense v-show="state.models.length">
      <v-col cols="12">
         <v-table>
            <thead>
               <tr>
                  <th v-show="results.length" class="text-center" style="width: 10%;">
                     
                  </th>
                  <th class="text-center" style="width: 10%;">
                     {{ labels['typeId'] }}
                  </th>
                  <th class="text-center" style="width: 10%;">
                     {{ labels['courtType'] }}
                  </th>
                  <!-- <th v-show="dptOptions.length" class="text-center" style="width: 10%;">
                     {{ labels['dpt'] }}
                  </th> -->
                  <th class="text-center" style="width: 20%;">
                     {{ labels['fileNumber'] }}
                  </th>
                  <th class="text-center" style="width: 10%;">
                     {{ labels['year'] }}
                  </th>
                  <th class="text-center" style="width: 12%;">
                     {{ labels['category'] }}
                  </th>
                  <th class="text-center" style="width: 10%;">
                     {{ labels['num'] }}
                  </th>
                  <th class="text-center" style="width: 12%;">
                     {{ labels['judgeDate'] }}
                  </th>
                  <th class="text-center" >
                     備註
                  </th>
               </tr>
            </thead>
            <tbody>
               <tr v-for="model in state.models" :key="model.id">
                  <td v-show="results.length">
                     <FilesJudgebookResult :result="getResult(model)"
                     @find="onFind"
				         />
                  </td>
                  <td>
                     <v-select class="mt-3" :label="labels['typeId']" density="compact" variant="outlined"
                     :items="type_options" v-model="model.typeId"
                     />
                  </td>
                  <td>
                     <v-select class="mt-3" :label="labels['courtType']" density="compact" variant="outlined"
                     :items="courtTypes" v-model="model.courtType"
                     />
                  </td>
                  <!--  <td v-show="dptOptions.length">
                     <v-select class="mt-3" :label="labels['dpt']" density="compact" variant="outlined"
                     :items="dptOptions" v-model="model.dpt"
                     />
                  </td>
                 <td>
                     <v-select class="mt-3" :label="labels['originType']" density="compact" variant="outlined"
                     :items="originTypes" v-model="model.originType"
                     />
                  </td> -->
                  <td>
                     <v-text-field variant="outlined" class="pt-3" density="compact"
                     v-model="model.fileNumber" :error-messages="model.errors.get('fileNumber')" 
                     @input="check(model, 'fileNumber')"
                     />
                  </td>
                  <td>
                     <v-text-field variant="outlined" class="pt-3" density="compact"
                     v-model="model.year" :error-messages="model.errors.get('year')" 
                     @input="check(model, 'year')"
                     />
                  </td>
                  <td>
                     <v-text-field variant="outlined" class="pt-3" density="compact"
                     v-model="model.category" :error-messages="model.errors.get('category')" 
                     @input="check(model, 'category')"
                     />
                  </td>
                  <td>
                     <v-text-field variant="outlined" class="pt-3" density="compact"
                     v-model="model.num" :error-messages="model.errors.get('num')" 
                     @input="check(model, 'num')"
                     />
                  </td>
                  <td>
                     <CommonPickerRocDate class_name="pt-3"
                     :clearable="allowEmptyJudgeDate" label=""
                     :error_message="model.errors.get('judgeDate')"
                     :date="model.judgeDateModel.date" :value="model.judgeDateModel.value"
                     @ready="(date) => onDateSelected(model, date)"
                     @selected="(date) => onDateSelected(model, date)"
                     />
                  </td>
                  <td>
                     <v-text-field variant="outlined" class="pt-3" density="compact"
                     v-model="model.ps"
                     />
                  </td>
               </tr>
            </tbody>
         </v-table>
      </v-col>
		<v-col cols="12">
         <v-btn color="success" class="float-right"
         :disabled="state.models.length === 0 || has_error"
         @click.prevent="onSubmit"
         >
            確定
         </v-btn>
      </v-col>
   </v-row>
</div>
</template>