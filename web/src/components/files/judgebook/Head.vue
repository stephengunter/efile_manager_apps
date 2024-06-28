<script setup>
import { MqResponsive } from 'vue3-mq'
import { ref, reactive, computed, watch, onBeforeMount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useVuelidate } from '@vuelidate/core'
import { helpers } from '@vuelidate/validators'
import Errors from '@/common/errors'
import { isEmptyObject, deepClone , copyFromQuery, areObjectsEqual, reviewedOptions,
	setValues, badRequest, tryParseInt
} from '@/utils'
import JudgebookFile from '@/models/files/judgebook'

const name = 'FilesJudgebookHead'
const store = useStore()
const route = useRoute()
const router = useRouter()
const props = defineProps({
	can_review: {
      type: Boolean,
      default: false
   },
	disable_review: {
      type: Boolean,
      default: false
   }
})

const emit = defineEmits(['submit', 'upload', 'review'])
defineExpose({
   init, setParams, getParams, setPageOption
})

const initialState = {
	params: {
		reviewed: -1,
		typeId: 0,
		departmentIds: '',
		fileNumber: '',
		courtType: '',
		year: '',
		category: '',
		num: '',
		createdby: '',
		page: -1,
		pageSize: 50
	},
	options: {
		review: [],
		department: []
	},
	dpt_picker: {
		active: false,
		departmentId: 0,
		departmentIds: []		
	}
}

const createdByOptions = [{
	value: '', title: '全部人'
},{
	value: 'me', title: '我自己'
}]

onBeforeMount(() => {
	if(params.value) setParams(params.value)
	
	let review_options = reviewedOptions.slice(0)
	review_options.splice(0, 0, {
		value: -1, title: '全部'
	})
	state.options['review'] = review_options
})
function checkFileNumber(val) {
   if(val) return  JudgebookFile.checkFileNumber(val)
   return true
}
function checkYear(val) {
   if(val) return  JudgebookFile.checkYear(val)
   return true
}
function checkCategory(val) {
   return true
}
function checkNum(val) {
   if(val) return JudgebookFile.isValidNum(val)
   return true
}

const state = reactive(deepClone(initialState))
const ready = computed(() => store.state.files_judgebooks.pagedList != null)
const params = computed(() => store.state.files_judgebooks.params)
const isFilesManager = computed(() => store.state.files_judgebooks.isFilesManager)
const isChiefClerk = computed(() => store.state.files_judgebooks.isChiefClerk)
const isAdmin = computed(() => store.state.files_judgebooks.isAdmin)

const is_F_CC_Admin = computed(() => {
	if(isFilesManager.value) return true
	if(isChiefClerk.value) return true
	if(isAdmin.value) return true
	return false
})
 


const departments = computed(() => store.state.files_judgebooks.departments)
const courtType_options = computed(() => {
	let options = store.state.files_judgebooks.courtTypes.slice(0)
	if(is_F_CC_Admin.value) {
		options.splice(0, 0, {
			value: '', 
			title: '全部'
		})
	}
	return options
})
const type_options = computed(() => {
	let types = store.state.files_judgebooks.types
	let options = types.map(item => ({
		value: item.id, title: item.title
	}))
	options.splice(0, 0, {
		value: 0, title: '全部'
	})
	return options
})
const labels = computed(() => store.state.files_judgebooks.labels)


const rules = computed(() => {
	return {
		fileNumber: { 
			isValid: helpers.withMessage(`${labels.value['fileNumber']}不正確`, checkFileNumber)
		},
		year: { 
			isValid: helpers.withMessage(`${labels.value['year']}不正確`, checkYear)
		},
      category: { 
			isValid: helpers.withMessage(`${labels.value['category']}不正確`, checkCategory)
		},
      num: { 
			isValid: helpers.withMessage(`${labels.value['num']}不正確`, checkNum)
		}
	}
})

const query_match_params = computed(() => {
	if(route.query) {
		return areObjectsEqual(state.params, route.query, true)
	} return false
})

const v$ = useVuelidate(rules, state.params)

watch(route, init)

watch(params, (new_value) => {
	setParams(new_value)
})

function initParams() {
	if(!state.params.typeId) state.params.typeId = type_options.value[0].value
	if(!state.params.courtType) state.params.courtType = courtType_options.value[0].value

	setDepartments(state.params.courtType)
}

function init() {
   initParams()

	if(isEmptyObject(route.query)) {
		router.push({ path: route.path, query: { ...state.params } })
		return
	}

	copyFromQuery(state.params, route.query)
	initParams()

	if(!query_match_params.value) {
		router.push({ path: route.path, query: { ...state.params } })
		return
	}

	const errors = checkParams()
	if(errors.any()) {
		badRequest('BAD_REQUEST ', '錯誤的查詢參數', errors.getAll())
		return 
	}
	
	emit('submit', state.params)
	
}

function checkParams() {
	let errors = new Errors()
	const year = state.params.year
   if(!checkYear(year)) errors.set('year', [`錯誤的${labels['year']}`])

   const num = state.params.num
   if(!checkNum(num)) errors.set('num', [`錯誤的${labels['num']}`])

	return errors
}
function setPageOption(option) {
	if(option.hasOwnProperty('page')) state.params.page = option.page
	if(option.hasOwnProperty('size')) state.params.pageSize = option.size
	onSubmit()
}
function setParams(model) {
   setValues(model, state.params)
}
function getParams() {
   return state.params
}

function onSubmit() {
	if(query_match_params.value) emit('submit', state.params)
	else router.push({ path: route.path, query: { ...state.params } })
	
}
function onUpload() {
	emit('upload')
}
function onCourtTypeChanged(val) {
	setDepartments(val)
	onParamsChanged()
}
function setDepartments(courtType) {
	const key = 'department'
	courtType = courtType ? courtType.toLowerCase() : ''
	if(courtType) state.options[key] = departments.value[courtType].options.slice()		
	else state.options[key] = []

	if(is_F_CC_Admin.value) {
		if((state.options[key].findIndex(x => !x.value)) < 0){
			state.options[key].splice(0, 0, {
				value: 0, 
				title: '全部'
			})
		}
		//查看有無該股
		const options = state.options[key]
		const departmentId = state.dpt_picker.departmentId		
		if(options.length) {
			let index =  options.findIndex(x => x.value === departmentId)
			if(index < 0) state.dpt_picker.departmentId = options[0].value
		}
		else state.dpt_picker.departmentId = 0
	}else {
		const options = state.options[key]
		const values = options.map(o => o.value)
		let ids = state.dpt_picker.departmentIds
		if(ids.length) {
			state.dpt_picker.departmentIds = ids.filter(id => values.includes(id))
		}else {
			state.dpt_picker.departmentIds = options.map(o => o.value)
		}
		
	}

	onDepartmentChanged()
}
function onDepartmentChanged(val) {
	const params_clone = deepClone(state.params) 
	if(is_F_CC_Admin.value) {
		const departmentId = state.dpt_picker.departmentId	
		state.params.departmentIds = departmentId ? state.dpt_picker.departmentId.toString() : null
	}else {
		const ids = state.dpt_picker.departmentIds
		if(ids.length) state.params.departmentIds = ids.join()
		else  state.params.departmentIds = null
	}

	if(!areObjectsEqual(state.params, params_clone)) onParamsChanged()
}

function onParamsChanged() {
	onSubmit()
}
function onReview() {
	emit('review')
}


</script>

<template>
   <form v-show="ready" @submit.prevent="onSubmit" @input="onInputChanged">
		<v-row dense>
			<v-col cols="1">
				<v-select :label="labels['createdBy']" density="compact" 
            :items="createdByOptions" v-model="state.params.createdby"
				@update:modelValue="onParamsChanged"
            />
			</v-col>
			<v-col cols="1">
				<v-select :label="labels['reviewed']" density="compact" 
            :items="state.options.review" v-model="state.params.reviewed"
				@update:modelValue="onParamsChanged"
            />
			</v-col>
			<v-col cols="1">
				<v-select :label="labels['typeId']" density="compact" 
            :items="type_options" v-model="state.params.typeId"
				@update:modelValue="onParamsChanged"
            />
			</v-col>
			<v-col cols="1">
				<v-select :label="labels['courtType']" density="compact" 
            :items="courtType_options" v-model="state.params.courtType"
            @update:modelValue="onCourtTypeChanged"
				/>
			</v-col>
			<v-col v-show="state.params.courtType" cols="1">
				<v-select v-if="is_F_CC_Admin"
				:label="labels['dpt']" density="compact" 
            :items="state.options.department" v-model="state.dpt_picker.departmentId"
            @update:modelValue="onDepartmentChanged"
				/>
				<v-select v-else :label="labels['dpt']"
				density="compact" chips multiple
				:items="state.options.department" 
				v-model="state.dpt_picker.departmentIds" 
				@update:modelValue="onDepartmentChanged"
				/>
			</v-col>
			<v-col cols="2" v-show="isFilesManager" v-if="props.can_review">
				<v-text-field :label="labels['fileNumber']"  density="compact" :clearable="true"
				v-model="state.params.fileNumber"
            :error-messages="v$.fileNumber.$errors.map(e => e.$message)"                     
				@input="v$.fileNumber.$touch"
				@blur="v$.fileNumber.$touch"
				/>
			</v-col>
			<v-col cols="1">
				<v-text-field :label="labels['year']"  density="compact" clearable
				v-model="state.params.year"
            :error-messages="v$.year.$errors.map(e => e.$message)"                     
				@input="v$.year.$touch"
				@blur="v$.year.$touch"
				/>
			</v-col>
			<v-col cols="1">
				<v-text-field :label="labels['category']"  density="compact" clearable        
				v-model="state.params.category"
            :error-messages="v$.category.$errors.map(e => e.$message)"                     
				@input="v$.category.$touch"
				@blur="v$.category.$touch"
				/>
			</v-col>
			<v-col cols="1">
				<v-text-field :label="labels['num']"  density="compact" clearable    
				v-model="state.params.num"
            :error-messages="v$.num.$errors.map(e => e.$message)"                     
				@input="v$.num.$touch"
				@blur="v$.num.$touch"
				/>
			</v-col>
			<v-col cols="1">
				<v-tooltip text="查詢">
					<template v-slot:activator="{ props }">
						<v-btn class="float-left" v-bind="props" color="success"
						type="submit"
						>
						查詢
						</v-btn>
					</template>
				</v-tooltip>
			</v-col>
			<v-col cols="1">
				<v-tooltip text="上傳">
					<template v-slot:activator="{ props }">
						<v-btn class="float-right" :disabled="state.params.reviewed === 1" 
						icon="mdi-upload" v-bind="props" size="small" color="info"
						@click.prevent="onUpload"
						/>
					</template>
				</v-tooltip>
				<v-tooltip v-if="props.can_review" :disabled="props.disable_review" text="審核選取的項目">
					<template v-slot:activator="{ props }">
						<v-btn class="float-right mr-3"
						v-bind="props" icon="mdi-check"  size="small" color="warning"
						:disabled="disable_review"  
						@click.prevent="onReview"
						/>
					</template>
				</v-tooltip>
			</v-col>
		</v-row>
	</form>
</template>