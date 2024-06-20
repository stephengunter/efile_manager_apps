<script setup>
import { reactive, ref, computed, onBeforeMount } from 'vue'
import { deepClone, dateToText, textToDate, now, hasRole } from '@/utils'
import { useStore } from 'vuex'
import { SHOW_PHOTO } from '@/store/actions.type'
import { VALIDATE_MESSAGES, ROLE_TYPES } from '@/consts'
import Errors from '@/common/errors'
import date from '@/plugins/date'
const dateAdapter = new date.adapter({ locale: date.locale.zhTW })

const initialState = {
	
	date: {
		roc: false,
		date: null,
		value: '',
		model: {}
	},
	
	errors: new Errors()
}
const store = useStore()

const state = reactive(deepClone(initialState))
const currentUser = computed(() => store.getters.currentUser)

onBeforeMount(() => {
	console.log(window)
	console.log('dev', hasRole(currentUser.value, ROLE_TYPES.DEV))
	console.log('CC', hasRole(currentUser.value, ROLE_TYPES.CHIEF_CLERK))
})
function onDateSelected({ date, model }, selected = true) {	
	state.date.date = date
	state.date.value = state.date.roc ? model.text_cn : model.text
	state.date.model = deepClone(model)

	console.log(state.date)
}
</script>

<template>
	<div>
		<v-row>
			<v-col cols="6">
				<!-- <CommonPickerRocDate :roc="true"
				:date="state.date.date" :value="state.date.value"
				:error_message="state.errors.get('date')"
				@ready="(model) => onDateSelected(model, false)"
				@selected="(model) => onDateSelected(model)"
				/> -->
				<CommonPickerRocDate :roc="state.date.roc"
				:date="state.date.date" :value="state.date.value"
				:error_message="state.errors.get('date')"
				@ready="(model) => onDateSelected(model, false)"
				@selected="(model) => onDateSelected(model)"
				/>

			</v-col>
			<v-col cols="6">
			</v-col>
		</v-row>

	</div>
</template>