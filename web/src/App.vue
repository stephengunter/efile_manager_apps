<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { DIALOG_MAX_WIDTH } from '@/config'

const store = useStore()

</script>

<template>
   <v-app id="app">
      <LayoutToolbar />
		<LayoutDrawer />
      <v-container fluid>
			<v-main id="layout-view">
				<router-view />
			</v-main>
		</v-container>
      <LayoutShow />
      <LayoutFeedback />
      <LayoutLoading />
   </v-app>
</template>

