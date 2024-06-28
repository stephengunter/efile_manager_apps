<script setup>
import { onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { APP_CLOSED } from '@/config';

const name = 'CloseView'
const router = useRouter()
onBeforeMount(() => {
	if(!APP_CLOSED) router.push({ path: '/' })
})
</script>

<template>
   <v-row v-if="APP_CLOSED">
		<v-col cols="12">
			<v-alert outlined type="error"  prominent icon="mdi-tools">
				<ul>
					<li>
						系統維護中，暫時停止服務
					</li>
					<!-- <li>
						預計重啟時間：6/28 08:30
					</li> -->
				</ul>
				
			</v-alert>
		</v-col>
	</v-row>
</template>斯