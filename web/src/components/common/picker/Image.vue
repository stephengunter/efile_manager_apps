<script setup>
import { ref, reactive, computed, watch, onBeforeMount } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { url, required, helpers } from '@vuelidate/validators'
import { DIALOG_MAX_WIDTH } from '@/config'
import { WIDTH, VALIDATE_MESSAGES, ACTION_TYPES } from '@/consts'
import { deepClone } from '@/utils'

const name = 'CommonPickerImage'
const emit = defineEmits(['selected', 'cancel'])

const sources = [{ value: 1, text: '外部'}]
const labels = {
   'source':'來源', 
   'url':'Url',
   'title':'標題',
   'text':'說明'
}

const initialState = {
	form: {
		source: 1,
	   url: '',
      title: '',
      text: ''
	}
}
const state = reactive(deepClone(initialState))

const rules = {
	url: { 
      required: helpers.withMessage(VALIDATE_MESSAGES.REQUIRED('Url'), required), 
      url: helpers.withMessage(VALIDATE_MESSAGES.WRONG_FORMAT_OF('Url'), url)
   }
}

const v$ = useVuelidate(rules, state.form)


onBeforeMount(() => {
   state.form.source = sources[0].value
})

function onSubmit() {
	v$.value.$validate().then(valid => {
		if(valid) emit('selected', state.form)
	})
}
function cancel() {
   emit('cancel')
}


</script>
<template>
	<v-card :max-width="DIALOG_MAX_WIDTH">
      <v-toolbar>
			<v-card-title>
				<span class="text-h5 font-weight-black">插入圖片</span>       
			</v-card-title>
			<template v-slot:append>
				<v-tooltip :text="ACTION_TYPES.CANCEL.title">
					<template v-slot:activator="{ props }">
						<v-btn v-bind="props" icon="mdi-window-close" 
						@click.prevent="cancel" 
						/>
					</template>
				</v-tooltip>
			</template>
		</v-toolbar>
      <v-card-text>
         <form @submit.prevent="onSubmit">
            <v-select 
            :items="sources" item-title="text"
            :label="labels['source']"
            v-model="state.form.source"
            />
            <v-text-field
            :label="labels['url']"
            v-model="state.form.url"
            :error-messages="v$.url.$errors.map(e => e.$message)"
            @input="v$.url.$touch"
            @blur="v$.url.$touch"
            />
            <v-text-field
            :label="labels['title']"
            v-model="state.form.title"
            />
            <v-text-field
            :label="labels['text']"
            v-model="state.form.text"
            />
            <v-btn class="float-right" type="submit" color="success">確定</v-btn>
         </form>
    	</v-card-text>   
   </v-card>
</template>