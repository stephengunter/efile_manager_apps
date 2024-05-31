<template>
   <ul :class="class_name" style="font-size:16px">
      <li v-for="(item, index) in breadItems" :key="index">
         <a v-if="item.action" href="#" @click.prevent="selected(item)">
            {{ item.text }}
         </a>
         <span v-else>{{ item.text }}</span>
         <v-icon v-if="index < breadItems.length - 1" class="pb-1 ml-1 mr-1" size="16">
            mdi-chevron-right
         </v-icon>
      </li>
   </ul>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
   name: 'Bread',
   props: {
      class_name : {
         type: String,
         default: ''
      }
   },
   computed: {
      ...mapGetters(['breadItems']),
   },
   methods: {
      selected(item) {
         this.$emit('selected', item);
      }
   }
}
</script>

<style scoped>
ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

li {
  float: left;
}

li a {
  text-decoration: none;
}
</style>