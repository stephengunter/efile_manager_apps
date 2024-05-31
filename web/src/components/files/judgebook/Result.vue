<script setup>
import { MqResponsive } from 'vue3-mq'
import { ref, reactive, computed, watch, onBeforeMount, nextTick } from 'vue'
import { isEmptyObject } from '@/utils'
import { ICONS, SUCCESS } from '@/consts'

const name = 'FilesJudgebookResult'

const emit = defineEmits(['find'])
const props = defineProps({
   result: {
		type: Object,
		default: null
	}
})


const has_error = computed(() => { 
	if(props.result) {
		return !isEmptyObject(props.result.errors)
	} return false
})

const duplicate_error = computed(() => { 
	if(has_error.value) {
		return props.result.errors.hasOwnProperty('duplicate')
	} return false
})

onBeforeMount(() => {
   
})

function onFind() {
   emit('find', props.result.id)
}

</script>

<template>
	<div v-if="has_error">
		
		<ul class="text-error" style="list-style-type: disc !important;">
			<li v-for="([key, value]) in Object.entries(result.errors)" :key="key">{{ value }}</li>
		</ul>
		<v-tooltip v-if="result.errors.hasOwnProperty('duplicate')" text="查詢">
			<template v-slot:activator="{ props }">
				<v-btn class="mb-1" icon="mdi-magnify" v-bind="props" size="x-small" color="info"
				@click.prevent="onFind"
				/>
			</template>
		</v-tooltip>
	</div>
   
	<v-icon v-else :icon="ICONS[SUCCESS]" color="success" />
</template>