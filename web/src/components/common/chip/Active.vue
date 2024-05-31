<script setup>

const name = 'ActiveLabel'
const props = defineProps({
   value: {
		type: Boolean,
		default: false
	},
   text_true: {
		type: String,
		default: '上架中'
	},
   text_false: {
		type: String,
		default: '已下架'
	}
})
</script>
<template>
   <v-chip variant="flat" size="small"
   :color="value ? 'success' : 'default'" 
   >
   {{ value ? text_true : text_false}}
   </v-chip>
</template>