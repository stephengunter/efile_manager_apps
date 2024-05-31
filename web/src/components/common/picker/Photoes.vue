<script setup>
import { ref, reactive, computed, watch, onBeforeMount } from 'vue'
import { WIDTH, VALIDATE_MESSAGES, ACTION_TYPES } from '@/consts'
import { deepClone } from '@/utils'

const name = 'PickerPhotoes'
const props = defineProps({
   list: {
		type: Array,
		default: () => []
	},
   multi: {
		type: Boolean,
		default: true
	},
   selected: {
		type: Array,
		default: () => []
	},
	title: {
		type: String,
		default: '請選擇圖片'
	}
})
const emit = defineEmits(['submit', 'cancel'])

const initialState = {
   selected: []
}
const state = reactive(deepClone(initialState))


onBeforeMount(() => {
   state.selected = props.selected.slice()
})

function isSelected(item) {
   console.log(state.selected)
   let index = state.selected.findIndex(p => p.url === item.url)
   return index > -1
}

function select(item) {
   let index = state.selected.findIndex(p => p.url === item.url)
   if (index >= 0) state.selected.splice(index, 1)
   else state.selected.push(item)
}
function clear() {
   state.selected = []
}
function submit() {
   console.log(state.selected)
   emit('submit', state.selected)
}
function cancel() {
   emit('cancel')
}


</script>
<template>
	<v-card>
      <v-toolbar>
			<v-card-title>
				<span class="text-h5 font-weight-black">{{ props.title }}</span>       
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
         <v-row>
            <v-col v-for="(item, index) in props.list" :key="index" class="d-flex child-flex" cols="4">
               <v-img class="bg-grey-lighten-2" cover
               :src="item.url" style="cursor: pointer;"
               @click.prevent="select(item)"
               >
                  <v-btn v-if="isSelected(item)" class="close-icon-btn" color="success" density="compact" 
                  style="position : absolute; top : 0; right:0;"
                  variant="text" icon="mdi-check-circle"
                  /> 
                  <template v-slot:placeholder>
                     <v-row class="fill-height ma-0" align="center" justify="center">
                        <v-progress-circular indeterminate color="grey-lighten-5" />
                     </v-row>
                  </template>
               </v-img>
            </v-col>
         </v-row>
         <v-row>
            <v-col cols="6">
               <v-btn color="error" :disabled="state.selected.length < 1"
               @click.prevent="clear"
               >
               清空
               </v-btn>
            </v-col>
            <v-col cols="6" class="text-right">
               <v-btn color="success" :disabled="state.selected.length < 1"
               @click.prevent="submit"
               >
               確定
               </v-btn>
            </v-col>
         </v-row>
    	</v-card-text>   
   </v-card>
</template>