<script setup>
import { ref, reactive, computed, onBeforeMount, nextTick } from 'vue'
import { useStore } from 'vuex'
import { useVuelidate } from '@vuelidate/core'
import { required, numeric, helpers } from '@vuelidate/validators'
import { CLEAR_ERRORS } from '@/store/mutations.type'
import { VALIDATE_MESSAGES, WIDTH, HEIGHT, ACTION_TYPES, ENTITY_TYPES } from '@/consts'
import { setValues, showConfirm, hideConfirm, deepClone, isEmptyObject } from '@/utils'
import JudgebookFile from '@/models/files/judgebook'
import { el } from 'date-fns/locale'


const name = 'FilesJudgebookForm'
const props = defineProps({
   model: {
		type: Object,
		default: null
	},
	actions: {
		type: Array,
		default: () => []
	},
	dpt_options: {
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
const emit = defineEmits([ACTION_TYPES.SUBMIT.name, ACTION_TYPES.CANCEL.name, ACTION_TYPES.REMOVE.name])
const store = useStore()
const entity = ENTITY_TYPES.JUDGEBOOKFILE
const initialState = {
   form: {
		id: 0,
		typeId: 0,
		judgeDate: 0,
		fileNumber: '',
		courtType: '',
		year: '',
		category: '',
		num: '',
		ps: '',
		fileName: '',
		reviewed: false
   },
	date: {
		date: null,
		value: '',
		model: {
			text: '',
			text_cn: '',
			num: 0
		},
		error_message: ''
	},
	
	file: null
}
const file_upload = ref(null)
const no_file = computed(() => state.file === null)
const type_options = computed(() => {
	return store.state.files_judgebooks.types.map(item => ({
		value: item.id, title: item.title
	}))
})

const allowEmptyJudgeDate = computed(() => store.state.files_judgebooks.allowEmptyJudgeDate)
const allowEmptyFileNumber = computed(() => store.state.files_judgebooks.allowEmptyFileNumber)

// const user_can_review = computed(() => {
//    const actions = props.actions
//    if(!actions.length) return false
//    return actions.findIndex(item => item.toLowerCase() === ACTION_TYPES.REVIEW.name) > -1
// })
// const file_number_can_edit = computed(() => {
// 	state.form.re
//    const actions = props.actions
//    if(!actions.length) return false
//    return actions.findIndex(item => item.toLowerCase() === ACTION_TYPES.REVIEW.name) > -1
// })

const state = reactive(deepClone(initialState))
const rules = computed(() => {
	const items = 
	{
		fileNumber: {
			isValid: helpers.withMessage(`${labels.value['fileNumber']}不正確`, checkFileNumber)
		},
		year: {
			required: helpers.withMessage(VALIDATE_MESSAGES.REQUIRED(labels.value['year']), required),
			isValid: helpers.withMessage(`${labels.value['year']}不正確`, checkYear)
		},
      category: { 
			required: helpers.withMessage(VALIDATE_MESSAGES.REQUIRED(labels.value['category']), required),
			isValid: helpers.withMessage(`${labels.value['category']}不正確`, checkCategory)
		},
      num: { 
			required: helpers.withMessage(VALIDATE_MESSAGES.REQUIRED(labels.value['num']), required),
			isValid: helpers.withMessage(`${labels.value['num']}不正確`, checkNum)
		}
	}
	return items
})

const labels = computed(() => store.state.files_judgebooks.labels)
//const $externalResults = ref({}) 
// const v$ = useVuelidate(rules, state.form, { $externalResults })
const v$ = useVuelidate(rules, state.form)

const review_status = computed(() => {
	if(state.form.reviewed) return '已審核'
	return '未審核通過'
})
const canRemove = computed(() => {
	if(!props.model.id) return false
	if(props.model.reviewed) return false

	return true
})

onBeforeMount(init)

function init() {
	setValues(props.model, state.form)
	state.date = deepClone(JudgebookFile.iniJudgeDateModel(props.model.judgeDate))
}
function onSubmit() {
	v$.value.$validate().then(valid => {
		if(!valid) return
		
		if(!checkJudgeDate(state.form.judgeDate)) {
			state.date.error_message = `${labels.value['judgeDate']}不正確`
			return
		}
		
		// const errors = {
		// 	fileNumber: [`${labels.value['fileNumber']}不正確`]
		// }
  		// $externalResults.value = errors
		// return
		state.form.num = JudgebookFile.checkNum(state.form.num)
		emit(ACTION_TYPES.SUBMIT.name, { form: state.form, file: state.file})
	})
}
function onRemove() {
	showConfirm({
		type: 'warning',
		title: '確定要刪除嗎?',
		text: '',
		on_ok: remove,
		cancel: '取消'
	})
}
function remove() {
	hideConfirm()
	emit(ACTION_TYPES.REMOVE.name)
}
function onInputChanged(val) {
   store.commit(CLEAR_ERRORS)
}
function checkFileNumber(val) {
   if(val) return  JudgebookFile.checkFileNumber(val)
	if(state.form.reviewed) return false
   return allowEmptyFileNumber.value
}
function checkYear(val) {
   if(val) return  JudgebookFile.checkYear(val)
   return false
}
function checkCategory(val) {
   if(val) return true
	return false
}
function checkNum(val) {
   if(val) return JudgebookFile.isValidNum(val)
   return false
}
function checkJudgeDate(val) {
   if(val) return JudgebookFile.checkJudgeDate(val)
   return allowEmptyJudgeDate.value

}
function canDoAction(action) {
	const actions = props.actions
   if(!actions.length) return false
   return actions.findIndex(item => item.toLowerCase() === action.toLowerCase()) > -1
}
function upload() {
	file_upload.value.launch()
}
function onFileAdded(files) {
	if(files.length) {
		const file = files[0]
		if(file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
			state.file = file
		}
	}else {
		state.file = null
	}
}

function onDateSelected({ date, model }, selected = true) {
	if(date) {
		state.date.date = date
		state.date.model = deepClone(model)
		state.date.value = model.text_cn

		state.form.judgeDate = model.num		
	}else {
		state.date = deepClone(JudgebookFile.iniJudgeDateModel())
		state.form.judgeDate = 0
	}

	if(checkJudgeDate(state.form.judgeDate)) {
		state.date.error_message = ''
	}else {
		state.date.error_message = `${labels.value['judgeDate']}不正確`
	}

}
function onFileNumberChanged(val) {
	if($externalResults.value.hasOwnProperty('fileNumber')) {
		$externalResults.value['fileNumber'] = []
	}
}
</script>

<template>
	<form @submit.prevent="onSubmit" @input="onInputChanged">
		<v-row dense v-if="state.form.fileName">
			<v-col cols="12">
				<div class="mb-3">
					<div v-show="no_file && state.form.fileName">
						<span>檔案文件：</span>
						<v-icon size="small" icon="mdi-file" /> {{ state.form.fileName }}
						<v-tooltip text="刪除重傳">
							<template v-slot:activator="{ props }">
								<v-icon size="small" v-bind="props" color="red-lighten-1" icon="mdi-close" 
								@click.prevent="upload"
								/>
							</template>
						</v-tooltip>
					</div>
						
					<div v-show="!no_file">
						<span>檔案文件：</span>
						<CommonInputUpload ref="file_upload" :show_button="false" :multiple="false"
						:is_media="false" :allow_types="['.pdf']"
						@file-added="onFileAdded" @file-removed="onFileAdded"
						/>
					</div>
					
				</div>
			</v-col>
		</v-row>
		<v-row dense>
			<v-col cols="4">
				<v-select :label="labels['typeId']" density="compact" variant="outlined"
				:items="type_options" v-model="state.form.typeId"
				/>
			</v-col>
			<v-col cols="4">
				<v-select :label="labels['courtType']" density="compact" variant="outlined"
				:items="court_types" v-model="state.form.courtType"
				/>
			</v-col>
			<!-- <v-col cols="3">
				<v-select :label="labels['dpt']" density="compact" variant="outlined"
				:items="props.dpt_options" v-model="state.form.dpt"
				/>
				<v-select :label="labels['originType']" density="compact" variant="outlined"
				:items="props.origin_types" v-model="state.form.originType"
				/> 
			</v-col>-->
			<v-col cols="4">

				<CommonPickerRocDate :label="labels['judgeDate']"
				:clearable="allowEmptyJudgeDate"
				:error_message="state.date.error_message"
				:date="state.date.date" :value="state.date.value"
				@ready="(model) => onDateSelected(model, false)"
				@selected="(model) => onDateSelected(model, true)"
				/>
			</v-col>
		</v-row>
		<v-row dense>
			<v-col cols="4">
				<v-text-field :label="labels['year']"  density="compact"
				v-model="state.form.year"
            :error-messages="v$.year.$errors.map(e => e.$message)"                     
				@input="v$.year.$touch"
				@blur="v$.year.$touch"
				/>
			</v-col>
			<v-col cols="4">
				<v-text-field :label="labels['category']"  density="compact"        
				v-model="state.form.category"
            :error-messages="v$.category.$errors.map(e => e.$message)"                     
				@input="v$.category.$touch"
				@blur="v$.category.$touch"
				/>
			</v-col>
			<v-col cols="4">
				<v-text-field :label="labels['num']"  density="compact"    
				v-model="state.form.num"
            :error-messages="v$.num.$errors.map(e => e.$message)"                     
				@input="v$.num.$touch"
				@blur="v$.num.$touch"
				/>
			</v-col>
		</v-row>
		<v-row dense>
			<v-col cols="12">
				<v-text-field :label="labels['fileNumber']"  density="compact"        
				v-model="state.form.fileNumber"
            :error-messages="v$.fileNumber.$errors.map(e => e.$message)"
				@input="v$.fileNumber.$touch"
				@blur="v$.fileNumber.$touch"
				/>
				<!-- <v-text-field :label="labels['fileNumber']"  density="compact"        
				v-model="state.form.fileNumber"
            :error-messages="v$.fileNumber.$errors.map(e => e.$message)"
				@input="onFileNumberChanged"
				/> -->
			</v-col>
			<v-col cols="12">
				<v-textarea auto-grow :label="labels['ps']"  
				v-model="state.form.ps"	
				/>
			</v-col>
			<v-col cols="12" v-if="canDoAction(ACTION_TYPES.REVIEW.name)">
				<v-switch :label="review_status" hide-details inset color="success"
				v-model="state.form.reviewed"
				@update:modelValue="() => { v$.fileNumber.$touch }"
				/>
			</v-col>
		</v-row>
		<v-row dense>
			<v-col cols="12">
				<CommonErrorsList />
			</v-col> 
			<v-col cols="12">
				<v-btn v-if="canRemove"  class="float-left" color="error"
				@click.prevent="onRemove" 
				>
					{{ ACTION_TYPES.REMOVE.title }}
				</v-btn>
				<v-btn type="submit" color="success" class="float-right">
				{{ ACTION_TYPES.SAVE.title }}
				</v-btn>
			</v-col>
		</v-row>
	</form>
</template>