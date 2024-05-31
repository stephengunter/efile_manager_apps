<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import { deepClone, dateToText, textToDate, isValidDate, tryParseInt, getDatePickerModel } from '@/utils'
import Wrapper from './Wrapper.vue'
import { WIDTH, ROUTE_NAMES, VALIDATE_MESSAGES, ACTION_TYPES, ENTITY_TYPES } from '@/consts'


const name = 'CommonPickerRocDate'
const props = defineProps({
	roc: {
      type: Boolean,
		default: true
	},
   value: {
      type: String,
		default: ''
	},
	date: {
      type: Date,
		default: null
	},
   label: {
      type: String,
		default: '日期'
	},
   error_message: {
      type: String,
		default: ''
	},
	lower_limit: {
      type: Date,
		default: () => null
	},
	upper_limit: {
      type: Date,
		default: () => null
	},
	clearable: {
      type: Boolean,
		default: true
	},
	class_name: {
      type: String,
		default: ''
	},
	minimum_view: {
      type: String,
		default: 'day'
	},
	hours_allow: {
		type: Array,
		required: false,
		default: () => []
	},
	minutes_allow: {
		type: Array,
		required: false,
		default: () => []
	}
})
const emit = defineEmits(['ready', 'selected'])

const initialState = {
	active: false,
	date: null,
	model: {}
}
const state = reactive(deepClone(initialState))

const errorMessages = computed(() => props.error_message ? [props.error_message] : [])

onMounted(init)

// watch(() => props.value, init, {
// 	deep: false
// })
watch(() => props.date, (new_date, old_date) => {
	if(new_date && old_date) {
		if(new_date.getTime() === old_date.getTime()) return
	}
	init()
}, {
	deep: false
})

const model_text = computed({
	get() {
		return  props.value
	},
	set(val) {
		
	}
})

function init() {
	if(props.date) state.date = deepClone(props.date)
	else state.date = null

	let model = getDatePickerModel(state.date, props.roc)
	state.model = model
	emit('ready', { date: state.date, model })
}

function onSelected(date) {
	if(date) state.date = date
	else state.date = null

	let model = getDatePickerModel(state.date, props.roc)
	state.model = model
	emit('selected', { date: state.date, model })

	state.active = false
}

</script>
<template>
	<v-menu :close-on-content-click="false" v-model="state.active">
      <template v-slot:activator="{ props }">
         <v-text-field :class="class_name"  readonly v-bind="props"
			density="compact" variant="outlined"
			:label="label" :clearable="clearable"
         :model-value="model_text"
			:error-messages="errorMessages"
			@click:clear="onSelected(null)"
         />
      </template>
      <Wrapper :auto_show="true" :roc="roc"
		:lowerLimit="lower_limit" :upperLimit="upper_limit"
		:minimumView="minimum_view"
		:hours_allow="hours_allow" :minutes_allow="minutes_allow" 
		:modelValue="state.date" 
		@update:modelValue="onSelected"
		/>
   </v-menu>
</template>