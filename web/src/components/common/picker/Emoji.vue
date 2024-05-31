<script setup>
import { ref, reactive, computed, watch, onBeforeMount } from 'vue'
import { QQ_FACE_PATH } from '@/config'
import { deleteEmoji, qqfaceArr, genString2emoji, emoji2string } from '@/utils'

const name = 'PickerEmoji'
const emit = defineEmits(['selected', 'cancel'])

const emoij_list = ref(qqfaceArr)
const url = ref(QQ_FACE_PATH)

function select({key, value}) {
   emit('selected', {key, value})
}


</script>
<template>
	<v-card width="320px" height="360px">
      <div style="position: relative;">
         <div class="qqface-container">
            <span class="qqface-wrapper" v-for="[key, value] of Object.entries(emoij_list)" :key="value">
               <img :src="url" class="qqface" :class="[`qqface${value}`]" @click="select({key, value})">
            </span>
         </div>
      </div>
   </v-card>
</template>




<style lang="scss">
.qqface-container{
   .qqface-wrapper{
      display: inline-block;
      transform: scale(1.4);
      margin: 12px
   }
}

.picker-button{
   position: absolute;
   right: 20px;
   bottom: 20px;
   background: #fff;
   padding: 10px 20px 4px 20px;
   border-radius: 6px;
}
</style>