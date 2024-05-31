<script setup>
import { reactive, onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DIALOG_MAX_WIDTH } from '@/config'
import { deepClone } from '@/utils'

const name = '404'
const route = useRoute()
const router = useRouter()

const initialState = {
   returnUrl: ''
}
const state = reactive(deepClone(initialState))

onBeforeMount(() => {
	if(route.query) {
      state.returnUrl = route.query.returnUrl ? route.query.returnUrl : ''
   }
})
function back() {
	router.push({ path: state.returnUrl })
}
</script>

<template>
	<v-row>
      <v-col cols="12">
			<v-alert :max-width="DIALOG_MAX_WIDTH"
				type="warning"
				title="404 - Page Not Found"
				text="找不到您要求的頁面"
  			></v-alert>

		</v-col>
		<v-col cols="12" v-if="state.returnUrl">
			<v-btn variant="outlined"  color="primary" @click.prevent="back">
				返回上一頁
			</v-btn>
		</v-col>
   </v-row>
</template>