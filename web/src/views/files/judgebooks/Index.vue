<script setup>
import { MqResponsive } from 'vue3-mq'
import { ref, reactive, computed, watch, onBeforeMount, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { FETCH_JUDGEBOOKFILES, DOWNLOAD_JUDGEBOOKFILE,
	EDIT_JUDGEBOOKFILE, UPDATE_JUDGEBOOKFILE, REMOVE_JUDGEBOOKFILE, FETCH_JUDGEBOOK_TYPES,
	REVIEW_JUDGEBOOKFILES, SUBMIT_REVIEW_JUDGEBOOKFILES 
} from '@/store/actions.type'
import { SET_ERRORS, CLEAR_ERRORS, SET_JUDGEBOOKFILES_PARAMS } from '@/store/mutations.type'
import { isEmptyObject, deepClone , downloadFile,
	 onErrors, onSuccess, setValues, is400, 
	resolveErrorData, isNumeric,
	buildQuery, bytesToBinary, getMimeType, showModifyRecords
} from '@/utils'
import { WIDTH, ROUTE_NAMES, VALIDATE_MESSAGES, ACTION_TYPES, ENTITY_TYPES } from '@/consts'

const name = 'FilesJudgebooksIndexView'
const store = useStore()
const route = useRoute()
const router = useRouter()

const ENTITY_TYPE = ENTITY_TYPES.JUDGEBOOKFILE

const initialState = {
	upload: {
		title: `${ACTION_TYPES.UPLOAD.title}${ENTITY_TYPE.title}`,
		type: null,
		courtType: null,
		active: false
	},
	form: {
		id: 0,
		title: '',
		active: false,
		model: {},
		action: '',
		actions: [],
		width: WIDTH.M
	},
	review: {
		ids: []
	}
}


const state = reactive(deepClone(initialState))
const isFilesManager = computed(() => store.state.files_judgebooks.isFilesManager)
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
const types = computed(() => store.state.files_judgebooks.types)
const courtTypes = computed(() => store.state.files_judgebooks.courtTypes)
const originTypes = computed(() => store.state.files_judgebooks.originTypes)

const head = ref(null)
const pagedList = computed(() => store.state.files_judgebooks.pagedList)
const can_review = computed(() => canDoAction(ACTION_TYPES.REVIEW.name))

const disable_review = computed(() => params.value.reviewed !== 0)
const can_submit_review = computed(() => {
   if(!can_review.value) return false
	if(disable_review.value) return false
   return state.review.ids.length > 0
})

onMounted(() => {
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
	head.value.init()
}
function fetchData(params) {
	store.commit(CLEAR_ERRORS)
	store.dispatch(FETCH_JUDGEBOOKFILES, params)
	.then(() => {
		
	})
	.catch(error => onErrors(error))
}
function canDoAction(action) {
	const actions = store.state.files_judgebooks.actions
   if(!actions.length) return false
   return actions.findIndex(item => item.toLowerCase() === action.toLowerCase()) > -1
}
function onOptionChanged(option) {
	head.value.setPageOption(option)
}

function edit(id) {
	state.form.id = id
	store.commit(CLEAR_ERRORS)
	store.dispatch(EDIT_JUDGEBOOKFILE, id)
	.then(data => {
		state.form.title = `${ACTION_TYPES.EDIT.title}${ENTITY_TYPE.title}`,
		state.form.model = deepClone(data.model)
		state.form.actions = data.actions

		state.form.action = UPDATE_JUDGEBOOKFILE
		state.form.width = WIDTH.L
		state.form.active = true
	})
	.catch(error => onErrors(error))
}
function download(id) {
	store.dispatch(DOWNLOAD_JUDGEBOOKFILE, id)
	.then(data => {
		const file = data.fileView
		const ext = data.ext
		const fileBytes = bytesToBinary(file.fileBytes)
		const blob = new Blob([fileBytes], { type: getMimeType(ext) })
		downloadFile(blob, data.fileView.fileName)
	})
	.catch(error => onErrors(error))
}
function onUpload() {
	const params = head.value.getParams()
	store.commit(SET_JUDGEBOOKFILES_PARAMS, params)
	
	router.push({ name: `upload-${ROUTE_NAMES.JUDGEBOOKFILES}` })
}
function onReview() {
	store.commit(CLEAR_ERRORS)
	store.dispatch(REVIEW_JUDGEBOOKFILES, state.review.ids)
	.then(list => {
		state.form.title = `${ACTION_TYPES.REVIEW.title}${ENTITY_TYPE.title}`,
		state.form.model = list
		state.form.actions = [ACTION_TYPES.REVIEW.name]

		state.form.action = SUBMIT_REVIEW_JUDGEBOOKFILES
		state.form.width = WIDTH.XL
		state.form.active = true
	})
	.catch(error => onErrors(error))
}
function review(models) {
	store.commit(CLEAR_ERRORS)
	store.dispatch(SUBMIT_REVIEW_JUDGEBOOKFILES, models)
	.then(() => {
		fetchData(head.value.getParams())
		onSuccess()
		onCancel()
	})
	.catch(error => onErrors(error))
}

function onCancel() {
	state.form = deepClone(initialState.form)
}
function update({ form, file }) {
	setValues(form, state.form.model)
	const id = state.form.id
	const model = state.form.model
	store.dispatch(state.form.action, { id, model, file })
	.then(() => {
		fetchData(head.value.getParams())
		onCancel()
		onSuccess()
	})
	.catch(error => handleSubmitError(error))
}

function handleSubmitError(error) {
	if(is400(error)) {
		let errors = resolveErrorData(error)
		if(errors) store.commit(SET_ERRORS, Object.values(errors))
		else onErrors(error)
	}else onErrors(error)
}
function onFind(model) {
	const path = `${window.location.origin}${route.path}`
	const params = {
		year: model.year,
		category: model.category,
		num: model.num
	}
	window.open(buildQuery(path, params), '_blank')
}
function onCheckChanged(ids) {
	state.review.ids = ids
}
function remove() {
	const id = state.form.model.id
	store.dispatch(REMOVE_JUDGEBOOKFILE, id)
	.then(() => {
		fetchData(head.value.getParams())
		onCancel()
		onSuccess('刪除成功')
	})
	.catch(error => {
		let errors = resolveErrorData(error)
		if(errors) store.commit(SET_ERRORS, Object.values(errors))
		else onErrors(error)
	})
}
</script>

<template>
	<div>
		<FilesJudgebookHead ref="head" :dpt_options="dptOptions"
		:can_review="can_review" :disable_review="!can_submit_review" 
		@submit="fetchData" @upload="onUpload(true)"
		@review="onReview"
		/>
		<v-row dense>
			<v-col cols="12">
				<FilesJudgebookTable v-if="!isEmptyObject(pagedList)" 
				:model="pagedList" :court_types="courtTypes" :origin_types="originTypes"
				:can_review="can_review" :disable_review="disable_review"
				@select="edit" @download="download"
				@options_changed="onOptionChanged"
				@check_changed="onCheckChanged"
				/>
			</v-col>
		</v-row>
		<v-dialog persistent v-model="state.form.active" :width="state.form.width + 50">
			<v-card v-if="state.form.active" :max-width="state.form.width">
				<CommonCardTitle :title="state.form.title"
				@cancel="onCancel"  
				/>
				<v-card-text>
					<div style="padding-right: 10px;">
						<FilesJudgebookForm v-if="state.form.action === UPDATE_JUDGEBOOKFILE"
						:types="originTypes" :dpt_options="dptOptions"
						:origin_types="originTypes" :court_types="courtTypes"
						:model="state.form.model" :actions="state.form.actions"
						@submit="update" @remove="remove"
						/>
						<FilesJudgebookReview v-if="state.form.action === SUBMIT_REVIEW_JUDGEBOOKFILES"
						:origin_types="originTypes" :court_types="courtTypes"
						:list="state.form.model"
						@submit="review"
						/>
					</div>
				</v-card-text>
			</v-card>
		</v-dialog>
	</div>
</template>